import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as createJenkins from 'jenkins';
import { JenkinsRxJs } from '../../jenkins-rxjs';
import { isJobDone, isJobProgress } from '../../jenkins-rxjs/models/job-response';
import { displayTime } from '../../jenkins-rxjs/utils';
import { store } from '../../utils/store';
import { ensureAuthenticated } from '../login';
import { Job, verifyJobs } from './jobs';
import { Project, verifyProjects } from './projects';
import { getQuestions, QuestionsResult } from './questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  await ensureAuthenticated();
  // questionnaire(inputJobs, inputProjects, extended);
  // runJenkins();
}

async function questionnaire(inputJobs: string[], inputProjects: string[], extended: boolean) {
  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const questions = getQuestions(jobs, projects, extended);

  const result: QuestionsResult = await inquirer.prompt<QuestionsResult>(questions);
  console.log(result);
}

function runJenkins() {
  const jenkins = createJenkins({
    baseUrl: `http://${store.username}:${store.token}@jenkins.wikia-prod:8080`,
    promisify: true,
  });
  const jenkinsRxJs = new JenkinsRxJs(jenkins);
  const opts = {
    name: 'update_dependencies_mobilewiki',
    parameters: { branch: 'jenkins-test', adengine_version: 'jenkins-test' },
  };

  jenkinsRxJs.job(opts).subscribe(response => {
    if (isJobProgress(response)) {
      console.log(chalk.yellow(response.text));
      console.log(chalk.bgBlue(displayTime(response)));
    } else if (isJobDone(response)) {
      if (response.status === 'SUCCESS') {
        console.log(chalk.yellow(response.text));
      } else {
        console.log(chalk.red(response.text));
      }
    }
  });
}
