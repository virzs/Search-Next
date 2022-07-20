/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-15 16:57:39
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-20 18:00:09
 */

import { SMDB } from '@/utils/db';
import dayjs from 'dayjs';

export interface Release {
  show: boolean;
  lastTime: string;
  interval: number;
  remind: string;
}

export interface Message {
  release?: Release;
}

export const setMessage = (data: Message) => {
  const userId = localStorage.getItem('account');
  const res = SMDB.findOne({ userId });

  return res ? SMDB.update({ userId }, data) : SMDB.inset({ userId, ...data });
};

export const getMessage = () => {
  const userId = localStorage.getItem('account');
  const res = SMDB.findOne({ userId });
  if (!res) {
    setMessage({
      release: {
        show: true,
        lastTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        interval: 0,
        remind: 'popup',
      },
    });
  }

  return SMDB.findOne({ userId });
};
