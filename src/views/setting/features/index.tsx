/*
 * @Author: Vir
 * @Date: 2021-12-13 22:10:07
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-24 10:01:10
 */
import { Router } from '@/config/router';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Features: React.FC<PageProps> = (props) => {
  const history = useNavigate();
  const location = useLocation();
  const { route, children, ...others } = props;
  const [list, setList] = React.useState<Router[]>([]);

  React.useEffect(() => {
    setList(route?.routes || []);
  }, []);

  return (
    <div {...props}>
      <div className="flex flex-col gap-2 my-4">
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </div>
    </div>
  );
};

export default Features;
