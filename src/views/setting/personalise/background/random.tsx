/*
 * @Author: Vir
 * @Date: 2021-09-23 15:34:04
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 16:18:23
 */

import {
  BingImage,
  bingImg,
  checkedBg,
  setBackground,
} from '@/apis/setting/background';
import { Block, Replay } from '@material-ui/icons';
import { Spin, Image } from 'antd';
import { Button, CircularProgress, Tooltip } from '@material-ui/core';
import OutlineCard from '@/components/global/card/outline-card';
import React from 'react';
import dayjs from 'dayjs';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';

const Random: React.FC = () => {
  const [imgList, setImgList] = React.useState([] as BingImage[]); //图片列表
  const [loadings, setLoadings] = React.useState<boolean[]>([]); //图片加载数组
  const [checkHsh, setCheckHsh] = React.useState<string>(''); //选中图片的hsh值
  const [apiLoading, setApiLoading] = React.useState<boolean>(false);
  const demoList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const [init, setInit] = React.useState<boolean>(false);
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
    const userId = localStorage.getItem('account');
    const check = checkedBg(userId);
    let hsh = 'empty';
    if (check) {
      hsh = check.hsh;
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
    // 解决初始化时每个card都触发onChange事件的问题
    if (!init) return setInit(true);
    const userId = localStorage.getItem('account');
    if (hsh === 'empty' && userId) setBackground(userId);
    const image = imgList.find((i) => i.hsh === hsh);
    if (image && userId) {
      setBackground(userId, {
        check: true,
        url: image.url,
        bgId: image._id,
        hsh: image.hsh,
        copyright: image.copyright,
        copyrightlink: image.copyrightlink,
      });
    }
    // setTheme(hsh !== 'empty');
  };

  React.useEffect(() => {
    getList();
  }, []);

  return (
    <div className="my-0 px-4 border-t">
      <ItemHeader
        title="背景"
        desc="修改适用于主页的背景，当前版本壁纸尺寸为标准1920x1080，在更大分辨率下会存在模糊问题。"
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
      <div className="bing-img-root p-4 justify-center">
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
          ? demoList.map((i) => (
              <OutlineCard key={i} label=" " disabled loading />
            ))
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

export default Random;
