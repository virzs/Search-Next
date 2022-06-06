/*
 * @Author: Vir
 * @Date: 2022-04-08 16:02:55
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-12 16:57:01
 */
import {
  getIndexWeatherSetting,
  saveIndexWeatherSetting,
} from '@/apis/pages/index';
import {
  getWeather,
  locationInfo,
  qweatherNow,
  saveWeather,
} from '@/apis/weather';
import {
  QWeatherCity,
  QweatherCityParams,
  QWeatherNow,
  QweatherNowParams,
} from '@/apis/weather/interface';
import Select from '@/components/md-custom/form/select';
import ContentLinkList from '@/pages/setting/components/contentLinkList';
import Link from '@/pages/setting/components/contentLinkList/link';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
import { css } from '@emotion/css';
import { Alert, AlertTitle, Switch, TextField } from '@mui/material';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import WeatherCard from './components/weatherCard';
import geolocation from './utils/geolocation';

const Weather: FC = () => {
  let timer: number | undefined; // 定时器（点击授权时检查是否授权）
  let lastState: string | undefined; // 上一次的状态（记录单次点击授权最后一次状态，undefined时表示第一次点击）
  const userId = localStorage.getItem('account') ?? '';

  const [weather, setWeather] = React.useState<QWeatherNow>({} as QWeatherNow);
  const [location, setLocation] = React.useState<QWeatherCity>(
    {} as QWeatherCity,
  );
  const [permission, setPermission] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<string>('');
  const [geolocationStatus, setGeolocationStatusStatus] =
    React.useState<boolean>(false);
  const [key, setKey] = useState('');
  const [pluginKey, setPluginKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [latlng, setLatlng] = useState<number[]>([]);
  const [weatherInterval, setWeatherInterval] = useState(15);
  const [show, setShow] = useState(true);
  const [init, setInit] = useState(false);

  const refreshOptions = [
    { label: '10分钟', value: 10 },
    { label: '15分钟', value: 15 },
    { label: '30分钟', value: 30 },
  ];

  // 获取当前位置并获取天气
  const getCurrentPosition = () => {
    geolocation.getCurrentPosition().then((res) => {
      const localData = getWeather(userId);
      const time = dayjs(localData?.updatedTime ?? localData?.createdTime);
      const diff = localData ? dayjs().diff(time, 'minute') > 10 : true;
      setKey(localData?.key ?? '');
      setPluginKey(localData?.pluginKey ?? '');
      if (diff) {
        setLatlng([res.longitude, res.latitude]);
        getLocationInfo({
          key: key ?? localData?.key,
          location: res.longitude + ',' + res.latitude,
        });
        getWeatherInfo({
          key: key ?? localData?.key,
          location: res.longitude + ',' + res.latitude,
        });
      } else if (localData) {
        localData.weather && setWeather(localData.weather);
        localData.city && setLocation(localData.city);
      }
    });
  };

  const applyPermission = () => {
    if (geolocation.checkGeolocation) {
      /* 地理位置服务可用 */
      setPermission(true);
      geolocation.getPermissionStatus().then((res) => {
        if (res === 'granted') {
          setGeolocationStatusStatus(true);
          getCurrentPosition();
        } else {
          setGeolocationStatusStatus(false);
        }
      });
    } else {
      /* 地理位置服务不可用 */
      setPermission(false);
    }
  };

  // 检查授权状态
  const checkPermission = () => {
    getCurrentPosition();
    timer = setInterval(async () => {
      geolocation.getPermissionStatus().then((res) => {
        setGeolocationStatusStatus(res === 'granted');
        setStatus(res);
        if (res !== 'prompt') {
          clearTimeout(timer);
          !lastState && toast.info('已选择位置信息权限，请检查浏览器设置');
          return;
        }
        lastState = res;
      });
    }, 100);
  };

  // 获取位置城市信息
  const getLocationInfo = (params: QweatherCityParams) => {
    setLoading(true);
    const { key } = params;
    locationInfo(params).then((res) => {
      setLocation(key ? res : res.data);
      setLoading(false);
    });
  };

  // 获取天气信息
  const getWeatherInfo = (params: QweatherNowParams) => {
    setLoading(true);
    const { key } = params;
    qweatherNow(params).then((res) => {
      setWeather(key ? res : res.data);
      setLoading(false);
    });
  };

  // 获取主页 天气设置
  const getWeatherSetting = () => {
    const res = getIndexWeatherSetting(userId);
    const setting = res?.navBar?.left?.weather;
    if (setting) {
      setWeatherInterval(setting.interval);
      setShow(setting.show);
    }
  };

  const onIndexSettingChange = (key: string, value: any) => {
    key === 'interval' && setWeatherInterval(value);
    key === 'show' && setShow(value);
    const res = getIndexWeatherSetting(userId);
    const setting = res?.navBar?.left?.weather;
    saveIndexWeatherSetting({
      ...setting,
      userId,
      [key]: value,
    });
  };

  useEffect(() => {
    applyPermission();
    getWeatherSetting();
    setInit(true);
  }, []);

  useEffect(() => {
    // 保存天气信息前校验是否超过十分钟，填写key时不校验
    const localData = getWeather(userId);
    const time = dayjs(localData?.updatedTime ?? localData?.createdTime);
    const diff = localData ? dayjs().diff(time, 'minute') > 10 : true;
    if (
      Object.keys(weather).length > 0 &&
      Object.keys(location).length > 0 &&
      (diff || !!localData?.key)
    ) {
      saveWeather({
        userId,
        weather: weather,
        city: location,
        key: key,
        latlng,
      });
    }
  }, [weather, location]);

  return (
    <div>
      {geolocationStatus && (
        <WeatherCard
          apiKey={key}
          onRefresh={() => getCurrentPosition()}
          weather={weather}
          city={location}
          loading={loading}
        />
      )}
      <ContentList>
        <ContentTitle title="权限"></ContentTitle>
        <ItemAccordion
          title="位置访问"
          desc="获取用户地理位置信息，用于天气查询"
          action={
            <Switch
              disabled={!permission}
              onClick={(e) => e.stopPropagation()}
              checked={geolocationStatus}
              onChange={(e) => {
                checkPermission();
              }}
            />
          }
        >
          {!permission && (
            <Alert severity="warning">当前浏览器位置访问权限不可用</Alert>
          )}
          {status === 'granted' && (
            <Alert severity="success">已授权位置访问权限</Alert>
          )}
          {status === 'denied' && (
            <Alert severity="error">位置访问权限被拒绝，请检查浏览器设置</Alert>
          )}
          {status === 'prompt' && (
            <Alert severity="info">等待授权位置访问权限</Alert>
          )}
        </ItemAccordion>
        <ContentTitle title="KEY"></ContentTitle>
        <Alert severity="info">
          <AlertTitle>为什么需要填写KEY？</AlertTitle>
          虽然和风天气提供了免费方案，但考虑到使用次数限制，最好的方式是自己申请KEY，然后填写到下方。
          当然不填写KEY也可以使用天气功能，但是查询次数会有限制，如果超过限制，则无法使用天气功能。
        </Alert>
        <ItemAccordion title="和风天气KEY" desc="设置和风天气使用时必须的KEY">
          <Alert
            severity="warning"
            className={css`
              margin-bottom: 8px;
            `}
          >
            该KEY仅用作和风天气API使用，不会保存到服务器，请勿将KEY泄露给他人。
          </Alert>
          <TextField
            fullWidth
            variant="standard"
            label="和风天气API KEY"
            placeholder="请输入和风天气API KEY"
            value={key}
            disabled={!permission}
            onChange={(e) => {
              setKey(e.target.value);
            }}
            onBlur={() => {
              saveWeather({
                userId,
                weather: weather,
                city: location,
                key,
              });
            }}
            error={key.length > 32}
            helperText={key.length > 32 ? 'KEY长度不能超过32位' : ''}
          ></TextField>
          <div className="h-3"></div>
          <Alert
            severity="warning"
            className={css`
              margin-bottom: 8px;
            `}
          >
            该KEY仅用作和风天气插件使用，不会保存到服务器，请勿将KEY泄露给他人。
          </Alert>
          <TextField
            fullWidth
            variant="standard"
            label="和风天气插件 KEY"
            placeholder="请输入和风天气天气插件 KEY"
            value={pluginKey}
            disabled={!permission}
            onChange={(e) => {
              setPluginKey(e.target.value);
            }}
            onBlur={() => {
              saveWeather({
                userId,
                weather: weather,
                city: location,
                pluginKey,
              });
            }}
            error={pluginKey.length > 32}
            helperText={pluginKey.length > 32 ? 'KEY长度不能超过32位' : ''}
          ></TextField>
        </ItemAccordion>
        <ContentTitle title="高级设置" />
        <ItemCard
          title="刷新时间"
          desc="设置天气自动更新时间间隔"
          action={
            <Select
              disabled={!key || !permission}
              value={weatherInterval}
              onChange={(e) => onIndexSettingChange('interval', e.target.value)}
              options={refreshOptions}
            />
          }
        />
        <ItemCard
          title="首页展示"
          desc="设置首页是否展示天气"
          action={
            <Switch
              disabled={!permission}
              checked={show}
              onChange={(e) => onIndexSettingChange('show', e.target.checked)}
            />
          }
        />
      </ContentList>
      <ContentLinkList>
        <ContentTitle title="相关链接" />
        <Link text="和风天气开发平台" href="https://dev.qweather.com/" />
      </ContentLinkList>
    </div>
  );
};

export default Weather;
