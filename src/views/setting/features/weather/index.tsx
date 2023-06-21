/*
 * @Author: Vir
 * @Date: 2022-04-08 16:02:55
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-12 16:57:01
 */
import ContentLinkList from '@/pages/setting/components/contentLinkList';
import Link from '@/pages/setting/components/contentLinkList/link';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
import { css } from '@emotion/css';
import { Alert, AlertTitle, Switch, TextField } from '@mui/material';
import React, { FC, useEffect } from 'react';
import WeatherCard from './components/weatherCard';
import useWeather from '../../../../hooks/settings/weather/weather';

const Weather: FC = () => {
  const [data, action] = useWeather();
  const {
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
  } = data;
  const { setData, refresh } = action;

  return (
    <div>
      {authed && (
        <WeatherCard
          apiKey={key}
          onRefresh={() => refresh()}
          weather={weather}
          city={city}
          loading={loading}
        />
      )}
      <ContentList>
        <ContentTitle title="权限"></ContentTitle>
        <ItemAccordion
          title="位置访问"
          desc="获取用户地理位置信息，用于天气查询"
        >
          {!permission && (
            <Alert severity="warning">当前浏览器位置访问权限不可用</Alert>
          )}
          {geoLocationStatus === 'granted' && (
            <Alert severity="success">已授权位置访问权限</Alert>
          )}
          {geoLocationStatus === 'denied' && (
            <Alert severity="error">位置访问权限被拒绝，请检查浏览器设置</Alert>
          )}
          {geoLocationStatus === 'prompt' && (
            <Alert severity="info">等待授权位置访问权限</Alert>
          )}
        </ItemAccordion>
        <ContentTitle title="高级设置" />
        <ItemCard
          title="首页展示"
          desc="设置首页是否展示天气"
          action={
            <Switch
              disabled={!permission}
              checked={show}
              onChange={(e) => {
                setData({
                  show: e.target.checked,
                });
              }}
            />
          }
        />
        <ItemAccordion title="和风天气KEY" desc="设置和风天气使用时必须的KEY">
          <Alert severity="info" className="mb-2">
            <AlertTitle>为什么需要填写KEY？</AlertTitle>
            虽然和风天气提供了免费方案，但考虑到使用次数限制，最好的方式是自己申请KEY，然后填写到下方。
            当然不填写KEY也可以使用天气功能，如果超过限制，则无法使用天气功能。
          </Alert>
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
              setData({
                key: e.target.value,
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
            点击下方创建标准版天气插件链接，生成代码，将代码中的 KEY 填写在下方输入框中
          </Alert>
          <TextField
            fullWidth
            variant="standard"
            label="和风天气插件 KEY"
            placeholder="请输入和风天气天气插件 KEY"
            value={pluginKey}
            disabled={!permission}
            onChange={(e) => {
              setData({
                pluginKey: e.target.value,
              });
            }}
            error={pluginKey.length > 32}
            helperText={pluginKey.length > 32 ? 'KEY长度不能超过32位' : ''}
          ></TextField>
        </ItemAccordion>
      </ContentList>
      <ContentLinkList>
        <ContentTitle title="相关链接" />
        <Link text="和风天气开发平台" href="https://dev.qweather.com/" />
        <Link
          text="创建标准版天气插件"
          href="https://widget.qweather.com/create-standard"
        />
      </ContentLinkList>
    </div>
  );
};

export default Weather;
