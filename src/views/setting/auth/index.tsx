/*
 * @Author: Vir
 * @Date: 2021-09-17 23:07:52
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-24 09:54:21
 */

import { Router } from '@/config/router';
import { AuthData } from '@/data/account/interface';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import React from 'react';
import AccountCard from './components/accountCard';
import { getAccount } from './utils/acount';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth: React.FC<PageProps> = (props) => {
  const { route } = props;
  const history = useNavigate();
  const location = useLocation();
  const [list, setList] = React.useState<Router[]>([]);
  const [account, setAccount] = React.useState<AuthData>({} as AuthData);

  React.useEffect(() => {
    setList(route?.routes || []);
    setAccount(getAccount());
  }, []);

  return (
    <div {...props}>
      <AccountCard account={account} />
      <div className="flex flex-col gap-2 my-4">
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </div>
    </div>
  );
};

export default Auth;
