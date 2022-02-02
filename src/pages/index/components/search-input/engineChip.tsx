/*
 * @Author: Vir
 * @Date: 2021-04-03 17:25:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-05 01:05:33
 */

import { list } from '@/apis/search';
import { SearchEngine } from '@/data/engine/types';
import { Chip } from '@mui/material';
import classnames from 'classnames';
import React from 'react';

export type EngineChip = '' | '';
export interface EngineChipProps {
  // onClick?: () => void;
  onChange?: (value: SearchEngine) => void;
  type?: EngineChip; // 选择搜索引擎组件展示类型
}

const EngineChip = ({ onChange }: EngineChipProps) => {
  const [engineList, setEngineList] = React.useState([] as SearchEngine[]);
  const [engine, setEngine] = React.useState({} as SearchEngine);

  // 获取搜索引擎列表
  const getList = () => {
    list().then((res) => {
      setEngineList(res.data);
      if (res.data.length === 0) return;
      const engineId = localStorage.getItem('engine_id');
      if (engineId) {
        const engine = res.data.find((i) => i._id === engineId);
        setEngine(engine ? engine : res.data[0]);
        if (onChange) onChange(engine ? engine : res.data[0]);
      } else {
        setEngine(res.data[0]);
        if (onChange) onChange(res.data[0]);
      }
    });
  };

  const changeEngine = (item: SearchEngine, e: any) => {
    localStorage.setItem('engine_id', item._id);
    setEngine(item);
    if (onChange) onChange(item);
  };

  React.useEffect(() => {
    getList();
  }, []);

  return (
    <div className="w-full text-left mb-1 flex justify-start items-center overflow-x-auto">
      {engineList.map((i) => (
        <Chip
          key={i._id}
          className={classnames(
            'mx-1',
            i._id === engine._id ? 'bg-primary text-white' : 'bg-gray-100',
          )}
          size="small"
          label={i.name}
          onClick={(e) => changeEngine(i, e)}
        ></Chip>
      ))}
    </div>
  );
};

export default EngineChip;
