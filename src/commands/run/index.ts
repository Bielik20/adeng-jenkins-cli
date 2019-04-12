import { Jenkins } from '../../utils/jenkins';
import { Job, verifyJobs } from './job-questions';
import { JobsBuilder } from './jobs-builder';
import { JobsRunner } from './jobs-runner/jobs-runner';
import { promptParams } from './param-questions';
import { ParamsResult } from './param-questions.model';
import { Project, verifyProjects } from './project-questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  questionnaire(inputJobs, inputProjects, extended);
}

async function questionnaire(inputJobs: string[], inputProjects: string[], extended: boolean) {
  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const params: ParamsResult = await promptParams(jobs, projects, extended);
  console.log(params);

  const builder = new JobsBuilder();
  const builderResult = builder.build(jobs, projects, params);
  console.log(JSON.stringify(builderResult, null, 2));

  const jenkinsRxJs = await Jenkins.getJenkinsRxJs();
  const runner = new JobsRunner(jenkinsRxJs);
  await runner.runJobs(builderResult);
}
