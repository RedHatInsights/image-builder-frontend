import path from 'path';

import react from '@vitejs/plugin-react';

const config = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
    },
    server: {
      deps: {
        inline: ['vitest-canvas-mock', '@patternfly', '@monaco-editor'],
      },
    },
    testTimeout: 10000,
    fileParallelism: false,
    exclude: ['./pkg/lib/**', '**/node_modules/**', '**/dist/**', './playwright/**'],
    retry: 3,
  },
  reporters: ['default', 'junit'],
  outputFile: {
    junit: './coverage/junit.xml',
  },
  resolve: {
    mainFields: ['module'],
    alias: {
      // we have to point vitest to the mocks for `cockpit` and `cockpit/fsinfo`
      // by using aliases. This allows vitest to resolve these two packages
      // and allows the tests to pass
      cockpit: path.resolve(__dirname, 'src/test/mocks/cockpit'),
      'cockpit/fsinfo': path.resolve(
        __dirname,
        'src/test/mocks/cockpit/fsinfo'
      ),
      'os-release': path.resolve(__dirname, 'src/test/mocks/os-release'),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
};

export default config;
