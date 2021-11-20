/*
 * @Author: Vir
 * @Date: 2021-11-17 17:39:43
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-21 00:48:42
 */

const fs = require('fs');
const exec = require('child_process').execSync;
const prettier = require('prettier');

const readFile = (path) => {
  try {
    console.info(`正在读取文件 ${path}`);
    const data = fs.readFileSync(path, 'utf8');
    console.info(`文件读取成功 ${path}`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

const copyFile = (path, outPath) => {
  try {
    console.log(`正在复制文件 ${path}`);
    const source = readFile(path);
    if (source) {
      fs.writeFileSync(outPath, source);
      console.log(`文件复制成功 ${path} --> ${outPath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
  }
};

const tsToJs = (path) => {
  const result = exec(`tsc ${path} --removeComments`, (err) => {
    return err ? err : true;
  });
  return result;
};

const templete = (data) => {
  return `
  import {Classify} from "./interface";
  const navigationData: Classify[] = ${JSON.stringify(data)};
  export default navigationData;`;
};

const prettierFile = (data) => {
  const result = prettier.format(data, { parser: 'babel' });
  return result;
};

module.exports = { readFile, copyFile, tsToJs, templete, prettierFile };
