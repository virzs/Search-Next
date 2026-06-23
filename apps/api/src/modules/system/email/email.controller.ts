import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dtos/send.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('邮件')
@Controller('system/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: '发送邮件' })
  @Post('send')
  sendEmail(@Body() body: SendEmailDto) {
    return this.emailService.sendEmail(body.email);
  }
}
