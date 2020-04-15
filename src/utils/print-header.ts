import chalk from 'chalk';
import * as clear from 'clear';
import { textSync } from 'figlet';
import { packageJson } from './package';

export function printHeader(): void {
  clear();

  if (packageJson.version === '0.0.0-development') {
    console.log(chalk.red(textSync('AdEng Jenkins', { horizontalLayout: 'full' })));
    console.log(chalk.red('You are in dev mode!', '\n'));
  } else {
    console.log(chalk.yellow(textSync('AdEng Jenkins', { horizontalLayout: 'full' })), '\n');
  }
}
