/*
 * @Author: Vir
 * @Date: 2021-04-03 17:25:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-05 21:16:25
 */

import classnames from 'classnames';
import { Chip } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { SearchEngineValueTypes } from '@/data/engine';
import { list } from '@/apis/search';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import { animated, useSpring } from 'react-spring';
import './style/chip.less';

export type EngineChipType = '' | '';
export interface EngineChipPropTypes {
  // onClick?: () => void;
  onChange?: (value: SearchEngineValueTypes) => void;
  type?: EngineChipType; // 选择搜索引擎组件展示类型
  autoHidden?: boolean; // 是否选择后自动隐藏
}

interface ListType {
  clientWidth: number;
  clientHeight: number;
}

const EngineChip = ({ onChange }: EngineChipPropTypes) => {
  const [engineList, setEngineList] = useState([] as SearchEngineValueTypes[]);
  const [engine, setEngine] = useState({} as SearchEngineValueTypes);
  const [isExpand, setIsExpand] = useState<boolean>(false); // 是否展开
  const [listEle, setListEle] = useState({} as ListType);
  const [chipBtnWidth, setChipBtnWidth] = useState<number>(20); //当前按钮宽度
  const [engineWidth, setEngineWidth] = useState<number>(0); // 当前选中的宽度
  const ele = useRef(null); // chip组件整体ref
  const btn = useRef(null); // chip组件展开收缩按钮ref

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
    setEngineWidth(e.target.clientWidth);
    setEngine(item);
    if (onChange) onChange(item);
  };

  const buttonClick = () => {
    setIsExpand(!isExpand);
    const width =
      engineWidth !== 0 ? engineWidth + 26 : localStorage.getItem('engine_w');
    setChipBtnWidth(isExpand ? Number(width) : 16);
  };

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    if (ele && ele.current) {
      // 此处设置了一个延迟用于获取正确的信息，后续有更好的方法再修改
      const current: any = ele.current;
      setTimeout(() => {
        setListEle({
          clientWidth: current.clientWidth,
          clientHeight: current.clientHeight,
        });
      }, 1);
    }
    if (btn && btn.current) {
      const btnCurrent: any = btn.current;
      setTimeout(() => {
        setChipBtnWidth(btnCurrent.clientWidth);
        localStorage.setItem('engine_w', btnCurrent.clientWidth);
      }, 1);
    }
  }, [ele, btn]);

  return (
    <div
      className="search-engine-label"
      style={{ height: listEle.clientHeight }}
    >
      <animated.div
        className="engine-list"
        style={useSpring({
          to: { left: isExpand ? '0px' : `-${listEle.clientWidth || 0}px` },
        })}
        ref={ele}
      >
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
        <div
          ref={btn}
          className="chip-btn"
          onClick={buttonClick}
          style={{ right: `-${chipBtnWidth}px` }}
        >
          <Chip
            className="engine-chip selected"
            size="small"
            label={engine.name}
            style={{ display: isExpand ? 'none' : '' }}
          ></Chip>
          <div className="svg-btn">
            {isExpand ? <ArrowLeft></ArrowLeft> : <ArrowRight></ArrowRight>}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default EngineChip;
