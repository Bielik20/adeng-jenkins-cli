import { ParamsResult } from '../questions/param-questions.model';
import { Project } from '../questions/project-questions';
import { JobDescriptor } from './models';

interface DeployJobAppParams {
  sandbox: string;
  app_branch: string;
  config_branch: string;
  datacenter: string;
  crowdin_branch: string;
  debug: boolean;
}

interface DeployJobMobileWikiParams {
  sandbox: string;
  branch: string;
  dc: string;
  crowdin_branch: string;
}

export class DeployJobBuilder {
  private projectNameMap = new Map<Project, string>([
    ['app', 'mediawiki-deploy-sandbox-ucp'],
    ['mobile-wiki', 'mobile-wiki-deploy-sandbox'],
  ]);

  build(projects: Project[], params: ParamsResult): JobDescriptor[] {
    return projects
      .filter((project: Project) => this.projectNameMap.has(project))
      .map((project: Project) => ({
        displayName: project,
        opts: {
          name: this.mapProjectName(project),
          parameters: this.mapProjectParams(project, params),
        },
      }));
  }

  private mapProjectName(input: Project): string {
    return this.projectNameMap.get(input);
  }

  private mapProjectParams(
    project: Project,
    input: ParamsResult,
  ): DeployJobAppParams | DeployJobMobileWikiParams {
    switch (project) {
      case 'app':
        return {
          sandbox: input.sandbox,
          app_branch: input.branch,
          config_branch: input.configBranch,
          datacenter: input.datacenter,
          crowdin_branch: input.crowdinBranch,
          debug: input.debug,
        };

      case 'mobile-wiki':
        return {
          sandbox: input.sandbox,
          branch: input.branch,
          dc: input.datacenter,
          crowdin_branch: input.crowdinBranch,
        };
    }

    console.log('Aborting - Trying to build DeployJob with unknown Project');
    process.exit(1);
  }
}
