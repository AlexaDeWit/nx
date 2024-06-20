import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AggregatedLog } from '@nx/devkit/src/generators/plugin-migrations/aggregate-log-util';
import { buildPostTargetTransformer } from './build-post-target-transformer';

describe('buildPostTargetTransformer', () => {
  it('should migrate outputPath correctly', () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace();

    const targetConfiguration = {
      options: {
        outputPath: 'dist/apps/myapp',
      },
    };

    const inferredTargetConfiguration = {};

    const migrationLogs = new AggregatedLog();

    tree.write('apps/myapp/remix.config.js', remixConfig);
    tree.write('apps/myapp/package.json', `{"type": "module"}`);

    // ACT
    const target = buildPostTargetTransformer(migrationLogs)(
      targetConfiguration,
      tree,
      { projectName: 'myapp', root: 'apps/myapp' },
      inferredTargetConfiguration
    );

    // ASSERT
    const configFile = tree.read('apps/myapp/remix.config.js', 'utf-8');
    expect(configFile).toMatchInlineSnapshot(`
      "import { createWatchPaths } from '@nx/remix';
      import { dirname } from 'path';
      import { fileURLToPath } from 'url';
        
        // These options were migrated by @nx/remix:convert-to-inferred from the project.json file.
        const configValues = {"default":{"outputPath":"../../dist/apps/myapp"}};
        
        // Determine the correct configValue to use based on the configuration
        const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';
        
        const options = {
          ...configValues.default,
          ...(configValues[nxConfiguration] ?? {})
        }
        

      const __dirname = dirname(fileURLToPath(import.meta.url));

      /**
       * @type {import('@remix-run/dev').AppConfig}
       */
      export default {assetsBuildDirectory: options.outputPath + "/public/build",serverBuildPath: options.outputPath + "/build/index.js",
        ignoredRouteFiles: ['**/.*'],
        // appDirectory: "app",
        // assetsBuildDirectory: "public/build",
        // serverBuildPath: "build/index.js",
        // publicPath: "/build/",
        watchPaths: () => createWatchPaths(__dirname),
      };"
    `);
    expect(target).toMatchInlineSnapshot(`
      {
        "options": {},
      }
    `);
  });

  it('should handle configurations correctly', () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace();

    const targetConfiguration = {
      options: {
        outputPath: 'dist/apps/myapp',
      },
      configurations: {
        dev: {
          outputPath: 'dist/dev/apps/myapp',
        },
      },
    };

    const inferredTargetConfiguration = {};

    const migrationLogs = new AggregatedLog();

    tree.write('apps/myapp/remix.config.js', remixConfig);
    tree.write('apps/myapp/package.json', `{"type": "module"}`);

    // ACT
    const target = buildPostTargetTransformer(migrationLogs)(
      targetConfiguration,
      tree,
      { projectName: 'myapp', root: 'apps/myapp' },
      inferredTargetConfiguration
    );

    // ASSERT
    const configFile = tree.read('apps/myapp/remix.config.js', 'utf-8');
    expect(configFile).toMatchInlineSnapshot(`
      "import { createWatchPaths } from '@nx/remix';
      import { dirname } from 'path';
      import { fileURLToPath } from 'url';
        
        // These options were migrated by @nx/remix:convert-to-inferred from the project.json file.
        const configValues = {"default":{"outputPath":"../../dist/apps/myapp"},"dev":{"outputPath":"../../dist/dev/apps/myapp"}};
        
        // Determine the correct configValue to use based on the configuration
        const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';
        
        const options = {
          ...configValues.default,
          ...(configValues[nxConfiguration] ?? {})
        }
        

      const __dirname = dirname(fileURLToPath(import.meta.url));

      /**
       * @type {import('@remix-run/dev').AppConfig}
       */
      export default {assetsBuildDirectory: options.outputPath + "/public/build",serverBuildPath: options.outputPath + "/build/index.js",
        ignoredRouteFiles: ['**/.*'],
        // appDirectory: "app",
        // assetsBuildDirectory: "public/build",
        // serverBuildPath: "build/index.js",
        // publicPath: "/build/",
        watchPaths: () => createWatchPaths(__dirname),
      };"
    `);
    expect(target).toMatchInlineSnapshot(`
      {
        "configurations": {
          "dev": {},
        },
        "options": {},
      }
    `);
  });
});

const remixConfig = `import { createWatchPaths } from '@nx/remix';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  watchPaths: () => createWatchPaths(__dirname),
};`;
