/*
 * @Author: Vir
 * @Date: 2021-11-17 17:41:30
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-21 00:49:27
 */
const {
  allDataPath,
  classifyDataPath,
  exportPath,
  classifyDataOutPath,
  allDataOutPath,
  typesPath,
  typesOutPath,
  interfacePath,
  interfaceOutPath,
} = require('../config');
const {
  readFile,
  copyFile,
  tsToJs,
  templete,
  prettierFile,
} = require('./file');
const { writeFileSync, unlinkSync } = require('fs');
const exec = require('child_process').exec;

const copyAndSwitchFile = () => {
  const classify = copyFile(classifyDataPath, classifyDataOutPath);
  const all = copyFile(allDataPath, allDataOutPath);
  const types = copyFile(typesPath, typesOutPath);
  const interface = copyFile(interfacePath, interfaceOutPath);

  if (classify && all && types && interface) {
    const classifyRes = tsToJs(classifyDataOutPath);
    const allRes = tsToJs(allDataOutPath);
    if (classifyRes) console.log('classify 转换成功');
    if (allRes) console.log('all 转换成功');
    return true;
  } else {
    console.error('执行失败');
    return false;
  }
};

const formatData = (classify = [], website = []) => {
  return classify.map((i) => {
    if (i.subClassify) {
      return { ...i, subClassify: formatData(i.subClassify, website) };
    } else {
      const { children, ...rest } = i;
      return {
        ...rest,
        children:
          children !== undefined
            ? children.filter((j) => j.classify.includes(i.path))
            : website.filter((j) => j.classify.includes(i.path)),
      };
    }
  });
};

const exportFile = () => {
  const res = copyAndSwitchFile();
  if (!res) return;
  const data = require('./source/all');
  const classify = require('./source/classify');
  if (data && classify) {
    const all = formatData(classify.default, data.default);
    const strWriteData = templete(all);
    const pre = prettierFile(strWriteData);
    if (pre) {
      writeFileSync('./outFile.ts', pre, 'utf8');
      copyFile('./outFile.ts', exportPath);
      unlinkSync('./outFile.ts');
      console.log(`导出成功 ${exportPath}`);
    } else {
      console.error('导出失败');
    }
  }
};

module.exports = { exportFile, copyAndSwitchFile };
