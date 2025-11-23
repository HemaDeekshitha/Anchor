import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('resume'))
  async uploadContact(@Body() body, @UploadedFile() file: Express.Multer.File) {
    return this.contactService.handleContact(body, file);
  }
}
