/*
 * @Author: Vir
 * @Date: 2022-05-04 21:17:38
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-04 21:53:20
 */
import { css, cx, keyframes } from '@emotion/css';
import React, { FC } from 'react';

const load = keyframes`
  0%,
  20%,
  40%,
  60%,
  100% {
    transform: scaleY(0.5);
  }

  20% {
    transform: scaleY(1);
  }`;

export interface LoadingProps {
  children?: any;
  loading?: boolean;
  color?: string;
  full?: boolean;
}

const Loading: FC<LoadingProps> = (props) => {
  const { loading, color = '#5f5f5f', children, full = false } = props;
  const icon = (
    <div className="w-16 h-16 flex gap-1 justify-center items-center">
      {new Array(5).fill('').map((i, j) => (
        <i
          className={cx(
            'w-1.5 h-10 rounded scale-y-50',
            css`
              background-color: ${color};
              animation: ${load} 1s ${j * 0.2}s infinite ease-in-out;
            `,
          )}
          key={j}
        ></i>
      ))}
    </div>
  );
  return children ? (
    <div
      className={cx(
        loading && 'flex justify-center items-center relative',
        full && 'w-full h-full',
      )}
    >
      <div className={cx(loading && 'opacity-0')}>{children}</div>
      {loading && (
        <div
          className={cx(
            'flex absolute top-0 left-0 right-0 bottom-0 justify-center items-center',
          )}
        >
          {icon}
        </div>
      )}
    </div>
  ) : full ? (
    <div className="w-full h-full flex justify-center items-center">{icon}</div>
  ) : (
    icon
  );
};

export default Loading;
