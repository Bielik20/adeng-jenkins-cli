import * as createJenkins from 'jenkins';
import { JenkinsPromisifiedAPI } from 'jenkins';
import { JenkinsRxJs } from 'jenkins-rxjs';
import { ensureAuthenticated } from '../commands/login';
import { store } from './store';

export abstract class Jenkins {
  private static promisified: JenkinsPromisifiedAPI;
  private static rxjs: JenkinsRxJs;

  static async getJenkinsPromisified(): Promise<JenkinsPromisifiedAPI> {
    if (!Jenkins.promisified) {
      await ensureAuthenticated();
      Jenkins.promisified = createJenkins({
        baseUrl: `http://${store.username}:${store.token}@jenkins.wikia-prod:8080`,
        promisify: true,
      });
    }

    return Jenkins.promisified;
  }

  static async getJenkinsRxJs() {
    if (!Jenkins.rxjs) {
      const jenkinsPromise = await Jenkins.getJenkinsPromisified();

      Jenkins.rxjs = new JenkinsRxJs(jenkinsPromise);
    }

    return Jenkins.rxjs;
  }
}
