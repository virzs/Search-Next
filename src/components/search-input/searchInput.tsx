/*
 * @Author: Vir
 * @Date: 2021-03-20 15:01:24
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-08 13:21:35
 */

import React from 'react';
import './style/index.less';
import { Button } from '@material-ui/core';
import { useIntl } from 'react-intl';
import EngineChip from './engineChip';
import { SearchEngineValueTypes } from '@/data/engine';

// 自动填充内容，off不填充，on填充
// 更多参数：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input
export type AutoCompleteType = 'off' | 'on';

export interface SearchInputPropTypes {
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

const RenderInput: React.FC<SearchInputPropTypes> = ({
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
  const { formatMessage } = useIntl();
  const [inputValue, setInputValue] = React.useState(
    defaultValue || value || '',
  );
  const [engine, setEngine] = React.useState({} as SearchEngineValueTypes);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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
    <div className="v-search-input">
      <EngineChip onChange={chipChange}></EngineChip>
      <div className="v-input">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...props}
        ></input>
        <Button
          size="large"
          variant="contained"
          disableElevation
          onClick={handleBtnClick}
          style={{ backgroundColor: '#5f5f5f' }}
        >
          {primaryText ||
            formatMessage({ id: 'app.component.searchinput.submitbutton' })}
        </Button>
      </div>
    </div>
  );
};

const SearchInput: React.FC<SearchInputPropTypes> = (props) => (
  <RenderInput {...props} />
);

export default SearchInput;
