import {
  JobBatchDescriptor as GenericJobBatchDescriber,
  JobDescriptor as GenericJobDescriber,
} from 'jenkins-jobs-runner';
import { Job } from '../questions/job-questions';
import { Project } from '../questions/project-questions';

export type JobBatchDescriptor = GenericJobBatchDescriber<Job, Project>;
export type JobDescriptor = GenericJobDescriber<Project>;
