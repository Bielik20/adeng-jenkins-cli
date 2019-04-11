/* tslint:disable:max-classes-per-file */

import * as createJenkins from 'jenkins';
import { JenkinsPromisifiedAPI } from 'jenkins';
import { Observable } from 'rxjs';
import { filter, shareReplay, takeUntil } from 'rxjs/operators';
import { Subscriber } from 'rxjs/src/internal/Subscriber';
import {
  getQueueItemRemainingTime,
  isQueueItemDone,
  isQueueItemQueued,
  isQueueItemQuiet,
  QueueItem,
  QueueItemDone,
  QueueItemQueued,
  QueueItemQuiet,
} from '../models';
import { delay, processInterrupt$ } from '../utils';

export class JenkinsRxJs {
  private readonly jenkins: JenkinsPromisifiedAPI;
  queue: JenkinsRxJsQueue;

  constructor(baseUrl: string) {
    this.jenkins = createJenkins({ baseUrl, promisify: true });
    this.queue = new JenkinsRxJsQueue(this.jenkins);
  }
}

class JenkinsRxJsQueue {
  constructor(private jenkins: JenkinsPromisifiedAPI) {}

  item(
    n: number,
  ): {
    quiet: Observable<QueueItemQuiet>;
    queued: Observable<QueueItemQueued>;
    done: Observable<QueueItemDone>;
  } {
    const stream$: Observable<QueueItem> = Observable.create(
      async (observer: Subscriber<QueueItem>) => {
        try {
          while (true) {
            const response: QueueItem = await this.jenkins.queue.item(n);
            const remainingMilliseconds = getQueueItemRemainingTime(response);

            observer.next({ ...response, remainingMilliseconds });

            if (isQueueItemDone(response)) {
              observer.complete();
              return;
            }

            await delay(remainingMilliseconds);
          }
        } catch (e) {
          observer.error(e);
        }
      },
    ).pipe(
      takeUntil(processInterrupt$),
      shareReplay(1),
    );

    return {
      quiet: stream$.pipe(filter(response => isQueueItemQuiet(response))) as any,
      queued: stream$.pipe(filter(response => isQueueItemQueued(response))) as any,
      done: stream$.pipe(filter(response => isQueueItemDone(response))) as any,
    };
  }
}
