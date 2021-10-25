/*
 * @Author: Vir
 * @Date: 2021-10-21 11:28:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-25 22:45:58
 */
import React from 'react';
import TimeClockContext, { DateValue } from '../timeClockContext';
import Digit, { MatrixNum } from './digit';
import Separator from './separator';

const Clock3: React.FC = () => {
  const [date, setDate] = React.useState<DateValue>();

  const mathNum = (number: number, bool: boolean = true): MatrixNum => {
    return bool
      ? (Math.floor(number / 10) as unknown as MatrixNum)
      : ((number % 10) as unknown as MatrixNum);
  };
  return (
    <TimeClockContext>
      {(value) => {
        setDate(value);
        return (
          <div className="flex gap-3">
            <Digit number={mathNum(date?.hour || 0)} />
            <Digit number={mathNum(date?.hour || 0, false)} />
            <Separator number={date?.second || 0} />
            <Digit number={mathNum(date?.minute || 0)} />
            <Digit number={mathNum(date?.minute || 0, false)} />
            <Separator number={date?.second || 0} />
            <Digit number={mathNum(date?.second || 0)} />
            <Digit number={mathNum(date?.second || 0, false)} />
          </div>
        );
      }}
    </TimeClockContext>
  );
};

export default Clock3;
