import * as inquirer from 'inquirer';
import { verifyJobs } from './jobs';
import { verifyProjects } from './projects';
import { getQuestions } from './questions';

export async function run(
  inputJobs: string[] | undefined,
  inputProjects: string[] | undefined,
  extended: boolean,
) {
  const jobs = await verifyJobs(inputJobs);
  const projects = await verifyProjects(inputProjects);
  const questions = getQuestions(jobs, projects, extended);

  const result = await inquirer.prompt(questions);
  console.log(result);
}
