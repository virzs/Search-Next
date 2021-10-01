/*
 * @Author: Vir
 * @Date: 2021-09-29 17:50:58
 * @Last Modified by:   Vir
 * @Last Modified time: 2021-09-29 17:50:58
 */

import { latestImg } from '@/apis/setting/background';
import { AuthBackground, AuthBackgroundType } from '@/data/account/default';
import { getScale } from '@/utils/common';
import React from 'react';

export interface ExampleProps {
  data: AuthBackground;
}

const Example: React.FC<ExampleProps> = ({ data }) => {
  const [scale, setScale] = React.useState<[number, number]>([0, 0]);
  const [height, setHeight] = React.useState<number>(0);
  const [privateData, setPrivateData] = React.useState({} as AuthBackground);

  const ref = React.useRef<HTMLDivElement>(null);

  const onResize = React.useCallback(() => {
    const scale = getScale();
    const width = ref.current ? ref.current.clientWidth : 384;
    const h = (width / scale[0]) * scale[1];
    setScale(scale);
    setHeight(h);
  }, []);

  // 获取每日一图
  const getEveryDay = () => {
    latestImg().then((res) => {
      setPrivateData({
        type: data.type,
        data: res.data.data[0],
      });
    });
  };

  React.useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  React.useEffect(() => {
    if (data.type === 'everyday') {
      getEveryDay();
    } else {
      setPrivateData(data);
    }
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-8">
      <div
        ref={ref}
        className="rounded border my-2 bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          height: `${height}px`,
          background: privateData.data
            ? `url(${privateData.data.url})`
            : undefined,
        }}
      >
        <div className="rounded h-5 w-48 mb-6 flex justify-end overflow-hidden">
          <div className="flex-grow h5 border bg-white rounded-l"></div>
          <div className="bg-primary h-5 w-9 border border-primary"></div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Example;
