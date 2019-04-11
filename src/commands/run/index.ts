import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as createJenkins from 'jenkins';
import * as MultiProgress from 'multi-progress';
import { combineLatest, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { JenkinsRxJs } from '../../jenkins-rxjs';
import { isJobDone, isJobProgress } from '../../jenkins-rxjs/models/job-response';
import { getProgressInfo } from '../../jenkins-rxjs/utils';
import { store } from '../../utils/store';
import { ensureAuthenticated } from '../login';
import { Job, verifyJobs } from './jobs';
import { Project, verifyProjects } from './projects';
import { getQuestions, QuestionsResult } from './questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  await ensureAuthenticated();
  // questionnaire(inputJobs, inputProjects, extended);
  runJenkins();
  // ui();
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

  const multi = new MultiProgress(process.stderr);
  const bar = multi.newBar('MobileWiki [:bar] :percent :remaining (:text)', {
    complete: chalk.green('='),
    incomplete: ' ',
    width: 30,
    total: 100,
  });

  combineLatest(jenkinsRxJs.job(opts), interval(500))
    .pipe(map(([response]) => response))
    .subscribe(response => {
      if (isJobProgress(response)) {
        const progressInfo = getProgressInfo(response);
        bar.update(progressInfo.progress, {
          text: response.text,
          remaining: progressInfo.remaining,
        });
      } else if (isJobDone(response)) {
        if (response.status === 'SUCCESS') {
          bar.update(1, {
            text: chalk.green('Completed'),
            remaining: '',
          });
        } else {
          bar.update(1, {
            text: chalk.red('Failed'),
            remaining: '',
          });
        }
        // TODO: Should complete here
      }
    });
}
