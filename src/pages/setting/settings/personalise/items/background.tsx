/*
 * @Author: Vir
 * @Date: 2021-06-11 09:16:52
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-14 23:01:45
 */

import { bingImg } from '@/apis/bing';
import { CircularProgress, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import { Image, Spin } from 'antd';
import { BingImage } from '@/apis/bing/interface';
import './styles/background.style.less';
import ContentItemTitle from '../../components/contentItemTitle';

const BackgroundItem = () => {
  const [imgList, setImgList] = React.useState([] as BingImage[]);
  const [loadings, setLoadings] = React.useState<boolean[]>([]);

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

  React.useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <ContentItemTitle title="背景" desc="适用于主页的背景" />
      <div className="bing-img-root">
        {imgList.map((i, j) => (
          <div className="bing-img-card-root" key={j}>
            <Tooltip title={i.copyright}>
              <Spin
                spinning={loadings[j]}
                indicator={<CircularProgress size={18} color="inherit" />}
              >
                <Image
                  onLoad={() => imgLoad(j)}
                  preview={false}
                  placeholder
                  src={i.url}
                />
              </Spin>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundItem;
