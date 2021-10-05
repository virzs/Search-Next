/*
 * @Author: Vir
 * @Date: 2021-06-03 11:55:10
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-17 16:43:24
 */

import classNames from 'classnames';
import React from 'react';
import './style.less';

interface DigitPropsType {
  value: number; //当前显示的数字
}

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
  // 0至9对应显示的部分，生成顺序依照顺时针，第7位为中间的元素
  const digitSegments = [
    [0, 1, 2, 3, 4, 5], //0
    [1, 2], //1
    [0, 1, 6, 4, 3], //2
    [0, 1, 6, 2, 3], //3
    [5, 6, 1, 2], //4
    [0, 5, 6, 2, 3], //5
    [0, 5, 4, 3, 2, 6], //6
    [0, 1, 2], //7
    [0, 1, 2, 3, 4, 5, 6], //8
    [0, 1, 6, 2, 5], //9
  ];

  const changeSegment = () => {
    let newSeg = segmentsOn.map(() => false);
    digitSegments[value].forEach((i) => {
      newSeg[i] = true;
    });
    setSegmentsOn(newSeg);
  };

  React.useEffect(() => {
    changeSegment();
  }, [value]);

  return (
    <div className="digit">
      {segmentsOn.map((i, j) => (
        <div className={classNames('segment', { on: i })} key={j}></div>
      ))}
    </div>
  );
};

export default Digit;
