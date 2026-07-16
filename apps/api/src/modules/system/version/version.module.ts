import { Module } from "@nestjs/common";
import { VersionService } from "./version.service";
import { VersionController } from "./version.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { VersionName, VersionSchema } from "./schemas/version";
import {
  ReleasePublicationName,
  ReleasePublicationSchema,
} from "./release-publication.schema";
import { ReleasePublicationService } from "./release-publication.service";
import { ProjectModule } from "../project/project.module";
import { NoticeModule } from "../notice/notice.module";

@Module({
  controllers: [VersionController],
  providers: [VersionService, ReleasePublicationService],
  imports: [
    ProjectModule,
    NoticeModule,
    MongooseModule.forFeature([
      {
        name: VersionName,
        schema: VersionSchema,
      },
      {
        name: ReleasePublicationName,
        schema: ReleasePublicationSchema,
      },
    ]),
  ],
})
export class VersionModule {}
