/*
 * @Author: Vir
 * @Date: 2021-09-29 17:50:58
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 15:27:36
 */

import { getScale } from '@/utils/common';
import { css, cx } from '@emotion/css';
import React, { useEffect, useState } from 'react';
import { UsePreviewData } from '@/hooks/settings/background/preview';

export interface ExampleProps {
  data: UsePreviewData;
}

const Example: React.FC<ExampleProps> = ({ data: dataSource }) => {
  const [scale, setScale] = React.useState<[number, number]>([0, 0]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = React.useState<number>(0);

  const [privCss, setPrivCss] = useState('');

  const { css: localCss, type } = dataSource ?? {};

  const ref = React.useRef<HTMLDivElement>(null);

  const onResize = React.useCallback(() => {
    const scale = getScale();
    const width = ref.current ? ref.current.clientWidth : 384;
    const h = (width / scale[0]) * scale[1];
    setScale(scale);
    setWidth(width);
    setHeight(h);
  }, []);

  React.useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    // 这个格式的可以根据宽高优化图像，所以这里这样写
    if (type === 'picsum') {
      const id = dataSource?.picsum?.data?.id;
      if (id) {
        const privateCss = css`
          background-image: url(https://picsum.photos/id/${id}/${width.toFixed()}/${height.toFixed()});
        `;
        setPrivCss(privateCss);
      }
    } else {
      privCss !== '' && setPrivCss('');
    }
  }, [dataSource, width, height]);

  return (
    <div className="grid grid-cols-2 gap-8">
      <div
        ref={ref}
        className={cx(
          'rounded border my-2 bg-cover bg-center flex flex-col items-center justify-center',
          privCss === '' ? localCss : privCss,
        )}
        style={{
          height: `${height}px`,
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
