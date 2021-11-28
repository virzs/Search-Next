/*
 * @Author: Vir
 * @Date: 2021-11-25 20:51:40
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-25 21:10:50
 */

import classNames from 'classnames';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router';

export interface MenuItemProps {
  title: string;
  path: string;
  value: string | boolean;
  onClick: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = (props) => {
  const { title, path, value, onClick } = props;

  return (
    <div
      key={path}
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
          'bg-gray-150': typeof value === 'boolean' ? value : value === path,
        },
      )}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

export interface MenuProps {
  datasource?: any[];
  mode?: 'route' | 'page';
  onChange?: (id: string, item: any) => void;
}

const Menu: React.FC<MenuProps> = (props) => {
  const { datasource = [], mode = 'page', onChange } = props;
  const history = useHistory();
  const location = useLocation();

  const [val, setVal] = useState<string>('');

  return (
    <div className="flex flex-col gap-1 my-4 flex-grow">
      {datasource?.map((i) => (
        <MenuItem
          key={i.path}
          path={i.path}
          value={
            mode === 'route' ? location.pathname.indexOf(i.path) > -1 : val
          }
          title={i.name ?? ''}
          onClick={() => {
            if (mode === 'route') {
              if (onChange) onChange(i.id, i);
            } else {
              history.push(i.path);
              setVal(i.path);
            }
          }}
        />
      ))}
    </div>
  );
};

export default Menu;
