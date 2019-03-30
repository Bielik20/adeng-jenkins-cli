import * as inquirer from 'inquirer';
import { requiredInput } from '../../utils/question-helpers';
import { isSandbox, Sandbox, sandboxes } from '../../utils/sandbox';
import { store } from '../../utils/store';

export async function sandbox(input: string) {
  if (isSandbox(input)) {
    store.sandbox = input;
  } else {
    const result = await inquirer.prompt<{ sandbox: Sandbox }>(question);
    store.sandbox = result.sandbox;
  }
}

const question: inquirer.Question = {
  name: 'sandbox',
  type: 'list',
  message: 'Choose your default sandbox',
  validate: requiredInput,
  choices: sandboxes,
  default: store.sandbox,
};
