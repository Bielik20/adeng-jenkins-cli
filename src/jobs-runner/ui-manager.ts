import * as ansiEscapes from 'ansi-escapes';
import * as boxen from 'boxen';
import { BorderStyle } from 'boxen';
import * as logSymbols from 'log-symbols';
import * as MultiProgress from 'multi-progress';
import { JobDone } from '../jenkins-rxjs/models';
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
      .map((batchDescriber: JobBatchDescriber) => batchDescriber.builds)
      .reduce((prev, curr) => [...prev, ...curr], [])
      .map((jobDescriber: JobDescriber) => jobDescriber.displayName.length)
      .reduce((prev, curr) => (prev > curr ? prev : curr), 0);
  }

  printBatchHeader(describer: JobBatchDescriber): void {
    const fillLength = (this.batchNameWidth = describer.displayName.length);
    const title = describer.displayName + ' '.repeat(fillLength);

    process.stdout.write(ansiEscapes.cursorHide);
    console.log(
      boxen(title, {
        padding: { left: 1, right: 1, bottom: 0, top: 0 },
        borderStyle: BorderStyle.Round,
      }),
    );
    process.stdout.write(ansiEscapes.cursorSavePosition);

    this.batchMulti = new MultiProgress(process.stderr);
  }

  printBatchFooter(results: JobDone[]): void {
    this.batchMulti.terminate();

    process.stdout.write(ansiEscapes.cursorRestorePosition);
    process.stdout.write(ansiEscapes.cursorDown(results.length) + ansiEscapes.cursorLeft);
    process.stdout.write(ansiEscapes.cursorShow);
  }

  printBatchError(failures: JobDone[]): void {
    console.log(`${logSymbols.error} Error: One or more jobs has failed with message:`);
    failures.forEach((failure: JobDone) => console.log(`- ${failure.text}`));
  }
}
