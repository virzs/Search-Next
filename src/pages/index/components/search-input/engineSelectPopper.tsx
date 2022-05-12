/*
 * @Author: Vir
 * @Date: 2022-01-29 21:09:38
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-12 17:35:09
 */

import { AccountEngine, getClassifyEngineListApi } from '@/apis/engine';
import {
  SearchEngine,
  SearchEngineClassifyWithChildren,
} from '@/data/engine/types';
import { Close, Settings } from '@mui/icons-material';
import { Card, Chip, IconButton, Popper } from '@mui/material';
import classnames from 'classnames';
import React, { FC, useEffect, useState } from 'react';

export interface EngineSelectPopperProps {
  children?: any;
  width?: number;
  anchorEl: any;
  open: boolean;
  onBtnClick: (val: boolean) => void;
  onEngineSelect: (engine: SearchEngine) => void;
  engine: AccountEngine;
}

const EngineSelectPopper: FC<EngineSelectPopperProps> = (props) => {
  const {
    width = 300,
    anchorEl,
    open = false,
    onBtnClick,
    onEngineSelect,
    engine,
  } = props;
  const [classifyEngineList, setClassifyEngineList] = useState<
    SearchEngineClassifyWithChildren[]
  >([]);
  const [selected, setSelected] = useState<string>('');
  const [engineList, setEngineList] = React.useState([] as SearchEngine[]);

  const getClassifyEngine = () => {
    getClassifyEngineListApi().then((res) => {
      const current = {
        ...engine.engine,
        classifyId: engine.engine?.classify?._id,
      } as SearchEngine;
      let filterEngines = res
        .map((i) => i.children)
        .flat()
        .filter((u) => u._id !== engine.engine?._id)
        .slice(0, engine.indexCount - 1);
      if (engine.sortType === 'count') {
        filterEngines = filterEngines.sort((r, t) => t.count - r.count);
      }
      setEngineList([current, ...filterEngines]);
      setClassifyEngineList(res);
      res.length > 0 && setSelected(res[0]._id);
    });
  };

  useEffect(() => {
    if (engine?.engine?.classify?._id) {
      setSelected(engine?.engine?.classify?._id);
    }
    getClassifyEngine();
  }, [engine]);

  return (
    <div className="mb-1">
      <Popper open={open} anchorEl={anchorEl} placement="top">
        {({ TransitionProps }) => (
          <Card
            {...TransitionProps}
            style={{ width: `${anchorEl?.clientWidth}px` }}
            className="mb-1"
          >
            <div className="p-2 flex gap-2 items-start">
              <div className="max-h-20 overflow-y-auto pr-1">
                {classifyEngineList.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelected(item._id);
                    }}
                    className={classnames(
                      'px-1.5 py-0.5 cursor-pointer rounded text-sm',
                      selected === item._id
                        ? 'bg-primary text-white'
                        : 'bg-white',
                    )}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
              <div className="flex gap-1 items-start justify-start flex-grow">
                {classifyEngineList
                  .filter((i) => i._id === selected)?.[0]
                  ?.children.map((i) => (
                    <div
                      className={classnames(
                        'px-1.5 py-0.5 cursor-pointer rounded text-sm',
                        engine?.engine?._id === i._id
                          ? 'bg-primary text-white'
                          : 'bg-white border',
                      )}
                      onClick={() => {
                        onEngineSelect(i);
                      }}
                    >
                      {i.name}
                    </div>
                  ))}
              </div>
              <IconButton
                onClick={() => {
                  onBtnClick(false);
                }}
                size="small"
              >
                <Close />
              </IconButton>
            </div>
          </Card>
        )}
      </Popper>
      <div className="w-full text-left mb-1 flex justify-start items-center overflow-x-auto">
        {engineList.map((i, j) => (
          <Chip
            key={j}
            className={classnames(
              'mx-1',
              i._id === engine?.engine?._id
                ? 'bg-primary text-white'
                : 'bg-gray-100',
            )}
            size="small"
            label={i.name}
            onClick={(e) => onEngineSelect(i)}
          ></Chip>
        ))}
        {engine.mode === 'custom' && (
          <Chip
            onClick={(e: any) => {
              onBtnClick(!open);
            }}
            className={classnames('mx-1', 'bg-gray-100')}
            size="small"
            label={
              <div className="text-sm flex gap-1 items-center">
                <Settings className="text-base" />
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default EngineSelectPopper;
