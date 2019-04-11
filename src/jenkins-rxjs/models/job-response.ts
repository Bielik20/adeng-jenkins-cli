import { BuildResponse } from './build-response';
import {
  getQueueItemRemainingDuration,
  isQueueItemDone,
  isQueueItemQuiet,
  QueueItem,
  QueueItemDone,
  QueueItemQueued,
  QueueItemQuiet,
} from './queue-response';

export type JobStatus = 'FAILURE' | 'SUCCESS' | 'PROGRESS';

export interface JobResponse {
  name: string;
  url: string;
  text: string;
  status: JobStatus;
}

export interface JobProgress extends JobResponse {
  status: 'PROGRESS';
  started: number;
  duration: number;
  remainingDuration: number;
}

export function isJobProgress(input: JobResponse): input is JobProgress {
  return input.status === 'PROGRESS';
}

export interface JobDone extends JobResponse {
  number: number;
  status: 'FAILURE' | 'SUCCESS';
}

export function isJobDone(input: JobResponse): input is JobDone {
  return !isJobProgress(input);
}

export function jobResponseFromQueue(
  queue: QueueItem | QueueItemQuiet | QueueItemQueued | QueueItemDone,
): JobResponse {
  const response = {
    name: queue.task.name,
    url: queue.task.url,
  };

  if (!!queue.cancelled) {
    return {
      ...response,
      text: 'Job has been cancelled',
      status: 'FAILURE',
    } as JobDone;
  }

  if (!!queue.stuck) {
    return {
      ...response,
      text: 'Job stuck',
      status: 'FAILURE',
    } as JobDone;
  }

  if (isQueueItemDone(queue)) {
    return {
      ...response,
      text: 'Item has started building',
      number: queue.executable.number,
      status: 'SUCCESS',
    } as JobDone;
  }

  return {
    ...response,
    text: isQueueItemQuiet(queue) ? 'Item in quiet state' : 'Item in the queue',
    status: 'PROGRESS',
    started: queue.inQueueSince,
    duration: +new Date() - queue.inQueueSince,
    remainingDuration: getQueueItemRemainingDuration(queue),
  } as JobProgress;
}

export function jobResponseFromBuild(build: BuildResponse): JobResponse {
  const response = {
    name: build.displayName,
    url: build.url,
  };

  if (!build.duration) {
    return {
      ...response,
      text: 'Build in progress',
      status: 'PROGRESS',
      started: build.timestamp,
      duration: +new Date() - build.timestamp,
      remainingDuration: build.estimatedDuration + build.timestamp - +new Date(),
    } as JobProgress;
  }

  if (!!build.result && build.result === 'SUCCESS') {
    return {
      ...response,
      text: 'Build finished',
      number: build.number,
      status: 'SUCCESS',
    } as JobDone;
  }

  return {
    ...response,
    text: `Build failed with response: ${build.result}`,
    status: 'FAILURE',
  } as JobDone;
}
