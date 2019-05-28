import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { JobDone, JobProgress, JobResponse } from '../jenkins-rxjs/models';
import { delay } from '../jenkins-rxjs/utils';
import { JobBatchDescriptor } from './index';
import { UiManager } from './ui-manager';

export async function uiManagerTest() {
  const batchDescribers: JobBatchDescriptor[] = createBatchDescriptors();
  const uiManager = new UiManager(batchDescribers);

  for (const batchDescriber of batchDescribers) {
    uiManager.printBatchHeader(batchDescriber);

    const promises: Promise<JobResponse>[] = createStreamsForBatchDescriber(
      batchDescriber,
      uiManager,
    ).map(stream => stream.toPromise());
    const results: JobDone[] = (await Promise.all(promises)) as any;

    uiManager.printBatchFooter(results);
  }
}

function createBatchDescriptors(): JobBatchDescriptor[] {
  return [
    {
      displayName: 'odd',
      jobDescriptor: [
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
      jobDescriptor: [
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
      displayName: 'loooong',
      jobDescriptor: [
        {
          displayName: 'loooong display name',
          opts: {} as any,
        },
      ],
    },
  ];
}

function createStreamsForBatchDescriber(
  jobBatchDescriptor: JobBatchDescriptor,
  uiManager: UiManager,
): Observable<JobResponse>[] {
  return jobBatchDescriptor.jobDescriptor.map(jobDescriber => {
    const timeout: number = 2000 + Math.floor(Math.random() * 5000);
    const stream: Observable<JobProgress> = createStream(timeout);

    return uiManager.createDisplayStream(jobDescriber, stream);
  });
}

function createStream(timeout): Observable<JobProgress> {
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
