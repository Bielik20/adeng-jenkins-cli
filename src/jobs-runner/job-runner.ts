import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { last, map, takeUntil } from 'rxjs/operators';
import { isJobDone, JenkinsRxJs, JobDone, JobResponse } from '../jenkins-rxjs';
import { processInterrupt$ } from '../jenkins-rxjs/utils';
import { JobDescriber } from './models';
import { UiManager } from './ui-manager';

export class JobRunner {
  constructor(private jenkins: JenkinsRxJs) {}

  run(jobDescriber: JobDescriber, uiManager: UiManager): Promise<JobDone> {
    const stream$: Observable<JobResponse> = this.createDisplayStream(
      jobDescriber,
      this.jenkins.job(jobDescriber.opts),
      uiManager,
    );
    const end$: Observable<JobDone> = stream$.pipe(last()) as Observable<JobDone>;

    return end$.toPromise();
  }

  private createDisplayStream(
    jobDescriber: JobDescriber,
    stream$: Observable<JobResponse>,
    uiManager: UiManager,
  ): Observable<JobResponse> {
    const bar: ProgressBar = uiManager.createBar(jobDescriber);
    const end$ = new Subject();

    return combineLatest(stream$, interval(1000)).pipe(
      map(([response]: [JobResponse, number]) => response),
      takeUntil(processInterrupt$),
      takeUntil(end$.pipe(takeUntil(processInterrupt$))),
      tap((response: JobResponse) => {
        uiManager.updateBar(bar, response);
        if (isJobDone(response)) {
          end$.next();
          end$.complete();
        }
      }),
    );
  }
}
