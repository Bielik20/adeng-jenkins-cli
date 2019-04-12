import { Job } from '../job-questions';
import { ParamsResult } from '../param-questions';
import { Project } from '../project-questions';
import { JobBuilderResult } from './job-builder-result';
import { UpdateJobBuilder } from './update-job-builder';

export class JobsBuilder {
  private updateJobBuilder = new UpdateJobBuilder();

  build(jobs: Job[], projects: Project[], params: ParamsResult): JobBuilderResult[] {
    const result: JobBuilderResult[] = [];

    if (jobs.includes('update')) {
      result.push({
        displayName: 'update',
        builds: this.updateJobBuilder.build(projects, params),
      });
    }

    return result;
  }
}
