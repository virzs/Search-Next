/*
 * @Author: Vir
 * @Date: 2021-10-21 11:28:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 14:09:29
 */
import React from 'react';
import TimeClockContext from '../timeClockContext';
import Digit, { MatrixNum } from './digit';
import Separator from './separator';

const Clock3: React.FC = () => {
  const mathNum = (number: number = 0, bool: boolean = true): MatrixNum => {
    return bool
      ? (Math.floor(number / 10) as unknown as MatrixNum)
      : ((number % 10) as unknown as MatrixNum);
  };
  return (
    <TimeClockContext>
      {(value) => {
        return (
          <div className="flex gap-3 px-2 md:px-0">
            <Digit number={mathNum(value?.hour)} />
            <Digit number={mathNum(value?.hour, false)} />
            <Separator number={value?.second || 0} />
            <Digit number={mathNum(value?.minute)} />
            <Digit number={mathNum(value?.minute, false)} />
            <Separator number={value?.second || 0} />
            <Digit number={mathNum(value?.second)} />
            <Digit number={mathNum(value?.second, false)} />
          </div>
        );
      }}
    </TimeClockContext>
  );
};

export default Clock3;
