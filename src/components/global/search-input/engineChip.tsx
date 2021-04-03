/*
 * @Author: Vir
 * @Date: 2021-04-03 17:25:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-03 18:09:27
 */

import classnames from 'classnames';
import { Chip, Button } from '@material-ui/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SearchEngineValueTypes } from '@/data/engine';
import { list } from '@/apis/search';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import { animated, useSpring } from 'react-spring';
import './style/chip.less';

export type EngineChipType = '' | '';
export interface EngineChipPropTypes {
  onClick?: () => void;
  onChange?: () => void;
  type?: EngineChipType; // 选择搜索引擎组件展示类型
}

interface ListType {
  clientWidth: number;
  clientHeight: number;
}

const EngineChip = () => {
  const [engineList, setEngineList] = useState([] as SearchEngineValueTypes[]);
  const [engine, setEngine] = useState({} as SearchEngineValueTypes);
  const [isExpand, setIsExpand] = useState<boolean>(false); // 是否展开
  const [listEle, setListEle] = useState({} as ListType);
  const ele = useRef(null);

  const ref = useCallback((node: any) => {
    if (node) {
      setListEle({
        clientWidth: node.clientWidth,
        clientHeight: node.clientHeight,
      });
    }
    console.log(node.clientWidth);
  }, []);

  // 获取搜索引擎列表
  const getList = () => {
    list().then((res) => {
      setEngineList(res.data);
      if (res.data.length === 0) return;
      const engineId = localStorage.getItem('engine_id');
      if (engineId) {
        const engine = res.data.find((i) => i.id === engineId);
        setEngine(engine ? engine : res.data[0]);
      } else {
        setEngine(res.data[0]);
      }
    });
  };

  const changeEngine = (item: SearchEngineValueTypes) => {
    localStorage.setItem('engine_id', item.id);
    setEngine(item);
  };

  const buttonClick = () => {
    setIsExpand(!isExpand);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div
      className="search-engine-label"
      style={{ height: listEle.clientHeight }}
    >
      <animated.div
        className="engine-list"
        style={useSpring({
          from: { left: isExpand ? `-${listEle.clientWidth || 0}px` : '0px' },
          to: { left: isExpand ? '0px' : `-${listEle.clientWidth || 0}px` },
        })}
        ref={ref}
      >
        {engineList.map((i) => (
          <Chip
            key={i.id}
            className={classnames('engine-chip', {
              selected: i.id === engine.id,
            })}
            size="small"
            label={i.name}
            onClick={() => changeEngine(i)}
          ></Chip>
        ))}
      </animated.div>
      <Button size="small" onClick={buttonClick}>
        {isExpand ? <ArrowLeft></ArrowLeft> : <ArrowRight></ArrowRight>}
      </Button>
    </div>
  );
};

export default EngineChip;
