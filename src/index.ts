import chalk from 'chalk';
import * as clear from 'clear';
import * as program from 'commander';
import { textSync } from 'figlet';
import { login } from './commands/login';
import { run } from './commands/run';
import { sandbox } from './commands/sandbox';
import { checkVersion } from './utils/check-version';
import { list } from './utils/list';
import { packageJson } from './utils/package';

export async function start() {
  clear();
  console.log(chalk.yellow(textSync('AdEng Jenkins', { horizontalLayout: 'full' })), '\n');
  checkVersion();

  program.version(packageJson.version).description(packageJson.description);
  program
    .command('run')
    .alias('r')
    .description('Run Jenkins jobs')
    .option('-j, --jobs <items>', 'Jenkins jobs to run', list, [])
    .option('-p, --projects <items>', 'Project to include', list, [])
    .option('-e, --extended', 'Whether to show extended options', false)
    .action(({ jobs, projects, extended }) => run(jobs, projects, extended));
  program
    .command('sandbox')
    .alias('s')
    .description('Choose your default sandbox')
    .option('name', 'Name of the sandbox')
    .action(input => sandbox(input));
  program
    .command('login')
    .alias('l')
    .description('Login to Jenkins')
    .action(() => login());

  if (process.argv.length === 2) {
    process.argv.push('-h');
  }

  program.parse(process.argv);
}
