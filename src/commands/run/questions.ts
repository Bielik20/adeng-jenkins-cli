import * as inquirer from 'inquirer';
import { Job } from './jobs';
import { availableProjects, Project } from './projects';

type FilterQuestion = inquirer.Question & {
  destined: { jobs: Job[]; projects: Project[]; extended: boolean };
};

export interface QuestionsResult {
  branch: string;
  adEngineVersion: string;
  sandbox: string;
  configBranch?: string;
  datacenter?: string;
  crowdinBranch?: string;
  debug?: boolean;
  testBranch?: string;
  query?: string;
  fandomEnvironment?: string;
  extension?: string;
  name: string;
}

export function getQuestions(
  jobs: string[],
  projects: string[],
  extended: boolean,
): inquirer.Questions {
  return questions.filter(question => {
    const isJobOk = question.destined.jobs.some(job => jobs.includes(job));
    const isProjectOk = question.destined.projects.some(project => projects.includes(project));
    const isExtendedOk = !question.destined.extended || extended;

    return isJobOk && isProjectOk && isExtendedOk;
  });
}

const questions: FilterQuestion[] = [
  {
    name: 'branch',
    type: 'input',
    message: 'Project branch',
    validate: required,
    destined: {
      jobs: ['update', 'deploy'],
      projects: availableProjects,
      extended: false,
    },
  },
  {
    name: 'adEngineVersion',
    type: 'input',
    message: '@wikia/ad-engine version',
    validate: required,
    destined: {
      jobs: ['update'],
      projects: availableProjects,
      extended: false,
    },
  },
  {
    name: 'sandbox',
    type: 'list',
    message: 'Sandbox',
    validate: required,
    choices: [
      'sandbox-adeng01',
      'sandbox-adeng02',
      'sandbox-adeng03',
      'sandbox-adeng04',
      'sandbox-adeng05',
      'sandbox-adeng06',
      'sandbox-adeng07',
    ],
    default: 'sandbox-adeng02',
    destined: {
      jobs: ['deploy'],
      projects: ['app', 'mobile-wiki'],
      extended: false,
    },
  },
  {
    name: 'configBranch',
    type: 'input',
    message: 'Config branch e.g. release-01, PLAT-345',
    destined: {
      jobs: ['update'],
      projects: ['app'],
      extended: true,
    },
  },
  {
    name: 'datacenter',
    type: 'input',
    message: 'Datacenter',
    validate: required,
    default: 'sjc',
    destined: {
      jobs: ['update'],
      projects: ['app', 'mobile-wiki'],
      extended: true,
    },
  },
  {
    name: 'crowdinBranch',
    type: 'input',
    message: 'Branch for Crowdin translations (leave empty if translations update not needed)',
    destined: {
      jobs: ['update'],
      projects: ['app', 'mobile-wiki'],
      extended: true,
    },
  },
  {
    name: 'debug',
    type: 'confirm',
    message: 'Branch for Crowdin translations (leave empty if translations update not needed)',
    default: false,
    destined: {
      jobs: ['update'],
      projects: ['app'],
      extended: true,
    },
  },
  {
    name: 'testBranch',
    type: 'input',
    message:
      'Branch for Tests. Leave this parameter empty if you want to run on jobs DEFAULT branch e.g. origin/branch-name',
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: true,
    },
  },
  {
    name: 'query',
    type: 'input',
    message: 'Url params',
    default: `cb=${+new Date()}`,
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: false,
    },
  },
  {
    name: 'fandomEnvironment',
    type: 'input',
    message: 'Environment for Fandom ( Upstream) tests',
    default: 'sandbox-adeng',
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: true,
    },
  },
  {
    name: 'extension',
    type: 'input',
    message: 'Additional browser extenstions e.g. adblock',
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: true,
    },
  },
  {
    name: 'name',
    type: 'input',
    message: 'Custom name which will be added to tab name',
    validate: required,
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: false,
    },
  },
];

function required(value?: string): boolean | string {
  if (!!value) {
    return true;
  } else {
    return 'This file is required.';
  }
}
