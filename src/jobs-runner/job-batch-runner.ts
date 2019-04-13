import { JenkinsRxJs, JobDone } from '../jenkins-rxjs';
import { JobRunner } from './job-runner';
import { JobBatchDescriber, JobDescriber } from './models';
import { UiManager } from './ui-manager';

export class JobBatchRunner {
  private jobRunner: JobRunner;

  constructor(jenkins: JenkinsRxJs) {
    this.jobRunner = new JobRunner(jenkins);
  }

  async runJobs(inputs: JobBatchDescriber[]): Promise<void> {
    const uiManager = new UiManager(inputs);

    for (const input of inputs) {
      uiManager.printBatchHeader(input);

      const results: JobDone[] = await Promise.all(this.runJobProjects(input, uiManager));

      uiManager.printBatchFooter(results);
      this.ensureSuccess(results, uiManager);
    }
  }

  private ensureSuccess(results: JobDone[], uiManager: UiManager): void {
    const failures = results.filter((result: JobDone) => result.status === 'FAILURE');

    if (failures.length) {
      uiManager.printBatchError(failures);
      process.exit(1);
    }
  }

  private runJobProjects(input: JobBatchDescriber, uiManager: UiManager): Promise<JobDone>[] {
    return input.builds.map((build: JobDescriber) => this.jobRunner.run(build, uiManager));
  }
}
