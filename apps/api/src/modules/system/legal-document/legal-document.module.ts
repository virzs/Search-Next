import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from 'src/modules/users/schemas/user';
import { UsersName } from 'src/modules/users/schemas/ref-names';
import { LegalDocumentController } from './legal-document.controller';
import {
  LegalDocumentSchema,
  LegalDocumentSchemaName,
} from './legal-document.schema';
import { LegalDocumentService } from './legal-document.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LegalDocumentSchemaName, schema: LegalDocumentSchema },
      { name: UsersName, schema: UsersSchema },
    ]),
  ],
  controllers: [LegalDocumentController],
  providers: [LegalDocumentService],
  exports: [LegalDocumentService],
})
export class LegalDocumentModule {}
