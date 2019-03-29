import chalk from 'chalk';
import * as clear from 'clear';
import { textSync } from 'figlet';
import * as minimist from 'minimist';

export async function run() {
  clear();
  console.log(chalk.yellow(textSync('AdEng Jenkins', { horizontalLayout: 'full' })), '\n');

  const args = minimist(process.argv.slice(2));

  let cmd = args._[0] || 'run';

  if (args.version || args.v) {
    cmd = 'version';
  }

  if (args.help || args.h) {
    cmd = 'help';
  }

  switch (cmd) {
    case 'version':
      require('./commands/version').verion(args);
      break;

    case 'help':
      require('./commands/help').help(args);
      break;

    default:
      const { error } = require('./utils/error');
      error(`"${cmd}" is not a valid command!`, true);
  }
}
