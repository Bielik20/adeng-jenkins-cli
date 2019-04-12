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

  run(input: JobBuilderResult): Promise<JobDone>[] {
    console.log(input.displayName, '\n');

    return input.builds.map((build: JobBuildDescriber) => this.jobRunner.run(build));
  }
}
