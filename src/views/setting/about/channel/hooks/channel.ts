/*
 * @Author: Vir
 * @Date: 2022-06-29 17:14:46
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 11:41:30
 */

import {
  getChannel,
  setChannel as setChannelApi,
} from '@/apis/setting/channel';
import channelOptions, { Channel, ChannelType } from '@/data/channel';
import { useEffect, useState } from 'react';

export interface UseChannelData {
  channel: ChannelType;
  option: Channel;
}

export interface UseChannelAction {
  refresh: () => void;
  updateChannel: (channel: ChannelType) => void;
}

export type UseChannelResult = [UseChannelData, UseChannelAction];

const useChannel = (): UseChannelResult => {
  const [channel, setChannel] = useState<ChannelType>(channelOptions[0].value);
  const [option, setOption] = useState<Channel>(channelOptions[0]);

  const fetchChannel = () => {
    const result = getChannel();
    setChannel(result.channel ?? channelOptions[0].value);
  };

  const updateChannel = (channel: ChannelType) => {
    setChannelApi(channel);
    setChannel(channel);
  };

  const refresh = () => {
    fetchChannel();
  };

  useEffect(() => {
    const opt = channelOptions.find((i) => i.value === channel);
    opt && setOption(opt);
  }, [channel]);

  useEffect(() => {
    fetchChannel();
  }, []);

  return [
    { channel, option },
    { refresh, updateChannel },
  ];
};

export default useChannel;
