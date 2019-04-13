import { Observable } from 'rxjs';
import { last } from 'rxjs/operators';
import { JenkinsRxJs, JobDone, JobResponse } from '../jenkins-rxjs';
import { JobDescriber } from './models';
import { UiManager } from './ui-manager';

export class JobRunner {
  constructor(private jenkins: JenkinsRxJs) {}

  run(jobDescriber: JobDescriber, uiManager: UiManager): Observable<JobDone> {
    const stream$: Observable<JobResponse> = uiManager.createDisplayStream(
      jobDescriber,
      this.jenkins.job(jobDescriber.opts),
    );

    return stream$.pipe(last()) as Observable<JobDone>;
  }
}
