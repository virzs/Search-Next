/*
 * @Author: Vir
 * @Date: 2021-12-12 18:19:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-12 23:04:47
 */
import React from 'react';
import { Drawer as MDrawer, DrawerProps } from '@mui/material';
import { css } from '@emotion/css';
import { Overwrite } from '@/typings/global';
import classNames from 'classnames';

interface DrawerNewProps {
  title?: React.ReactNode | string;
  width?: string;
  fixedTitle?: boolean;
  titleStyle?: string;
}

export interface DrawerCustomProps
  extends Overwrite<DrawerProps, DrawerNewProps> {}

const Drawer: React.FC<DrawerCustomProps> = (props) => {
  const {
    anchor = 'right',
    title,
    fixedTitle = false,
    titleStyle,
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
        {title && (
          <div className={classNames('font-semibold text-lg p-3 shadow-sm', titleStyle)}>
            {title}
          </div>
        )}
        <div
          className={classNames(
            'p-3 flex-grow',
            fixedTitle && 'overflow-y-auto',
          )}
        >
          {children}
        </div>
      </div>
    </MDrawer>
  );
};

export default Drawer;
