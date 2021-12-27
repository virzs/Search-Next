/*
 * @Author: Vir
 * @Date: 2021-12-24 09:51:59
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-24 09:56:40
 */
import { getAuthDataByKey, updateAuthDataByKey } from '@/apis/auth';
import { Message as AuthMessage } from '@/data/account/interface';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import { PageProps } from '@/typings';
import { Switch } from '@mui/material';
import React from 'react';

const Message: React.FC<PageProps> = (props) => {
  const [update, setUpdate] = React.useState(false);
  const [messageData, setMessageData] = React.useState({} as AuthMessage);
  const init = () => {
    const account = localStorage.getItem('account');
    const result = getAuthDataByKey(account ?? '', 'message');
    setUpdate(result.update ?? true);
    setMessageData(result);
  };

  const onUpdateSwichChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setUpdate(checked);
    setMessageData({ ...messageData, update: checked });
    const account = localStorage.getItem('account');
    updateAuthDataByKey(account ?? '', 'message', {
      ...messageData,
      update: checked,
    });
  };

  React.useEffect(() => {
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
      </ContentList>
    </div>
  );
};

export default Message;
