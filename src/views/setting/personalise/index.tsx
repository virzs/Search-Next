/*
 * @Author: Vir
 * @Date: 2021-09-23 11:05:05
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 11:12:44
 */

import { Router } from '@/config/router';
import ItemCard from '@/pages/setting/components/itemCard';
import RenderContent from '@/pages/setting/components/renderContent';
import { PageProps } from '@/typings';
import React from 'react';

const Personalise: React.FC<PageProps> = ({
  history,
  route,
  children,
  ...props
}) => {
  const [list, setList] = React.useState<Router[]>([]);

  React.useEffect(() => {
    setList(route?.routes || []);
  }, []);

  return (
    <RenderContent
      location={history.location as unknown as Location}
      pChildren={children}
    >
      <div className="flex flex-col gap-2 my-4">
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history.push(i.path)}
          ></ItemCard>
        ))}
      </div>
    </RenderContent>
  );
};

export default Personalise;
