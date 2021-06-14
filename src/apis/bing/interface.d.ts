/*
 * @Author: Vir
 * @Date: 2021-06-11 23:54:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-11 23:56:06
 */

export interface BingImgListType {
  images: BingImage[];
  tooltips: Tooltips;
}

export interface BingImage {
  startdate: string;
  fullstartdate: string;
  enddate: string;
  url: string;
  urlbase: string;
  copyright: string;
  copyrightlink: string;
  title: string;
  quiz: string;
  wp: boolean;
  hsh: string;
  drk: number;
  top: number;
  bot: number;
  hs: any[];
}

export interface Tooltips {
  loading: string;
  previous: string;
  next: string;
  walle: string;
  walls: string;
}
