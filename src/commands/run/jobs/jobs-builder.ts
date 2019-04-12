import { Job } from '../job-questions';
import { ParamsResult } from '../param-questions';
import { Project } from '../project-questions';
import { DeployJobBuilder } from './deploy-job-builder';
import { JobBuilderResult } from './job-builder-result';
import { UpdateJobBuilder } from './update-job-builder';

export class JobsBuilder {
  private updateJobBuilder = new UpdateJobBuilder();
  private deployJobBuilder = new DeployJobBuilder();

  build(jobs: Job[], projects: Project[], params: ParamsResult): JobBuilderResult[] {
    const result: JobBuilderResult[] = [];

    if (jobs.includes('update')) {
      const builds = this.updateJobBuilder.build(projects, params);

      if (builds.length) {
        result.push({
          displayName: 'update',
          builds,
        });
      }
    }

    if (jobs.includes('deploy')) {
      const builds = this.deployJobBuilder.build(projects, params);

      if (builds.length) {
        result.push({
          displayName: 'deploy',
          builds,
        });
      }
    }

    return result;
  }
}
