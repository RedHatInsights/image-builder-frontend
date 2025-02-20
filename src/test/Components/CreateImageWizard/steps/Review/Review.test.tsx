import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  clickBack,
  clickNext,
  clickRegisterLater,
  renderCreateMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const selectGuestImage = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const setupWithRhel = async () => {
  await renderCreateMode();
  await selectGuestImage();
};

const setupWithCentos = async () => {
  const user = userEvent.setup();
  await renderCreateMode();
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[0];

  await waitFor(() => user.click(releaseMenu));
  const showOptionsButton = await screen.findByRole('button', {
    name: 'Show options for further development of RHEL',
  });
  await waitFor(() => user.click(showOptionsButton));

  const centos = await screen.findByRole('option', {
    name: 'CentOS Stream 9',
  });
  await waitFor(() => user.click(centos));
  await selectGuestImage();
};

const handleRegistration = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
};

const goToReviewStep = async () => {
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Repository snapshot
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // First boot script
  await clickNext(); // Details
  await clickNext(); // Review
};

describe('Step Review', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('has 3 buttons', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReviewStep();
    await screen.findByRole('button', { name: /Create blueprint/ });
    await screen.findByRole('button', { name: /Back/ });
    await screen.findByRole('button', { name: /Cancel/ });
  });

  test('clicking Back loads Image name', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReviewStep();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Details',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReviewStep();
    await verifyCancelButton(router);
  });

  test('has Registration expandable section for rhel', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReviewStep();

    await screen.findByRole('heading', { name: /Review/ });
    const registrationExpandable = await screen.findByTestId(
      'registration-expandable'
    );
    await within(registrationExpandable).findByText('Registration type');
    await within(registrationExpandable).findByText(
      'Register the system later'
    );
  });

  test('has no Registration expandable for centos', async () => {
    await setupWithCentos();
    await goToReviewStep();

    await screen.findByRole('heading', { name: /Review/ });
    expect(
      screen.queryByTestId('registration-expandable')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Registration type')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Register the system later')
    ).not.toBeInTheDocument();
  });
});
