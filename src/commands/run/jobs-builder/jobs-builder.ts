import { Job } from '../job-questions';
import { ParamsResult } from '../param-questions.model';
import { Project } from '../project-questions';
import { DeployJobBuilder } from './deploy-job-builder';
import { JobBatchDescriber } from './models';
import { TestJobBuilder } from './test-job-builder';
import { UpdateJobBuilder } from './update-job-builder';

export class JobsBuilder {
  private updateJobBuilder = new UpdateJobBuilder();
  private deployJobBuilder = new DeployJobBuilder();
  private testJobBuilder = new TestJobBuilder();

  build(jobs: Job[], projects: Project[], params: ParamsResult): JobBatchDescriber[] {
    const result: JobBatchDescriber[] = [];

    if (jobs.includes('update')) {
      const jobDescribers = this.updateJobBuilder.build(projects, params);

      if (jobDescribers.length) {
        result.push({
          displayName: 'update',
          jobDescribers,
        });
      }
    }

    if (jobs.includes('deploy')) {
      const jobDescribers = this.deployJobBuilder.build(projects, params);

      if (jobDescribers.length) {
        result.push({
          displayName: 'deploy',
          jobDescribers,
        });
      }
    }

    if (jobs.includes('test')) {
      const jobDescribers = this.testJobBuilder.build(projects, params);

      if (jobDescribers.length) {
        result.push({
          displayName: 'test',
          jobDescribers,
        });
      }
    }

    return result;
  }
}
