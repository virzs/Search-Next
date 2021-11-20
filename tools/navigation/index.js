/*
 * @Author: Vir
 * @Date: 2021-11-16 13:57:51
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-20 22:57:46
 */
const { Command } = require('commander');
const { exportFile, copyAndSwitchFile } = require('./src/export');

const program = new Command();

program
  .command('export')
  .alias('e')
  .description('将数据处理为分类格式')
  .action((options) => {
    exportFile();
  });

program
  .command('copy')
  .alias('c')
  .description('将数据处理为分类格式')
  .action((options) => {
    copyAndSwitchFile();
  });

program.version('0.0.1', '-v, --version');
program.parse(process.argv);
