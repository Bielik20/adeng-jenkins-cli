import * as inquirer from 'inquirer';
import { isSandbox, Sandbox, sandboxes } from '../../utils/sandbox';
import { store } from '../../utils/store';
import { requiredInput } from '../run/questions/question-helpers';

export async function sandbox(input: string) {
  if (isSandbox(input)) {
    store.sandbox = input;
  } else {
    const result = await inquirer.prompt<{ sandbox: Sandbox }>(question);
    store.sandbox = result.sandbox;
    console.log('');
  }
}

const question: inquirer.Question = {
  name: 'sandbox',
  type: 'list',
  message: 'Choose your default sandbox',
  validate: requiredInput,
  choices: sandboxes,
  pageSize: sandboxes.length,
  default: store.sandbox,
};
