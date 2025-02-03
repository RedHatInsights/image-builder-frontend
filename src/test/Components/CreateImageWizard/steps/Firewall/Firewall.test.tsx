import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { firewallCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToFirewallStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
};

const goToReviewStep = async () => {
  await clickNext(); // Services
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const addPort = async (port: string) => {
  const user = userEvent.setup();
  const portsInput = await screen.findByPlaceholderText(/add port/i);
  await waitFor(() => user.type(portsInput, port.concat(' ')));
};

const addEnabledFirewallService = async (service: string) => {
  const user = userEvent.setup();
  const enabledServicesInput = await screen.findByPlaceholderText(
    /add enabled service/i
  );
  await waitFor(() => user.type(enabledServicesInput, service.concat(' ')));
};

const addDisabledFirewallService = async (service: string) => {
  const user = userEvent.setup();
  const disabledServiceInput = await screen.findByPlaceholderText(
    /add disabled service/i
  );
  await waitFor(() => user.type(disabledServiceInput, service.concat(' ')));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('firewall-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-firewall'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Firewall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Services', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Systemd services',
    });
  });

  test('clicking Back loads Kernel', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Kernel' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await verifyCancelButton(router);
  });

  test('duplicate ports cannnot be added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    expect(screen.queryByText('Port already exists.')).not.toBeInTheDocument();
    await addPort('22:tcp');
    await addPort('22:tcp');
    await screen.findByText('Port already exists.');
  });

  test('port in an invalid format cannot be added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addPort('00:wrongFormat');
    await screen.findByText('Invalid format.');
  });

  test('service in an invalid format cannot be added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addPort('wrong--service');
    await screen.findByText('Invalid format.');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await addPort('22:tcp');
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Firewall/ });
  });
});

describe('Firewall request generated correctly', () => {
  test('with ports added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await addPort('22:tcp');
    await addPort('imap:tcp');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        firewall: {
          ports: ['22:tcp', 'imap:tcp'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with services added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await addEnabledFirewallService('ftp');
    await addEnabledFirewallService('ntp');
    await addEnabledFirewallService('dhcp');
    await addDisabledFirewallService('telnet');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        firewall: {
          services: {
            enabled: ['ftp', 'ntp', 'dhcp'],
            disabled: ['telnet'],
          },
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with ports and services added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await addPort('22:tcp');
    await addPort('imap:tcp');
    await addEnabledFirewallService('ftp');
    await addEnabledFirewallService('ntp');
    await addEnabledFirewallService('dhcp');
    await addDisabledFirewallService('telnet');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        firewall: {
          ports: ['22:tcp', 'imap:tcp'],
          services: {
            enabled: ['ftp', 'ntp', 'dhcp'],
            disabled: ['telnet'],
          },
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Firewall edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['firewall'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = firewallCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
