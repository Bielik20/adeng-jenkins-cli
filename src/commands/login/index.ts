import * as ansiEscapes from 'ansi-escapes';
import * as inquirer from 'inquirer';
import { store } from '../../utils/store';
import { requiredInput } from '../run/questions/question-helpers';

export async function login() {
  const { username, token } = await inquirer.prompt<{ username: string; token: string }>(questions);
  store.username = username;
  store.token = token;
  console.log('');
}

export function isAuthenticated(): boolean {
  return !!store.username && !!store.token;
}

export async function ensureAuthenticated(): Promise<void> {
  if (isAuthenticated()) {
    return;
  }

  console.log('You need to login first');
  await login();
}

const questions: inquirer.Questions = [
  {
    name: 'username',
    message: 'Your Jenkins user name',
    validate: requiredInput,
    default: store.username,
  },
  {
    name: 'token',
    message: `Your Jenkins API token (${ansiEscapes.link(
      'help',
      'https://stackoverflow.com/questions/45466090/how-to-get-the-api-token-for-jenkins',
    )})`,
    validate: requiredInput,
    default: store.token,
  },
];
