import * as ansiEscapes from 'ansi-escapes';
import { JobBatchRunner } from '../../jobs-runner';
import { uiManagerTest } from '../../jobs-runner/ui-manager.test';
import { Jenkins } from '../../utils/jenkins';
import { JobsBuilder } from './jobs-builder';
import { JobBatchDescriptor } from './jobs-builder/models';
import { Job, ParamsResult, Project, promptParams, verifyJobs, verifyProjects } from './questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  // await uiManagerTest();
  questionnaire(inputJobs, inputProjects, extended);
}

async function questionnaire(inputJobs: string[], inputProjects: string[], extended: boolean) {
  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const params: ParamsResult = await promptParams(jobs, projects, extended);

  process.stdout.write(ansiEscapes.cursorDown(1) + ansiEscapes.cursorLeft);

  const builder = new JobsBuilder();
  const builderResult: JobBatchDescriptor[] = builder.build(jobs, projects, params);

  const jenkinsRxJs = await Jenkins.getJenkinsRxJs();
  const runner = new JobBatchRunner(jenkinsRxJs);
  await runner.runBatches(builderResult);
}
