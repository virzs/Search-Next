/*
 * @Author: Vir
 * @Date: 2021-04-11 14:54:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-11 17:30:22
 */

import { Card, CardContent, Avatar } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import React from 'react';
import './styles/siteCard.less';

type SiteCardType = 'view' | 'add';

interface SiteCardPropTypes {
  type: SiteCardType;
  onClick: () => void;
}

const SiteCard: React.FC<SiteCardPropTypes> = ({ type, onClick }) => {
  const viewContent = () => {};

  const addContent = () => {
    return (
      <Avatar variant="rounded">
        <Add />
      </Avatar>
    );
  };

  const siteClick = () => {
    if (onClick) onClick();
  };

  return (
    <Card className="top-site-item" onClick={siteClick}>
      <CardContent>
        {type === 'add' && addContent()}
        {type === 'view' && viewContent()}
      </CardContent>
    </Card>
  );
};

export default SiteCard;
