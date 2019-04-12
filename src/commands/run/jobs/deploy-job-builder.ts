import { ParamsResult } from '../param-questions';
import { Project } from '../project-questions';
import { JobBuildDescriber } from './job-builder-result';

interface DeployJoAppParams {
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
    ['app', 'mediawiki-deploy-sandbox'],
    ['mobile-wiki', 'mobile-wiki-deploy-sandbox'],
  ]);

  build(projects: Project[], params: ParamsResult): JobBuildDescriber[] {
    return projects
      .filter(project => this.projectNameMap.has(project))
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
  ): DeployJoAppParams | DeployJobMobileWikiParams {
    switch (project) {
      case 'app':
        return {
          sandbox: input.sandbox,
          app_branch: input.branch,
          config_branch: input.configBranch,
          datacenter: input.datacenter || 'sjc',
          crowdin_branch: input.crowdinBranch,
          debug: input.debug || false,
        };

      case 'mobile-wiki':
        return {
          sandbox: input.sandbox,
          branch: input.branch,
          dc: input.datacenter || 'sjc',
          crowdin_branch: input.crowdinBranch,
        };
    }

    console.log('Aborting - Trying to build DeployJob with unknown Project');
    process.exit(1);
  }
}
