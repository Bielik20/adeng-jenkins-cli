import { JobProgress } from '../models/job-response';

export function displayRemaining(milliseconds: number): string {
  const minutes: number = Math.floor(milliseconds / 60000);
  const seconds: number = +((milliseconds % 60000) / 1000).toFixed(0);
  return minutes + ' min' + (seconds < 1 ? '' : ` ${seconds} sec`);
}

export function getProgressInfo(response: JobProgress) {
  const now = +new Date();
  const end = response.started + response.duration + response.remainingDuration;
  const progress = (now - response.started) / (response.duration + response.remainingDuration);
  const remaining = end - now;
  const remainingMessage = displayRemaining(remaining > 0 ? remaining : 0);

  return {
    progress,
    remaining: remainingMessage,
  };
}
