/*
 * @Author: Vir
 * @Date: 2021-06-03 11:08:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-06 14:25:04
 */

import dayjs from 'dayjs';
import React from 'react';
import Digit from './digit';
import Separator from './separator';
import './style.less';

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

  React.useEffect(() => {
    const timer = setInterval(getTime, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={className}>
      <div className="digital-clock-root">
        <Digit value={Math.floor(hour / 10)} />
        <Digit value={hour % 10} />
        <Separator />
        <Digit value={Math.floor(min / 10)} />
        <Digit value={min % 10} />
        <Separator />
        <Digit value={Math.floor(sec / 10)} />
        <Digit value={sec % 10} />
      </div>
    </div>
  );
};

export default DigitalClock;
