/*
 * @Author: Vir
 * @Date: 2021-10-25 22:03:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-25 22:39:18
 */
import dayjs from 'dayjs';
import React from 'react';

export interface DateValue {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  date: dayjs.Dayjs;
}

export interface TimeClockContextProps {
  children: (value: DateValue | undefined) => React.ReactNode;
}

const TimeClockContext: React.FC<TimeClockContextProps> = ({ children }) => {
  const [date, setDate] = React.useState<DateValue>();
  const Context = React.createContext(date);

  const getTime = () => {
    const date = dayjs();
    setDate({
      year: date.year(),
      month: date.month() + 1,
      day: date.date(),
      hour: date.hour(),
      minute: date.minute(),
      second: date.second(),
      date: date,
    });
  };

  React.useEffect(() => {
    const timer = setInterval(getTime, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Context.Provider value={date}>
      <Context.Consumer>{children}</Context.Consumer>
    </Context.Provider>
  );
};

export default TimeClockContext;
