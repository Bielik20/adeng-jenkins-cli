import { ParamsResult } from '../param-questions.model';
import { Project } from '../project-questions';
import { JobDescriber } from './models';

interface TestJobParams {
  env: string;
  branch: string;
  qs: string;
  'fandom-env': string;
  extension: string;
  'custom-name': string;
  'tabs-to-trigger': string;
}

export class TestJobBuilder {
  private projectNameMap = new Map<Project, string>([
    ['app', 'ads-app-preview'],
    ['mobile-wiki', 'ads-mobile-wiki-preview'],
    ['f2', 'ads-news-and-stories-prod'],
  ]);

  build(projects: Project[], params: ParamsResult): JobDescriber[] {
    const result: JobDescriber = {
      displayName: projects.join(', ') as any,
      opts: {
        name: 'ads-synthetic-run',
        parameters: this.mapParams(projects, params),
      },
    };

    return [result];
  }

  private mapParams(projects: Project[], params: ParamsResult): TestJobParams {
    return {
      env: params.sandbox,
      branch: params.testBranch,
      qs: params.query,
      'fandom-env': params.fandomEnvironment,
      extension: params.extension,
      'custom-name': params.name,
      'tabs-to-trigger': this.mapTagsToTrigger(projects),
    };
  }

  private mapTagsToTrigger(projects: Project[]): string {
    return projects
      .map((project: Project) => this.projectNameMap.get(project))
      .filter((value: string) => !!value)
      .join(' ');
  }
}
