/*
 * @Author: Vir
 * @Date: 2021-10-23 15:49:56
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-23 22:52:56
 */

import { Router } from '@/config/router';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import { Alert, AlertTitle } from '@material-ui/core';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Lab: React.FC<PageProps> = (props) => {
  const { route } = props;
  const history = useNavigate();
  const location = useLocation();
  const [list, setList] = React.useState<Router[]>([]);

  React.useEffect(() => {
    setList(route?.routes || []);
  }, []);

  return (
    <div {...props}>
      <Alert severity="info">
        <AlertTitle>提示</AlertTitle>
        实验室中的功能均处在开发中，不保证实际发布。
      </Alert>
      <ContentList>
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </ContentList>
    </div>
  );
};

export default Lab;
