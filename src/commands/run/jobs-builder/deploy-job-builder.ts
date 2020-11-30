import { ParamsResult } from '../questions/param-questions.model';
import { Project } from '../questions/project-questions';
import { JobDescriptor } from './models';

interface DeployJobAppAndUcpParams {
  sandbox: string;
  ucp_branch: string;
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

interface DeployPlatformsParams {
  BRANCH: string;
}

type DeployProject = Project | 'app-ucp';

export class DeployJobBuilder {
  private projectNameMap = new Map<DeployProject, string>([
    ['app-ucp', 'mediawiki-deploy-sandbox-ucp'],
    ['ucp', 'mediawiki-deploy-sandbox-ucp'],
    ['app', 'mediawiki-deploy-sandbox-ucp'],
    ['mobile-wiki', 'mobile-wiki-deploy-sandbox'],
    ['platforms', 'ad_engine_platforms_deploy_branch'],
  ]);

  build(projects: Project[], params: ParamsResult): JobDescriptor[] {
    const deployProjects = this.parseDeployProject(projects);

    return deployProjects
      .filter((project: Project) => this.projectNameMap.has(project))
      .map((project: Project) => ({
        displayName: project,
        opts: {
          name: this.mapProjectName(project),
          parameters: this.mapProjectParams(project, params),
        },
      }));
  }

  private parseDeployProject(projects: Project[]): DeployProject[] {
    if (projects.includes('app') && projects.includes('ucp')) {
      return ['app-ucp', ...projects.filter(project => !['app', 'ucp'].includes(project))];
    }
    return projects;
  }

  private mapProjectName(input: Project): string {
    return this.projectNameMap.get(input);
  }

  private mapProjectParams(
    project: DeployProject,
    input: ParamsResult,
  ): DeployJobAppAndUcpParams | DeployJobMobileWikiParams | DeployPlatformsParams {
    switch (project) {
      case 'app-ucp':
        return {
          sandbox: input.sandbox,
          ucp_branch: input.branch,
          app_branch: input.branch,
          config_branch: input.configBranch,
          datacenter: input.datacenter,
          crowdin_branch: input.crowdinBranch,
          debug: input.debug,
        };

      case 'ucp':
        return {
          sandbox: input.sandbox,
          ucp_branch: input.branch,
          app_branch: 'dev',
          config_branch: input.configBranch,
          datacenter: input.datacenter,
          crowdin_branch: input.crowdinBranch,
          debug: input.debug,
        };

      case 'app':
        return {
          sandbox: input.sandbox,
          ucp_branch: 'master',
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

      case 'platforms':
        return {
          BRANCH: input.branch,
        };
    }

    console.log('Aborting - Trying to build DeployJob with unknown Project');
    process.exit(1);
  }
}
