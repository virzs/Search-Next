/*
 * @Author: Vir
 * @Date: 2021-10-21 11:29:36
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 16:00:58
 */

import classNames from 'classnames';
import React from 'react';
import matrixNum from './data';

export type MatrixNum = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface DigitProps {
  number: MatrixNum;
}

const Digit: React.FC<DigitProps> = ({ number }) => {
  const [matrix, setMatrix] = React.useState(matrixNum[0]);

  const renderDigit = (number: MatrixNum = 0) => {
    setMatrix(matrixNum[number]);
  };

  React.useEffect(() => {
    renderDigit(number);
  }, [number]);

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {matrix.map((i, j) => (
        <i
          key={j}
          className={classNames(
            'rounded-sm transition-all w-2.5 h-2.5',
            i ? 'bg-var-main-10' : 'bg-var-main-1',
          )}
        />
      ))}
    </div>
  );
};

export default Digit;
