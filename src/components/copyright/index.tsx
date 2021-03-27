/*
 * @Author: Vir
 * @Date: 2021-03-25 14:01:37
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-27 14:42:52
 */

import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import './index.less';

// 版权声明组件

export interface CopyrightPropTypes {
  author: string; // 作者
  href: string; // 网站链接
  startTime: string | Dayjs; // 开始时间
  endTime?: string | Dayjs; // 结束时间
  children?: React.ReactNode; // children
  classnames?: string;
}

const Copyright: React.FC<CopyrightPropTypes> = ({
  startTime,
  endTime,
  href,
  author,
  children,
  ...props
}) => {
  endTime = endTime ? endTime : dayjs(new Date()).format('YYYY');
  const content = children
    ? children
    : `©${startTime}-${endTime} by ${author}. All rights reserved.`;
  return (
    <a className="copyright" {...props} href={href}>
      {content}
    </a>
  );
};

export default Copyright;
