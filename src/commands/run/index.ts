import * as ansiEscapes from 'ansi-escapes';
import { JobBatchRunner } from '../../jobs-runner';
import { Jenkins } from '../../utils/jenkins';
import { uiTest } from '../ui-test';
import { Job, verifyJobs } from './job-questions';
import { JobsBuilder } from './jobs-builder';
import { promptParams } from './param-questions';
import { ParamsResult } from './param-questions.model';
import { Project, verifyProjects } from './project-questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  await uiTest();
  // questionnaire(inputJobs, inputProjects, extended);
}

async function questionnaire(inputJobs: string[], inputProjects: string[], extended: boolean) {
  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const params: ParamsResult = await promptParams(jobs, projects, extended);

  process.stdout.write(ansiEscapes.cursorDown(1) + ansiEscapes.cursorLeft);

  const builder = new JobsBuilder();
  const builderResult = builder.build(jobs, projects, params);

  const jenkinsRxJs = await Jenkins.getJenkinsRxJs();
  const runner = new JobBatchRunner(jenkinsRxJs);
  await runner.runJobs(builderResult);
}
