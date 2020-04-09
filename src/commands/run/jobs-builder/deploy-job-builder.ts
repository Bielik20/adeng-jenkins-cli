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

export class DeployJobBuilder {
  private projectNameMap = new Map<Project, string>([
    ['ucp', 'mediawiki-deploy-sandbox-ucp'],
    ['app', 'mediawiki-deploy-sandbox-ucp'],
    ['mobile-wiki', 'mobile-wiki-deploy-sandbox'],
  ]);

  build(projects: Project[], params: ParamsResult): JobDescriptor[] {
    const mappedProjects = projects
      .filter((project: Project) => this.projectNameMap.has(project))
      .map((project: Project) => ({
        displayName: project,
        opts: {
          name: this.mapProjectName(project),
          parameters: this.mapProjectParams(project, params),
        },
      }));

    return this.mergeDoubledProjects(mappedProjects);
  }

  private mergeDoubledProjects(projects: JobDescriptor[]): JobDescriptor[] {
    const filteredProjects = new Map<string, JobDescriptor>();

    projects.forEach(project => {
      const currentProject = filteredProjects.get(project.opts.name);

      if (currentProject) {
        Object.keys(project.opts.parameters).forEach(key => {
          if (
            project.opts.parameters[key] !== currentProject.opts.parameters[key] &&
            key.includes(project.displayName)
          ) {
            currentProject.opts.parameters[key] = project.opts.parameters[key];
          }
        });
      }

      filteredProjects.set(project.opts.name, currentProject || project);
    });

    return [...filteredProjects.values()];
  }

  private mapProjectName(input: Project): string {
    return this.projectNameMap.get(input);
  }

  private mapProjectParams(
    project: Project,
    input: ParamsResult,
  ): DeployJobAppAndUcpParams | DeployJobMobileWikiParams {
    switch (project) {
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
    }

    console.log('Aborting - Trying to build DeployJob with unknown Project');
    process.exit(1);
  }
}
