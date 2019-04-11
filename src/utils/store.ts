import * as Configstore from 'configstore';
import { packageJson } from './package';
import { Sandbox } from './sandbox';

export class Store {
  private state = new Configstore(packageJson.name);

  get sandbox(): Sandbox {
    return this.state.get('sandbox');
  }

  set sandbox(input: Sandbox) {
    this.state.set('sandbox', input);
  }

  get username(): string {
    return this.state.get('username');
  }

  set username(input: string) {
    this.state.set('username', input);
  }

  get token(): string {
    return this.state.get('token');
  }

  set token(input: string) {
    this.state.set('token', input);
  }
}

export const store = new Store();
