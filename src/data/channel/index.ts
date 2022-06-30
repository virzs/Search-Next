/*
 * @Author: Vir
 * @Date: 2022-06-30 10:14:24
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 10:25:07
 */

export type ChannelType = 'official' | 'beta' | 'dev';

export interface Channel {
  label: string;
  value: ChannelType;
  desc: string;
}

const channelOptions: Channel[] = [
  {
    label: 'OFFICIAL',
    value: 'official',
    desc: '正式渠道，最稳定',
  },
  {
    label: 'BETA',
    value: 'beta',
    desc: '测试渠道，相较于DEV版本，更加完善，但也更加慢。',
  },
  {
    label: 'DEV',
    value: 'dev',
    desc: '开发渠道，使用最新的代码，会存在一些问题和低稳定性',
  },
];

export default channelOptions;
