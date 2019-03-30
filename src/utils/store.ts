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
}

export const store = new Store();
