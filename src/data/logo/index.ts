/*
 * @Author: Vir
 * @Date: 2021-10-12 22:36:47
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 15:27:56
 */

import { Clock1, Clock2 } from '@/components/global/logo';
import Clock3 from '@/components/global/logo/Clock3';

// TODO logo按类型分类 文字、图片、天气、时钟

export type LogoType = 'clock' | 'text' | 'image';

export type ClockLogoType = 'clock1' | 'clock2' | 'clock3';

export const ClockData = [
  {
    id: '2e47f2c6d0bb48ba98a58dbb8dfb2fd3',
    title: '时钟1',
    value: 'clock1',
    tooltip: '经典的时钟样式',
    component: Clock1,
  },
  {
    id: 'cb229f5384094f32a7ba3228c78f0a68',
    title: '时钟2',
    value: 'clock2',
    tooltip: '以日期为主的时钟样式',
    component: Clock2,
  },
  {
    id: '780ab9033f274f6bbb596adfc2ff66a2',
    title: '时钟3',
    value: 'clock3',
    tooltip: '点阵时钟样式',
    component: Clock3,
  },
];

const LogoData = [
  {
    id: 'd3f18d1475034b0fa65c897e43e6160c',
    name: '时钟',
    value: 'clock',
    options: ClockData,
  },
  {
    id: 'b733a3efbad94097bc04093e8f0f1904',
    name: '文字',
    value: 'text',
  },
  {
    id: '4cf35023ddf0458da5f4425fb5b7b660',
    name: '图片',
    value: 'image',
  },
];

export default LogoData;
