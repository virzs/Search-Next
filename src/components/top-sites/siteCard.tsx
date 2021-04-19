/*
 * @Author: Vir
 * @Date: 2021-04-11 14:54:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-19 13:42:37
 */

import { getWebIconByUrl } from '@/apis/common';
import { SiteListType } from '@/models/site';
import { Card, CardContent, Avatar, CardHeader } from '@material-ui/core';
import { Add, MoreHoriz } from '@material-ui/icons';
import React from 'react';
import './styles/siteCard.less';

type SiteCardType = 'view' | 'add';

interface SiteCardPropTypes {
  type?: SiteCardType;
  item?: SiteListType;
  onClick?: () => void;
}

const SiteCard: React.FC<SiteCardPropTypes> = ({
  type = 'view',
  item,
  onClick,
}) => {
  const viewContent = () => {
    return (
      <>
        <Avatar
          className="icon"
          variant="rounded"
          src={getWebIconByUrl(item?.url)}
        ></Avatar>
        <p className="site-name">{item?.name}</p>
      </>
    );
  };

  const addContent = () => {
    return (
      <Avatar className="icon" variant="rounded">
        <Add />
      </Avatar>
    );
  };

  const siteClick = () => {
    if (onClick) onClick();
  };

  return (
    <Card className="top-site-item" onClick={siteClick}>
      <CardHeader title={<MoreHoriz />} />
      <CardContent className="site-item-content">
        {type === 'add' && addContent()}
        {type === 'view' && viewContent()}
      </CardContent>
    </Card>
  );
};

export default SiteCard;
