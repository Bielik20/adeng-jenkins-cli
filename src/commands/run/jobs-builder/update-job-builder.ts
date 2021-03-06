import { ParamsResult } from '../questions/param-questions.model';
import { Project } from '../questions/project-questions';
import { JobDescriptor } from './models';

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

  build(projects: Project[], params: ParamsResult): JobDescriptor[] {
    const parameters: UpdateJobParams = this.mapProjectParams(params);

    return projects
      .filter((project: Project) => this.projectNameMap.has(project))
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
