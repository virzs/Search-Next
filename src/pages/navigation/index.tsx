/*
 * @Author: Vir
 * @Date: 2021-07-25 00:07:11
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-30 11:06:33
 */

import { MenuLayoutMenu, MenuListItem } from '@/components/layout/menu-layout';
import MenuLayoutNew, { HeaderIcon } from '@/components/layout/menu-layout-new';
import Header, { SubHeader } from '@/components/layout/menu-layout/header';
import navigations from '@/data/navigation';
import { Classify } from '@/data/navigation/interface';
import { PageProps } from '@/typings';
import {
  Dialog,
  DialogContent,
  Input,
  List,
  Paper,
  styled,
  TextField,
} from '@mui/material';
import { InsertComment, Search } from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';
import WebsiteCardNew from './components/websiteCardNew';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { css } from '@emotion/css';
import allWebsites from '@/data/navigation/all';
import PinyinMatch from 'pinyin-match';
import { isArray } from 'lodash';

const basePath = '/navigation';

const SearchDialog = styled(Dialog)((theme) => ({
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
    marginTop: '5%',
  },
}));

const Recursion = (data: Classify, parent?: Classify) => {
  const notClassifiedData =
    data.children &&
    data.children.filter((k) =>
      data.subClassify
        ? data.subClassify
            ?.map((l) => l.path)
            .every((n) => !k.classify.includes(n))
        : k,
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

              {i.children && i.children.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 max-w-4xl">
                  {i.children.map((j) => (
                    <WebsiteCardNew key={i.id} datasource={j} />
                  ))}
                </div>
              ) : (
                <div>暂无数据</div>
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
          {data.path !== 'new' && <SubHeader title="未分类" />}
          <div className="grid grid-cols-3 gap-3 max-w-4xl">
            {notClassifiedData.map((j) => (
              <WebsiteCardNew key={j.id} datasource={j} />
            ))}
          </div>
        </div>
      )}
      {(data.children?.length === 0 && data.subClassify?.length === 0) ||
        (!data.children && !data.subClassify && <div>暂无数据</div>)}
    </>
  );
};

const NavigationPage: React.FC<PageProps> = (props) => {
  const docWidth = document.body.clientWidth;
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const menu: Classify[] = navigations;
  const history = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [selected, setSelected] = React.useState<Classify>({} as Classify);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchText, setSearchText] = useState('');

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

  // 查找指定数据
  const strMatching = (
    word: string,
    text: string,
    onlyValue: boolean = false,
  ) => {
    const pinyin: number[] | boolean = PinyinMatch.match(text, word);
    const templete = (val: any) =>
      `<font class='text-red-500 font-semibold'>${val}</font>`;
    let replaceWord = text;

    if (pinyin && isArray(pinyin)) {
      const replace = text.slice(pinyin[0], pinyin[1] + 1);
      replaceWord =
        text.substring(0, pinyin[0]) +
        templete(replace) +
        text.substring(pinyin[1] + 1);
    }

    if (onlyValue) return pinyin;
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: replaceWord,
        }}
      ></span>
    );
  };

  React.useEffect(() => {
    const path = location.pathname;
    if (path === basePath + '/*') {
      history(`${basePath}/${menu[0].path}`, { replace: true });
      setSelected(menu[0]);
    } else {
      const { classify } = params;
      changeSelect(classify || '');
    }
    // ! ctrl + f 打开搜索
    document.addEventListener('keydown', (e) => {
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        !searchOpen && setSearchOpen(true);
      }
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (searchOpen && searchInputRef.current) {
        searchInputRef.current?.focus();
      }
    }, 200);
  }, [searchInputRef.current, searchOpen]);

  const searchValueList = useMemo(() => {
    return allWebsites.filter((i) => {
      return !searchText.length
        ? false
        : strMatching(searchText, i.name, true) ||
            strMatching(searchText, i.url, true);
    });
  }, [searchText]);

  return (
    <MenuLayoutNew
      {...props}
      mode="page"
      menu={menu as MenuLayoutMenu[]}
      pathname={basePath}
      onChange={menuChange}
      headerIcons={[
        <HeaderIcon
          title="搜索"
          icon={<Search />}
          onClick={() => {
            setSearchOpen(!searchOpen);
          }}
        />,
      ]}
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
      {/* 搜索网站 */}
      <SearchDialog
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchText('');
        }}
        maxWidth="md"
      >
        <DialogContent className="overflow-hidden">
          <div style={{ width: docWidth * 0.8, maxWidth: '852px' }}>
            <TextField
              inputRef={searchInputRef}
              fullWidth
              label="网站名称/域名"
              variant="outlined"
              placeholder="请输入网站名称/域名搜索"
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            {searchValueList.length > 0 ? (
              <ul className="overflow-y-auto max-h-80 mt-2 overflow-x-hidden">
                {searchValueList.map((i) => (
                  <li key={i.id}>
                    <Paper
                      elevation={1}
                      className="p-2 mb-2 cursor-pointer"
                      onClick={() => {
                        window.open(i.url);
                      }}
                    >
                      <p>{strMatching(searchText, i.name)}</p>
                      <p>{strMatching(searchText, i.url)}</p>
                    </Paper>
                  </li>
                ))}
              </ul>
            ) : (
              <div></div>
            )}
          </div>
        </DialogContent>
      </SearchDialog>
    </MenuLayoutNew>
  );
};

export default NavigationPage;
