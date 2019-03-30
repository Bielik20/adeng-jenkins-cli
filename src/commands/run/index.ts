import * as inquirer from 'inquirer';
import { Job, verifyJobs } from './jobs';
import { Project, verifyProjects } from './projects';
import { getQuestions, QuestionsResult } from './questions';

export async function run(inputJobs: string[], inputProjects: string[], extended: boolean) {
  const jobs: Job[] = await verifyJobs(inputJobs);
  const projects: Project[] = await verifyProjects(inputProjects);
  const questions = getQuestions(jobs, projects, extended);

  const result: QuestionsResult = await inquirer.prompt<QuestionsResult>(questions);
  console.log(result);
}
