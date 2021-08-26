/*
 * @Author: Vir
 * @Date: 2021-03-25 14:01:37
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-27 14:42:52
 */

import { css } from '@emotion/css';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

// 版权声明组件

export interface CopyrightPropTypes {
  author: string; // 作者
  href: string; // 网站链接
  startTime: string | Dayjs; // 开始时间
  endTime?: string | Dayjs; // 结束时间
  children?: React.ReactNode; // children
  classnames?: string;
}

const CopyrightStyle = css`
  text-align: center;
  color: var(--main-text-color-opacity-7, rgba(95, 95, 95, 0.7));
  font-size: 14px;
  &:hover {
    color: var(--main-text-color, rgb(95, 95, 95));
  }
`;

const Copyright: React.FC<CopyrightPropTypes> = ({
  startTime,
  endTime,
  href,
  author,
  classnames,
  children,
  ...props
}) => {
  endTime = endTime ? endTime : dayjs(new Date()).format('YYYY');
  const content = children
    ? children
    : `©${startTime}-${endTime} by ${author}. All rights reserved.`;
  return (
    <a
      className={classNames([classnames, CopyrightStyle])}
      {...props}
      href={href}
    >
      {content}
    </a>
  );
};

export default Copyright;
