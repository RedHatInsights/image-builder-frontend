import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  clickBack,
  clickNext,
  enterBlueprintName,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToKernelStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
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
};

const goToReviewStep = async () => {
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectKernelName = async (kernelName: string) => {
  const user = userEvent.setup();
  const kernelNameDropdown = await screen.findByTestId('kernel-name-dropdown');
  await waitFor(() => user.click(kernelNameDropdown));

  const kernelOption = await screen.findByText(kernelName);
  await waitFor(() => user.click(kernelOption));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('kernel-expandable');
  const revisitButton = await within(expandable).findByTestId('revisit-kernel');
  await waitFor(() => user.click(revisitButton));
};

describe('Step Kernel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Firewall', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Firewall',
    });
  });

  test('clicking Back loads Hostname', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Hostname' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await verifyCancelButton(router);
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await selectKernelName('kernel');
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Kernel/ });
  });
});

// TO DO 'Kernel request generated correctly'
// TO DO 'Kernel edit mode'
