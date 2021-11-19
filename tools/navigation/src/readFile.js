/*
 * @Author: Vir
 * @Date: 2021-11-17 17:39:43
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-19 17:01:40
 */

const fs = require('fs');

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

module.exports = readFile;
