/*
 * @Author: Vir
 * @Date: 2021-09-20 16:53:59
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 15:27:01
 */

import { AuthData } from '@/data/account/interface';
import { Avatar, Chip } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';

export interface AccoundCardProps {
  account: AuthData;
}

const AccountCard: React.FC<AccoundCardProps> = ({ account }) => {
  return (
    <div className="flex py-4 pl-0 items-center">
      <div className="mr-4">
        <Avatar sx={{ width: 64, height: 64 }}>
          {account.username?.split('')[0].toLocaleUpperCase()}
        </Avatar>
      </div>
      <div>
        <div className="text-lg font-bold leading-7 mb-0">
          {account.username}
          <Chip
            className="ml-2"
            size="small"
            color="info"
            label={account.type === 'local' ? '本地账户' : '注册账户'}
          ></Chip>
        </div>
        <div className="text-sm mt-1 mb-0">
          创建时间: {dayjs(account.createdTime).format('YYYY-MM-DD HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
