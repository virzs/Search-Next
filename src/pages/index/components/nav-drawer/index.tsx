/*
 * @Author: Vir
 * @Date: 2021-12-12 22:23:43
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-13 14:57:12
 */
import { Drawer } from '@/components/md-custom/drawer';
import navigationData from '@/data/navigation';
import { Classify, Website } from '@/data/navigation/interface';
import { hexToRgba } from '@/utils/color';
import { css } from '@emotion/css';
import { CardActionArea, Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';

export interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface WebsiteCardProps {
  dataSource: Website;
}

const WebsiteCard: React.FC<WebsiteCardProps> = (props) => {
  const { dataSource } = props;
  const Card = (
    <CardActionArea>
      <a
        className={classNames(
          'p-1.5 shadow-lg rounded text-center flex items-center justify-center',
          css`
            --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
              0 1px 2px 0 ${hexToRgba(dataSource.color ?? '#000', 0.7).rgba} !important;
            border-bottom: 1px solid ${dataSource.color};
            &:hover {
              color: ${dataSource.color};
            }
          `,
        )}
        href={dataSource.url}
        target="_blank"
      >
        <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
          {dataSource.name}
        </div>
      </a>
    </CardActionArea>
  );
  return dataSource.intro ? (
    <Tooltip
      title={
        <div
          className={css`
            max-width: 256px;
          `}
        >
          <p>{dataSource.name}</p>
          <div>{dataSource.intro}</div>
        </div>
      }
    >
      {Card}
    </Tooltip>
  ) : (
    Card
  );
};

interface ClassifyProps {
  dataSource: Classify;
}

const ClassifyEle: React.FC<ClassifyProps> = (props) => {
  const { dataSource } = props;
  return (
    <div className="shadow p-2 mb-2 rounded" key={dataSource.path}>
      <div className="text-base font-bold mb-2">{dataSource.name}</div>
      <div className="mb-2">{dataSource.intro}</div>
      <div>
        {dataSource.children?.map((i) => {
          return <WebsiteCard dataSource={i} />;
        })}
        {dataSource.subClassify?.map((j) => {
          return (
            <div key={j.path}>
              <div className="font-semibold mb-3">{j.name}</div>
              <div className="grid gap-2.5 grid-cols-3 mb-3">
                {j.children?.map((k) => {
                  return <WebsiteCard dataSource={k} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NavDrawer: React.FC<NavDrawerProps> = (props) => {
  return (
    <Drawer
      ModalProps={{
        keepMounted: true,
      }}
      {...props}
    >
      {navigationData.map((i) => {
        return <ClassifyEle dataSource={i} />;
      })}
    </Drawer>
  );
};

export default NavDrawer;
