import * as branch from 'git-branch';
import * as inquirer from 'inquirer';
import { Job } from './jobs';
import { availableProjects, Project } from './projects';

interface FilterQuestion extends inquirer.Question {
  name: keyof QuestionsResult;
  destined: {
    jobs: Job[];
    projects: Project[];
    extended: boolean;
  };
}

export interface QuestionsResult {
  branch?: string;
  adEngineVersion?: string;
  sandbox?: string;
  configBranch?: string;
  datacenter?: string;
  crowdinBranch?: string;
  debug?: boolean;
  testBranch?: string;
  query?: string;
  fandomEnvironment?: string;
  extension?: string;
  name?: string;
}

export function getQuestions(
  jobs: Job[],
  projects: Project[],
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
    message: 'Project branch',
    validate: required,
    filter: adenToUpper,
    transformer: adenToUpper,
    default: currentBranch,
    destined: {
      jobs: ['update', 'deploy'],
      projects: availableProjects,
      extended: false,
    },
  },
  {
    name: 'adEngineVersion',
    message: 'Version of @wikia/ad-engine',
    validate: required,
    default: (answers: QuestionsResult) => answers.branch,
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
      jobs: ['deploy', 'test'],
      projects: availableProjects,
      extended: false,
    },
  },
  {
    name: 'configBranch',
    message: 'Config branch e.g. release-01, PLAT-345',
    destined: {
      jobs: ['update'],
      projects: ['app'],
      extended: true,
    },
  },
  {
    name: 'datacenter',
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
    message: 'Branch for Tests',
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: true,
    },
  },
  {
    name: 'query',
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
    message: 'Additional browser extenstions e.g. adblock',
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: true,
    },
  },
  {
    name: 'name',
    message: 'Custom name which will be added to tab name',
    validate: required,
    default: (answers: QuestionsResult) => answers.branch || answers.sandbox,
    destined: {
      jobs: ['test'],
      projects: availableProjects,
      extended: false,
    },
  },
];

function adenToUpper(input: string) {
  if (input.indexOf('aden-') === 0) {
    return `ADEN-${input.slice(5)}`;
  }
  return input;
}

function required(input?: string): boolean | string {
  if (!!input) {
    return true;
  } else {
    return 'This file is required.';
  }
}

function currentBranch(): string | undefined {
  try {
    return branch.sync();
  } catch (e) {
    return undefined;
  }
}
