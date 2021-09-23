/*
 * @Author: Vir
 * @Date: 2021-03-20 15:01:24
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 23:36:50
 */

import { SearchEngineValueTypes } from '@/data/engine';
import { Button } from '@material-ui/core';
import React from 'react';
import EngineChip from './engineChip';
import SugPopper from './sugPopper';

// 自动填充内容，off不填充，on填充
// 更多参数：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input
export type AutoCompleteType = 'off' | 'on';

export interface SearchInputProps {
  placeholder?: string; // 提示文字
  value?: string; // 输入框内容
  defaultValue?: string; // 输入框默认内容
  minLength?: number; // 最小字符数
  maxLength?: number; // 最大字符数
  autoComplete?: AutoCompleteType; // 自动填充
  autoFocus?: boolean; // 自动聚焦
  disabled?: boolean; // 是否禁用
  readonly?: boolean; // 是否只读
  required?: boolean; // 是否必填
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: string,
    engine: SearchEngineValueTypes,
  ) => void; // 输入框内容变化时回调
  onPressEnter?: (value: string, engine: SearchEngineValueTypes) => void; // 按下回车回调
  onBtnClick?: (value: string, engine: SearchEngineValueTypes) => void;
  onFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  primaryText?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onChange,
  onPressEnter,
  onBtnClick,
  onFocus,
  onBlur,
  value,
  defaultValue,
  primaryText,
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState(
    defaultValue || value || '',
  );
  const [engine, setEngine] = React.useState({} as SearchEngineValueTypes);
  const [sugOpen, setSugOpen] = React.useState<boolean>(false);
  const [wd, setWd] = React.useState<string>('');
  const [sugAnchorEl, setSugAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setWd(e.target.value);
    if (onChange) onChange(e, e.target.value, engine);
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter' && onPressEnter) onPressEnter(inputValue, engine);
  };

  const handleBtnClick = () => {
    if (onBtnClick) onBtnClick(inputValue, engine);
  };

  const chipChange = (value: SearchEngineValueTypes) => {
    setEngine(value);
  };

  return (
    <div
      className="search-input max-w-2xl w-4/5"
      onFocus={(e) => {
        setSugOpen(true);
        setSugAnchorEl(e.currentTarget);
      }}
      onBlur={(e) => {
        // 元素外部失去焦点时隐藏提示词
        // @ts-ignore
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setSugOpen(false);
        }
      }}
    >
      <EngineChip onChange={chipChange} />
      <div className="flex justify-center items-center rounded-md shadow-xl overflow-hidden">
        <input
          className="py-2 px-4 border-none leading-4 sm:leading-7 outline-none flex-grow rounded-tr-none rounded-br-none placeholder-gray-400 focus:placeholder-gray-200 transition-all"
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...props}
        />
        <Button
          className="w-16 sm:w-24 rounded-tl-none px-2 sm:px-4 leading-4 sm:leading-7 text-center tracking-widest rounded-bl-none bg-primary text-white"
          size="large"
          variant="contained"
          disableElevation
          onClick={handleBtnClick}
        >
          搜索
        </Button>
      </div>
      <SugPopper
        open={sugOpen}
        wd={wd}
        anchorEl={sugAnchorEl}
        onSelect={(content) => {
          if (onBtnClick) onBtnClick(content, engine);
        }}
      />
    </div>
  );
};

export default SearchInput;
