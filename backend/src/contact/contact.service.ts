import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly repo: Repository<Contact>, // FIXED: contact repository

    private readonly cloudinary: CloudinaryService, // FIXED: cloudinary service
  ) {}

  async handleContact(body: any, file: Express.Multer.File) {
    // Upload to Cloudinary
    const resumeUrl = await this.cloudinary.uploadFile(file);

    // Save to DB
    const entry = this.repo.create({
      name: body.name,
      email: body.email,
      message: body.message,
      resumeName: file.originalname,
      resumeUrl,
    });

    await this.repo.save(entry);

    return {
      success: true,
      message: 'Resume uploaded successfully!',
      resumeUrl,
    };
  }
}
