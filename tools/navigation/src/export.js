/*
 * @Author: Vir
 * @Date: 2021-11-17 17:41:30
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-20 22:58:04
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
const { readFile, copyFile, tsToJs } = require('./file');
const { writeFileSync } = require('fs');
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
  } else {
    console.error('执行失败');
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
  const filePath = allDataPath;
  const data = readFile(filePath);
  const classify = readFile(classifyDataPath);
  if (data && classify) {
    const jsonData = JSON.parse(data);
    const jsonClassify = JSON.parse(classify);
    const all = formatData(jsonClassify, jsonData);
    const strWriteData = `import {Classify} from "./types/classify";const navigationData: Classify[] = ${JSON.stringify(
      all,
    )};export default navigationData;`;
    writeFileSync(exportPath, strWriteData, 'utf8');
    console.log('导出成功');
  }
};

module.exports = { exportFile, copyAndSwitchFile };
