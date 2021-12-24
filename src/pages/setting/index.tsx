/*
 * @Author: Vir
 * @Date: 2021-06-10 11:08:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-21 00:14:32
 */

import { Breadcrumbs, IconButton, Link, Tooltip } from '@material-ui/core';
import { Home, KeyboardBackspace } from '@material-ui/icons';
import classNames from 'classnames';
import React from 'react';
import Copyright from '@/components/global/copyright';
import { PageProps } from '@/typings';
import { Router } from '@/config/router';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export interface SettingPageProps extends PageProps {
  children: any;
}

const SettingPage: React.FC<SettingPageProps> = ({
  children,
  route,
  ...props
}) => {
  const history = useNavigate();
  const location = useLocation();
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
    if (location.pathname === '/setting') {
      history(route?.routes?.[0].path || '/setting', { replace: true });
    }
    setMenuList(route?.routes);
  }, []);

  React.useEffect(() => {
    const breads = getBreadCrumbs(route.routes || []);
    console.log('breads', breads);
    setBreads(breads);
  }, [location]);

  return (
    <div className="flex flex-row h-screen bg-gray-70">
      <div className="w-72 p-4 h-full">
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
        <div className="flex flex-col gap-1 my-4">
          {menuList?.map((i) => (
            <div
              key={i.path}
              className={classNames(
                'hover:bg-gray-150',
                'transition-all',
                'px-2.5',
                'py-1.5',
                'cursor-pointer',
                'rounded',
                'text-sm',
                'text-gray-800',
                {
                  'bg-gray-150': location.pathname.indexOf(i.path) > -1,
                },
              )}
              onClick={() => {
                history(i.path);
              }}
            >
              {i.title}
            </div>
          ))}
        </div>
      </div>
      <div className="h-full overflow-hidden flex flex-col w-full px-6 py-4">
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {breads.map((i, index) => (
            <p
              className={classNames('text-2xl cursor-pointer mb-0', {
                'font-semibold': index === breads.length - 1,
              })}
              key={i.path}
              onClick={() => {
                const path =
                  '/setting/' +
                  breads
                    .map((i) => i.path)
                    .filter((_, ji) => ji <= index)
                    .join('/');
                index !== breads.length - 1 ? history(path) : null;
              }}
            >
              {i.title}
            </p>
          ))}
        </Breadcrumbs>
        <div className="flex-grow overflow-y-auto w-full pt-4">
          <div className="max-w-4xl">
            <Outlet />
          </div>
        </div>
        <div className="text-center max-w-4xl">
          <Copyright />
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
