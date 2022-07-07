/*
 * @Author: Vir
 * @Date: 2022-02-23 16:41:16
 * @Last Modified by: Vir
 * @Last Modified time: 2022-02-23 17:00:05
 */

import React, { FC } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Search } from '@mui/icons-material';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputBoxRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  handleBtnClick: () => void;
}

const Input: FC<InputProps> = (props) => {
  const { inputBoxRef, inputRef, handleBtnClick, ...rest } = props;
  const { t } = useTranslation();

  return (
    <div
      ref={inputBoxRef}
      className="flex justify-center items-center rounded-md shadow-xl overflow-hidden"
    >
      <input
        className="py-2 px-4 border-none leading-4 sm:leading-7 outline-none flex-grow rounded-tr-none rounded-br-none placeholder-gray-400 focus:placeholder-gray-200 transition-all"
        type="text"
        ref={inputRef}
        {...rest}
      />
      <Button
        className="w-24 md:w-16 sm:w-24 rounded-tl-none flex gap-2 items-center justify-center whitespace-nowrap leading-4 sm:leading-7 text-center tracking-widest rounded-bl-none bg-primary text-white"
        size="large"
        variant="contained"
        disableElevation
        onClick={handleBtnClick}
      >
        <Search />
        {t('sou-suo')}
      </Button>
    </div>
  );
};

export default Input;
