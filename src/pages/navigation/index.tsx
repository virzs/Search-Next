/*
 * @Author: Vir
 * @Date: 2021-07-25 00:07:11
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-04 10:14:38
 */

import MenuLayout from '@/components/layout/menu-layout';
import Header from '@/components/layout/menu-layout/header';
import navigations from '@/data/navigation';
import { Navigation } from '@/data/navigation/interface';
import { PageProps } from '@/typings';
import React from 'react';
import WebsiteCard from './components/WebisteCard';

const NavigationPage: React.FC<PageProps> = (props) => {
  const menu: Navigation[] = navigations;
  const [selected, setSelected] = React.useState<Navigation>({} as Navigation);

  const menuChange = (id: string) => {
    const find = navigations.find((i) => i.id === id);
    if (find) {
      setSelected(find);
      const node = document.getElementById(`${find.id}`);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <MenuLayout
      {...props}
      menu={menu}
      title="导航"
      basePath="/navigation"
      onChange={menuChange}
    >
      {menu.map((i) => (
        <div
          key={i.id}
          id={i.id}
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          <Header icon={i.icon} title={i.name} />
          <div className="grid grid-cols-3 gap-2 max-w-4xl">
            {i.children &&
              i.children.map((j) => <WebsiteCard key={j.id} item={j} />)}
          </div>
        </div>
      ))}
    </MenuLayout>
  );
};

export default NavigationPage;
