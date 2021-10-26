/*
 * @Author: Vir
 * @Date: 2021-10-16 22:55:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 14:08:25
 */
import dayjs from 'dayjs';
import React from 'react';
import TimeClockContext from '../timeClockContext';

const Clock2: React.FC = () => {
  const renderDate = (date: dayjs.Dayjs = dayjs()) => {
    return date.format('LL') || '-- -- --';
  };

  const renderTime = (date: dayjs.Dayjs = dayjs()) => {
    return date.format('HH:mm:ss') || '--:--:--';
  };

  return (
    <TimeClockContext>
      {(value) => {
        return (
          <div className="text-left mx-auto text-var-main-10 border-l-8 border-var-main-10 px-5 py-3 font-mono">
            <div className="font-semibold text-5xl tabular-nums">
              {renderDate(value?.date)}
            </div>
            <div className="text-4xl tabular-nums">
              {renderTime(value?.date)}
            </div>
          </div>
        );
      }}
    </TimeClockContext>
  );
};

export default Clock2;
