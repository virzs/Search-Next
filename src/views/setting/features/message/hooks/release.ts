/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-14 11:59:12
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-21 17:38:43
 */

import { Release } from '@/apis/setting/message';
import message from '@/data/message';
import dayjs from 'dayjs';
import { useState } from 'react';

export interface UseReleaseMessageAction {
  setRelease: (data: Release) => void;
}

/**
 * @name 版本更新消息通知设置
 */
const useReleaseMessage = (): [Release, UseReleaseMessageAction] => {
  const [release, setRelease] = useState<Release>(message.release);

  const setData = (data: Release) => {
    let newData: Release = { ...release };

    data.show !== undefined && (newData['show'] = data.show);
    data.interval !== undefined && (newData['interval'] = data.interval);
    data.remind !== undefined && (newData['remind'] = data.remind);

    if (
      data.show !== release.show ||
      data.interval !== release.interval ||
      data.remind !== release.remind
    ) {
      newData['lastTime'] = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }

    setRelease({
      ...newData,
    });
  };

  return [release, { setRelease: setData }];
};

export default useReleaseMessage;
