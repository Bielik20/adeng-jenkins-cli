import { Job } from '../questions/job-questions';
import { ParamsResult } from '../questions/param-questions.model';
import { Project } from '../questions/project-questions';
import { DeployJobBuilder } from './deploy-job-builder';
import { JobBatchDescriptor, JobDescriptor } from './models';
import { TestJobBuilder } from './test-job-builder';
import { UpdateJobBuilder } from './update-job-builder';

export class JobsBuilder {
  private updateJobBuilder = new UpdateJobBuilder();
  private deployJobBuilder = new DeployJobBuilder();
  private testJobBuilder = new TestJobBuilder();

  build(jobs: Job[], projects: Project[], params: ParamsResult): JobBatchDescriptor[] {
    const batchDescriptors: JobBatchDescriptor[] = [];

    if (jobs.includes('update')) {
      const jobDescriptors: JobDescriptor[] = this.updateJobBuilder.build(projects, params);

      if (jobDescriptors.length) {
        batchDescriptors.push({
          displayName: 'update',
          jobDescriptor: jobDescriptors,
        });
      }
    }

    if (jobs.includes('deploy')) {
      const jobDescriptors: JobDescriptor[] = this.deployJobBuilder.build(projects, params);

      if (jobDescriptors.length) {
        batchDescriptors.push({
          displayName: 'deploy',
          jobDescriptor: jobDescriptors,
        });
      }
    }

    if (jobs.includes('test')) {
      const jobDescriptors: JobDescriptor[] = this.testJobBuilder.build(projects, params);

      if (
        jobDescriptors.some(jobDescriptor => !!jobDescriptor.opts.parameters['tabs-to-trigger'])
      ) {
        batchDescriptors.push({
          displayName: 'test',
          jobDescriptor: jobDescriptors,
        });
      }
    }

    return batchDescriptors;
  }
}
