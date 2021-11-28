/*
 * @Author: Vir
 * @Date: 2021-11-25 09:19:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-27 18:05:09
 */
import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { Home, KeyboardBackspace } from '@material-ui/icons';
import Copyright from '@/components/global/copyright';
import { PageProps } from '@/typings';
import { Router } from '@/config/router';
import Menu from './menu';
import { MenuLayoutMenu } from '../menu-layout';

export interface MenuLayoutNewProps extends PageProps {
  children: any;
  pathname?: string;
  mode?: 'route' | 'page';
  menu?: MenuLayoutMenu[];
  onChange?: (id: string, item: any) => void;
  contentHeader?: JSX.Element | React.ReactNode;
  menuFooter?: JSX.Element | React.ReactNode;
}

const MenuLayoutNew: React.FC<MenuLayoutNewProps> = ({
  children,
  route,
  history,
  location,
  pathname,
  mode = 'page',
  menu = [],
  contentHeader,
  menuFooter,
  onChange,
  ...props
}) => {
  const [menuList, setMenuList] = React.useState<Router[] | undefined>([]);
  const [breads, setBreads] = React.useState<Router[]>([]);

  const getBreadCrumbs = (routes: Router[], newLocation?: any) => {
    let breadCrumbs: Router[] = [];

    const findRoute = (routes: Router[] | undefined) => {
      if (!routes) return routes;
      const loc = newLocation ? newLocation : location;
      routes.forEach((i) => {
        if (loc.pathname.indexOf(i.path) !== -1) {
          breadCrumbs.push(i);
        }
        if (i.routes) {
          findRoute(i.routes);
        }
      });
    };
    findRoute(routes);

    return breadCrumbs;
  };

  React.useEffect(() => {
    if (mode === 'route') {
      if (location.pathname === pathname) {
        history.replace(route?.routes?.[0].path || pathname);
      }
      setMenuList(route?.routes);
    } else {
      setMenuList(menu);
    }
  }, []);

  React.useEffect(() => {
    const breads = getBreadCrumbs(route.routes || []);
    setBreads(breads);
  }, [location]);

  return (
    <div className="flex flex-row h-screen bg-gray-70">
      <div className="w-72 p-4 h-full flex flex-col">
        <div className="flex gap-1">
          <Tooltip title="回到首页" arrow>
            <IconButton
              size="small"
              onClick={() => {
                history.push('/');
              }}
            >
              <Home />
            </IconButton>
          </Tooltip>
          <Tooltip title="返回上级" arrow>
            <IconButton
              size="small"
              onClick={() => {
                history.goBack();
              }}
            >
              <KeyboardBackspace />
            </IconButton>
          </Tooltip>
        </div>
        <Menu datasource={menuList} mode="route" onChange={onChange} />
        <div>{menuFooter}</div>
      </div>
      <div className="h-full overflow-hidden flex flex-col w-full px-6 py-4">
        <div>{contentHeader}</div>
        <div className="flex-grow overflow-y-auto w-full my-4 pb-2">
          <div className="max-w-4xl">{children}</div>
        </div>
        <div className="text-center max-w-4xl">
          <Copyright />
        </div>
      </div>
    </div>
  );
};

export default MenuLayoutNew;
