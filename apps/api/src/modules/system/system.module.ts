import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { MessageModule } from './message/message.module';
import { NoticeModule } from './notice/notice.module';
import { PermissionModule } from './permission/permission.module';
import { ProjectModule } from './project/project.module';
import { RoleModule } from './role/role.module';
import { StorageServiceModule } from './storage-service/storage-service.module';
import { VersionModule } from './version/version.module';
import { LegalDocumentModule } from './legal-document/legal-document.module';

@Module({
  imports: [
    PermissionModule,
    RoleModule,
    EmailModule,
    ProjectModule,
    VersionModule,
    StorageServiceModule,
    MessageModule,
    NoticeModule,
    LegalDocumentModule,
  ],
  exports: [
    PermissionModule,
    RoleModule,
    EmailModule,
    ProjectModule,
    VersionModule,
    StorageServiceModule,
    MessageModule,
    NoticeModule,
    LegalDocumentModule,
  ],
})
export class SystemModule {}
