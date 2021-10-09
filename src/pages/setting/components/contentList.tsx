/*
 * @Author: Vir
 * @Date: 2021-10-09 17:21:23
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-09 17:26:29
 */

import React from 'react';
import ContentTitle from './contentTitle';

export interface ContentListProps {
  title?: string;
  children: any;
}

const ContentList: React.FC<ContentListProps> = ({ title, children }) => {
  return (
    <>
      {title && <ContentTitle title={title} />}
      <div className="flex flex-col gap-2 my-2">{children}</div>
    </>
  );
};

export default ContentList;
