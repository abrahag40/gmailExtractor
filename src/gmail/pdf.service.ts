import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as pdfParse from 'pdf-parse';
import axios from 'axios';

@Injectable()
export class PDFService {
  private openai: OpenAI;
  private readonly apiKey = process.env.OPENAI_API_KEY;

  constructor(){
    this.openai = new OpenAI({
      apiKey: this.apiKey
    });

  }

  async processPDFWithOpenAI(pdfBuffer: Buffer, parentPDF: string) {
    const pdfText = await this.extractTextFromPDFBuffer(pdfBuffer);    
    const analysisResult = await this.processPdfContent(pdfText, parentPDF);

    console.log(analysisResult);
    return '';
  }

  async extractTextFromPDFBuffer(pdfBuffer: Buffer): Promise<string> {
    const pdfData = await pdfParse(pdfBuffer);  // Using pdf-parse to extract the text    
    return pdfData.text;
  }

  async processPdfContent(pdfContent: string, parentPDF: string) {
    console.log(parentPDF);
    
    try {
      // const response = await this.openai.chat.completions.create({
      //   model: 'gpt-4o-mini',
      //   messages: [
      //     {
      //       role: 'user',
      //       content: 
      //         `Just answer.
      //         Next data it's comming from an excel processed with pdfParse, read the 'Descripción' column (Column B).

      //         - Excel Data: ${parentPDF}

      //         Then next data processed with pdfParse it's comming from a seller company of electrical products

      //         - Invoice PDF Data: ${pdfContent}
              
      //         The target it's create a JSON object only with the records that match.

      //         The result data will be added in a new excel, mandatory if match, fill the data with excel file. Example of the JSON:

      //         [{
      //           BSPRE: 'BSAN.PRE.001', // this have to come from first column of the data extracted the Excel. If it's same string that "PRELIMINARES" row it's wrong 
      //           PRELIMINARES: 'Barrera Bidireccional tránsito color naranja.',
      //           Unidad: 'Pza',
      //           Cantidad: '1.00',
      //           UnitaryPrice: '$205.49',
      //         }]

              
      //         `
      //     }
      //   ],
      // });
      // return response.choices[0].message.content;
    } catch (err) {
      console.log('Error: ' + err);
      return err;
    }
  }


}
