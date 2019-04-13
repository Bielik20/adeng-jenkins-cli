import { JenkinsRxJs, JobDone } from '../jenkins-rxjs';
import { JobRunner } from './job-runner';
import { JobBatchDescriber, JobDescriber } from './models';
import { UiManager } from './ui-manager';

export class JobBatchRunner {
  private jobRunner: JobRunner;

  constructor(jenkins: JenkinsRxJs) {
    this.jobRunner = new JobRunner(jenkins);
  }

  async runJobs(batchDescribers: JobBatchDescriber[]): Promise<void> {
    const uiManager = new UiManager(batchDescribers);

    for (const batchDescriber of batchDescribers) {
      uiManager.printBatchHeader(batchDescriber);

      const results: JobDone[] = await Promise.all(this.runJobProjects(batchDescriber, uiManager));

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

  private runJobProjects(
    batchDescriber: JobBatchDescriber,
    uiManager: UiManager,
  ): Promise<JobDone>[] {
    return batchDescriber.builds.map((build: JobDescriber) => this.jobRunner.run(build, uiManager));
  }
}
