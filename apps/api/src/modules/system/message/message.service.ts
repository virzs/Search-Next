import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageSchemaName, Message, MessageData } from './message.schema';
import { Response } from 'src/utils/response';
import { MessageQueryDto } from './dto/message-query.dto';

@Injectable()
export class MessageService {
  private readonly subscribers = new Map<string, Subject<MessageData>>();
  private readonly LATEST_MESSAGE_LIMIT = 50; // 最新消息数量限制

  constructor(
    @InjectModel(MessageSchemaName)
    private readonly messageModel: Model<Message>,
  ) {}

  // 订阅消息
  subscribe(userId: string): Subject<MessageData> {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Subject<MessageData>());
    }
    return this.subscribers.get(userId);
  }

  // 取消订阅
  unsubscribe(userId: string) {
    const subscriber = this.subscribers.get(userId);
    if (subscriber) {
      subscriber.complete();
      this.subscribers.delete(userId);
    }
  }

  // 发送消息给指定用户
  async sendMessageToUser(userId: string, message: MessageData) {
    // 保存消息到数据库
    await this.messageModel.create({
      type: message.module,
      key: message.key,
      data: message,
      userId,
      isBroadcast: false,
    });

    const subscriber = this.subscribers.get(userId);
    if (subscriber) {
      subscriber.next(message);
    }
  }

  // 广播消息给所有用户
  async broadcast(message: MessageData) {
    // 保存广播消息到数据库
    await this.messageModel.create({
      type: message.module,
      key: message.key,
      data: message,
      isBroadcast: true,
    });

    this.subscribers.forEach((subscriber) => {
      subscriber.next(message);
    });
  }

  // 获取用户最新消息
  async getLatestMessages(userId: string, query: MessageQueryDto = new MessageQueryDto()) {
    const messages = await this.messageModel
      .find(this.buildUserMessageFilter(userId, query.key))
      .sort({ createdAt: -1 })
      .limit(this.LATEST_MESSAGE_LIMIT)
      .exec();

    return messages;
  }

  // 获取用户消息列表
  async getUserMessages(userId: string, query: MessageQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize;
    const filter = this.buildUserMessageFilter(userId, query.key);

    const messages = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.messageModel.countDocuments(filter);

    return Response.page(messages, { page, pageSize, total });
  }

  // 标记消息为已读
  async markAsRead(messageId: string) {
    return this.messageModel.findByIdAndUpdate(messageId, {
      isRead: true,
    });
  }

  // 获取用户未读消息数量
  async getUnreadCount(userId: string, query: MessageQueryDto = new MessageQueryDto()) {
    return this.messageModel.countDocuments({
      ...this.buildUserMessageFilter(userId, query.key),
      isRead: false,
    });
  }

  private buildUserMessageFilter(userId: string, key?: string) {
    return {
      $or: [{ userId }, { isBroadcast: true }],
      ...(key ? {
        $and: [{
          $or: [
            { key },
            { 'data.key': key },
            { type: key },
            { 'data.module': key },
          ],
        }],
      } : {}),
    };
  }
}
