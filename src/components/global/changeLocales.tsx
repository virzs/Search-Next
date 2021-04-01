/*
 * @Author: Vir
 * @Date: 2021-03-16 14:58:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-16 16:30:58
 */

import { getLocale, setLocale } from '@/.umi/plugin-locale/localeExports';
import { MenuItem, Button, Menu } from '@material-ui/core';
import { Public } from '@material-ui/icons';
import React from 'react';
export interface SelectLocalesTypes {
  label: string;
  value: string;
}

const ChangeLocales: React.FC = () => {
  const [localeValue, setLocaleValue] = React.useState<string>(getLocale());
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const selectLocalesValue: SelectLocalesTypes[] = [
    {
      label: '中文',
      value: 'zh-CN',
    },
    {
      label: 'English',
      value: 'en-US',
    },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (value: string) => {
    setAnchorEl(null);
    setLocaleValue(value);
    setLocale(value, false);
  };

  return (
    <div className="locales">
      <Button onClick={handleClick}>
        <Public fontSize="small" />
        {selectLocalesValue.find((i) => i.value === localeValue)?.label}
      </Button>
      <Menu
        id="locales-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {selectLocalesValue.map((i) => (
          <MenuItem
            selected={localeValue === i.value}
            value={i.value}
            key={i.value}
            onClick={() => handleClose(i.value)}
          >
            {i.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default ChangeLocales;
