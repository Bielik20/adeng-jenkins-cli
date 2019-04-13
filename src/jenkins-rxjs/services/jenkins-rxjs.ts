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
        console.log('Error in jenkins rxjs ', e);
        observer.next(this.getErrorJobResponse(parserResult, e));
        observer.complete();
      }
    }).pipe(
      takeUntil(processInterrupt$),
      shareReplay(1),
    );
  }

  private getErrorJobResponse(parserResult: JobResponse, e: Error): JobDone {
    // TODO: declare parserResult outside try so that you have access to it here
    return {
      ...parserResult,
      text: `Unexpected error occurred:\n- name: ${e.name}\n- message: ${e.message}`,
      status: 'FAILURE',
      id: (parserResult as JobDone).id || -1,
    };
  }
}
