import chalk from 'chalk';
import * as clear from 'clear';
import * as program from 'commander';
import { textSync } from 'figlet';
import { run } from './commands/run';
import { list } from './utils/list';

const { version, description } = require('../package.json');

export async function start() {
  clear();
  console.log(chalk.yellow(textSync('AdEng Jenkins', { horizontalLayout: 'full' })), '\n');

  program.version(version).description(description);
  program
    .description('Run Jenkins jobs')
    .command('run')
    .alias('r')
    .option('-j, --jobs <items>', 'Jenkins jobs to run', list, [])
    .option('-p, --projects <items>', 'Project to include', list, [])
    .option('-e, --extended', 'Whether to show extended options', false)
    .action(({ jobs, projects, extended }) => {
      run(jobs, projects, extended);
    });

  if (process.argv.length === 2) {
    process.argv.push('-h');
  }

  program.parse(process.argv);
}
