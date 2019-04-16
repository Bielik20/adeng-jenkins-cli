import { JobBuildOptions } from 'jenkins';

export interface JobBatchDescriptor<T = string, P = string> {
  displayName: T;
  jobDescriptor: JobDescriptor<P>[];
}

export interface JobDescriptor<T = string> {
  displayName: T;
  opts: JobBuildOptions;
}
