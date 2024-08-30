import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailRepository } from './email.repository';
import { Email } from './email.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>, // Repositorio estándar
  ) {}

  async findAll(): Promise<Email[]> {
    return this.emailRepository.find();
  }

  async findOne(id: number): Promise<Email> {
    return this.emailRepository.findOne({ where: { id } }); // Cambio para asegurar que 'id' sea el único parámetro
  }

  async create(email: Email): Promise<Email> {
    return this.emailRepository.save(email);
  }

  async update(id: number, email: Email): Promise<Email> {
    await this.emailRepository.update(id, email);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.emailRepository.delete(id);
  }
  
  async findMatchingEmails(): Promise<Email[]> {
    return this.emailRepository.find({ where: { isMatch: true } });
  }
}
