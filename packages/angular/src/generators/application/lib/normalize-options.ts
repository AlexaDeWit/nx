import {
  getWorkspacePath,
  joinPathFragments,
  readJson,
  Tree,
} from '@nrwl/devkit';
import type { Schema } from '../schema';
import type { NormalizedSchema } from './normalized-schema';

import { names, getWorkspaceLayout } from '@nrwl/devkit';
import { E2eTestRunner, UnitTestRunner } from '../../../utils/test-runners';
import { Linter } from '@nrwl/linter';
import {
  normalizeDirectory,
  normalizePrefix,
  normalizeProjectName,
} from '../../utils/project';

export function normalizeOptions(
  host: Tree,
  options: Partial<Schema>
): NormalizedSchema {
  const appDirectory = normalizeDirectory(options.name, options.directory);
  const appProjectName = normalizeProjectName(options.name, options.directory);
  const e2eProjectName = options.rootProject
    ? 'e2e'
    : `${names(options.name).fileName}-e2e`;

  const { appsDir, npmScope, standaloneAsDefault } = getWorkspaceLayout(host);
  const appProjectRoot = options.rootProject
    ? '.'
    : joinPathFragments(appsDir, appDirectory);
  const e2eProjectRoot = options.rootProject
    ? 'e2e'
    : joinPathFragments(appsDir, `${appDirectory}-e2e`);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const prefix = normalizePrefix(options.prefix, npmScope);

  options.standaloneConfig = options.standaloneConfig ?? standaloneAsDefault;

  // Determine the roots where @schematics/angular will place the projects
  // This might not be where the projects actually end up
  const workspaceJsonPath = getWorkspacePath(host);
  let newProjectRoot = null;
  if (workspaceJsonPath) {
    ({ newProjectRoot } = readJson(host, workspaceJsonPath));
  }
  const ngCliSchematicAppRoot = newProjectRoot
    ? `${newProjectRoot}/${appProjectName}`
    : appProjectName;
  const ngCliSchematicE2ERoot = newProjectRoot
    ? `${newProjectRoot}/${e2eProjectName}`
    : `${appProjectName}/e2e`;

  // Set defaults and then overwrite with user options
  return {
    style: 'css',
    routing: false,
    inlineStyle: false,
    inlineTemplate: false,
    skipTests: false,
    skipFormat: false,
    unitTestRunner: UnitTestRunner.Jest,
    e2eTestRunner: E2eTestRunner.Cypress,
    linter: Linter.EsLint,
    strict: true,
    ...options,
    prefix,
    name: appProjectName,
    appProjectRoot,
    e2eProjectRoot,
    e2eProjectName,
    parsedTags,
    ngCliSchematicAppRoot,
    ngCliSchematicE2ERoot,
  };
}
