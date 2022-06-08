import { useRef } from 'react';
/*
 * @Author: Vir
 * @Date: 2022-06-07 14:41:50
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-07 18:02:09
 */

import {
  locationInfo,
  qweatherNow,
  getWeather as getLocalWeather,
  saveWeather as saveLocalWeather,
} from '@/apis/weather';
import {
  QWeatherCity,
  QweatherCityParams,
  QWeatherNow,
  QweatherNowParams,
  SaveWeatherData,
} from '@/apis/weather/interface';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import geolocation from '../utils/geolocation';

export interface Location {
  longitude: number;
  latitude: number;
}

export interface UseWeatherResult {
  /**
   * geolocation 权限状态
   * @type {PermissionState}
   */
  geoLocationStatus: PermissionState;
  /**
   * 是否正在加载
   * @type {boolean}
   */
  loading: boolean;
  /**
   * 是否有权限
   * @type {boolean}
   */
  permission: boolean;
  /**
   * 是否已经获取权限
   * @type {boolean}
   */
  authed: boolean;
  /**
   * 定位信息
   * @type {Location}
   */
  location?: Location;
  /**
   * 天气信息
   * @type {QWeatherNow}
   */
  weather?: QWeatherNow;
  /**
   * 城市信息
   * @type {QWeatherCity}
   */
  city?: QWeatherCity;
  /**
   * key
   * @type {string}
   */
  key: string;
  /**
   * pluginKey
   * @type {string}
   */
  pluginKey: string;
  /**
   * 是否显示
   * @type {boolean}
   */
  show?: boolean;
}

export interface UseWeatherAction {
  setData: (params: SetDataParams) => void;
  refresh: () => void;
}

export type UseWeatherReturn = [UseWeatherResult, UseWeatherAction];

export interface FetchParams {
  key?: string;
}

export interface SetDataParams {
  key?: string;
  pluginKey?: string;
  interval?: number;
  show?: boolean;
}

const useWeather = (): UseWeatherReturn => {
  const userId = localStorage.getItem('account') ?? '';
  const timer = useRef();

  const [lastState, setLastState] = useState<string | undefined>(undefined);
  const [geoLocationStatus, setGeoLocationStatus] =
    useState<PermissionState>('prompt');
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [location, setLocation] = useState<Location>();
  const [weather, setWeather] = useState<QWeatherNow>();
  const [city, setCity] = useState<QWeatherCity>();
  const [key, setKey] = useState<string>('');
  const [pluginKey, setPluginKey] = useState<string>('');
  const [show, setShow] = useState(false);
  const [localWeatherData, setLocalWeatherData] = useState<SaveWeatherData>();

  const setData = (params: SetDataParams) => {
    const { key, pluginKey, interval, show } = params;
    key && setKey(key);
    pluginKey && setPluginKey(pluginKey);
    show && setShow(show);
  };

  const fetch = <W, T>(
    fn: any,
    params: T extends FetchParams ? T : FetchParams,
    callback: (data: W) => void,
  ) => {
    setLoading(true);
    const { key } = params;
    fn(params)
      .then((res: any) => {
        callback(key ? res : res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // 获取城市信息
  const getCity = (params: QweatherCityParams) => {
    fetch<QWeatherCity, QweatherCityParams>(locationInfo, params, (data) => {
      setCity(data);
    });
  };

  // 获取天气
  const getWeather = (params: QweatherNowParams) => {
    fetch<QWeatherNow, QweatherNowParams>(qweatherNow, params, (data) => {
      setWeather(data);
    });
  };

  // 获取当前定位
  const getCurrentPosition = () => {
    geolocation
      .getCurrentPosition()
      .then((res) => {
        setLocation(res);
        setGeoLocationStatus('granted');
        setAuthed(true);
      })
      .catch((err) => {
        if (err.code === 1) {
          setGeoLocationStatus('denied');
          setAuthed(false);
        }
      });
  };

  // 检查 geolocation 权限状态
  const applyPermission = () => {
    if (geolocation.checkGeolocation) {
      setPermission(true);
      geolocation.getPermissionStatus().then((status) => {
        setGeoLocationStatus(status);
        if (status === 'granted') {
          setAuthed(true);
        }
        getCurrentPosition();
      });
    } else {
      setPermission(false);
    }
  };

  const refresh = () => {
    const params = {
      location: location?.longitude + ',' + location?.latitude,
    };
    getCity(params);
    getWeather(params);
  };

  useEffect(() => {
    if (!location) return;
    refresh();
  }, [location]);

  useEffect(() => {
    applyPermission();
    const data = getLocalWeather(userId);
    setLocalWeatherData(data);
  }, []);

  const returnData = {
    geoLocationStatus,
    loading,
    permission,
    authed,
    location,
    weather,
    city,
    key,
    pluginKey,
    show,
  };

  const returnAction = {
    setData,
    refresh,
  };

  weather &&
    city &&
    saveLocalWeather({
      userId,
      weather,
      city,
      key,
      location,
      pluginKey,
      show,
    });

  return [returnData, returnAction];
};

export default useWeather;
