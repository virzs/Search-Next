/*
 * @Author: Vir
 * @Date: 2021-10-23 15:49:56
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 15:58:00
 */

import { checkChannel, getChannelOption } from '@/apis/setting/channel';
import { Router } from '@/config/router';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import { Alert, AlertTitle, Chip } from '@mui/material';
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
        {list
          .filter((i) => {
            let flag = true;
            if (i?.status && ['beta', 'process'].includes(i?.status)) {
              flag = true;
            }
            if (i.channel) {
              flag = checkChannel(i.channel);
            }
            return flag;
          })
          .map((i) => (
            <ItemCard
              key={i.path}
              title={
                <div className="flex items-center gap-1">
                  {i.title}
                  {i?.channel && (
                    <Chip
                      label={getChannelOption(i.channel)?.label}
                      size="small"
                    />
                  )}
                  {i?.status === 'process' && (
                    <Chip label={i?.status?.toLocaleUpperCase()} size="small" />
                  )}
                </div>
              }
              icon={i.icon}
              onClick={() => history(i.path)}
            ></ItemCard>
          ))}
      </ContentList>
    </div>
  );
};

export default Lab;
