/*
 * @Author: Vir
 * @Date: 2021-03-29 11:36:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-29 15:05:46
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
