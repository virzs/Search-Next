import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from "class-validator";
import type { ReleaseComponent } from "./release-publication.schema";

export class PublishReleaseDto {
  @ApiProperty({ enum: ["web", "admin"] })
  @IsString()
  @IsIn(["web", "admin"])
  @Expose()
  component: ReleaseComponent;

  @ApiProperty({ description: "GitHub Release ID" })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Expose()
  githubReleaseId: number;

  @ApiProperty({ description: "公告标题" })
  @IsString()
  @IsNotEmpty()
  @Expose()
  announcementTitle: string;

  @ApiProperty({ description: "Markdown 公告内容" })
  @IsString()
  @IsNotEmpty()
  @Expose()
  announcementContent: string;

  @ApiProperty({ description: "确认对应构建已经部署", example: true })
  @IsBoolean()
  @Equals(true, { message: "请先确认对应构建已经部署" })
  @Expose()
  deploymentConfirmed: true;
}
