/*
 * @Author: Vir
 * @Date: 2021-04-25 16:56:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-27 23:09:39
 */

import { getUuid } from '@/utils/common';
import {
  ClickAwayListener,
  Paper,
  Popper,
  PopperPlacementType,
} from '@material-ui/core';
import React, { JSXElementConstructor, ReactElement } from 'react';

export interface PopperCustom {
  title?: React.ReactNode | string;
  content: React.ReactNode;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: PopperPlacementType;
}

// 自定义Popper组件
const PopperCustom: React.FC<PopperCustom> = ({
  title,
  content,
  children,
  placement,
  ...props
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [id, setId] = React.useState<string>('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const popperOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(!open);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setOpen(false);
    console.log('click');
  };

  React.useEffect(() => {
    setId(getUuid());
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="MUI-popper-custom">
        {React.cloneElement(children, {
          onClick: popperOpen,
          'aria-describedby': id,
        })}
        <Popper {...props} open={open} id={id} anchorEl={anchorEl} transition>
          <Paper>{content}</Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default PopperCustom;
