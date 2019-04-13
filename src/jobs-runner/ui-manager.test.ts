import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { JobDone, JobProgress } from '../jenkins-rxjs/models';
import { delay } from '../jenkins-rxjs/utils';
import { JobBatchDescriber } from './index';
import { UiManager } from './ui-manager';

export async function uiManagerTest() {
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

    return uiManager.createDisplayStream(jobDescriber, stream);
  });
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
