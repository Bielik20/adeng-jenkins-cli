import { JenkinsPromisifiedAPI, JobBuildOptions } from 'jenkins';
import { from, Observable, of } from 'rxjs';
import { catchError, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Subscriber } from 'rxjs/src/internal/Subscriber';
import {
  getJobProgressEstimatedRemainingTime,
  isJobDone,
  JobDone,
  JobProgress,
  JobResponse,
  jobResponseFromBuild,
  jobResponseFromQueue,
} from '../models';
import { delay, processInterrupt$ } from '../utils';

// TODO: Add delay retry to jenkins calls (test with VPN off/interrupted)
export class JenkinsRxJs {
  constructor(private readonly jenkins: JenkinsPromisifiedAPI) {}

  run(opts: JobBuildOptions): Observable<JobResponse> {
    return this.job(opts).pipe(
      switchMap((queueNumber: number) =>
        this.queue(queueNumber).pipe(
          switchMap((response: JobResponse) => {
            if (isJobDone(response) && response.status === 'SUCCESS') {
              return this.build(response.name, response.id);
            }

            return of(response);
          }),
        ),
      ),
      // TODO: Add better info about error here (test with VPN off/interrupted)
      catchError(e => of(this.getErrorJobResponse({} as any, e))),
    );
  }

  private job(opts: JobBuildOptions): Observable<number> {
    return from(this.jenkins.job.build(opts));
  }

  private queue(queueNumber: number): Observable<JobResponse> {
    return this.execute(() => this.jenkins.queue.item(queueNumber), jobResponseFromQueue);
  }

  private build(name: string, id: number): Observable<JobResponse> {
    return this.execute(() => this.jenkins.build.get(name, id), jobResponseFromBuild);
  }

  private execute<T>(
    action: () => Promise<T>,
    parser: (res: T) => JobResponse,
  ): Observable<JobResponse> {
    return Observable.create(async (observer: Subscriber<JobResponse>) => {
      let parserResult: JobResponse = {
        name: 'JOB',
        url: '',
        id: -1,
        text: 'Unexpected error occurred',
        status: 'FAILURE',
      };

      try {
        while (true) {
          const actionResponse: T = await action();

          parserResult = parser(actionResponse);
          observer.next(parserResult);

          if (isJobDone(parserResult)) {
            observer.complete();

            return;
          }

          await delay(getJobProgressEstimatedRemainingTime(parserResult as JobProgress));
        }
      } catch (e) {
        // TODO: Rethrow here with info and catch inside this.run (test with VPN off/interrupted)
        observer.next(this.getErrorJobResponse(parserResult, e));
        observer.complete();
      }
    }).pipe(
      takeUntil(processInterrupt$),
      shareReplay(1),
    );
  }

  private getErrorJobResponse(parserResult: JobResponse, e: Error): JobDone {
    return {
      ...parserResult,
      text: `Unexpected error occurred:\n- name: ${e.name}\n- message: ${e.message}`,
      status: 'FAILURE',
      id: (parserResult as JobDone).id || -1,
    };
  }
}
