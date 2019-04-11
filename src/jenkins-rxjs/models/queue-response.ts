import { pessimisticThreshold } from '../utils';

export interface QueueItem {
  _class: string;
  actions: ActionsEntity[];
  blocked: boolean;
  buildable: boolean;
  id: number;
  inQueueSince: number;
  params: string;
  stuck: boolean;
  task: Task;
  url: string;
  estimatedDuration: number;
}

export interface ActionsEntity {
  _class: string;
  parameters?: any[];
  causes?: any[];
}

export interface Task {
  _class: string;
  name: string;
  url: string;
  color: string;
}

export interface Executable {
  _class: string;
  number: number;
  url: string;
}

export interface QueueItemQuiet extends QueueItem {
  why: string;
  timestamp: number;
}

export function isQueueItemQuiet(response: QueueItem): response is QueueItemQuiet {
  return typeof (response as QueueItemQuiet).timestamp === 'number';
}

export interface QueueItemQueued extends QueueItem {
  why: string;
  buildableStartMilliseconds: number;
}

export function isQueueItemQueued(response: QueueItem): response is QueueItemQueued {
  return typeof (response as QueueItemQueued).buildableStartMilliseconds === 'number';
}

export interface QueueItemDone extends QueueItem {
  cancelled: boolean;
  executable: Executable;
}

export function isQueueItemDone(response: QueueItem): response is QueueItemDone {
  return !!(response as QueueItemDone).executable;
}

export function getQueueItemEstimatedDuration(response: QueueItem): number {
  let milliseconds = 0;

  if (isQueueItemQuiet(response)) {
    milliseconds = response.timestamp - +new Date();
  } else if (isQueueItemQueued(response)) {
    milliseconds = parseQueuedEstimatedDuration(response.why);
  }

  if (milliseconds < 0) {
    milliseconds = 0;
  }

  return milliseconds + pessimisticThreshold;
}

function parseQueuedEstimatedDuration(why: string): number {
  let milliseconds = 0;

  const startIndex = why.indexOf('(ETA:');
  const endIndex = why.indexOf(')');

  if (startIndex === -1 || endIndex === -1) {
    return milliseconds;
  }

  const time: string = why.slice(startIndex + 5, endIndex);
  const times: string[] = time.split(' ');

  const minutesIndex = times.indexOf('min');

  if (minutesIndex !== -1) {
    milliseconds += +times[minutesIndex - 1] * 60 * 1000;
  }

  const secondsIndex = times.indexOf('sec');

  if (secondsIndex !== -1) {
    milliseconds += +times[secondsIndex - 1] * 1000;
  }

  return milliseconds;
}
