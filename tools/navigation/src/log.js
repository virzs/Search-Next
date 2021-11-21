/*
 * @Author: Vir
 * @Date: 2021-11-21 15:10:25
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-21 16:08:51
 */

const { stdout } = require('single-line-log');
const colors = require('colors');

class Log {
  constructor() {
    this.write = process.stdout.write;
  }

  template(type, str) {
    let colorType = '';
    switch (type) {
      case 'SUCCESS':
        colorType = type['green'];
        break;
      case 'ERROR':
        colorType = type['red'];
      case 'WARNING':
        colorType = type['yellow'];
      case 'INFO':
        colorType = type['blue'];
      default:
        colorType = type;
        break;
    }
    return `[${colorType}] ${str}`;
  }

  info(str) {
    stdout(this.template('INFO', str));
  }

  error(str) {
    stdout(this.template('ERROR', str));
  }

  info(str) {
    stdout(this.template('INFO', str));
  }

  success(str) {
    stdout(this.template('SUCCESS', str));
  }
}

module.exports = Log;
