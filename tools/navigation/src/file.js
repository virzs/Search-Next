/*
 * @Author: Vir
 * @Date: 2021-11-17 17:39:43
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-07 11:49:31
 */

const fs = require('fs');
const exec = require('child_process').execSync;
const prettier = require('prettier');
const Log = require('./log');

const log = new Log();

const readFile = (path) => {
  try {
    log.info(`正在读取文件 ${path}`);
    const data = fs.readFileSync(path, 'utf8');
    log.success(`文件读取成功 ${path}`);
    return data;
  } catch (err) {
    console.error(err);
  }
};

const copyFile = (path, outPath) => {
  try {
    log.info(`正在复制文件 ${path}`);
    const source = readFile(path);
    if (source) {
      fs.writeFileSync(outPath, source);
      log.success(`文件复制成功 ${path} --> ${outPath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
  }
};

const tsToJs = (path) => {
  const result = exec(`tsc ${path} --removeComments --skipLibCheck`, (err) => {
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
