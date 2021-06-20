/*
 * @Author: Vir
 * @Date: 2021-06-11 09:16:52
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-20 15:46:58
 */

import { bingImg } from '@/apis/bing';
import { Button, CircularProgress } from '@material-ui/core';
import React from 'react';
import { Image, Spin } from 'antd';
import { BingImage } from '@/apis/bing/interface';
import './styles/background.style.less';
import ContentItemTitle from '../../components/contentItemTitle';
import OutlineCard from '@/components/global/card/outline-card';
import { Block, Replay } from '@material-ui/icons';
import dayjs from 'dayjs';
import Tooltip from 'antd/es/tooltip';

const BackgroundItem = () => {
  const [imgList, setImgList] = React.useState([] as BingImage[]); //图片列表
  const [loadings, setLoadings] = React.useState<boolean[]>([]); //图片加载数组
  const [checkHsh, setCheckHsh] = React.useState<string>(''); //选中图片的hsh值
  const [apiLoading, setApiLoading] = React.useState<boolean>(false);
  const demoList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const getList = () => {
    setApiLoading(true);
    const hsh = initCheck();
    bingImg({ size: 9, hsh }).then((res) => {
      let list = res.data.data;
      setImgList(list);
      setLoadings(list.map(() => true));
      setApiLoading(false);
    });
  };

  const imgLoad = (index: number) => {
    let imgLoadings = loadings;
    imgLoadings[index] = false;
    setLoadings(imgLoadings.map((i) => i));
  };

  const initCheck = (): string => {
    const check = localStorage.getItem('checkIndexBg');
    let hsh = 'empty';
    if (check) {
      hsh = JSON.parse(check).hsh;
    }
    setCheckHsh(hsh);
    return hsh;
  };

  // 选择背景
  const onCheckChange = (hsh: string) => {
    setCheckHsh(hsh);
    findImgToStroage(hsh);
  };

  const findImgToStroage = (hsh: string) => {
    if (hsh === 'empty') localStorage.removeItem('checkIndexBg');
    const image = imgList.find((i) => i.hsh === hsh);
    if (image) localStorage.setItem('checkIndexBg', JSON.stringify(image));
  };

  React.useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <ContentItemTitle
        title="背景"
        desc="修改适用于主页的背景"
        rightHandle={
          <Tooltip title="通过刷新获取随机背景图片">
            <Button
              variant="contained"
              startIcon={<Replay />}
              size="small"
              disableElevation
              onClick={() => getList()}
            >
              刷新
            </Button>
          </Tooltip>
        }
      />
      <div className="bing-img-root">
        {!apiLoading && (
          <OutlineCard
            id="empty"
            value={checkHsh}
            onChange={(val) => onCheckChange(val)}
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
        )}
        {apiLoading
          ? demoList.map((i) => <OutlineCard key={i} disabled loading />)
          : imgList.map((i, j) => (
              <OutlineCard
                key={i.hsh}
                id={i.hsh}
                value={checkHsh}
                label={dayjs(i.enddate).format('YYYY/MM/DD')}
                onChange={(val) => onCheckChange(val)}
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
