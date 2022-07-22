/*
 * @Author: Vir
 * @Date: 2021-09-23 11:05:05
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 15:27:44
 */

import { Router } from '@/config/router';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import React from 'react';
import Example from './components/example';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePreview } from '@/hooks/settings/background/preview';

const Personalise: React.FC<PageProps> = (props) => {
  const { route } = props;
  const history = useNavigate();
  const location = useLocation();
  const [list, setList] = React.useState<Router[]>([]);

  const [preData] = usePreview();

  React.useEffect(() => {
    setList(route?.routes || []);
  }, []);

  return (
    <div {...props}>
      <Example data={preData} />
      <ContentList>
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </ContentList>
    </div>
  );
};

export default Personalise;
