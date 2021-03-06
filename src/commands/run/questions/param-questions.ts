import * as inquirer from 'inquirer';
import { sandboxes } from '../../../utils/sandbox';
import { store } from '../../../utils/store';
import { Job } from './job-questions';
import { ParamsResult } from './param-questions.model';
import { availableProjects, Project } from './project-questions';
import {
  adenToUpper,
  currentBranch,
  replaceLatestWithAdEngineVersion,
  requiredInput,
} from './question-helpers';

interface FilterParamQuestion extends inquirer.Question {
  name: keyof ParamsResult;
  destined: {
    jobs: Job[];
    projects: Project[];
    extended: boolean;
  };
}

export async function promptParams(
  jobs: Job[],
  projects: Project[],
  extended: boolean,
): Promise<ParamsResult> {
  const paramQuestions: inquirer.Questions = getParamQuestions(jobs, projects, extended);
  const result: ParamsResult = await inquirer.prompt<ParamsResult>(paramQuestions);

  result.datacenter = result.datacenter || 'sjc';
  result.debug = typeof result.debug === 'boolean' ? result.debug : true;
  result.fandomEnvironment = result.fandomEnvironment || 'sandbox-adeng';
  result.configBranch = result.configBranch || 'dev';

  return result;
}

function getParamQuestions(
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

const questions: FilterParamQuestion[] = [
  {
    name: 'branch',
    message: 'Project branch',
    validate: requiredInput,
    filter: adenToUpper,
    transformer: adenToUpper,
    default: currentBranch,
    destined: {
      jobs: ['update', 'deploy'],
      projects: availableProjects.filter(project => project !== 'platforms'),
      extended: false,
    },
  },
  {
    name: 'adEngineVersion',
    message: 'Version of @wikia/ad-engine (can be "latest")',
    validate: requiredInput,
    filter: replaceLatestWithAdEngineVersion,
    default: (answers: ParamsResult) => answers.branch,
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
    validate: requiredInput,
    choices: sandboxes,
    pageSize: sandboxes.length,
    default: store.sandbox,
    destined: {
      jobs: ['deploy', 'test'],
      projects: ['ucp', 'app', 'mobile-wiki', 'f2'],
      extended: false,
    },
  },
  {
    name: 'configBranch',
    message: 'Config branch e.g. release-01, PLAT-345',
    default: 'dev',
    destined: {
      jobs: ['update'],
      projects: ['app'],
      extended: true,
    },
  },
  {
    name: 'datacenter',
    message: 'Datacenter',
    validate: requiredInput,
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
    default: true,
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
      projects: ['app', 'mobile-wiki', 'f2'],
      extended: true,
    },
  },
  {
    name: 'query',
    message: 'Url params',
    default: `cb=${+new Date()}`,
    destined: {
      jobs: ['test'],
      projects: ['app', 'mobile-wiki', 'f2'],
      extended: false,
    },
  },
  {
    name: 'fandomEnvironment',
    message: 'Environment for Fandom ( Upstream) tests',
    default: 'sandbox-adeng',
    destined: {
      jobs: ['test'],
      projects: ['app', 'mobile-wiki', 'f2'],
      extended: true,
    },
  },
  {
    name: 'extension',
    message: 'Additional browser extenstions e.g. adblock',
    destined: {
      jobs: ['test'],
      projects: ['app', 'mobile-wiki', 'f2'],
      extended: true,
    },
  },
  {
    name: 'name',
    message: 'Custom name which will be added to tab name',
    validate: requiredInput,
    default: (answers: ParamsResult) => {
      const userInitials: string = store.username.slice(0, 2);

      return answers.branch
        ? `${answers.branch}-${userInitials}`
        : `${answers.sandbox}-${userInitials}`;
    },
    destined: {
      jobs: ['test'],
      projects: ['app', 'mobile-wiki', 'f2'],
      extended: false,
    },
  },
  {
    name: 'platformsBranch',
    message: 'Platform branch',
    validate: requiredInput,
    filter: adenToUpper,
    transformer: adenToUpper,
    destined: {
      jobs: ['deploy'],
      projects: ['platforms'],
      extended: false,
    },
  },
];
