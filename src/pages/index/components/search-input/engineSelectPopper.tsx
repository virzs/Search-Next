/*
 * @Author: Vir
 * @Date: 2022-01-29 21:09:38
 * @Last Modified by: Vir
 * @Last Modified time: 2022-02-02 22:03:08
 */

import { getClassifyEngineListApi } from '@/apis/engine';
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
  engine: SearchEngine;
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

  const getClassifyEngine = () => {
    getClassifyEngineListApi().then((res) => {
      console.log(res);
      setClassifyEngineList(res);
      res.length > 0 && setSelected(res[0]._id);
    });
  };

  useEffect(() => {
    getClassifyEngine();
  }, []);

  useEffect(() => {
    if (engine.classifyId) {
      setSelected(engine.classifyId);
    }
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
                        engine?._id === i._id
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
      <Chip
        onClick={(e: any) => {
          onBtnClick(!open);
        }}
        size="small"
        label={
          <div className="text-sm flex gap-1 items-center">
            {engine.name}
            <Settings className="text-base" />
          </div>
        }
      />
    </div>
  );
};

export default EngineSelectPopper;
