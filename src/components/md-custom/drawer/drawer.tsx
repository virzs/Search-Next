/*
 * @Author: Vir
 * @Date: 2021-12-12 18:19:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-12 21:22:13
 */
import React from 'react';
import { Drawer as MDrawer, DrawerProps } from '@material-ui/core';
import { css } from '@emotion/css';
import { Overwrite } from '@/typings/global';
import classNames from 'classnames';

interface DrawerNewProps {
  title?: React.ReactNode | string;
  width?: string;
}

export interface DrawerCustomProps
  extends Overwrite<DrawerProps, DrawerNewProps> {}

const Drawer: React.FC<DrawerCustomProps> = (props) => {
  const {
    anchor = 'right',
    title,
    width = '378px',
    children,
    ...others
  } = props;
  return (
    <MDrawer
      className={css`
        .MuiPaper-root {
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
        }
      `}
      anchor={anchor}
      {...others}
    >
      <div
        className={classNames(
          'flex flex-col h-screen',
          css`
            width: ${width};
          `,
        )}
      >
        <div className="font-semibold text-lg p-3">{title}</div>
        <div className="p-3 flex-grow">{children}</div>
      </div>
    </MDrawer>
  );
};

export default Drawer;
