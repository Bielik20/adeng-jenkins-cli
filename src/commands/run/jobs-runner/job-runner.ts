import chalk from 'chalk';
import * as MultiProgress from 'multi-progress';
import { Observable } from 'rxjs';
import { last, map, tap } from 'rxjs/operators';

import {
  getJobProgressEstimatedRemainingTime,
  getJobProgressPercentage,
  isJobDone,
  isJobProgress,
  JenkinsRxJs,
  JobDone,
  JobResponse,
} from '../../../jenkins-rxjs';
import { millisecondsToDisplay } from '../../../utils/milliseconds-to-display';
import { JobBuildDescriber } from '../jobs-builder';

export class JobRunner {
  constructor(private jenkins: JenkinsRxJs, private multi: MultiProgress) {}

  run(build: JobBuildDescriber): Promise<JobDone> {
    const stream$: Observable<JobResponse> = this.jenkins
      .job(build.opts)
      .pipe(tap((response: JobResponse) => this.display(response, build)));

    return (stream$.pipe(last()) as Observable<JobDone>).toPromise();
  }

  private display(response: JobResponse, build: JobBuildDescriber) {
    const bar = this.multi.newBar(`${build.displayName} [:bar] :percent :remaining (:text)`, {
      complete: chalk.green('='),
      incomplete: ' ',
      width: 30,
      total: 100,
    });

    if (isJobProgress(response)) {
      bar.update(getJobProgressPercentage(response), {
        text: response.text,
        remaining: millisecondsToDisplay(getJobProgressEstimatedRemainingTime(response)),
      });
    } else if (isJobDone(response)) {
      if (response.status === 'SUCCESS') {
        bar.update(1, {
          text: chalk.green('Completed'),
          remaining: '',
        });
      } else {
        bar.update(1, {
          text: chalk.red('Failed'),
          remaining: '',
        });
      }
    }
  }
}
