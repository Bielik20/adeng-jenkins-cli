import chalk from 'chalk';
import * as MultiProgress from 'multi-progress';
import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
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
  private multi = new MultiProgress(process.stderr);

  constructor(private jenkins: JenkinsRxJs) {}

  run(build: JobBuildDescriber): Promise<JobDone> {
    const stream$: Observable<JobResponse> = this.display(build, this.jenkins.job(build.opts));
    const end$: Observable<JobDone> = stream$.pipe(last()) as Observable<JobDone>;

    return end$.toPromise();
  }

  private display(
    build: JobBuildDescriber,
    stream$: Observable<JobResponse>,
  ): Observable<JobResponse> {
    const bar: ProgressBar = this.createBar(build);
    const end$ = new Subject();

    return combineLatest(stream$, interval(1000)).pipe(
      map(([response]: [JobResponse, number]) => response),
      takeUntil(processInterrupt$),
      takeUntil(end$.pipe(takeUntil(processInterrupt$))),
      tap((response: JobResponse) => {
        if (isJobProgress(response)) {
          bar.update(getJobProgressPercentage(response), {
            text: response.text,
            remaining: millisecondsToDisplay(getJobProgressEstimatedRemainingTime(response)),
          });
        } else if (isJobDone(response)) {
          const text: string =
            response.status === 'SUCCESS' ? chalk.green('Completed') : chalk.red('Failed');

          bar.update(1, {
            text,
            remaining: '',
          });
          bar.terminate();

          end$.next();
          end$.complete();
        }
      }),
    );
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
