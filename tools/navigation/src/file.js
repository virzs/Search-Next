/*
 * @Author: Vir
 * @Date: 2021-11-17 17:39:43
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-20 22:54:59
 */

const fs = require('fs');
const exec = require('child_process').exec;

const readFile = (path) => {
  try {
    console.info('正在读取文件');
    const data = fs.readFileSync(path, 'utf8');
    console.info('文件读取成功');
    return data;
  } catch (err) {
    console.error(err);
  }
};

const copyFile = (path, outPath) => {
  try {
    console.log('正在复制文件');
    const source = readFile(path);
    if (source) {
      fs.writeFileSync(outPath, source);
      console.log('文件复制成功');
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
  }
};

const tsToJs = async (path) => {
  const result = await exec(`tsc ${path} --removeComments`, (err) => {
    return err ? err : true;
  });
  return result;
};

module.exports = { readFile, copyFile, tsToJs };
