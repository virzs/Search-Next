/*
 * @Author: Vir
 * @Date: 2022-04-08 16:02:55
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-09 17:47:17
 */
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
import ContentLinkList from '@/pages/setting/components/contentLinkList';
import Link from '@/pages/setting/components/contentLinkList/link';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import { css } from '@emotion/css';
import { Alert, AlertTitle, Switch, TextField } from '@mui/material';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import WeatherCard from './components/weatherCard';

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
  const [geolocation, setGeolocation] = React.useState<boolean>(false);
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取当前位置并获取天气
  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      const localData = getWeather(userId);
      const time = dayjs(localData?.updatedTime ?? localData?.createdTime);
      const diff = localData ? dayjs().diff(time, 'minute') > 10 : true;
      if (diff || !localData?.key) {
        const coords = position.coords;
        getLocationInfo({
          location: coords.longitude + ',' + coords.latitude,
        });
        getWeatherInfo({
          location: coords.longitude + ',' + coords.latitude,
        });
      } else if (localData) {
        setKey(localData.key);
        setWeather(localData.weather);
        setLocation(localData.city);
      }
    });
  };

  const applyPermission = () => {
    if ('geolocation' in navigator) {
      /* 地理位置服务可用 */
      setPermission(true);
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setStatus(status.state);
        if (status.state === 'granted') {
          setGeolocation(true);
          getCurrentPosition();
        } else {
          setGeolocation(false);
        }
        // status 是一个 PermissionStatus 的实例
      });
    } else {
      /* 地理位置服务不可用 */
      setPermission(false);
    }
  };

  const checkPermission = () => {
    getCurrentPosition();
    timer = setInterval(async () => {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setGeolocation(result.state === 'granted');
      setStatus(result.state);
      if (result.state !== 'prompt') {
        clearTimeout(timer);
        !lastState && toast.info('已选择位置信息权限，请检查浏览器设置');
        return;
      }
      lastState = result.state;
    }, 100);
  };

  const getLocationInfo = (params: QweatherCityParams) => {
    setLoading(true);
    locationInfo(params).then((res) => {
      setLocation(res.data);
      setLoading(false);
    });
  };

  const getWeatherInfo = (params: QweatherNowParams) => {
    setLoading(true);
    qweatherNow(params).then((res) => {
      setWeather(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    applyPermission();
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
      });
    }
  }, [weather, location]);

  return (
    <div>
      {geolocation && (
        <WeatherCard weather={weather} city={location} loading={loading} />
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
              checked={geolocation}
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
        <ItemAccordion
          title="和风天气API KEY"
          desc="设置和风天气API使用时必须的KEY"
        >
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
            label="KEY"
            placeholder="请输入和风天气API KEY"
            value={key}
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
        </ItemAccordion>
      </ContentList>
      <ContentLinkList>
        <ContentTitle title="相关链接" />
        <Link text="和风天气开发平台" href="https://dev.qweather.com/" />
      </ContentLinkList>
    </div>
  );
};

export default Weather;
