import * as ansiEscapes from 'ansi-escapes';
import * as boxen from 'boxen';
import { BorderStyle } from 'boxen';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as MultiProgress from 'multi-progress';
import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import {
  getJobProgressEstimatedRemainingTime,
  getJobProgressPercentage,
  isJobDone,
  isJobProgress,
  JobDone,
  JobProgress,
  JobResponse,
} from '../jenkins-rxjs/models';
import { processInterrupt$ } from '../jenkins-rxjs/utils';
import { JobBatchDescriber, JobDescriber } from './models';

export class UiManager {
  batchNameWidth: number;
  jobNameWidth: number;
  batchMulti: MultiProgress;

  constructor(batchDescribers: JobBatchDescriber[]) {
    this.batchNameWidth = batchDescribers
      .map((batchDescriber: JobBatchDescriber) => batchDescriber.displayName.length)
      .reduce((prev, curr) => (prev > curr ? prev : curr), 0);

    this.jobNameWidth = batchDescribers
      .map((batchDescriber: JobBatchDescriber) => batchDescriber.jobDescribers)
      .reduce((prev, curr) => [...prev, ...curr], [])
      .map((jobDescriber: JobDescriber) => jobDescriber.displayName.length)
      .reduce((prev, curr) => (prev > curr ? prev : curr), 0);
  }

  printBatchHeader(batchDescriber: JobBatchDescriber): void {
    const fillLength = this.batchNameWidth - batchDescriber.displayName.length;
    const title: string = batchDescriber.displayName;

    process.stdout.write(ansiEscapes.cursorHide);
    console.log(
      boxen(title, {
        padding: {
          left: 1 + Math.floor(fillLength / 2),
          right: 1 + Math.ceil(fillLength / 2),
          bottom: 0,
          top: 0,
        },
        borderColor: 'blue',
        borderStyle: BorderStyle.Round,
      }),
    );
    process.stdout.write(ansiEscapes.cursorSavePosition);

    this.batchMulti = new MultiProgress(process.stderr);
  }

  printBatchFooter(results: JobDone[]): void {
    this.batchMulti.terminate();

    process.stdout.write(ansiEscapes.cursorRestorePosition);
    process.stdout.write(ansiEscapes.cursorDown(results.length + 1) + ansiEscapes.cursorLeft);
    process.stdout.write(ansiEscapes.cursorShow);
  }

  printBatchError(failures: JobDone[]): void {
    let text = `${logSymbols.error} Error: One or more jobs has failed.\n`;
    failures.forEach((failure: JobDone) => {
      text += `\nname: ${failure.name}\n`;
      text += `url: ${failure.url}\n`;
      text += `message: ${failure.text}\n`;
    });

    console.log(
      boxen(text, {
        padding: 1,
        borderColor: 'red',
        borderStyle: BorderStyle.Round,
      }),
    );
  }

  createDisplayStream(
    jobDescriber: JobDescriber,
    stream$: Observable<JobResponse>,
  ): Observable<JobResponse> {
    const bar: ProgressBar = this.createBar(jobDescriber);
    const end$ = new Subject();

    return combineLatest(stream$, interval(1000)).pipe(
      map(([response]: [JobResponse, number]) => response),
      takeUntil(processInterrupt$),
      takeUntil(end$.pipe(takeUntil(processInterrupt$))),
      tap((response: JobResponse) => {
        this.updateBar(bar, response);
        if (isJobDone(response)) {
          // TODO: Replace this hack with something more elegant (test with VPN off)
          setTimeout(() => {
            end$.next();
            end$.complete();
          });
        }
      }),
    );
  }

  private createBar(jobDescriber: JobDescriber): ProgressBar {
    const fillLength = this.jobNameWidth - jobDescriber.displayName.length;
    const title = ' '.repeat(fillLength) + jobDescriber.displayName;

    return this.batchMulti.newBar(`${title} [:bar] :percent (:message)`, {
      complete: chalk.green('='),
      incomplete: ' ',
      width: 40,
      total: 100,
    });
  }

  private updateBar(bar: ProgressBar, response: JobResponse): void {
    if (isJobProgress(response)) {
      const symbol = logSymbols.info;
      const link = response.url;
      const text = ansiEscapes.link(response.text, link);
      const eta = this.createETA(response);
      const message = `${symbol} ${text} ${eta}`;

      return bar.update(getJobProgressPercentage(response), { message });
    }

    if (isJobDone(response)) {
      const symbol = response.status === 'SUCCESS' ? logSymbols.success : logSymbols.error;
      const link = response.url;
      const text = ansiEscapes.link(response.status, link);
      const message = `${symbol} ${text}`;

      bar.update(1, { message });
      bar.terminate();
    }
  }

  private createETA(response: JobProgress): string {
    const remaining: number = getJobProgressEstimatedRemainingTime(response);
    const eta: string = this.millisecondsToDisplay(remaining);

    return `ETA: ${eta}`;
  }

  private millisecondsToDisplay(milliseconds: number): string {
    const minutes: number = Math.floor(milliseconds / 60000);
    const seconds: number = +((milliseconds % 60000) / 1000).toFixed(0);
    return minutes + ' min' + (seconds < 1 ? '' : ` ${seconds} sec`);
  }
}
