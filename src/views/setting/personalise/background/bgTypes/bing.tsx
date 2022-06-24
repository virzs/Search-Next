/*
 * @Author: Vir
 * @Date: 2021-09-23 15:34:04
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-20 17:34:55
 */

import {
  BingImage,
  bingImg,
  UseBackgroundTypeBingData,
} from '@/apis/setting/background';
import { Replay } from '@mui/icons-material';
import { Spin, Image } from 'antd';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import OutlineCard from '@/components/global/card/outline-card';
import React from 'react';
import dayjs from 'dayjs';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import { AuthBackgroundRandomData } from '@/data/account/interface';
import classNames from 'classnames';
import { css } from '@emotion/css';

export interface RandomProps {
  dataSource?: UseBackgroundTypeBingData;
  onChange?: (selected?: UseBackgroundTypeBingData['data']) => void;
}

const Bing: React.FC<RandomProps> = ({ dataSource, onChange }) => {
  const { data, history = [] } = dataSource ?? {};
  const [imgList, setImgList] = React.useState([] as BingImage[]); //图片列表
  const [hisLoadings, setHisLoadings] = React.useState<boolean[]>([]); //图片加载数组
  const [loadings, setLoadings] = React.useState<boolean[]>([]); //图片加载数组
  const [checkHsh, setCheckHsh] = React.useState<string>(''); //选中图片的hsh值
  const [apiLoading, setApiLoading] = React.useState<boolean>(false);
  const demoList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const getList = () => {
    setApiLoading(true);
    const hsh = initCheck();
    bingImg({ size: 10, hsh }).then((res) => {
      let list = res.data;
      setImgList(list);
      setLoadings(list.map(() => true));
      setApiLoading(false);
      const image = list[0];
      if (data) {
        setCheckHsh(data?._id);
      } else {
        if (onChange) onChange(image);
        setCheckHsh(image._id);
      }
    });
  };

  // 图片加载状态
  const imgLoad = (index: number, isHistory?: boolean) => {
    if (isHistory) {
      let historyLoadings = hisLoadings;
      historyLoadings[index] = false;
      setHisLoadings(historyLoadings.map((i) => i));
      return;
    }
    let imgLoadings = loadings;
    imgLoadings[index] = false;
    setLoadings(imgLoadings.map((i) => i));
  };

  const initCheck = (): string => {
    const check = data;
    let hsh = '';
    if (check) {
      hsh = check.hsh;
      setCheckHsh(check?._id);
    }
    return hsh;
  };

  // 选择背景
  const onCheckChange = (_id: string) => {
    setCheckHsh(_id);
    const selected: any =
      imgList.find((i) => i._id === _id) || history.find((i) => i._id === _id);
    if (selected && onChange) {
      onChange(selected);
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
      {history.length > 0 && (
        <>
          <ItemHeader title="最近使用的背景" />
          <div
            className={classNames(
              'justify-center flex flex-wrap mt-4 mb-4 gap-3',
              css`
                .ant-image {
                  display: block;
                }
              `,
            )}
          >
            {history.map((i, j) => (
              <OutlineCard
                key={i._id}
                id={i._id}
                value={checkHsh}
                label={dayjs(i.enddate).format('YYYY/MM/DD')}
                onChange={(val) => onCheckChange(val)}
                tip={i.copyright}
              >
                <Spin
                  spinning={hisLoadings[j]}
                  indicator={<CircularProgress size={18} color="inherit" />}
                >
                  <Image
                    className="w-32 h-20 block"
                    onLoad={() => imgLoad(j, true)}
                    preview={false}
                    placeholder
                    src={i.url}
                    alt={i.copyright}
                  />
                </Spin>
              </OutlineCard>
            ))}
          </div>
        </>
      )}
      <ItemHeader title="可选背景" />
      <div
        className={classNames(
          'justify-center flex flex-wrap mt-4 mb-4 gap-3',
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
                key={i._id}
                id={i._id}
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

export default Bing;
