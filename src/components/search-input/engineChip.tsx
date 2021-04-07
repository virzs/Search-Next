/*
 * @Author: Vir
 * @Date: 2021-04-03 17:25:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-05 21:16:25
 */

import classnames from 'classnames';
import { Chip } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SearchEngineValueTypes } from '@/data/engine';
import { list } from '@/apis/search';
import './style/chip.less';

export type EngineChipType = '' | '';
export interface EngineChipPropTypes {
  // onClick?: () => void;
  onChange?: (value: SearchEngineValueTypes) => void;
  type?: EngineChipType; // 选择搜索引擎组件展示类型
}

const EngineChip = ({ onChange }: EngineChipPropTypes) => {
  const [engineList, setEngineList] = useState([] as SearchEngineValueTypes[]);
  const [engine, setEngine] = useState({} as SearchEngineValueTypes);

  // 获取搜索引擎列表
  const getList = () => {
    list().then((res) => {
      setEngineList(res.data);
      if (res.data.length === 0) return;
      const engineId = localStorage.getItem('engine_id');
      if (engineId) {
        const engine = res.data.find((i) => i.id === engineId);
        setEngine(engine ? engine : res.data[0]);
        if (onChange) onChange(engine ? engine : res.data[0]);
      } else {
        setEngine(res.data[0]);
        if (onChange) onChange(res.data[0]);
      }
    });
  };

  const changeEngine = (item: SearchEngineValueTypes, e: any) => {
    localStorage.setItem('engine_id', item.id);
    setEngine(item);
    if (onChange) onChange(item);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="search-engine-label">
      {engineList.map((i) => (
        <Chip
          key={i.id}
          className={classnames('engine-chip', {
            selected: i.id === engine.id,
          })}
          size="small"
          label={i.name}
          onClick={(e) => changeEngine(i, e)}
        ></Chip>
      ))}
    </div>
  );
};

export default EngineChip;
