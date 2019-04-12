import chalk from 'chalk';
import * as MultiProgress from 'multi-progress';
import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable } from 'rxjs';
import { last, map, takeUntil } from 'rxjs/operators';
import {
  getJobProgressEstimatedRemainingTime,
  getJobProgressPercentage,
  isJobDone,
  isJobProgress,
  JenkinsRxJs,
  JobDone,
  JobResponse,
} from '../../../jenkins-rxjs';
import { processInterrupt$ } from '../../../jenkins-rxjs/utils';
import { millisecondsToDisplay } from '../../../utils/milliseconds-to-display';
import { JobBuildDescriber } from '../jobs-builder';

export class JobRunner {
  constructor(private jenkins: JenkinsRxJs, private multi: MultiProgress) {}

  run(build: JobBuildDescriber): Promise<JobDone> {
    const stream$: Observable<JobResponse> = this.jenkins.job(build.opts);
    const end$: Observable<JobDone> = stream$.pipe(last()) as Observable<JobDone>;

    this.display(build, stream$);

    return end$.toPromise();
  }

  private display(build: JobBuildDescriber, stream$: Observable<JobResponse>): void {
    const bar: ProgressBar = this.createBar(build);

    const subscription = combineLatest(stream$, interval(1000))
      .pipe(
        map(([response]) => response),
        takeUntil(processInterrupt$),
      )
      .subscribe((response: JobResponse) => {
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

          bar.terminate();
          subscription.unsubscribe();
        }
      });
  }

  private createBar(build: JobBuildDescriber): ProgressBar {
    return this.multi.newBar(`${build.displayName} [:bar] :percent :remaining (:text)`, {
      complete: chalk.green('='),
      incomplete: ' ',
      width: 50 - build.displayName.length,
      total: 100,
    });
  }
}
