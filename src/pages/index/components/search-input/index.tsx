/*
 * @Author: Vir
 * @Date: 2021-03-20 15:01:24
 * @Last Modified by: Vir
 * @Last Modified time: 2022-02-23 16:52:26
 */

import { Button } from '@mui/material';
import React, { useEffect } from 'react';
import EngineChip from './engineChip';
import SugPopper from './sugPopper';
import { useTranslation } from 'react-i18next';
import EngineSelectPopper from './engineSelectPopper';
import { isBeta } from '@/apis/auth';
import {
  AccountEngine,
  getAccountEngineApi,
  SearchEngineData,
  setAccountCurretEngineApi,
  setAccountEngineApi,
  setEngineCountApi,
} from '@/apis/engine';
import { SearchEngine } from '@/data/engine/types';
import Input from './input';

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
    accountEngine: SearchEngineData,
  ) => void; // 输入框内容变化时回调
  onPressEnter?: (value: string, accountEngine: SearchEngineData) => void; // 按下回车回调
  onBtnClick?: (value: string, accountEngine: SearchEngineData) => void;
  onFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onArrow?: (code: string) => void;
  primaryText?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onChange,
  onPressEnter,
  onBtnClick,
  onFocus,
  onBlur,
  onArrow,
  value,
  defaultValue,
  primaryText,
  ...props
}) => {
  const { t, i18n } = useTranslation();

  const [inputValue, setInputValue] = React.useState(
    defaultValue || value || '',
  );
  const [accountEngine, setAccountEngine] = React.useState({} as AccountEngine);
  const [sugOpen, setSugOpen] = React.useState<boolean>(false);
  const [wd, setWd] = React.useState<string>('');
  const [sugAnchorEl, setSugAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [code, setCode] = React.useState<'ArrowDown' | 'ArrowUp' | null>(null);
  const inputRef = React.useRef<HTMLDivElement>(null);
  const [engineSelectOpen, setEngineSelectOpen] =
    React.useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setWd(e.target.value);
    if (onChange) onChange(e, e.target.value, accountEngine.engine);
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 相应键盘 Enter 事件
    if (e.code === 'Enter') {
      onPressEnter && onPressEnter(inputValue, accountEngine.engine);
      window.open(`${accountEngine.engine.href}${value}`);
      setEngineCountApi(accountEngine.engine._id);
    }
    // 相应键盘 方向键 上下 事件
    if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
      if (onArrow) onArrow(e.code);
      setCode(e.code);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCode(null);
  };

  const handleBtnClick = () => {
    if (onBtnClick) onBtnClick(inputValue, accountEngine.engine);
    window.open(`${accountEngine.engine.href}${value}`);
    setEngineCountApi(accountEngine.engine._id);
  };

  const chipChange = (value: SearchEngine) => {
    setAccountEngine({
      ...accountEngine,
      engine: value as unknown as SearchEngineData,
    });
  };

  const getCurrentEngine = () => {
    getAccountEngineApi().then((res) => {
      setAccountEngine(res);
    });
  };

  const updateCurrentEngine = (value: SearchEngine) => {
    setAccountCurretEngineApi(value._id).then((res) => {
      setAccountEngine({
        ...accountEngine,
        engine: value as unknown as SearchEngineData,
      });
    });
  };

  useEffect(() => {
    getCurrentEngine();
  }, []);

  return (
    <div
      className="search-input max-w-2xl w-4/5"
      onFocus={(e) => {
        setSugOpen(true);
        setEngineSelectOpen(false);
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
      {isBeta() ? (
        <EngineSelectPopper
          anchorEl={inputRef?.current}
          open={engineSelectOpen}
          onBtnClick={(val) => {
            setEngineSelectOpen(val);
          }}
          onEngineSelect={(val) => {
            updateCurrentEngine(val);
            setEngineSelectOpen(false);
          }}
          engine={accountEngine}
        />
      ) : (
        <EngineChip onChange={chipChange} />
      )}
      <Input
        inputRef={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        handleBtnClick={handleBtnClick}
        {...props}
      />
      <SugPopper
        open={sugOpen}
        wd={wd}
        code={code}
        anchorEl={sugAnchorEl}
        onKeySelect={(content) => {
          setInputValue(content);
        }}
        onSelect={(content) => {
          if (onBtnClick) onBtnClick(content, accountEngine.engine);
        }}
      />
    </div>
  );
};

export default SearchInput;
