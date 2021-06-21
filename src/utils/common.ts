/*
 * @Author: Vir
 * @Date: 2021-03-29 11:36:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-18 16:45:13
 */

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
  const re = /^(((ht|f)tps?):\/\/)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
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

// 应用主题 has是否应用主题 theme主题名
export const setTheme = (
  has?: boolean,
  theme: string = 'theme-on-background',
) => {
  const body = document.getElementById('root');
  if (has && body) {
    body.className = theme;
  } else if (!has && body) {
    body.className = '';
  }
};
