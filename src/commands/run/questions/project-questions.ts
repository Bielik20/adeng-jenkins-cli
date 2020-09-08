import * as inquirer from 'inquirer';
import { filterList } from '../../../utils/filter-list';

export type Project = 'app' | 'mobile-wiki' | 'f2' | 'gamepedia' | 'ucp-desktop' | 'ucp-mobile';
export const availableProjects: Project[] = [
  'app',
  'mobile-wiki',
  'f2',
  'gamepedia',
  'ucp-desktop',
  'ucp-mobile',
];

export async function verifyProjects(projects: string[]): Promise<Project[]> {
  return filterList(projects, availableProjects, () => askForProjects());
}

async function askForProjects(): Promise<Project[]> {
  const questions: inquirer.Questions = [
    {
      name: 'projects',
      type: 'checkbox',
      message: 'Choose project to include',
      validate(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please choose at least one project.';
        }
      },
      choices: availableProjects,
      default: ['app', 'mobile-wiki'],
    },
  ];
  const result: any = await inquirer.prompt(questions);

  return result.projects;
}
