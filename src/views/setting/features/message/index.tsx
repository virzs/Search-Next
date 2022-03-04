/*
 * @Author: Vir
 * @Date: 2021-12-24 09:51:59
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-04 11:03:29
 */

import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import { PageProps } from '@/typings';
import { Router } from '@/config/router';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Message: React.FC<PageProps> = (props) => {
  const { route } = props;
  const history = useNavigate();
  const location = useLocation();
  const [list, setList] = React.useState<Router[]>([]);

  React.useEffect(() => {
    setList(route?.routes || []);
  }, []);

  return (
    <div>
      <ContentList>
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={<div className="flex items-center gap-1">{i.title}</div>}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </ContentList>
    </div>
  );
};

export default Message;
