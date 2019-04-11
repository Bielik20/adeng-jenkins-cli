import { JenkinsPromisifiedAPI } from 'jenkins';
import { Observable } from 'rxjs';
import { filter, shareReplay, takeUntil } from 'rxjs/operators';
import { Subscriber } from 'rxjs/src/internal/Subscriber';
import {
  getQueueItemEstimatedDuration,
  isQueueItemDone,
  isQueueItemQueued,
  isQueueItemQuiet,
  QueueItem,
  QueueItemDone,
  QueueItemQueued,
  QueueItemQuiet,
} from '../models';
import { delay, processInterrupt$ } from '../utils';

export class JenkinsRxJsQueue {
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
            const estimatedDuration: number = getQueueItemEstimatedDuration(response);

            observer.next({ ...response, estimatedDuration });

            if (isQueueItemDone(response)) {
              observer.complete();
              return;
            }

            await delay(estimatedDuration);
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
