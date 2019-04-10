import * as inquirer from 'inquirer';
import * as createJenkins from 'jenkins';
import { store } from '../../utils/store';
import { ensureAuthenticated } from '../login';
import { Job, verifyJobs } from './jobs';
import { Project, verifyProjects } from './projects';
import { getQuestions, QuestionsResult } from './questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  await ensureAuthenticated();

  const jenkins = createJenkins({
    baseUrl: `http://${store.username}:${store.token}@jenkins.wikia-prod:8080`,
    promisify: true,
  });

  const queueNumber = await jenkins.job.build({
    name: 'update_dependencies_mobilewiki',
    parameters: { branch: 'jenkins-test', adengine_version: 'v27.0.0' },
  });
  console.log(queueNumber);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const item = await jenkins.queue.item(queueNumber);

  console.log(item);

  return;

  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const questions = getQuestions(jobs, projects, extended);

  const result: QuestionsResult = await inquirer.prompt<QuestionsResult>(questions);
  console.log(result);
  console.log('');
}
