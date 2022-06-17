import { loremPicsumImg } from '@/apis/setting/background';
import OutlineCard from '@/components/global/card/outline-card';
import Loading from '@/components/global/loading/loading';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import { css, cx } from '@emotion/css';
import { Button, ButtonGroup, CircularProgress } from '@mui/material';
import { Spin, Image as AImage } from 'antd';
import React, { useEffect, useState } from 'react';

export interface Image {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

function LoremPicsum() {
  const [init, setInit] = useState(false);
  const [loadings, setLoadings] = React.useState<boolean[]>([]); //图片加载数组
  const [current, setCurrent] = useState(1);
  const [lastCurrent, setLastCurrent] = useState<number | undefined>();
  const [imageList, setImageList] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState('');

  const fetchList = (page: number) => {
    setLoading(true);
    loremPicsumImg({ page })
      .then((res: any) => {
        setLastCurrent(current);
        setCurrent(page);
        setImageList(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 图片加载状态
  const imgLoad = (index: number) => {
    let imgLoadings = loadings;
    imgLoadings[index] = false;
    setLoadings(imgLoadings.map((i) => i));
  };

  // 选择背景
  const onCheckChange = (id: string) => {
    setChecked(id);
    // findImgToStroage(hsh);
    // const selected: any = imgList.find((i) => i.hsh === hsh);
    // if (selected && onChange) {
    //   onChange(formatItem(selected));
    // }
  };

  useEffect(() => {
    init && fetchList(current);
  }, [current, init]);

  useEffect(() => {
    setInit(true);
    lastCurrent !== current && fetchList(current);
  }, []);

  return (
    <div className="my-0 px-4 border-t">
      <ItemHeader
        title="Lorem Picsum"
        desc="修改适用于主页的背景，Lorem Pisum会自动获取符合当前分辨率的图片"
      />
      <Loading loading={loading}>
        <div
          className={cx(
            'p-4 grid grid-cols-5 mt-2 mb-4 gap-3',
            css`
              .ant-image {
                display: block;
              }
            `,
          )}
        >
          {imageList.map((item, index) => (
            <OutlineCard
              fullWidth
              labelWidth={140}
              key={item.id}
              id={item.id}
              value={checked}
              label={item.author}
              onChange={(val) => onCheckChange(val)}
            >
              <Spin
                spinning={loadings[index]}
                indicator={<CircularProgress size={18} color="inherit" />}
              >
                <AImage
                  className="w-full h-20 block"
                  onLoad={() => imgLoad(index)}
                  preview={false}
                  placeholder
                  src={`https://picsum.photos/id/${item.id}/128/80`}
                  alt={item.author}
                />
              </Spin>
            </OutlineCard>
          ))}
        </div>
      </Loading>
      <div className="flex justify-center">
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <Button
            disabled={current === 1}
            onClick={() => setCurrent(current - 1)}
          >
            上一页
          </Button>
          <Button
            disabled={imageList.length === 0 || imageList.length < 30}
            onClick={() => setCurrent(current + 1)}
          >
            下一页
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default LoremPicsum;
