/*
 * @Author: Vir
 * @Date: 2022-03-04 10:59:42
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-04 14:01:29
 */
import { getAuthDataByKey, updateAuthDataByKey } from '@/apis/auth';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import { SelectChangeEvent, Switch } from '@mui/material';
import {
  AccountUpdateMessage,
  AccountUpdateMessageRemind,
  Message as AuthMessage,
} from '@/data/account/interface';
import React, { FC, useEffect } from 'react';
import Select from '@/components/md-custom/form/select';
import { isBoolean } from 'lodash';
import { ValueOf } from '@/typings/global';

const Release: FC = () => {
  const [update, setUpdate] = React.useState(false);
  const [remind, setRemind] =
    React.useState<AccountUpdateMessageRemind>('popup');
  const [interval, setInterval] = React.useState(0);
  const [messageData, setMessageData] = React.useState({} as AuthMessage);

  const init = () => {
    const account = localStorage.getItem('account');
    const result = getAuthDataByKey(account ?? '', 'message');
    if (isBoolean(result?.update)) {
      setUpdate(result.update);
      setRemind('popup');
      setInterval(0);
    } else {
      const { update = {} } = result || {};
      const {
        update: privUpdate = true,
        remind = 'popup',
        interval = 0,
      } = update;
      setUpdate(privUpdate);
      setRemind(remind);
      setInterval(interval);
    }
    setMessageData(result);
  };

  const handleUpdate = (key: any, val: any) => {
    const account = localStorage.getItem('account');
    const updateData: any = {
      update,
      interval,
      remind,
    };
    updateData[key] = val;
    const newMessageData = {
      ...messageData,
      update: updateData,
    };
    setMessageData(newMessageData);
    updateAuthDataByKey(account ?? '', 'message', newMessageData);
    init();
  };

  const onUpdateSwichChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setUpdate(checked);
    handleUpdate('update', checked);
  };

  const onRemindChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value as AccountUpdateMessageRemind;
    setRemind(value);
    handleUpdate('remind', value);
  };

  const onIntervalChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value as number;
    setInterval(value);
    handleUpdate('interval', value);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <ContentList>
        <ItemCard
          title="版本更新提醒"
          desc="设置版本更新时是否提醒"
          action={<Switch checked={update} onChange={onUpdateSwichChange} />}
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
                { label: '通知', value: 'notification' },
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
