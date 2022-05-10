/*
 * @Author: Vir
 * @Date: 2022-05-10 11:30:20
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-10 16:59:14
 */

import { SPIDB } from '@/utils/db';
import { IndexWeatherParams } from './interface';

export const saveIndexWeatherSetting = (params: IndexWeatherParams) => {
  const { show, interval, userId } = params;
  const localData = SPIDB.findOne({ userId });
  if (localData) {
    return SPIDB.update(
      { userId },
      { navBar: { left: { weather: { show, interval } } } },
    );
  } else {
    return SPIDB.inset({
      userId,
      navBar: { left: { weather: { show, interval } } },
    });
  }
};

export const getIndexWeatherSetting = (userId: string) => {
  return SPIDB.findOne({ userId });
};
