import {
  JobBatchDescriber as GenericJobBatchDescriber,
  JobDescriber as GenericJobDescriber,
} from '../../../jobs-runner';
import { Job } from '../job-questions';
import { Project } from '../project-questions';

export type JobBatchDescriber = GenericJobBatchDescriber<Job, Project>;
export type JobDescriber = GenericJobDescriber<Project>;
