/*
 * @Author: Vir
 * @Date: 2021-07-25 00:22:40
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 23:19:42
 */

import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import classNames from 'classnames';
import { MenuLayoutMenu, MenuLayoutProps } from './interface';
import {
  MenuLayoutContentBoxStyle,
  MenuLayoutContentStyle,
  MenuLayoutRootStyle,
  MenuLayoutSideStyle,
} from './style';
import { history } from 'umi';
import { ArrowBack } from '@material-ui/icons';
import React from 'react';
import { SettingRouteState } from '@/pages/setting';

const MenuLayout: React.FC<MenuLayoutProps> = (props) => {
  const { title, basePath, menu, children, onChange, ...other } = props;

  const [selected, setSelected] = React.useState<MenuLayoutMenu>(
    ([] as unknown) as MenuLayoutMenu,
  );

  React.useEffect(() => {
    const state: SettingRouteState = history.location?.state;
    if (state?.search) {
      const sel = menu.find((i) => i.id === state?.search);
      const selected = sel ? sel : menu[0];
      setSelected(selected);
      if (onChange) onChange(selected.id, selected);
    } else {
      setSelected(menu[0]);
      if (onChange) onChange(menu[0].id, menu[0]);
    }
  }, []);

  return (
    <div className={classNames(MenuLayoutRootStyle())}>
      <div className={classNames(MenuLayoutSideStyle())}>
        <Typography variant="h5">
          <IconButton
            size="small"
            onClick={() => {
              history.goBack();
            }}
          >
            <ArrowBack />
          </IconButton>
          {title}
        </Typography>
        <List dense>
          {menu.map((i, j) => (
            <ListItem
              key={j}
              button
              selected={i.id === selected.id}
              onClick={() => {
                if (basePath) {
                  history.replace(basePath, { search: i.id });
                } else {
                  history.push(i.path);
                }
                setSelected(i);
                if (onChange) onChange(i.id, i);
              }}
            >
              <ListItemIcon>{i.icon}</ListItemIcon>
              <ListItemText primary={i.name} />
            </ListItem>
          ))}
        </List>
      </div>
      <div className={classNames(MenuLayoutContentStyle())}>
        <div className={classNames(MenuLayoutContentBoxStyle())}>
          {children ? children : selected.component}
        </div>
      </div>
    </div>
  );
};

export default MenuLayout;
