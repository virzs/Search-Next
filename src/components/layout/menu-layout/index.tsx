/*
 * @Author: Vir
 * @Date: 2021-07-25 00:22:40
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-04 16:20:07
 */

import Copyright from '@/components/global/copyright';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import classNames from 'classnames';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface MenuLayoutMenu {
  id: string;
  name: string; // 显示名称
  path: string; // 路径
  icon?: JSX.Element; // 图标
  [x: string]: any;
}

export interface MenuLayoutProps {
  children?: any;
  title?: string;
  basePath?: string;
  menu: MenuLayoutMenu[];
  menuFooter?: JSX.Element | React.ReactNode;
  showCopyright?: boolean;
  onChange?: (id: string, item: MenuLayoutMenu) => void;
}

export type RouteState = { search?: string } | null | undefined;

export interface MenuListItemProps extends ListItemProps {
  icon?: any;
  primary: string;
}

export const MenuListItem: React.FC<MenuListItemProps> = ({
  icon,
  primary,
  ...props
}) => {
  return (
    <ListItem {...props}>
      <ListItemIcon className="min-w-min mr-2">{icon}</ListItemIcon>
      <ListItemText primary={primary} />
    </ListItem>
  );
};

const MenuLayout: React.FC<MenuLayoutProps> = ({
  menu,
  menuFooter,
  basePath = '',
  showCopyright = true,
  children,
  title,
  onChange,
  ...props
}) => {
  const location = useLocation();
  const history = useNavigate();
  const [selected, setSelected] = React.useState<MenuLayoutMenu>(
    [] as unknown as MenuLayoutMenu,
  );

  React.useEffect(() => {
    const state = location?.state as RouteState;
    if (state && state?.search) {
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
    <div className="flex h-screen bg-gray-50">
      <div
        className={classNames(
          'max-w-xs flex-grow py-7 px-7 pl-12 border-gray-200 border-r flex flex-col',
          !!menuFooter && 'pb-2',
        )}
      >
        <div className="flex items-center">
          <IconButton size="small" onClick={() => history(-1)}>
            <ArrowBack />
          </IconButton>
          <span className="text-xl font-semibold">{title}</span>
        </div>
        <List dense className="flex-grow">
          {menu.map((i, j) => (
            <MenuListItem
              key={j}
              selected={i.id === selected.id}
              onClick={() => {
                setSelected(i);
                if (onChange) onChange(i.id, i);
              }}
              icon={i.icon}
              primary={i.name}
            />
          ))}
        </List>
        <div>{menuFooter}</div>
      </div>
      <div className="flex-grow h-full flex flex-col">
        <div
          className="flex-grow overflow-y-auto pl-12 pb-8"
          style={{ scrollSnapType: 'proximity' }}
        >
          {children}
        </div>
        {showCopyright && (
          <div className="text-center h-8 max-w-4xl">
            <Copyright />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuLayout;
