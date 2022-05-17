/*
 * @Author: Vir
 * @Date: 2022-04-08 15:38:40
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-09 16:16:12
 */

import { SWDB } from '@/utils/db';
import instance from '@/utils/request';
import {
  QWeatherCity,
  QWeatherNow,
  QweatherNowParams,
  SaveWeatherData,
} from './interface';

// 获取实时天气
export const qweatherNow = (
  params: QweatherNowParams,
): Promise<{ data: any }> => {
  const { key, ...rest } = params;
  return instance.get(
    key
      ? 'https://devapi.qweather.com/v7/weather/now'
      : '/v1/resource/qweather/now',
    { params: key ? params : rest },
  );
};

// 获取城市信息
export const locationInfo = (params: any): Promise<{ data: any }> => {
  const { key, ...rest } = params;

  return instance.get(
    key
      ? 'https://geoapi.qweather.com/v2/city/lookup'
      : '/v1/resource/qweather/city',
    { params: key ? params : rest },
  );
};

// 根据用户id保存当前天气设置
export const saveWeather = (
  data: Omit<SaveWeatherData, '_id' | 'createdTime' | 'updatedTime'>,
): SaveWeatherData => {
  const { userId, ...rest } = data;
  const result = SWDB.findOne({ userId });
  if (result) {
    return SWDB.update({ userId }, rest);
  }
  return SWDB.inset(data);
};

// 获取当前用户天气设置
export const getWeather = (userId: string): SaveWeatherData => {
  return SWDB.findOne({ userId }) ?? {};
};
