/*
 * @Author: Vir
 * @Date: 2021-11-16 13:57:51
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-17 17:44:02
 */
const { Command } = require('commander');
const exportFile = require('./src/export');

const program = new Command();

program
  .command('export')
  .alias('e')
  .description('将数据处理为分类格式')
  .action((options) => {
    exportFile();
  });

program.version('0.0.1', '-v, --version');
program.parse(process.argv);
