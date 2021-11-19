/*
 * @Author: Vir
 * @Date: 2021-11-17 17:41:30
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-19 17:41:23
 */
const { allDataPath, classifyDataPath, exportPath } = require('../config');
const readFile = require('./readFile');
const { writeFileSync } = require('fs');

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

module.exports = exportFile;
