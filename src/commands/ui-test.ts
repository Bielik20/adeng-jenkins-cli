import * as ansiEscapes from 'ansi-escapes';
import * as boxen from 'boxen';
import { BorderStyle } from 'boxen';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as MultiProgress from 'multi-progress';
import * as ProgressBar from 'progress';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { last, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import {
  getJobProgressEstimatedRemainingTime,
  getJobProgressPercentage,
  isJobDone,
  isJobProgress,
  JobDone,
  JobProgress,
  JobResponse,
} from '../jenkins-rxjs/models';
import { delay, processInterrupt$ } from '../jenkins-rxjs/utils';
import { JobDescriber } from '../jobs-runner';
import { millisecondsToDisplay } from '../utils/milliseconds-to-display';

export async function uiTest() {
  const multi = new MultiProgress(process.stderr);
  const build: any = {
    displayName: 'test',
  };
  const streams = [
    createStream(3000),
    createStream(2000),
    createStream(2500),
    createStream(1000),
    createStream(4000),
  ];

  console.log(
    boxen('Job', {
      padding: { left: 1, right: 1, bottom: 0, top: 0 },
      borderStyle: BorderStyle.Round,
    }),
  );
  process.stdout.write(ansiEscapes.cursorSavePosition);
  process.stdout.write(ansiEscapes.cursorHide);

  try {
    const promises = streams.map(s =>
      display(build, s, multi)
        .pipe(last())
        .toPromise(),
    );
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }

  process.stdout.write(ansiEscapes.cursorRestorePosition);
  process.stdout.write(ansiEscapes.cursorDown(streams.length) + ansiEscapes.cursorLeft);
  process.stdout.write(ansiEscapes.cursorShow);
  multi.terminate();
}

function display(build: JobDescriber, stream$: Observable<JobResponse>, multi) {
  const bar: ProgressBar = createBar(build, multi);
  const end$ = new Subject();
  const time = Math.floor(Math.random() * 100) + 500;
  // console.log(time);

  return combineLatest(stream$, interval(time)).pipe(
    map(([response]) => response),
    takeUntil(processInterrupt$),
    takeUntil(end$.pipe(takeUntil(processInterrupt$))),
    tap((response: JobResponse) => {
      if (isJobProgress(response)) {
        bar.update(getJobProgressPercentage(response), {
          text: response.text,
          remaining: millisecondsToDisplay(getJobProgressEstimatedRemainingTime(response)),
        });
      } else if (isJobDone(response)) {
        if (response.status === 'SUCCESS') {
          bar.update(1, {
            text: `${logSymbols.success} Completed`,
            remaining: '',
          });
        } else {
          bar.update(1, {
            text: `${logSymbols.error} Failed`,
            remaining: '',
          });
        }

        bar.terminate();
        end$.next();
        end$.complete();
      }
    }),
  );
}

function createBar(build: JobDescriber, multi): ProgressBar {
  return multi.newBar(`${build.displayName} [:bar] :percent :remaining (:text)`, {
    complete: chalk.green('='),
    incomplete: ' ',
    width: 50 - build.displayName.length,
    total: 100,
  });
}

function createStream(timeout) {
  const jobProgress: JobProgress = {
    text: 'lorem impus',
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
