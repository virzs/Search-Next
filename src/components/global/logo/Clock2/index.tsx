/*
 * @Author: Vir
 * @Date: 2021-10-16 22:55:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-21 14:41:51
 */
import dayjs from 'dayjs';
import React from 'react';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

const Clock2: React.FC = () => {
  const [date, setDate] = React.useState<string>('-');
  const [time, setTime] = React.useState<string>('-');

  const getTime = () => {
    dayjs.extend(LocalizedFormat);
    let date = dayjs().format('LL');
    let time = dayjs().format('HH:mm:ss');
    setDate(date);
    setTime(time);
  };

  React.useEffect(() => {
    const timer = setInterval(getTime, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="text-left mx-auto text-var-main-10 border-l-8 border-var-main-10 px-5 py-3 font-mono">
      <div className="font-semibold text-3xl tabular-nums">{date}</div>
      <div className="text-2xl tabular-nums">{time}</div>
    </div>
  );
};

export default Clock2;
