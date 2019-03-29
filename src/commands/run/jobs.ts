import * as inquirer from 'inquirer';
import { verifyList } from '../../utils/verify-list';

export type Job = 'update' | 'deploy' | 'test';
export const availableJobs: Job[] = ['update', 'deploy', 'test'];

export async function verifyJobs(jobs: string[]): Promise<Job[]> {
  return verifyList(jobs, availableJobs, () => askForFobs());
}

async function askForFobs(): Promise<Job[]> {
  const questions: inquirer.Questions = [
    {
      name: 'jobs',
      type: 'checkbox',
      message: 'Choose jobs to execute',
      validate(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please choose at least one job.';
        }
      },
      choices: availableJobs,
    },
  ];
  const result: any = await inquirer.prompt(questions);
  return result.jobs;
}
