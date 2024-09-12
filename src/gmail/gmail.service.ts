import { Email } from 'src/email/email.entity';
import { google } from 'googleapis';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Service } from 'src/common/services/oauth2.service';
import { PDFService } from './pdf.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';

@Injectable()
export class GmailService implements OnModuleInit {

  private referenceData: any[];
  private readonly logger = new Logger(GmailService.name);
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abrahag40@gmail.com',
      pass: 'descorazonaria3312',
    },
  });
  private oauth2Client;

  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>, 
    private readonly httpService: HttpService,
    private readonly oauth2Service: OAuth2Service,
    private readonly pdfService: PDFService,
    private readonly pubSubService: PubSubService,

  ) {
    this.oauth2Client = this.oauth2Service.getClient();
    this.loadReferenceData();
    this.pubSubService.listenForMessages();
  }

  async onModuleInit() {
    // Configura Gmail para que observe la bandeja de entrada y envíe notificaciones a Pub/Sub
    await this.watchEmails();
  }

  // Método para obtener los correos electrónicos más recientes
  async getRecentEmails(accessToken: string) {
    try {
      const response = await this.httpService.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          maxResults: 1, // Es posible ajustar el número de correos a obtener
        },
      }).toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Failed to retrieve recent emails', error.stack);
      throw new Error('Could not retrieve emails');
    }
  }

  // Procesamiento de correos electrónicos (integrado en la lógica existente)
  async processEmails(emails: any[], accessToken: string) {

    for (const email of emails) {
      const messageDetails = await this.getMessageDetails(accessToken, email.id);

      if (messageDetails.payload.parts) {
        for (const part of messageDetails.payload.parts) {
          if (part.filename && (part.filename.endsWith('.pdf') || part.filename.endsWith('.xlsx'))) {
            const attachment = await this.downloadAttachment(accessToken, email.id, part.body.attachmentId);
            const fileBuffer = Buffer.from(attachment.data, 'base64');
                        
            let isMatch = false;
            
            if (part.filename.endsWith('.xlsx')) {
              const data = this.processExcel(fileBuffer);
              isMatch = this.compareWithReference(data);
            }
            
            if (part.filename.endsWith('.pdf')) {
              const text = await this.processPDF(fileBuffer);
              await this.pdfService.processPDFWithOpenAI(fileBuffer, text);
              isMatch = this.comparePDFTextWithReference(text);
            }

            // Guardar el resultado en la base de datos
            await this.saveEmailResult(
              messageDetails.payload.headers.find(header => header.name === 'From').value,
              messageDetails.payload.headers.find(header => header.name === 'Subject').value,
              messageDetails.snippet,
              part.filename.endsWith('.pdf') ? 'pdf' : 'xlsx',
              isMatch
            );

            // Envía una notificación si se encuentra una coincidencia
            if (isMatch) {
              await this.sendNotification('abrahag40@gmail.com', messageDetails.payload.headers.find(header => header.name === 'Subject').value, 'A match was found!');
            }
          }
        }
      }
    }
  }

  // Método para guardar los resultados de la comparación
  async saveEmailResult(sender: string, subject: string, content: string, attachmentType: string, isMatch: boolean) {
    if (!attachmentType || !sender || !subject || !content) {
      console.error('Missing required fields');
      return;
    }
    console.log('All fields are valid');
    const email = this.emailRepository.create({ sender, subject, content, attachmentType, isMatch });
        
    await this.emailRepository.save(email);
  }

  // Método para obtener los detalles de un mensaje específico
  async getMessageDetails(accessToken: string, messageId: string) {
    try {
      const response = await this.httpService.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).toPromise();

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to retrieve message details for messageId: ${messageId}`, error.stack);
      throw new Error('Could not retrieve message details');
    }
  }

  // Método para descargar un archivo adjunto
  async downloadAttachment(accessToken: string, messageId: string, attachmentId: string) {
    try {
      const response = await this.httpService.get(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ).toPromise();

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to download attachment: ${attachmentId}`, error.stack);
      throw new Error('Could not download attachment');
    }
  }

  // Método para procesar un archivo Excel
  processExcel(fileBuffer: Buffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      this.logger.error('Failed to process Excel file', error.stack);
      throw new Error('Could not process Excel file');
    }
  }

  // Método para procesar un archivo PDF
  async processPDF(fileBuffer: Buffer) {
    try {
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (error) {
      this.logger.error('Failed to process PDF file', error.stack);
      throw new Error('Could not process PDF file');
    }
  }

  // Método para cargar y preparar el Excel de referencia
  private loadReferenceData() {
    try {
      const referenceDataPath = path.join(process.cwd(), 'src', 'assets', 'CatalogoSantander.xlsx');
      const workbook = XLSX.readFile(referenceDataPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      this.referenceData = XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      this.logger.error('Failed to load reference data from Excel file', error.stack);
      throw new Error('Could not load reference data');
    }
  }

  // Método para comparar datos extraídos con la referencia
  compareWithReference(extractedData: any[]): boolean {
    // Ejemplo simple: comparar por nombre en los datos extraídos y los datos de referencia
    return extractedData.every((item) => {
      return this.referenceData.some((ref) => ref.name === item.name);
    });
  }

  // Método para comparar texto extraído de un PDF con la referencia
  comparePDFTextWithReference(text: string): boolean {
    // Ejemplo simple: verificar si alguna línea del texto coincide con un nombre en la referencia
    const lines = text.split('\n');
    return lines.some((line) => {
      return this.referenceData.some((ref) => line.includes(ref.name));
    });
  }

  // Método para enviar notificaciones
  async sendNotification(email: string, subject: string, content: string) {
    const mailOptions = {
      from: 'abrahag40@gmail.com',
      to: email,
      subject: 'Match Found: ' + subject,
      text: content,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Método para observar emails entrantes
  async watchEmails() {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    // console.log('Using service account:', this.oauth2Client.credentials);

    try {
      const res = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: process.env.GOOGLE_TOPIC_NAME,
          labelIds: ['INBOX'],
        },
      });
      console.log('Watch response:', res.data);
    } catch (error) {
      // console.error('Error watching emails2:', error);
    }
  }
}
