/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-21 17:37:25
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-21 17:39:43
 */
import { Message } from '@/apis/setting/message';
import dayjs from 'dayjs';

const message: Required<Message> = {
  release: {
    show: true,
    lastTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    interval: 0,
    remind: 'popup',
  },
};

export default message;
