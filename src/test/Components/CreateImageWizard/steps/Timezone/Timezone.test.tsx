import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { timezoneCreateBlueprintRequest } from '../../../../fixtures/editMode';
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

const goToTimezoneStep = async () => {
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
};

const goToReviewStep = async () => {
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectTimezone = async () => {
  const user = userEvent.setup();
  const timezoneDropdown = await screen.findByPlaceholderText(
    /select a timezone/i
  );
  await waitFor(() => user.type(timezoneDropdown, 'Europe/Am'));
  const amsterdamTimezone = await screen.findByText('Europe/Amsterdam');
  await waitFor(() => user.click(amsterdamTimezone));
};

const addNtpServerViaKeyDown = async (ntpServer: string) => {
  const user = userEvent.setup();
  const ntpServersInput = await screen.findByPlaceholderText(
    /add ntp servers/i
  );
  await waitFor(() => user.type(ntpServersInput, ntpServer.concat(' ')));
};

const addNtpServerViaAddButton = async (ntpServer: string) => {
  const user = userEvent.setup();
  const ntpServersInput = await screen.findByPlaceholderText(
    /add ntp servers/i
  );
  const addServerBtn = await screen.findByRole('button', {
    name: /add ntp server/i,
  });
  await waitFor(() => user.type(ntpServersInput, ntpServer));
  await waitFor(() => user.click(addServerBtn));
};

const clearInput = async () => {
  const user = userEvent.setup();
  const clearInputBtn = await screen.findByRole('button', {
    name: /clear input/i,
  });
  await waitFor(() => user.click(clearInputBtn));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('timezone-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-timezone'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Timezone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Locale', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Locale',
    });
  });

  test('clicking Back loads Users', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Users' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await verifyCancelButton(router);
  });

  test('duplicate NTP server cannnot be added', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    expect(
      screen.queryByText('NTP server already exists.')
    ).not.toBeInTheDocument();
    await addNtpServerViaKeyDown('0.nl.pool.ntp.org');
    await addNtpServerViaKeyDown('0.nl.pool.ntp.org');
    await screen.findByText('NTP server already exists.');
    await clearInput();
    expect(
      screen.queryByText('NTP server already exists.')
    ).not.toBeInTheDocument();
    await addNtpServerViaAddButton('0.nl.pool.ntp.org');
    await screen.findByText('NTP server already exists.');
  });

  test('NTP server in an invalid format cannot be added', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addNtpServerViaKeyDown('this is not NTP server');
    await screen.findByText('Invalid format.');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await selectTimezone();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Timezone/ });
  });
});

describe('Timezone request generated correctly', () => {
  test('with timezone selected', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await selectTimezone();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        timezone: {
          timezone: 'Europe/Amsterdam',
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with NTP servers', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await addNtpServerViaKeyDown('0.nl.pool.ntp.org');
    await addNtpServerViaKeyDown('1.nl.pool.ntp.org');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        timezone: {
          ntpservers: ['0.nl.pool.ntp.org', '1.nl.pool.ntp.org'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with timezone and NTP servers', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await selectTimezone();
    await addNtpServerViaKeyDown('0.nl.pool.ntp.org');
    await addNtpServerViaKeyDown('1.nl.pool.ntp.org');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        timezone: {
          timezone: 'Europe/Amsterdam',
          ntpservers: ['0.nl.pool.ntp.org', '1.nl.pool.ntp.org'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Timezone edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['timezone'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = timezoneCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
