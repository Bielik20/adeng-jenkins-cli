import * as createJenkins from 'jenkins';
import { JenkinsPromisifiedAPI } from 'jenkins';
import { JenkinsRxJsQueue } from './jenkins-rxjs-queue';

export class JenkinsRxJs {
  private readonly jenkins: JenkinsPromisifiedAPI;
  queue: JenkinsRxJsQueue;

  constructor(baseUrl: string) {
    this.jenkins = createJenkins({ baseUrl, promisify: true });
    this.queue = new JenkinsRxJsQueue(this.jenkins);
  }
}
