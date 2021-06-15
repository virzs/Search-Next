/*
 * @Author: Vir
 * @Date: 2021-06-11 09:16:52
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-15 14:50:13
 */

import { bingImg } from '@/apis/bing';
import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { Image, Spin } from 'antd';
import { BingImage } from '@/apis/bing/interface';
import './styles/background.style.less';
import ContentItemTitle from '../../components/contentItemTitle';
import OutlineCard from '@/components/global/card/outline-card';
import { Block } from '@material-ui/icons';
import dayjs from 'dayjs';

const BackgroundItem = () => {
  const [imgList, setImgList] = React.useState([] as BingImage[]);
  const [loadings, setLoadings] = React.useState<boolean[]>([]);
  const [checkHsh, setCheckHsh] = React.useState<string>('empty');

  const getList = () => {
    bingImg().then((res) => {
      let list = res.data.data;
      setImgList(list);
      setLoadings(list.map(() => true));
    });
  };

  const imgLoad = (index: number) => {
    let imgLoadings = loadings;
    imgLoadings[index] = false;
    setLoadings(imgLoadings.map((i) => i));
  };

  const findImgToStroage = (hsh: string) => {
    const image = imgList.find((i) => i.hsh === hsh);
    if (image) localStorage.setItem('checkIndexBg', JSON.stringify(image));
  };

  React.useEffect(() => {
    getList();
  }, []);

  React.useEffect(() => {
    findImgToStroage(checkHsh);
  }, [checkHsh]);

  return (
    <div>
      <ContentItemTitle title="背景" desc="适用于主页的背景" />
      <div className="bing-img-root">
        <OutlineCard
          id="empty"
          value={checkHsh}
          onChange={(val) => setCheckHsh(val)}
          label="默认背景"
        >
          <Image
            className="content-w-h"
            preview={false}
            placeholder={
              <div className="bg-empty">
                <Block />
              </div>
            }
          />
        </OutlineCard>
        {imgList.map((i, j) => (
          <OutlineCard
            key={i.hsh}
            id={i.hsh}
            value={checkHsh}
            label={dayjs(i.enddate).format('YYYY/MM/DD')}
            onChange={(val) => setCheckHsh(val)}
            tip={i.copyright}
          >
            <Spin
              spinning={loadings[j]}
              indicator={<CircularProgress size={18} color="inherit" />}
            >
              <Image
                className="content-w-h"
                onLoad={() => imgLoad(j)}
                preview={false}
                placeholder
                src={i.url}
                alt={i.copyright}
              />
            </Spin>
          </OutlineCard>
        ))}
      </div>
    </div>
  );
};

export default BackgroundItem;
