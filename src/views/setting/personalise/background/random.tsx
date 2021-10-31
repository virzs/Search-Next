/*
 * @Author: Vir
 * @Date: 2021-09-23 15:34:04
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 14:44:47
 */

import {
  BingImage,
  bingImg,
  checkedBg,
  setBackground,
} from '@/apis/setting/background';
import { Replay } from '@material-ui/icons';
import { Spin, Image } from 'antd';
import { Button, CircularProgress, Tooltip } from '@material-ui/core';
import OutlineCard from '@/components/global/card/outline-card';
import React from 'react';
import dayjs from 'dayjs';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import { AuthBackgroundRandomData } from '@/data/account/interface';
import classNames from 'classnames';
import { css } from '@emotion/css';

export interface RandomProps {
  data?: AuthBackgroundRandomData;
  onChange?: (selected?: AuthBackgroundRandomData) => void;
}

const Random: React.FC<RandomProps> = ({ data, onChange }) => {
  const [imgList, setImgList] = React.useState([] as BingImage[]); //图片列表
  const [loadings, setLoadings] = React.useState<boolean[]>([]); //图片加载数组
  const [checkHsh, setCheckHsh] = React.useState<string>(''); //选中图片的hsh值
  const [apiLoading, setApiLoading] = React.useState<boolean>(false);
  const demoList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const [init, setInit] = React.useState<boolean>(false);

  const formatItem = (data: BingImage): AuthBackgroundRandomData => {
    return {
      id: data._id,
      url: data.url,
      hsh: data.hsh,
      copyright: data.copyright,
      copyrightlink: data.copyrightlink,
    };
  };

  const getList = () => {
    setApiLoading(true);
    const hsh = initCheck();
    bingImg({ size: 10, hsh }).then((res) => {
      let list = res.data.data;
      setImgList(list);
      setLoadings(list.map(() => true));
      setApiLoading(false);
      const image = list[0];
      if (data) {
        setCheckHsh(data.hsh);
      } else {
        if (onChange) onChange(formatItem(image));
        setCheckHsh(image.hsh);
      }
    });
  };

  // 图片加载状态
  const imgLoad = (index: number) => {
    let imgLoadings = loadings;
    imgLoadings[index] = false;
    setLoadings(imgLoadings.map((i) => i));
  };

  const initCheck = (): string => {
    const check = data;
    let hsh = '';
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
    const selected: any = imgList.find((i) => i.hsh === hsh);
    if (selected && onChange) {
      onChange(formatItem(selected));
    }
  };

  const findImgToStroage = (hsh: string) => {
    // 解决初始化时每个card都触发onChange事件的问题
    if (!init) return setInit(true);
    const userId = localStorage.getItem('account');
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
      <div
        className={classNames(
          'p-4 justify-center flex flex-wrap mt-2 mb-4 gap-3',
          css`
            .ant-image {
              display: block;
            }
          `,
        )}
      >
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
                  className="w-32 h-20 block"
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
