import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

import { server } from './mocks/server';
import 'vitest-canvas-mock';

// scrollTo is not defined in jsdom - needed for the navigation to the wizard
window.HTMLElement.prototype.scrollTo = function () {};

// ResizeObserver is not defined and needs to be mocked and stubbed
const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', MockResizeObserver);

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    auth: {
      getUser: () => {
        return {
          identity: {
            internal: {
              org_id: 5,
            },
          },
        };
      },
    },
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
  default: () => ({
    analytics: {
      track: () => 'test',
    },
  }),
}));

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.import.enabled':
        return true;
      case 'image-builder.firstboot.enabled':
        return true;
      case 'image-builder.snapshots.enabled':
        return true;
      case 'image-builder.wsl.enabled':
        return true;
      case 'image-builder.pkgrecs.enabled':
        return true;
      case 'edgeParity.image-list':
        return true;
      case 'image-builder.edge.local-image-table':
        return true;
      default:
        return false;
    }
  }),
}));

// Remove DOM dump from the testing-library output
configure({
  getElementError: (message: string) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = '';
    return error;
  },
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
