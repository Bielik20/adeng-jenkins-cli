import chalk from 'chalk';
import * as clear from 'clear';
import { textSync } from 'figlet';

export async function run() {
  clear();
  console.log(chalk.yellow(textSync('AdEng Jenkins', { horizontalLayout: 'full' })));
}
