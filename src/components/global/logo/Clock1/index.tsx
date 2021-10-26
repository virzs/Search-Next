/*
 * @Author: Vir
 * @Date: 2021-06-03 11:08:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 14:10:14
 */

import React from 'react';
import TimeClockContext from '../timeClockContext';
import Digit, { DigitNum } from './digit';
import Separator from './separator';

const Clock1: React.FC = () => {
  const mathNum = (number: number = 0, bool: boolean = true): DigitNum => {
    return bool
      ? (Math.floor(number / 10) as unknown as DigitNum)
      : ((number % 10) as unknown as DigitNum);
  };

  return (
    <TimeClockContext>
      {(value) => {
        return (
          <div className="flex justify-center items-center">
            <Digit value={mathNum(value?.hour)} />
            <Digit value={mathNum(value?.hour, false)} />
            <Separator number={value?.second || 0} />
            <Digit value={mathNum(value?.minute)} />
            <Digit value={mathNum(value?.minute, false)} />
            <Separator number={value?.second || 0} />
            <Digit value={mathNum(value?.second)} />
            <Digit value={mathNum(value?.second, false)} />
          </div>
        );
      }}
    </TimeClockContext>
  );
};

export default Clock1;
