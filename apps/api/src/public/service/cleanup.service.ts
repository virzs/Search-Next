import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { ResourceService } from 'src/modules/resource/resource.service';
import { ResourceDBName } from 'src/modules/resource/schemas/ref-names';

/**
 * 定时清理服务
 */
@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectConnection() private connection: Connection,
    private readonly resourceService: ResourceService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldData() {
    this.logger.log('开始清理过期数据...');
    const collections = await this.connection.db.collections();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    for (const collection of collections) {
      // 如果是资源集合，需要先删除对象存储中的文件
      if (collection.collectionName === ResourceDBName) {
        const resources = await collection
          .find({
            isDelete: true,
            updatedAt: { $lt: sixtyDaysAgo },
          })
          .toArray();

        for (const resource of resources) {
          try {
            await this.resourceService.deleteFilePermanent(
              resource._id.toString(),
            );
            this.logger.log(`已删除对象存储文件: ${resource.key}`);
          } catch (error) {
            this.logger.error(`删除对象存储文件失败: ${resource.key}`, error);
          }
        }
        continue;
      }

      const result = await collection.deleteMany({
        isDelete: true,
        updatedAt: { $lt: sixtyDaysAgo },
      });

      result.deletedCount > 0 &&
        this.logger.log(
          `集合 ${collection.collectionName} 清理完成，删除了 ${result.deletedCount} 条记录`,
        );
    }

    this.logger.log('所有集合清理完成');
  }
}
