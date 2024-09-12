import { Injectable, Logger } from '@nestjs/common';
import { PubSub, Subscription } from '@google-cloud/pubsub';
import * as path from 'path';

@Injectable()
export class PubSubService {
  private readonly logger = new Logger(PubSubService.name);
  private pubSubClient: PubSub;
  private subscription: Subscription;
  // private topicName = 'gmail-notifications';
  private topicName = process.env.GOOGLE_TOPIC_NAME;

  constructor() {
    const keyFilePath = path.join(__dirname, '..', '..', 'keys', 'service-account.json');
    this.pubSubClient = new PubSub({ projectId: 'electronic-installation', keyFilename: keyFilePath });
    
    console.log('---- keyFilePath', this.pubSubClient);
    const subscriptionName = process.env.GOOGLE_SUBSCRIPTION_NAME; 
    this.subscription = this.pubSubClient.subscription(subscriptionName);
  }

  async publishMessage() {  
    const data = JSON.stringify({ message: 'This is a test message' });
    const dataBuffer = Buffer.from(data);

    try {
      const messageId = await this.pubSubClient.topic(this.topicName).publishMessage({ data: dataBuffer });
      console.log(`Message ${messageId} published.`);
    } catch (error) {
      console.error(`Failed to publish message: ${error}`);
    }
  }

  listenForMessages() {
    this.subscription.on('message', message => {
      this.logger.log(`Received message: ${message.data}`);
      // Llama al método para procesar el nuevo correo usando la información del mensaje
      this.processNewEmail(message.data.toString());
      message.ack();
    });

    this.subscription.on('error', error => {
      this.logger.error(`Error receiving message: ${error.message}`);
    });
  }

  async processNewEmail(historyId: string) {
    // Aquí puedes implementar la lógica para procesar el correo usando historyId
    // como referencia para obtener los detalles del correo.
    console.log('Processing email with historyId:', historyId);

    // Por ejemplo, podrías llamar a processEmails con los detalles del correo
  }
}
