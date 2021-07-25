/*
 * @Author: Vir
 * @Date: 2021-07-25 00:07:11
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 23:19:54
 */

import MenuLayout from '@/components/global/menu-layout';
import { MenuLayoutMenu } from '@/components/global/menu-layout/interface';
import React from 'react';
import navigations from './data';
import { Navigation } from './interface';

const NavigationPage = (props: any) => {
  const menu: Navigation[] = navigations;
  const [selected, setSelected] = React.useState<Navigation>({} as Navigation);

  const menuChange = (id: string) => {
    const find = navigations.find((i) => i.id === id);
    if (find) setSelected(find);
  };

  return (
    <MenuLayout
      title="导航"
      basePath="/navigation"
      onChange={menuChange}
      menu={menu}
    >
      {Object.keys(selected).length > 0 &&
        selected.children.map((i) => (
          <div>
            <a href={i.url}>
              <p>{i.name}</p>
            </a>
          </div>
        ))}
    </MenuLayout>
  );
};

export default NavigationPage;
