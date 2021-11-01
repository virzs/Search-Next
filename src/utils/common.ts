/*
 * @Author: Vir
 * @Date: 2021-03-29 11:36:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-01 22:34:09
 */

import { gitemoji, GitEmoji } from '@/data/github/gitemoji';
import { isEmoji } from './regexp';

export type githubCommitTypes =
  | 'feat' // 提交新功能
  | 'fix' // 修复Bug
  | 'docs' // 文档调整
  | 'style' // 调整代码格式，未修改代码逻辑（比如修改空格、格式化、缺少分号等）
  | 'refactor' // 代码重构，既没修复bug也没有添加新功能
  | 'pref' // 性能优化，提高性能的代码更改
  | 'test' // 添加或修改代码测试
  | 'chore' // 对构建流程或辅助工具和依赖库（如文档生成等）的更改
  | 'unknown'; // 未知类型，一般指未按以上规范提交的代码

export interface getGithubCommitTypeReturnTypes {
  type: string; // commit类型
  desc: string; // commit说明
}

// 处理获取github commit信息，优化显示效果
export const getGithubCommitType = (
  commit: string,
): getGithubCommitTypeReturnTypes => {
  const typesWithDesc = new Map([
    ['feat', '新增'],
    ['fix', '修复'],
    ['docs', '文档调整'],
    ['style', '格式更改'],
    ['refactor', '重构'],
    ['pref', '性能优化'],
    ['test', '测试'],
    ['chore', '更改'],
    ['unknown', '未知'],
  ]);
  const types = [...typesWithDesc.keys()];
  let typeInCommit = '';
  types.forEach((i) => {
    if (commit.includes(i)) typeInCommit = i;
  });
  let desc = typesWithDesc.get(typeInCommit);
  let message = commit.replace(`${typeInCommit}`, '').trim();
  let result = {
    type: typeInCommit ? typeInCommit : 'unknown',
    desc: desc ? desc : '未知',
    message,
  };
  return result;
};

// 根据commit状态获取对应的颜色
export const gitCommitColorByType = (type: githubCommitTypes) => {
  const typesWithColor = new Map([
    ['feat', '#bddd22'],
    ['fix', '#41C466'],
    ['docs', '#3A69ED'],
    ['style', '#FEC22E'],
    ['refactor', '#FC4545'],
    ['pref', '#64687F'],
    ['test', '#E2E0DE'],
    ['chore', '#44cef6'],
  ]);
  return typesWithColor.get(type);
};

// 生成随机id
export const getId = (length: number) => {
  return Number(
    Math.random().toString().substr(3, length) + Date.now(),
  ).toString(36);
};
//生成uuid
export const getUuid = () => {
  let s: any = [];
  let hexDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  let uuid = s.join('');
  return uuid;
};

// 检查网址是否包含https或http
export const checkUrlWithHttpsOrHttp = (url: string) => {
  const re =
    /^(((ht|f)tps?):\/\/)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  return re.test(url);
};

// 网址存在https或http替换
export const replaceUrlHaveHttpsOrHttpToEmpty = (url: string): string => {
  const reg = /^((ht|f)tps?:\/\/)/;
  return url.replace(reg, '');
};

// 网址不存在https或http替换
export const replaceUrlNotHaveHttpsOrHttpToHttps = (url: string): string => {
  const reg = /^((ht|f)tps?:\/\/)/;
  const res = reg.test(url);
  return res ? url : `https://${url}`;
};

// 获取本地存储中占用的容量
export const storageSize = () => {
  let size = 0;
  for (let i in localStorage) {
    const item = localStorage.getItem(i);
    size += item ? item.length : 0;
  }
  return size;
};

// 转换 字节 kb mb gb
export const formatSize = (limit: number) => {
  var size = '';
  if (limit < 0.1 * 1024) {
    //小于0.1KB，则转化成B
    size = limit.toFixed(2) + 'B';
  } else if (limit < 0.1 * 1024 * 1024) {
    //小于0.1MB，则转化成KB
    size = (limit / 1024).toFixed(2) + 'KB';
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    //小于0.1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + 'MB';
  } else {
    //其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }

  var sizeStr = size + ''; //转成字符串
  var index = sizeStr.indexOf('.'); //获取小数点处的索引
  var dou = sizeStr.substr(index + 1, 2); //获取小数点后两位的值
  if (dou == '00') {
    //判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
};

//判断数据类型
export const getObjType = (obj: any) => {
  const toString = Object.prototype.toString;
  const map: { [x: string]: string } = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
};

//数组深拷贝
export const deepCopy = (data: any): any => {
  let type = getObjType(data);
  let obj: any;
  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    //不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (let i = 0, len = data.length; i < len; i++) {
      obj[i] = deepCopy(data[i]);
    }
  } else if (type === 'object') {
    for (let key in data) {
      obj[key] = deepCopy(data[key]);
    }
  }
  return obj;
};

//递归处理数据
//data 数据源 option key&value格式字段替换配置
export const loop = (data: any[], option: object = {}): any[] => {
  let keys = Object.keys(option); //获取option keys
  let values = Object.values(option); //获取option values
  return data.map((item: any) => {
    keys.forEach((key: string, index: number) => {
      item[key] = item[values[index]];
    });
    return item.children && item.children.length > 0
      ? { ...item, children: loop(item.children, option) }
      : item;
  });
};

// 获取页面比例
export const getScale = (): [number, number] => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const gcd = (x: number, y: number): number => {
    if (x % y == 0) return y;
    return gcd(y, x % y);
  };

  const n = gcd(width, height);

  return [width / n, height / n];
};

// 快速生成 type 用于数据更改时更新 ts 类型
export const getTypeStr = (key: keyof GitEmoji) => {
  let arr: string[] = [];
  gitemoji.forEach((i) => {
    arr.push(`'${i[key]}'`);
  });
  return arr.join('|');
};

// 将 emoji 简码替换成 emoji
export const formatText = (text: string) => {
  const match = isEmoji.match(text);
  match?.forEach((i) => {
    const emoji = gitemoji.find((j) => j.code === i)?.emoji;
    text = emoji ? text.replace(i, emoji) : text;
  });
  return text;
};

// 生成文件并下载
export const exportFile = (file: any, fileName: string) => {
  let link = document.createElement('a');
  let blob = new Blob([file]);

  link.download = fileName;
  link.style.display = 'none';
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
