import { JobProgress } from '../models/job-response';

export function displayDuration(milliseconds: number): string {
  const minutes: number = Math.floor(milliseconds / 60000);
  const seconds: number = +((milliseconds % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

export function displayTime(response: JobProgress): string {
  return displayDuration(response.remainingDuration);
}
