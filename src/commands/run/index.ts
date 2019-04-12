import * as ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import * as MultiProgress from 'multi-progress';
import { combineLatest, interval, Observable } from 'rxjs';
import { last, map, shareReplay, takeUntil } from 'rxjs/operators';
import {
  getJobProgressEstimatedRemainingTime,
  getJobProgressPercentage,
  isJobDone,
  isJobProgress,
  JobDone,
  JobProgress,
  JobResponse,
} from '../../jenkins-rxjs/models';
import { delay, processInterrupt$ } from '../../jenkins-rxjs/utils';
import { Jenkins } from '../../utils/jenkins';
import { millisecondsToDisplay } from '../../utils/milliseconds-to-display';
import { Job, verifyJobs } from './job-questions';
import { JobBuildDescriber, JobsBuilder } from './jobs-builder';
import * as ProgressBar from './jobs-runner/job-runner';
import { JobsRunner } from './jobs-runner/jobs-runner';
import { promptParams } from './param-questions';
import { ParamsResult } from './param-questions.model';
import { Project, verifyProjects } from './project-questions';

const multi = new MultiProgress(process.stderr);

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  await uiTest();
  // questionnaire(inputJobs, inputProjects, extended);
}

async function questionnaire(inputJobs: string[], inputProjects: string[], extended: boolean) {
  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const params: ParamsResult = await promptParams(jobs, projects, extended);

  const builder = new JobsBuilder();
  const builderResult = builder.build(jobs, projects, params);

  const jenkinsRxJs = await Jenkins.getJenkinsRxJs();
  const runner = new JobsRunner(jenkinsRxJs);
  await runner.runJobs(builderResult);
}

async function uiTest() {
  const build: any = {
    displayName: 'test',
  };

  const streams = [createStream(3000), createStream(4000), createStream(2500), createStream(1000)];

  process.stdout.write(ansiEscapes.cursorSavePosition);

  streams.forEach(s => display(build, s));

  const array = await Promise.all(streams.map(s => s.pipe(last()).toPromise()));

  process.stdout.write(ansiEscapes.cursorRestorePosition);
  process.stdout.write(ansiEscapes.cursorDown(array.length + 1));
  process.stdout.write(ansiEscapes.cursorLeft);

  console.log('aaa');
}

function display(build: JobBuildDescriber, stream$: Observable<JobResponse>): void {
  const bar: ProgressBar = createBar(build);

  const subscription = combineLatest(stream$, interval(1000))
    .pipe(
      map(([response]) => response),
      takeUntil(processInterrupt$),
    )
    .subscribe((response: JobResponse) => {
      if (isJobProgress(response)) {
        bar.update(getJobProgressPercentage(response), {
          text: response.text,
          remaining: millisecondsToDisplay(getJobProgressEstimatedRemainingTime(response)),
        });
      } else if (isJobDone(response)) {
        if (response.status === 'SUCCESS') {
          bar.update(1, {
            text: chalk.green('Completed'),
            remaining: '',
          });
        } else {
          bar.update(1, {
            text: chalk.red('Failed'),
            remaining: '',
          });
        }

        bar.terminate();
        subscription.unsubscribe();
      }
    });
}

function createBar(build: JobBuildDescriber): ProgressBar {
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
