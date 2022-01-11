/*
 * @Author: Vir
 * @Date: 2021-12-12 22:23:43
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-10 13:51:27
 */
import { Drawer } from '@/components/md-custom/drawer';
import navigationData from '@/data/navigation';
import { Classify, Website } from '@/data/navigation/interface';
import { hexToRgba } from '@/utils/color';
import { css } from '@emotion/css';
import { CardActionArea, Tooltip, Button } from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="overflow-hidden whitespace-nowrap text-ellipsis">
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

const ClassifyEle = (dataSource: Classify, parent?: Classify) => {
  const notClassifiedData =
    dataSource.children &&
    dataSource.children.filter((k) =>
      dataSource.subClassify
        ?.map((l) => l.path)
        .every((n) => !k.classify.includes(n)),
    );
  return (
    <div
      className={classNames(!parent && 'shadow p-2 mb-2 rounded')}
      key={dataSource.path + parent}
    >
      <div>
        {dataSource.subClassify?.map((j, ji) => {
          return (
            <div key={ji}>
              <div className={classNames('font-semibold mb-3')}>{j.name}</div>
              {j.children && j.children.length > 0 && (
                <div className="grid gap-2.5 grid-cols-3 mb-3">
                  {j.children?.map((k, ki) => {
                    return <WebsiteCard dataSource={k} key={ki} />;
                  })}
                </div>
              )}
              {ClassifyEle(j, dataSource)}
            </div>
          );
        })}
        {notClassifiedData &&
          notClassifiedData.length > 0 &&
          dataSource?.level === 1 && (
            <div
              className={css`
                margin-top: 16px;
              `}
            >
              <div className={classNames('font-semibold mb-3')}>未分类</div>
              <div className="grid gap-2.5 grid-cols-3 mb-3">
                {notClassifiedData.map((j) => (
                  <WebsiteCard key={j.id} dataSource={j} />
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const NavDrawer: React.FC<NavDrawerProps> = (props) => {
  const history = useNavigate();
  return (
    <Drawer
      ModalProps={{
        keepMounted: true,
      }}
      fixedTitle
      titleStyle={css`
        padding-top: 4px !important;
        padding-bottom: 4px !important;
      `}
      title={
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">导航</div>
          <Button
            onClick={() => {
              history('/navigation/*');
            }}
          >
            更多
          </Button>
        </div>
      }
      {...props}
    >
      {navigationData.map((i, ii) => {
        return (
          <div key={ii}>
            <div className="text-base font-bold mb-2">{i.name}</div>
            {i.intro && <div className="mb-2">{i.intro}</div>}
            {ClassifyEle(i)}
          </div>
        );
      })}
    </Drawer>
  );
};

export default NavDrawer;
