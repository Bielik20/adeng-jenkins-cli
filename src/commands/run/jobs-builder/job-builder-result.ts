import { JobBuildOptions } from 'jenkins';
import { Job } from '../job-questions';
import { Project } from '../project-questions';

export interface JobBuilderResult {
  displayName: Job;
  builds: JobBuildDescriber[];
}

export interface JobBuildDescriber {
  displayName: Project;
  opts: JobBuildOptions;
}
