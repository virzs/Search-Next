/*
 * @Author: Vir
 * @Date: 2021-10-09 17:21:23
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-09 17:26:29
 */

import classNames from 'classnames';
import React from 'react';
import ContentTitle from './contentTitle';

export interface ContentListProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: any;
}

const ContentList: React.FC<ContentListProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <>
      {title && <ContentTitle title={title} />}
      <div className={classNames('flex flex-col gap-2 my-2', className)}>
        {children}
      </div>
    </>
  );
};

export default ContentList;
