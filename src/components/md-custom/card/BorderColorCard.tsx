/*
 * @Author: Vir
 * @Date: 2021-08-14 23:35:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-14 23:57:26
 */

import { hexToRgba } from '@/utils/color';
import { css } from '@emotion/css';
import { Card, CardProps } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';

const BorderColorCardStyle = (color: string = '#000000') => {
  return css`
    cursor: pointer;
    &.MuiCard-root {
      box-shadow: 0px 4px 2px -2px ${hexToRgba(color, 0.2).rgba},
        0px 2px 2px 0px ${hexToRgba(color, 0.14).rgba},
        0px 2px 6px 0px ${hexToRgba(color, 0.12).rgba};
    }
    .MuiCardHeader-root {
      height: 100%;
      align-items: flex-start;
      .MuiCardHeader-content {
        width: calc(100% - 80px);
      }
      .MuiCardHeader-subheader {
        p {
          margin-bottom: 0;
        }
      }
    }
    .MuiCardActions-root {
      justify-content: flex-end;
    }
  `;
};

export interface BorderColorCardProps extends CardProps {
  color?: string;
}

const BorderColorCard: React.FC<BorderColorCardProps> = ({
  color,
  children,
  ...props
}) => {
  return (
    <Card {...props} className={classNames(BorderColorCardStyle(color))}>
      {children}
    </Card>
  );
};

export default BorderColorCard;
