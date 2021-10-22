/*
 * @Author: Vir
 * @Date: 2021-06-03 11:08:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 14:22:22
 */

import dayjs from 'dayjs';
import React from 'react';
import Digit, { DigitNum } from './digit';
import Separator from './separator';

export interface DigitalClockProps {
  className: any;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ className }) => {
  const [hour, setHour] = React.useState<number>(0);
  const [min, setMin] = React.useState<number>(0);
  const [sec, setSec] = React.useState<number>(0);

  const getTime = () => {
    let time = dayjs();
    setHour(time.hour());
    setMin(time.minute());
    setSec(time.second());
  };

  const mathNum = (number: number, bool: boolean = true): DigitNum => {
    return bool
      ? (Math.floor(number / 10) as unknown as DigitNum)
      : ((number % 10) as unknown as DigitNum);
  };

  React.useEffect(() => {
    const timer = setInterval(getTime, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={className}>
      <div className="flex justify-center items-center">
        <Digit value={mathNum(hour)} />
        <Digit value={mathNum(hour, false)} />
        <Separator number={sec} />
        <Digit value={mathNum(min)} />
        <Digit value={mathNum(min, false)} />
        <Separator number={sec} />
        <Digit value={mathNum(sec)} />
        <Digit value={mathNum(sec, false)} />
      </div>
    </div>
  );
};

export default DigitalClock;
