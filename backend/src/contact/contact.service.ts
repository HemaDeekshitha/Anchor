import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './contact.entity';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private repo: Repository<Contact>,
  ) {}

  async create(data: CreateContactDto) {
    const contact = this.repo.create(data);
    return await this.repo.save(contact);
  }
}
