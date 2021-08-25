/*
 * @Author: Vir
 * @Date: 2021-07-25 00:07:11
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-23 16:51:43
 */

import MenuLayout from '@/components/global/menu-layout';
import React from 'react';
import navigations from '@/data/navigation/data';
import { Navigation } from '@/data/navigation/interface';
import ContentHeader from '@/components/global/menu-layout/contentHeader';
import WebsiteCard from './components/WebisteCard';
import { css } from '@emotion/css';
import { copyright as copyrightApi } from '@/apis/common';
import { CopyrightType } from '@/data/main';
import Copyright from '@/components/copyright';
import classNames from 'classnames';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

const WebsiteGridStyle = css`
  display: grid;
  grid: auto-flow / 1fr 1fr 1fr;
  column-gap: 8px;
  row-gap: 8px;
  grid-template-columns: repeat(auto-fit);
`;

const CopyrightStyle = css`
  width: 100%;
  margin: 30px auto 10px;
  display: block;
  color: #000;
`;

const NavigationPage = (props: any) => {
  const menu: Navigation[] = navigations;
  const [selected, setSelected] = React.useState<Navigation>({} as Navigation);
  const [copyright, setCopyright] = React.useState(
    {} as CopyrightTypeWithVersion,
  );

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

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  React.useEffect(() => {
    getCopyright();
  }, []);

  return (
    <MenuLayout
      title="导航"
      basePath="/navigation"
      onChange={menuChange}
      menu={menu}
    >
      {menu.map((i) => (
        <div key={i.id} id={i.id}>
          <ContentHeader icon={i.icon} title={i.name} />
          <div className={WebsiteGridStyle}>
            {i.component &&
              i.component.map((j) => <WebsiteCard key={j.id} item={j} />)}
          </div>
        </div>
      ))}
      {copyright && (
        <Copyright
          classnames={classNames(CopyrightStyle)}
          author={copyright.author}
          href={copyright.href}
          startTime={copyright.startTime}
        ></Copyright>
      )}
    </MenuLayout>
  );
};

export default NavigationPage;
