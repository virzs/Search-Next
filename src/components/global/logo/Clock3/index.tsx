/*
 * @Author: Vir
 * @Date: 2021-10-21 11:28:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-21 15:08:00
 */
import dayjs from 'dayjs';
import React from 'react';
import Digit, { MatrixNum } from './digit';
import Separator from './separator';

const Clock3: React.FC = () => {
  const [hour, setHour] = React.useState<number>(0);
  const [minute, setMinute] = React.useState<number>(0);
  const [second, setSecond] = React.useState<number>(0);

  const getTime = () => {
    let privHour = dayjs().hour();
    let privMinute = dayjs().minute();
    let privSecond = dayjs().second();

    setHour(privHour);
    setMinute(privMinute);
    setSecond(privSecond);
  };

  const mathNum = (number: number, bool: boolean = true): MatrixNum => {
    return bool
      ? (Math.floor(number / 10) as unknown as MatrixNum)
      : ((number % 10) as unknown as MatrixNum);
  };

  React.useEffect(() => {
    const timer = setInterval(getTime, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex gap-2">
      <Digit number={mathNum(hour)} />
      <Digit number={mathNum(hour, false)} />
      <Separator number={minute} />
      <Digit number={mathNum(minute)} />
      <Digit number={mathNum(minute, false)} />
      <Separator number={second} />
      <Digit number={mathNum(second)} />
      <Digit number={mathNum(second, false)} />
    </div>
  );
};

export default Clock3;
