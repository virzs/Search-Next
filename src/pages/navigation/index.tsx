/*
 * @Author: Vir
 * @Date: 2021-07-25 00:07:11
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-10 13:49:03
 */

import { MenuLayoutMenu, MenuListItem } from '@/components/layout/menu-layout';
import MenuLayoutNew from '@/components/layout/menu-layout-new';
import Header, { SubHeader } from '@/components/layout/menu-layout/header';
import navigations from '@/data/navigation';
import { Classify } from '@/data/navigation/interface';
import { PageProps } from '@/typings';
import { Input, List } from '@mui/material';
import { InsertComment } from '@mui/icons-material';
import React from 'react';
import WebsiteCardNew from './components/websiteCardNew';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { css } from '@emotion/css';

const basePath = '/navigation';

const Recursion = (data: Classify, parent?: Classify) => {
  const notClassifiedData =
    data.children &&
    data.children.filter((k) =>
      data.subClassify
        ?.map((l) => l.path)
        .every((n) => !k.classify.includes(n)),
    );

  return (
    <>
      {data?.subClassify?.map((i) => {
        return (
          <>
            <div
              key={i.id}
              id={i.id}
              style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
              }}
            >
              {parent ? (
                <SubHeader icon={i.icon} title={i.name} />
              ) : (
                <Header icon={i.icon} title={i.name} />
              )}

              {i.children && i.children.length > 0 && (
                <div className="grid grid-cols-3 gap-3 max-w-4xl">
                  {i.children.map((j) => (
                    <WebsiteCardNew key={i.id} datasource={j} />
                  ))}
                </div>
              )}
              {Recursion(i, data)}
            </div>
          </>
        );
      })}
      {notClassifiedData && notClassifiedData.length > 0 && data?.level === 1 && (
        <div
          className={css`
            margin-top: 16px;
          `}
        >
          <SubHeader title="未分类" />
          <div className="grid grid-cols-3 gap-3 max-w-4xl">
            {notClassifiedData.map((j) => (
              <WebsiteCardNew key={j.id} datasource={j} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const NavigationPage: React.FC<PageProps> = (props) => {
  const menu: Classify[] = navigations;
  const history = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = React.useState<Classify>({} as Classify);

  const changeSelect = (path: string, type: 'push' | 'replace' = 'replace') => {
    const find = menu.find((i) => i.path === path);
    if (find) {
      const path = `${basePath}/${find.path}`;
      if (type === 'push') history(path);
      if (type === 'replace') history(path, { replace: true });
      setSelected(find);
    }
  };

  const menuChange = (id: string, item: Classify) => {
    changeSelect(item.path, 'push');
  };

  React.useEffect(() => {
    const path = location.pathname;
    if (path === basePath) {
      history(`${basePath}/${menu[0].path}`, { replace: true });
      setSelected(menu[0]);
    } else {
      // const { classify } = match.params as any;
      // changeSelect(classify);
    }
  }, []);

  return (
    <MenuLayoutNew
      {...props}
      mode="page"
      menu={menu as MenuLayoutMenu[]}
      pathname="/navigation"
      onChange={menuChange}
      menuFooter={
        <List dense>
          <MenuListItem
            icon={<InsertComment />}
            primary="提交网站"
            onClick={() => history('/help/commit_website')}
          />
        </List>
      }
    >
      {Recursion(selected)}
    </MenuLayoutNew>
  );
};

export default NavigationPage;
