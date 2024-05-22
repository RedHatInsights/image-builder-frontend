import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import '@testing-library/jest-dom';
import { renderWithReduxRouter } from '../../test/testUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'stage',
  }),
}));

window.HTMLElement.prototype.scrollTo = function () {};

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) => {
    switch (flag) {
      case 'image-builder.import.enabled':
        return true;
      case 'image-builder.new-wizard.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const BLUEPRINT_JSON = `{
    "customizations": {
      "files": [
      ],
      "kernel": {
      },
      "openscap": {
      },
      "packages": [
        "aide",
        "sudo",
        "audit",
        "rsyslog",
        "firewalld",
        "nftables",
        "libselinux"
      ],
      "services": {
        "enabled": [
          "crond",
          "firewalld",
          "systemd-journald",
          "rsyslog",
          "auditd"
        ]
      },
      "subscription": {
      }
    },
    "description": "Tested blueprint",
    "distribution": "rhel-93",
    "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
    "image_requests": [
      {
        "architecture": "aarch64",
        "image_type": "aws",
        "upload_request": {
          "options": {
            "share_with_sources": [
              "473980"
            ]
          },
          "type": "aws"
        }
      }
    ],
    "name": "Blueprint test"
  }`;

const INVALID_JSON = `{
  "name": "Blueprint test"
}`;

const INVALID_ARCHITECTURE_JSON = `{
    "customizations": {
      "files": [
      ],
      "kernel": {
      },
      "openscap": {
      },
      "packages": [
        "aide",
        "sudo",
        "audit",
        "rsyslog",
        "firewalld",
        "nftables",
        "libselinux"
      ],
      "services": {
        "enabled": [
          "crond",
          "firewalld",
          "systemd-journald",
          "rsyslog",
          "auditd"
        ]
      },
      "subscription": {
      }
    },
    "description": "Tested blueprint",
    "distribution": "rhel-93",
    "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
    "image_requests": [
      {
        "architecture": "aaaaa",
        "image_type": "aws",
        "upload_request": {
          "options": {
            "share_with_sources": [
              "473980"
            ]
          },
          "type": "aws"
        }
      }
    ],
    "name": "Blueprint test"
  }`;

const INVALID_IMAGE_TYPE_JSON = `{
    "customizations": {
      "files": [
      ],
      "kernel": {
      },
      "openscap": {
      },
      "packages": [
        "aide",
        "sudo",
        "audit",
        "rsyslog",
        "firewalld",
        "nftables",
        "libselinux"
      ],
      "services": {
        "enabled": [
          "crond",
          "firewalld",
          "systemd-journald",
          "rsyslog",
          "auditd"
        ]
      },
      "subscription": {
      }
    },
    "description": "Tested blueprint",
    "distribution": "rhel-93",
    "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
    "image_requests": [
      {
        "architecture": "aaaaa",
        "image_type": "aws",
        "upload_request": {
          "options": {
            "share_with_sources": [
              "473980"
            ]
          },
          "type": "aws"
        }
      }
    ],
    "name": "Blueprint test"
  }`;

const uploadFile = async (filename: string, content: string): Promise<void> => {
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([content], filename, { type: 'application/json' });
    await userEvent.upload(fileInput, file);
  }
};

describe('Import model', () => {
  const user = userEvent.setup();

  test('renders import component', async () => {
    renderWithReduxRouter('', {});
    const importButton = await screen.findByTestId('import-blueprint-button');
    await waitFor(() => expect(importButton).toBeInTheDocument());
  });

  const setUp = async () => {
    renderWithReduxRouter('', {});
    await user.click(await screen.findByTestId('import-blueprint-button'));
    const reviewButton = await screen.findByRole('button', {
      name: /review and finish/i,
    });
    expect(reviewButton).toHaveClass('pf-m-disabled');
  };

  test('should show alert on invalid blueprint', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    expect(helperText).toBeInTheDocument();
  });

  test('should show alert on invalid blueprint incorrect architecture', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_ARCHITECTURE_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    expect(helperText).toBeInTheDocument();
  });

  test('should show alert on invalid blueprint incorrect image type', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_IMAGE_TYPE_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    expect(helperText).toBeInTheDocument();
  });

  test('should enable button on correct blueprint', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, BLUEPRINT_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    await waitFor(() => expect(reviewButton).not.toHaveClass('pf-m-disabled'));

    await userEvent.click(reviewButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Image output' })
      ).toBeInTheDocument();
    });
  });
});
