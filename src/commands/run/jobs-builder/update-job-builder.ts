import { ParamsResult } from '../param-questions.model';
import { Project } from '../project-questions';
import { JobBuildDescriber } from './job-builder-result';

interface UpdateJobParams {
  branch: string;
  adengine_version: string;
}

export class UpdateJobBuilder {
  private projectNameMap = new Map<Project, string>([
    ['app', 'update_dependencies_app'],
    ['mobile-wiki', 'update_dependencies_mobilewiki'],
    ['f2', 'update_dependencies_f2'],
  ]);

  build(projects: Project[], params: ParamsResult): JobBuildDescriber[] {
    const parameters: UpdateJobParams = this.mapProjectParams(params);

    return projects
      .filter(project => this.projectNameMap.has(project))
      .map((project: Project) => ({
        displayName: project,
        opts: {
          name: this.mapProjectName(project),
          parameters,
        },
      }));
  }

  private mapProjectName(input: Project): string {
    return this.projectNameMap.get(input);
  }

  private mapProjectParams(input: ParamsResult): UpdateJobParams {
    return {
      branch: input.branch,
      adengine_version: input.adEngineVersion,
    };
  }
}
