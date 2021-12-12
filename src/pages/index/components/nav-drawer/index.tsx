/*
 * @Author: Vir
 * @Date: 2021-12-12 22:23:43
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-12 22:53:36
 */
import { Drawer } from '@/components/md-custom/drawer';
import navigationData from '@/data/navigation';
import { css } from '@emotion/css';
import classNames from 'classnames';
import React from 'react';

export interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const NavDrawer: React.FC<NavDrawerProps> = (props) => {
  return (
    <Drawer title="导航" {...props}>
      {navigationData.map((i) => {
        return (
          <div className="shadow p-2 mb-2 rounded" key={i.path}>
            <div className="text-base font-bold mb-2">{i.name}</div>
            <div className="mb-2">{i.intro}</div>
            <div>
              {i.subClassify?.map((j) => {
                return (
                  <div key={j.path}>
                    <div className="font-semibold mb-3">{j.name}</div>
                    <div className="grid gap-2.5 grid-cols-2 mb-3">
                      {j.children?.map((k) => {
                        return (
                          <a
                            className={classNames(
                              'p-2 shadow rounded',
                              css`
                                --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
                                  0 1px 2px 0 ${k.color} !important;
                              `,
                            )}
                            href={k.url}
                            target="_blank"
                          >
                            {k.name}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Drawer>
  );
};

export default NavDrawer;
