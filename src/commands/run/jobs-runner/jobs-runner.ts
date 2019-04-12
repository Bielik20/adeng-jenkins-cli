import * as ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import * as MultiProgress from 'multi-progress';
import { JenkinsRxJs, JobDone } from '../../../jenkins-rxjs';
import { JobBuildDescriber, JobBuilderResult } from '../jobs-builder';
import { JobRunner } from './job-runner';

export class JobsRunner {
  private jobRunner: JobRunner;
  private multi = new MultiProgress(process.stderr);

  constructor(jenkins: JenkinsRxJs) {
    this.jobRunner = new JobRunner(jenkins, this.multi);
  }

  async runJobs(inputs: JobBuilderResult[]): Promise<void> {
    for (const input of inputs) {
      console.log('\n', chalk.bgCyan(`======${input.displayName}======`));
      process.stdout.write(ansiEscapes.cursorSavePosition);

      const results: JobDone[] = await Promise.all(this.runJobProjects(input));

      process.stdout.write(ansiEscapes.cursorRestorePosition);
      process.stdout.write(ansiEscapes.cursorDown(results.length + 1));
      process.stdout.write(ansiEscapes.cursorLeft);

      this.ensureSuccess(results);
    }
  }

  private ensureSuccess(results: JobDone[]): void {
    const failures = results.filter((result: JobDone) => result.status === 'FAILURE');

    if (failures.length) {
      console.log(chalk.red('Error: '), 'One or more jobs has failed with message:');
      failures.forEach((failure: JobDone) => console.log(`- ${failure.text}`));
      process.exit(1);
    }
  }

  private runJobProjects(input: JobBuilderResult): Promise<JobDone>[] {
    return input.builds.map((build: JobBuildDescriber) => this.jobRunner.run(build));
  }
}
