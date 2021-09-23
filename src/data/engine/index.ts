/*
 * @Author: Vir
 * @Date: 2021-03-18 16:26:35
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-23 22:33:03
 */

export interface SearchEngineValueTypes {
  id: string; // id
  name: string; // 搜索引擎名称
  value: string; // 搜索引擎值
  href: string; // 搜索引擎链接
  sugurl?: string; // 搜索引擎热词链接
  icon: string; // 搜索引擎图标
  isShow: boolean; // 是否显示
  selected: boolean; // 是否选中
}

export default [
  {
    id: '4de5457415f1429ea318f8b112a59a6c',
    name: '谷歌',
    value: 'google',
    href: 'https://www.google.com/search?q=',
    sugurl:
      'https://suggestqueries.google.com/complete/search?client=youtube&q=#content#&jsonp=window.google.ac.h',
    icon: './img/engineLogo/google.ico',
    isShow: true,
    selected: false,
  },
  {
    id: '3176606942b5445a913c099aeac9ddb0',
    name: '必应',
    value: 'bing',
    href: 'https://cn.bing.com/search?q=',
    sugurl:
      'https://api.bing.com/qsonhs.aspx?type=cb&q=#content#&cb=window.bing.sug',
    icon: './img/engineLogo/bing.ico',
    isShow: true,
    selected: true,
  },
  {
    id: '755551cec9054314a50e74ac9130c34b',
    name: '百度',
    value: 'baidu',
    href: 'https://www.baidu.com/s?wd=',
    sugurl: 'https://suggestion.baidu.com/su?wd=#content#&cb=window.baidu.sug',
    icon: './img/engineLogo/baidu.svg',
    isShow: true,
    selected: false,
  },
  {
    id: 'e9275210f149443b9d554a59861887c8',
    name: '搜狗',
    value: 'sougou',
    href: 'https://www.sogou.com/web?query=',
    sugurl: 'https://www.sogou.com/suggnew/ajajjson?type=web&key=#content#',
    icon: './img/engineLogo/sougou.ico',
    isShow: true,
    selected: false,
  },
  {
    id: 'ee4b853b01cd4c9bb3fdcb814c13b298',
    name: '好搜',
    value: '好搜',
    href: 'https://www.so.com/s?ie=utf-8&fr=hao_360so&src=home_hao_360so&q=',
    sugurl:
      'https://sug.so.360.cn/suggest?encodein=utf-8&encodeout=utf-8&format=json&word=#content#&callback=window.so.sug',
    icon: './img/engineLogo/so360.ico',
    isShow: true,
    selected: false,
  },
  {
    id: 'db34d1185cdf42339f17dd34f25b897b',
    name: 'Magi',
    value: 'magi',
    href: 'https://magi.com/search?q=',
    sugurl:
      'https://magi.com/suggest?size=8&q=#content#&callback=window.magi.sug',
    icon: './img/engineLogo/magi.png',
    isShow: true,
    selected: false,
  },
  {
    id: 'ace54031b5bb4b4693e4ffc4cc304199',
    name: '夸克',
    value: 'quark',
    href: 'https://quark.sm.cn/s?q=',
    sugurl:
      'https://quark.sm.cn/api/quark_sug?q=#content#&callback=window.quark.sug',
    icon: './img/engineLogo/quark.ico',
    isShow: true,
    selected: false,
  },
] as SearchEngineValueTypes[];
