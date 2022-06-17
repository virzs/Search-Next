/*
 * @Author: Vir
 * @Date: 2022-06-09 11:08:34
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-15 17:43:07
 */

import {
  BackgroundType,
  getBackgroundApi,
  setBackgroundApi,
  UseBackgroundData,
  UseBackgroundTypeBingData,
  UseBackgroundTypeBingEverydayData,
  UseBackgroundTypeColorData,
  UseBackgroundTypeLinkData,
  UseBackgroundTypePicsumData,
} from '@/apis/setting/background';
import { useEffect, useState } from 'react';

// ! onChange 修改时不需要传每个类型得 history 参数
export interface UseBackgroundActionOnChangeParams {
  type?: BackgroundType;
  color?: UseBackgroundTypeColorData['data'];
  bing?: UseBackgroundTypeBingData['data'];
  picsum?: UseBackgroundTypePicsumData['data'];
  bing_everyday?: UseBackgroundTypeBingEverydayData['data'];
  link?: UseBackgroundTypeLinkData['data'];
}

export interface UseBackgroundAction {
  onChange: (data: UseBackgroundActionOnChangeParams) => void;
}

export type UseBackgroundResult = [UseBackgroundData, UseBackgroundAction];

const useBackground = (): UseBackgroundResult => {
  const [init, setInit] = useState(false);
  const userId = localStorage.getItem('account');
  const [type, setType] = useState<BackgroundType>('color');
  const [color, setColor] = useState<UseBackgroundTypeColorData>();
  const [bing, setBing] = useState<UseBackgroundTypeBingData>();
  const [picsum, setPicsum] = useState<UseBackgroundTypePicsumData>();
  const [bing_everyday, setBingEveryday] =
    useState<UseBackgroundTypeBingEverydayData>();
  const [link, setLink] = useState<UseBackgroundTypeLinkData>();

  const updateData = <T, K>(value: T, data: K) => {
    if (!value) return data ?? {};
    const { data: oldData, history = [] } = data ?? ({} as any);
    const inHistory = history.find((item: any) => item.id === value.id);
    const newHistory = inHistory
      ? [...history.filter((item: any) => item.id !== value.id), oldData]
      : [...history, oldData];
    const newData = {
      data: value,
      history: newHistory.filter((i: any) => i !== undefined).slice(-5),
    };
    console.log(newData);
    return newData;
  };

  const onChange = (data: UseBackgroundActionOnChangeParams) => {
    const _type = data.type || type;
    let _value;
    let _data;
    setType(_type);
    switch (_type) {
      case 'color':
        _value = data.color;
        _data = color;
        setColor(updateData(_value, _data));
        break;
      case 'bing':
        _value = data.bing;
        _data = bing;
        setBing(updateData(_value, _data));
        break;
      case 'picsum':
        _value = data.picsum;
        _data = picsum;
        setPicsum(updateData(_value, _data));
        break;
      case 'bing_everyday':
        _value = data.bing_everyday;
        _data = bing_everyday;
        setBingEveryday(updateData(_value, _data));
        break;
      case 'link':
        _value = data.link;
        _data = link;
        setLink(updateData(_value, _data));
        break;
    }
  };

  useEffect(() => {
    if (!init) return;
    setBackgroundApi(userId ?? '', {
      type,
      color,
      bing,
      picsum,
      bing_everyday,
      link,
    });
  }, [type, color, bing, picsum, bing_everyday, link]);

  useEffect(() => {
    if (init) return;
    const localData = getBackgroundApi(userId ?? '');
    if (localData) {
      setType(localData.type);
      setColor(localData.color);
      setBing(localData.bing);
      setPicsum(localData.picsum);
      setBingEveryday(localData.bing_everyday);
      setLink(localData.link);
      setInit(true);
    }
  }, []);

  return [
    { type, color, bing, picsum, bing_everyday, link },
    {
      onChange,
    },
  ];
};

export default useBackground;
