/*
 * @Author: Vir
 * @Date: 2022-04-08 15:40:09
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-09 16:15:18
 */

import { DB_BASE_COL } from '@/utils/db';

/**
 * @name 和风天气 API 请求参数
 */
export interface QweatherNowParams {
  /**
   * @name 和风天气 API KEY
   * @desc 可以为空，默认使用服务器配置的 KEY
   */
  key?: string;
  /**
   * @name 城市 ID / 经度,纬度坐标
   * @desc 需要查询地区的LocationID或以英文逗号分隔的经度,纬度坐标（十进制，最多支持小数点后两位）
   */
  location: string;
}

/**
 * @name 和风天气 API 请求参数
 */
export interface QweatherCityParams extends QweatherNowParams {}

/**
 * @name 地区数据
 */
export interface QWeatherCity {
  /**
   * @name 地区 / 城市列表
   */
  location: Location[];
  /**
   * @name 数据描述
   */
  refer: Refer;
}

export interface Location {
  /**
   * @name 地区/城市名称
   */
  name: string;
  /**
   * @name 地区/城市ID
   */
  id: string;
  /**
   * @name 地区/城市纬度
   */
  lat: string;
  /**
   * @name 地区/城市经度
   */
  lon: string;
  /**
   * @name 地区/城市的上级行政区划名称
   */
  adm2: string;
  /**
   * @name 地区/城市所属一级行政区域
   */
  adm1: string;
  /**
   * @name 地区/城市所属国家名称
   */
  country: string;
  /**
   * @name 地区/城市所在时区
   * @desc https://dev.qweather.com/docs/resource/glossary/#timezone
   */
  tz: string;
  /**
   * @name 地区/城市目前与UTC时间偏移的小时数
   * @desc https://dev.qweather.com/docs/resource/glossary/#utc-offset
   */
  utcOffset: string;
  /**
   * @name 地区/城市是否当前处于夏令时
   * @desc 1 表示当前处于夏令时 0 表示当前不是夏令时
   * @desc https://dev.qweather.com/docs/resource/glossary/#daylight-saving-time
   */
  isDst: string;
  /**
   * @name 地区/城市的属性
   */
  type: string;
  /**
   * @name 地区评分
   * @desc https://dev.qweather.com/docs/resource/glossary/#rank
   */
  rank: string;
  /**
   * @name 该地区的天气预报网页链接
   */
  fxLink: string;
}

/**
 * @name 当前天气数据
 */
export interface QWeatherNow {
  /**
   * @name 当前API的最近更新时间
   */
  updateTime: string;
  /**
   * @name 当前数据的响应式页面
   */
  fxLink: string;
  /**
   * @name 天气数据
   */
  now: Now;
  /**
   * @name 数据描述
   */
  refer: Refer;
}

export interface Now {
  /**
   * @name 数据观测时间
   */
  obsTime: string;
  /**
   * @name 温度
   * @desc 默认单位：摄氏度
   */
  temp: string;
  /**
   * @name 体感温度
   * @desc 默认单位：摄氏度
   */
  feelsLike: string;
  /**
   * @name 天气状况和图标的代码
   */
  icon: string;
  /**
   * @name 天气状况的文字描述，包括阴晴雨雪等天气状态的描述
   */
  text: string;
  /**
   * @name 风向360角度
   */
  wind360: string;
  /**
   * @name 风向
   */
  windDir: string;
  /**
   * @name 风力等级
   */
  windScale: string;
  /**
   * @name 风速
   * @desc 公里/小时
   */
  windSpeed: string;
  /**
   * @name 相对湿度
   * @desc 百分比数值
   */
  humidity: string;
  /**
   * @name 当前小时累计降水量
   * @desc 默认单位：毫米
   */
  precip: string;
  /**
   * @name 大气压强
   * @desc 默认单位：百帕
   */
  pressure: string;
  /**
   * @name 能见度
   * @desc 默认单位：公里
   */
  vis: string;
  /**
   * @name 云量
   * @desc 百分比数值。可能为空
   */
  cloud?: string;
  /**
   * @name 露点温度
   * @desc 可能为空
   */
  dew?: string;
}

export interface Refer {
  /**
   * @name 原始数据来源，或数据源说明
   */
  sources?: string[];
  /**
   * @name 数据许可或版权声明
   * @desc 可能为空
   */
  license?: string[];
}

export interface SaveWeatherData extends DB_BASE_COL {
  /**
   * @name 用户id
   */
  userId: string;
  /**
   * @name 天气数据
   */
  weather: QWeatherNow;
  /**
   * @name 城市数据
   */
  city: QWeatherCity;
  /**
   * @name 和风天气 key
   */
  key?: string;
  /**
   * @name 和风天气插件 key
   */
  pluginKey?: string;
  /**
   * @name 经纬度
   */
  latlng?: number[];
}
