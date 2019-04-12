import { JenkinsPromisifiedAPI } from 'jenkins';
import * as createJenkins from 'jenkins';
import { ensureAuthenticated } from '../commands/login';
import { JenkinsRxJs } from '../jenkins-rxjs';
import { store } from './store';

export class Jenkins {
  private static promisified: JenkinsPromisifiedAPI;
  private static rxjs: JenkinsRxJs;

  static async getJenkinsPromisified(): Promise<JenkinsPromisifiedAPI> {
    if (!this.promisified) {
      await ensureAuthenticated();
      this.promisified = createJenkins({
        baseUrl: `http://${store.username}:${store.token}@jenkins.wikia-prod:8080`,
        promisify: true,
      });
    }

    return this.promisified;
  }

  static async getJenkinsRxJs() {
    if (!this.rxjs) {
      const jenkinsPromise = await Jenkins.getJenkinsPromisified();

      this.rxjs = new JenkinsRxJs(jenkinsPromise);
    }

    return this.rxjs;
  }
}
