/*
 * @Author: Vir
 * @Date: 2021-09-29 17:50:58
 * @Last Modified by:   Vir
 * @Last Modified time: 2021-09-29 17:50:58
 */

import { AuthBackground } from '@/data/account/default';
import { getScale } from '@/utils/common';
import React from 'react';

export interface ExampleProps {
  data: AuthBackground;
}

const Example: React.FC<ExampleProps> = ({ data }) => {
  const [scale, setScale] = React.useState<[number, number]>([0, 0]);
  const [height, setHeight] = React.useState<number>(0);

  const onResize = React.useCallback(() => {
    const scale = getScale();
    const h = (384 / scale[0]) * scale[1];
    setScale(scale);
    setHeight(h);
  }, []);

  React.useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className="w-96 rounded border my-2 bg-cover bg-center flex flex-col items-center justify-center"
      style={{
        height: `${height}px`,
        background: data.data ? `url(${data.data.url})` : undefined,
      }}
    >
      <div className="rounded h-5 w-48 mb-6 flex justify-end overflow-hidden">
        <div className="flex-grow h5 border bg-white rounded-l"></div>
        <div className="bg-primary h-5 w-9 border border-primary"></div>
      </div>
    </div>
  );
};

export default Example;
