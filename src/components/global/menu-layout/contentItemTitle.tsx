/*
 * @Author: Vir
 * @Date: 2021-06-12 21:35:35
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 11:51:06
 */

import React from 'react';
import { ContentItemTitleStyle } from './style';

export interface ContentItemTitleProps {
  title: string;
  desc?: string;
  rightHandle?: React.ReactNode;
}

const ContentItemTitle: React.FC<ContentItemTitleProps> = ({
  title,
  desc,
  rightHandle,
}) => {
  return (
    <div className={ContentItemTitleStyle}>
      <div className="item-title">
        <p>{title}</p>
        {rightHandle}
      </div>
      {desc && <p className="item-title-desc">{desc}</p>}
    </div>
  );
};

export default ContentItemTitle;
