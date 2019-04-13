import { JobBuildOptions } from 'jenkins';

export interface JobBatchDescriber<T = string, P = string> {
  displayName: T;
  builds: JobDescriber<P>[];
}

export interface JobDescriber<T = string> {
  displayName: T;
  opts: JobBuildOptions;
}
