/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-14 11:41:39
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-20 17:02:34
 */
import {
  getMessage,
  Message,
  Release,
  setMessage,
} from '@/apis/setting/message';
import { useEffect } from 'react';
import useReleaseMessage from './release';

export interface UseMessageData {
  release: Release;
}

export interface UseMessageActions {
  setData: (data: Message) => void;
  refresh: () => void;
}

const useMessage = (): [UseMessageData, UseMessageActions] => {
  const [release, { setRelease }] = useReleaseMessage();

  const setData = (data: Message) => {
    data.release && setRelease(data.release);

    setMessage({ release: data.release ?? release });
  };

  const getData = () => {
    const result = getMessage();

    result?.release && setRelease(result.release);
  };

  const refresh = () => {
    getData();
  };

  useEffect(() => {
    getData();
  }, []);

  return [{ release }, { refresh, setData }];
};

export default useMessage;
