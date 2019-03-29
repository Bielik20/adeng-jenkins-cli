import chalk from 'chalk';
import * as clear from 'clear';
import * as commander from 'commander';
import { textSync } from 'figlet';

const { version, description } = require('../package.json');

export async function run() {
  clear();
  console.log(chalk.yellow(textSync('AdEng Jenkins', { horizontalLayout: 'full' })), '\n');

  commander.version(version).description(description);
  commander
    .command('run')
    .alias('r')
    .description('Run Jenkins jobs')
    .action(() => {
      console.log('run');
    });

  if (process.argv.length === 2) {
    process.argv.push('-h');
  }

  commander.parse(process.argv);
}
