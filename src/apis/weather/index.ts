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
): Promise<{ data: QWeatherNow }> => {
  return instance.get('/v1/resource/qweather/now', {
    params,
  });
};

// 获取城市信息
export const locationInfo = (params: any): Promise<{ data: QWeatherCity }> => {
  return instance.get('/v1/resource/qweather/city', { params });
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
  return SWDB.findOne({ userId });
};
