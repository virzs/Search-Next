/*
 * @Author: Vir
 * @Date: 2022-03-04 10:59:42
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-04 14:03:54
 */

import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import { Alert, AlertTitle, SelectChangeEvent, Switch } from '@mui/material';
import React, { FC } from 'react';
import Select from '@/components/md-custom/form/select';
import useMessage from '../hooks/message';
import { Release as ReleaseType } from '@/apis/setting/message';

const Release: FC = () => {
  const [{ release }, { setData }] = useMessage();
  const { show, interval, remind } = release;

  const onUpdateSwichChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setData({
      release: {
        ...release,
        show: checked,
      },
    });
  };

  const onRemindChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value as ReleaseType['remind'];
    setData({
      release: {
        ...release,
        remind: value,
      },
    });
  };

  const onIntervalChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value as number;
    setData({
      release: {
        ...release,
        interval: value,
      },
    });
  };

  return (
    <div>
      <ContentList>
        <Alert severity="info">
          <AlertTitle>提示</AlertTitle>
          修改任意配置都会重置版本更新时间间隔依赖的时间
        </Alert>
        <ItemCard
          title="版本更新提醒"
          desc="设置版本更新时是否提醒"
          action={<Switch checked={show} onChange={onUpdateSwichChange} />}
        />
        <ItemCard
          title="提醒方式"
          desc="设置版本更新提醒方式"
          action={
            <Select
              size="small"
              label="提醒方式"
              value={remind}
              options={[
                { label: '消息', value: 'message' },
                // { label: '通知', value: 'notification' },
                { label: '弹窗', value: 'popup' },
              ]}
              onChange={onRemindChange}
            />
          }
        />
        <ItemCard
          title="提醒间隔"
          desc="设置版本更新提醒时间间隔"
          action={
            <Select
              size="small"
              label="提醒间隔"
              value={interval}
              options={[
                { label: '随时', value: 0 },
                { label: '7天', value: 7 },
                { label: '30天', value: 30 },
                { label: '60天', value: 60 },
                { label: '90天', value: 90 },
              ]}
              onChange={onIntervalChange}
            />
          }
        />
      </ContentList>
    </div>
  );
};

export default Release;
