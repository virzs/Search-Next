import channelOptions, { ChannelType } from '@/data/channel';
import { SPCDB } from '@/utils/db';

/*
 * @Author: Vir
 * @Date: 2022-06-29 17:40:21
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 15:52:11
 */

// 获取预览渠道相关设置
export const getChannel = () => {
  const userId = localStorage.getItem('account');
  const result = SPCDB.findOne({ userId: { $eq: userId } });
  return result || SPCDB.inset({ userId, channel: channelOptions[0].value });
};

// 设置预览渠道相关设置
export const setChannel = (channel: ChannelType) => {
  const userId = localStorage.getItem('account');
  const result = SPCDB.findOne({ userId: { $eq: userId } });
  if (result) {
    return SPCDB.update({ userId: { $eq: userId } }, { channel });
  } else {
    return getChannel();
  }
};

// 判断是否可查看，用于路由及权限判断
export const checkChannel = (channel: ChannelType) => {
  const userId = localStorage.getItem('account');
  const result = SPCDB.findOne({ userId: { $eq: userId } });
  if (result) {
    if (result.channel === 'dev') {
      return channel === 'beta' || channel === 'dev';
    }
    return result.channel === channel;
  } else {
    return false;
  }
};

// 处理当前预览渠道数据
export const getChannelOption = (channel: ChannelType) => {
  return channelOptions.find((item) => item.value === channel);
};
