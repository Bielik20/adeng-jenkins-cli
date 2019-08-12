import * as ansiEscapes from 'ansi-escapes';
import * as boxen from 'boxen';
import { BorderStyle } from 'boxen';
import chalk from 'chalk';
import {
  getJobProgressEstimatedRemainingTime,
  getJobProgressPercentage,
  isJobDone,
  isJobProgress,
  JobDone,
  JobProgress,
  JobResponse,
} from 'jenkins-rxjs';
import * as logSymbols from 'log-symbols';
import * as MultiProgress from 'multi-progress';
import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { JobBatchDescriptor, JobDescriptor } from './models';
import { processInterrupt$ } from './process-interrupt';

export class UiManager {
  batchMaxNameWidth: number;
  jobMaxNameWidth: number;
  batchMulti: MultiProgress;

  constructor(batchDescriptors: JobBatchDescriptor[]) {
    this.batchMaxNameWidth = batchDescriptors
      .map((batchDescriptor: JobBatchDescriptor) => batchDescriptor.displayName.length)
      .reduce((prev, curr) => (prev > curr ? prev : curr), 0);

    this.jobMaxNameWidth = batchDescriptors
      .map((batchDescriptor: JobBatchDescriptor) => batchDescriptor.jobDescriptor)
      .reduce((prev, curr) => [...prev, ...curr], [])
      .map((jobDescriptor: JobDescriptor) => jobDescriptor.displayName.length)
      .reduce((prev, curr) => (prev > curr ? prev : curr), 0);
  }

  printBatchHeader(batchDescriptor: JobBatchDescriptor): void {
    const fillLength: number = this.batchMaxNameWidth - batchDescriptor.displayName.length;
    const title: string = batchDescriptor.displayName;

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
    jobDescriptor: JobDescriptor,
    stream$: Observable<JobResponse>,
  ): Observable<JobResponse> {
    const bar: ProgressBar = this.createBar(jobDescriptor);
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

  private createBar(jobDescriptor: JobDescriptor): ProgressBar {
    const fillLength: number = this.jobMaxNameWidth - jobDescriptor.displayName.length;
    const title: string = ' '.repeat(fillLength) + jobDescriptor.displayName;

    return this.batchMulti.newBar(`${title} [:bar] :percent (:message)`, {
      complete: chalk.green('='),
      incomplete: ' ',
      width: 40,
      total: 100,
    });
  }

  private updateBar(bar: ProgressBar, response: JobResponse): void {
    if (isJobProgress(response)) {
      const symbol: string = logSymbols.info;
      const link: string = response.url;
      const text: string = ansiEscapes.link(response.text, link);
      const eta: string = this.createETA(response);
      const message: string = `${symbol} ${text} ${eta}`;

      return bar.update(getJobProgressPercentage(response), { message });
    }

    if (isJobDone(response)) {
      const symbol: string = response.status === 'SUCCESS' ? logSymbols.success : logSymbols.error;
      const link: string = response.url;
      const text: string = ansiEscapes.link(response.status, link);
      const message: string = `${symbol} ${text}`;

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
