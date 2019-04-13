import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
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
} from '../jenkins-rxjs';
import { processInterrupt$ } from '../jenkins-rxjs/utils';
import { millisecondsToDisplay } from '../utils/milliseconds-to-display';
import { JobDescriber } from './models';
import { UiManager } from './ui-manager';

export class JobRunner {
  constructor(private jenkins: JenkinsRxJs) {}

  run(build: JobDescriber, uiManager: UiManager): Promise<JobDone> {
    const stream$: Observable<JobResponse> = this.display(
      build,
      this.jenkins.job(build.opts),
      uiManager,
    );
    const end$: Observable<JobDone> = stream$.pipe(last()) as Observable<JobDone>;

    return end$.toPromise();
  }

  private display(
    build: JobDescriber,
    stream$: Observable<JobResponse>,
    uiManager: UiManager,
  ): Observable<JobResponse> {
    const bar: ProgressBar = this.createBar(build, uiManager);
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
          if (response.status === 'SUCCESS') {
            bar.update(1, {
              text: `${logSymbols.success} Completed`,
              remaining: '',
            });
          } else {
            bar.update(1, {
              text: `${logSymbols.error} Failed`,
              remaining: '',
            });
          }

          bar.terminate();
          end$.next();
          end$.complete();
        }
      }),
    );
  }

  private createBar(build: JobDescriber, multi: MultiProgress): ProgressBar {
    return multi.newBar(`${build.displayName} [:bar] :percent :remaining (:text)`, {
      complete: chalk.green('='),
      incomplete: ' ',
      width: 50 - build.displayName.length,
      total: 100,
    });
  }
}
