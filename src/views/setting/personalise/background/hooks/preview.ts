/*
 * @Author: Vir
 * @Date: 2022-06-21 17:51:04
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-21 17:53:40
 */

import {
  BackgroundType,
  getBackgroundApi,
  latestImg,
  UseBackgroundData,
  UseBackgroundTypeBingData,
  UseBackgroundTypeBingEverydayData,
  UseBackgroundTypeColorData,
  UseBackgroundTypeLinkData,
  UseBackgroundTypePicsumData,
} from '@/apis/setting/background';
import { css } from '@emotion/css';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { UseBackgroundActionOnChangeParams } from './background';

export interface UsePreviewData extends UseBackgroundData {
  css: string;
  isImage: boolean;
  url: string;
}

export interface UsePreviewAction {
  refresh: () => void;
}

export type UsePreviewResult = [UsePreviewData, UsePreviewAction];

export const usePreview = (): UsePreviewResult => {
  const [init, setInit] = useState(false);
  const [type, setType] = useState<BackgroundType>('color');
  const [color, setColor] = useState<UseBackgroundTypeColorData>();
  const [bing, setBing] = useState<UseBackgroundTypeBingData>();
  const [picsum, setPicsum] = useState<UseBackgroundTypePicsumData>();
  const [bing_everyday, setBingEveryday] =
    useState<UseBackgroundTypeBingEverydayData>();
  const [link, setLink] = useState<UseBackgroundTypeLinkData>();

  const [cssData, setCssData] = useState(''); // 预处理的 css 样式
  const [isImage, setIsImage] = useState(false); // 判断当前是否是图片类型
  const [url, setUrl] = useState<string>('');

  const handleCss = (data: UseBackgroundActionOnChangeParams) => {
    const _type = data.type || type;
    let _css = css``;

    switch (_type) {
      case 'color':
        setIsImage(false);
        break;
      case 'bing':
        const bingUrl = data.bing?.url;
        _css = css`
          background-image: url(${bingUrl});
        `;
        setIsImage(true);
        setUrl(bingUrl ?? '');
        break;
      case 'bing_everyday':
        const latestData = data.bing_everyday;
        const over = latestData
          ? dayjs().format('YYYYMMDD') !== latestData.enddate
          : true;
        if (over) {
          latestImg().then((res) => {
            if (res.data[0]) {
              _css = css`
                background-image: url(${res.data[0]?.url});
              `;
              setUrl(res.data[0]?.url);
            }
          });
        } else {
          const bingEverydayUrl = data.bing_everyday?.url;
          _css = css`
            background-image: url(${bingEverydayUrl});
          `;
          setUrl(bingEverydayUrl ?? '');
        }
        setIsImage(true);
        break;
      case 'picsum':
        setIsImage(true);
        break;
      case 'link':
        const linkUrl = data.link?.url;
        _css = css`
          background-image: url(${linkUrl});
        `;
        setIsImage(true);
        setUrl(linkUrl ?? '');
        break;
    }
    setCssData(_css);
  };

  const getLocalData = () => {
    const userId = localStorage.getItem('account');
    const localData = getBackgroundApi(userId ?? '');
    if (localData) {
      setType(localData.type);
      setColor(localData.color);
      setBing(localData.bing);
      setPicsum(localData.picsum);
      setBingEveryday(localData.bing_everyday);
      setLink(localData.link);
      handleCss({
        type: localData.type,
        color: localData.color?.data,
        bing: localData.bing?.data,
        picsum: localData.picsum?.data,
        bing_everyday: localData.bing_everyday?.data,
        link: localData.link?.data,
      });
    }
  };

  const refresh = () => {
    getLocalData();
  };

  useEffect(() => {
    if (init) return;
    getLocalData();
    setInit(true);
  }, []);

  return [
    {
      type,
      color,
      bing,
      picsum,
      bing_everyday,
      link,
      css: cssData,
      isImage,
      url,
    },
    { refresh },
  ];
};
