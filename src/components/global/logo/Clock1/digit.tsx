/*
 * @Author: Vir
 * @Date: 2021-06-03 11:55:10
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 14:30:52
 */

import classNames from 'classnames';
import React from 'react';
import digitNum from './data';

interface DigitPropsType {
  value: DigitNum; //当前显示的数字
}
export type DigitNum = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const Digit: React.FC<DigitPropsType> = ({ value = 0 }) => {
  // 当前所有segment状态，true为亮起，false为熄灭
  const [segmentsOn, setSegmentsOn] = React.useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const changeSegment = () => {
    let newSeg = segmentsOn.map(() => false);
    digitNum[value].forEach((i: number) => {
      newSeg[i] = true;
    });
    setSegmentsOn(newSeg);
  };

  React.useEffect(() => {
    changeSegment();
  }, [value]);

  return (
    <div className="w-14 h-25 mx-1 relative transform scale-75 md:scale-100 flex-grow-0 flex-shrink">
      {segmentsOn.map((i, j) => (
        <i
          className={classNames(
            'segment bg-var-main-10 rounded absolute opacity-20 transition-opacity block',
            {
              'opacity-100': i,
              'h-1.5': j === 0 || j === 3 || j === 6,
              'w-1.5 h-10': j === 1 || j === 2 || j === 4 || j === 5,
              'top-1': j === 0,
              'top-2': j === 1 || j === 5,
              'left-1': j === 4 || j === 5,
              'left-2': j === 0 || j === 3 || j === 6,
              'right-1': j === 1 || j === 2,
              'right-2': j === 0 || j === 3 || j === 6,
              'bottom-1': j === 3,
              'bottom-2': j === 2 || j === 4,
              'bottom-1/2 -mb-0.75': j === 6,
            },
          )}
          key={j}
        />
      ))}
    </div>
  );
};

export default Digit;
