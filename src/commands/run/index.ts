import * as inquirer from 'inquirer';
import * as createJenkins from 'jenkins';
import { JenkinsRxJs } from '../../jenkins-rxjs';
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

  const jenkinsRxJs = new JenkinsRxJs(
    `http://${store.username}:${store.token}@jenkins.wikia-prod:8080`,
  );

  const { quiet, queued, done } = jenkinsRxJs.queue.item(queueNumber);

  quiet.subscribe(x => console.log('QUIET\n', x));
  queued.subscribe(x => console.log('QUEUED\n', x));
  done.subscribe(async x => {
    console.log('EXECUTED\n', x);

    const get = await jenkins.build.get(x.task.name, x.executable.number);
    const log = await jenkins.build.log(x.task.name, x.executable.number);
    const logStream = await jenkins.build.logStream(x.task.name, x.executable.number);

    console.log('get', get);
    console.log('\n==========\n');
    console.log('log', log);
    console.log('\n==========\n');
    console.log('logStream', logStream);
  });

  return;

  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const questions = getQuestions(jobs, projects, extended);

  const result: QuestionsResult = await inquirer.prompt<QuestionsResult>(questions);
  console.log(result);
  console.log('');
}
