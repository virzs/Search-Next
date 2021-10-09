/*
 * @Author: Vir
 * @Date: 2021-10-09 17:23:12
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-09 17:28:09
 */

import React from 'react';

export interface ContentTitleProps {
  title: string;
}

const ContentTitle: React.FC<ContentTitleProps> = ({ title }) => {
  return <div className="font-semibold py-2 px-1">{title}</div>;
};

export default ContentTitle;
