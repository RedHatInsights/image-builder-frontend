import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  baseCreateBlueprintRequest,
  expectedFilesystemCisL2,
  expectedKernelCisL2,
  expectedOpenscapCisL2,
  expectedPackagesCisL2,
  expectedServicesCisL2,
  oscapCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import {
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  selectGuestImageTarget,
} from '../../wizardTestUtils';
import {
  clickNext,
  clickReviewAndFinish,
  goToOscapStep,
} from '../../wizardTestUtils';

const selectRhel8 = async () => {
  const user = userEvent.setup();
  await waitFor(async () =>
    user.click(
      screen.getAllByRole('button', {
        name: /options menu/i,
      })[0]
    )
  );
  const rhel8 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 8/i,
  });
  await waitFor(async () => user.click(rhel8));
};

const selectImageInstallerTarget = async () => {
  const user = userEvent.setup();
  const imageInstallerCheckbox = await screen.findByTestId(
    'checkbox-image-installer'
  );
  await waitFor(() => user.click(imageInstallerCheckbox));
};

const selectWslTarget = async () => {
  const user = userEvent.setup();
  const wslCheckBox = await screen.findByTestId('checkbox-wsl');
  await waitFor(() => user.click(wslCheckBox));
};

const selectProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const cis1Profile = await screen.findByText(
    /cis red hat enterprise linux 8 benchmark for level 1 - workstation/i
  );
  await waitFor(() => user.click(cis1Profile));
};

const selectDifferentProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const cis2Profile = await screen.findByText(
    /cis red hat enterprise linux 8 benchmark for level 2 - workstation/i
  );
  await waitFor(() => user.click(cis2Profile));
};

const selectNone = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  await waitFor(async () => user.click(await screen.findByText(/none/i)));
};

const goToReviewStep = async () => {
  await clickNext(); // File system configuration
  await clickNext(); // Snapshot repositories
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // FirstBoot
  await clickNext(); // Details
  await enterBlueprintName('Oscap test');
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('oscap-detail-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-openscap'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step OpenSCAP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('create an image with None OpenSCAP profile', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectNone();

    // check that the FSC does not contain a /tmp partition
    await clickNext();
    await screen.findByRole('heading', { name: /File system configuration/i });
    expect(
      screen.queryByRole('cell', {
        name: /tmp/i,
      })
    ).not.toBeInTheDocument();

    await clickNext(); // skip Snapshots
    await clickNext(); // skip Repositories

    // check that there are no Packages contained when selecting the "None" profile option
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    await screen.findByText(
      /Search above to add additionalpackages to your image/
    );
  });

  test('create an image with an OpenSCAP profile', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectProfile();

    await screen.findByText(/disabled services:/i);
    await screen.findByText(
      /rpcbind autofs nftables nfs-server emacs-service/i
    );
    await screen.findByText(/enabled services:/i);
    await screen.findByText(/crond/i);

    // check that the FSC contains a /tmp partition
    await clickNext();
    await screen.findByRole('heading', { name: /File system configuration/i });
    await screen.findByText(/tmp/i);

    await clickNext(); // skip Snapshots
    await clickNext(); // skip Repositories

    // check that the Packages contains correct packages
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    const selected = await screen.findByText(/Selected/);
    user.click(selected);
    await screen.findByText(/aide/i);
    await screen.findByText(/neovim/i);
  });

  test('dropdown is disabled for WSL targets only', async () => {
    await renderCreateMode();
    await selectRhel8();
    await selectWslTarget();
    await goToOscapStep();
    await screen.findByText(
      /OpenSCAP profiles are not compatible with WSL images/i
    );
    expect(
      await screen.findByRole('textbox', { name: /select a profile/i })
    ).toBeDisabled();
  });

  test('alert displayed and OpenSCAP dropdown enabled when targets include WSL', async () => {
    await renderCreateMode();
    await selectRhel8();
    await selectImageInstallerTarget();
    await selectWslTarget();
    await goToOscapStep();
    await screen.findByText(
      /OpenSCAP profiles are not compatible with WSL images/i
    );
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /select a profile/i })
      ).toBeEnabled();
    });
  });

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });
});

describe('OpenSCAP request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('add a profile', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectProfile();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...oscapCreateBlueprintRequest,
      name: 'Oscap test',
    };
    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('remove a profile', { retry: 3, timeout: 20000 }, async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectProfile();
    await selectNone();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...baseCreateBlueprintRequest,
      name: 'Oscap test',
    };
    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('change profile', { retry: 3, timeout: 20000 }, async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectProfile();
    await selectDifferentProfile();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...baseCreateBlueprintRequest,
      customizations: {
        packages: expectedPackagesCisL2,
        openscap: expectedOpenscapCisL2,
        services: expectedServicesCisL2,
        kernel: expectedKernelCisL2,
        filesystem: expectedFilesystemCisL2,
      },
      name: 'Oscap test',
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectProfile();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /OpenSCAP/ });
  });
});

describe('OpenSCAP edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  test('edit mode works', async () => {
    const id = mockBlueprintIds['oscap'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = oscapCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('fsc and packages get populated on edit', async () => {
    const id = mockBlueprintIds['oscap'];
    await renderEditMode(id);

    // check that the FSC contains a /tmp partition
    const fscBtns = await screen.findAllByRole('button', {
      name: /file system configuration/i,
    });
    user.click(fscBtns[0]);
    await screen.findByRole('heading', { name: /file system configuration/i });
    await screen.findByText('/tmp');
    // check that the Packages contain neovim package
    const packagesNavBtn = await screen.findByRole('button', {
      name: /additional packages/i,
    });
    user.click(packagesNavBtn);
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    const selectedBtn = await screen.findByRole('button', {
      name: /Selected/i,
    });
    user.click(selectedBtn);
    await screen.findByText('neovim');
  });
});
