/*
 * @Author: Vir
 * @Date: 2021-12-15 14:26:33
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-15 14:50:32
 */
import { navigationSetting, updateNavigationSetting } from '@/apis/auth';
import Select from '@/components/md-custom/form/select';
import {
  NavigationType,
  Navigation as NavigationInterface,
} from '@/data/account/interface';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import RenderContent from '@/pages/setting/components/renderContent';
import { PageProps } from '@/typings';
import { SelectChangeEvent } from '@material-ui/core';
import React from 'react';

const Navigation: React.FC<PageProps> = (props) => {
  const { history, route, children } = props;

  const [value, setValue] = React.useState<NavigationType>('page');
  const [navigationData, setNavigationData] =
    React.useState<NavigationInterface>({} as NavigationInterface);

  const options = [
    {
      label: '抽屉',
      value: 'drawer',
    },
    {
      label: '页面',
      value: 'page',
    },
  ];

  const init = () => {
    const account = localStorage.getItem('account');
    const result = navigationSetting(account ?? '');
    setValue(result.type ?? 'page');
    setNavigationData(result);
  };

  const onChange = (event: SelectChangeEvent<any>) => {
    const select = event.target.value;
    setValue(select);
    const account = localStorage.getItem('account');
    updateNavigationSetting(account ?? '', { ...navigationData, type: select });
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <RenderContent
      location={history.location as unknown as Location}
      pChildren={children}
    >
      <ContentList>
        <ItemCard
          title="默认效果"
          desc="设置首页点击导航按钮后导航的显示方式"
          action={
            <Select
              label="效果"
              value={value}
              size="small"
              onChange={onChange}
              options={options}
            />
          }
        ></ItemCard>
      </ContentList>
    </RenderContent>
  );
};

export default Navigation;
