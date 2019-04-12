import { JenkinsPromisifiedAPI, JobBuildOptions } from 'jenkins';
import { from, Observable, of } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
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

export class JenkinsRxJs {
  constructor(private readonly jenkins: JenkinsPromisifiedAPI) {}

  job(opts: JobBuildOptions): Observable<JobResponse> {
    return from(this.jenkins.job.build(opts)).pipe(
      switchMap((queueNumber: number) =>
        this.queue(queueNumber).pipe(
          switchMap((response: JobResponse) => {
            if (isJobDone(response)) {
              return this.build(response.name, response.id);
            }

            return of(response);
          }),
        ),
      ),
    );
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
      try {
        while (true) {
          const actionResponse: T = await action();
          const parserResult: JobResponse = parser(actionResponse);

          observer.next(parserResult);

          if (isJobDone(parserResult)) {
            observer.complete();

            return;
          }

          await delay(getJobProgressEstimatedRemainingTime(parserResult as JobProgress));
        }
      } catch (e) {
        console.log(e);
        observer.next(this.getErrorJobResponse());
        observer.complete();
      }
    }).pipe(
      takeUntil(processInterrupt$),
      shareReplay(1),
    );
  }

  private getErrorJobResponse(): JobDone {
    return {
      name: 'JOB',
      url: '',
      text: 'Unexpected error occurred',
      id: 0,
      status: 'FAILURE',
    };
  }
}
