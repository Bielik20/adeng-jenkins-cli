import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { isJobDone, JobDone, JobProgress, JobResponse } from '../jenkins-rxjs/models';
import { delay, processInterrupt$ } from '../jenkins-rxjs/utils';
import { JobBatchDescriber, JobDescriber } from '../jobs-runner';
import { UiManager } from '../jobs-runner/ui-manager';

export async function uiTest() {
  const batchDescribers = createBatchDescribers();
  const uiManager = new UiManager(batchDescribers);

  for (const batchDescriber of batchDescribers) {
    uiManager.printBatchHeader(batchDescriber);

    const promises = createStreamsForBatchDescriber(batchDescriber, uiManager).map(stream =>
      stream.toPromise(),
    );
    const results: JobDone[] = (await Promise.all(promises)) as any;

    uiManager.printBatchFooter(results);
  }
}

function createBatchDescribers(): JobBatchDescriber[] {
  return [
    {
      displayName: 'odd',
      builds: [
        {
          displayName: 'app',
          opts: {} as any,
        },
        {
          displayName: 'mobile-wiki',
          opts: {} as any,
        },
        {
          displayName: 'f2',
          opts: {} as any,
        },
      ],
    },
    {
      displayName: 'even',
      builds: [
        {
          displayName: 'app',
          opts: {} as any,
        },
        {
          displayName: 'mobile-wiki',
          opts: {} as any,
        },
      ],
    },
    {
      displayName: 'loooong-even',
      builds: [
        {
          displayName: 'loooong display name',
          opts: {} as any,
        },
      ],
    },
  ];
}

function createStreamsForBatchDescriber(batchDescriber: JobBatchDescriber, uiManager: UiManager) {
  return batchDescriber.builds.map(jobDescriber => {
    const timeout = 2000 + Math.floor(Math.random() * 5000);
    const stream = createStream(timeout);

    return display(jobDescriber, stream, uiManager);
  });
}

function display(
  jobDescriber: JobDescriber,
  stream$: Observable<JobResponse>,
  uiManager: UiManager,
) {
  const bar: ProgressBar = uiManager.createBar(jobDescriber);
  const end$ = new Subject();

  return combineLatest(stream$, interval(1000)).pipe(
    map(([response]) => response),
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

function createStream(timeout) {
  const jobProgress: JobProgress = {
    text: 'build in progress',
    estimatedEnd: +new Date() + timeout,
    started: +new Date(),
    status: 'PROGRESS',
    name: 'job name',
    url: 'https://github.com/sindresorhus/awesome-nodejs',
  };
  const jobDone: JobDone = {
    ...jobProgress,
    status: 'SUCCESS',
    id: 0,
  };
  return Observable.create(async observer => {
    observer.next(jobProgress);
    await delay(timeout);
    observer.next(jobDone);
    observer.complete();
  }).pipe(shareReplay(1));
}
