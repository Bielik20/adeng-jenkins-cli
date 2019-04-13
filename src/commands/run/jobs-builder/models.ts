import { JobBatchDescriber as aaa, JobDescriber as bbb } from '../../../jobs-runner';
import { Job } from '../job-questions';
import { Project } from '../project-questions';

export type BuilderBatchDescriber = aaa<Job, Project>;
export type BuilderDescriber = bbb<Project>;
