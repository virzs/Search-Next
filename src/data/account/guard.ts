/*
 * @Author: Vir
 * @Date: 2021-10-17 21:28:41
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-17 22:04:05
 */

import { ClockLogo } from './interface';

export const isClockLogo = (obj: any): obj is ClockLogo => {
  return obj.type;
};
