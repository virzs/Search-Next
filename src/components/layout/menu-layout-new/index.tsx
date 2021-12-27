/*
 * @Author: Vir
 * @Date: 2021-11-25 09:19:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-28 14:46:48
 */
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Home, KeyboardBackspace } from '@mui/icons-material';
import Copyright from '@/components/global/copyright';
import { PageProps } from '@/typings';
import { Router } from '@/config/router';
import Menu from './menu';
import { MenuLayoutMenu } from '../menu-layout';
import { useNavigate } from 'react-router-dom';

export interface MenuLayoutNewProps extends PageProps {
  children: any;
  pathname: string;
  mode?: 'route' | 'page';
  menu?: MenuLayoutMenu[];
  onChange?: (id: string, item: any) => void;
  contentHeader?: JSX.Element | React.ReactNode;
  menuFooter?: JSX.Element | React.ReactNode;
}

const MenuLayoutNew: React.FC<MenuLayoutNewProps> = ({
  children,
  route,
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
  const history = useNavigate();

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
        history(route?.routes?.[0].path || pathname, { replace: true });
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
                history('/');
              }}
            >
              <Home />
            </IconButton>
          </Tooltip>
          <Tooltip title="返回上级" arrow>
            <IconButton
              size="small"
              onClick={() => {
                history(-1);
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
          <div className="max-w-4xl pl-1">{children}</div>
        </div>
        <div className="text-center max-w-4xl">
          <Copyright />
        </div>
      </div>
    </div>
  );
};

export default MenuLayoutNew;
