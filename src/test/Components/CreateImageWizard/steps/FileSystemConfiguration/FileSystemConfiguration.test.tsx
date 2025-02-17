import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  UNIT_GIB,
  UNIT_KIB,
  UNIT_MIB,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { fscCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  clickNext,
  clickReviewAndFinish,
  getNextButton,
} from '../../wizardTestUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const selectGuestImage = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const selectImageInstaller = async () => {
  const user = userEvent.setup();
  const imageInstallerCheckbox = await screen.findByTestId(
    'checkbox-image-installer'
  );
  await waitFor(() => user.click(imageInstallerCheckbox));
};

const goToFileSystemConfigurationStep = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
};

const clickManuallyConfigurePartitions = async () => {
  const user = userEvent.setup();
  const button = await screen.findByText(/manually configure partitions/i);
  await waitFor(() => user.click(button));
};

const addPartition = async () => {
  const user = userEvent.setup();
  const button = await screen.findByRole('button', { name: /add partition/i });
  await waitFor(() => user.click(button));
};

const customizePartition = async () => {
  const user = userEvent.setup();
  const row = await getRow(2);
  const minSize = await within(row).findByRole('textbox', {
    name: /mountpoint suffix/i,
  });
  await waitFor(() => user.type(minSize, 'cakerecipes'));
};

const getRow = async (row: number) => {
  const table = await screen.findByTestId('fsc-table');
  const rows = await within(table).findAllByRole('row');
  return rows[row];
};

const changePartitionSize = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const minSize = await within(row).findByRole('textbox', {
    name: /minimum partition size/i,
  });
  await waitFor(() => user.type(minSize, '{backspace}5'));
};

const changePartitionUnitsToKiB = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const units = await within(row).findByTestId('unit-select');
  await waitFor(() => user.click(units));
  const kibOption = await screen.findByRole('option', { name: 'KiB' });
  await waitFor(() => user.click(kibOption));
};

const changePartitionUnitsToMiB = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const units = await within(row).findByTestId('unit-select');
  await waitFor(() => user.click(units));
  const mibOption = await screen.findByRole('option', { name: 'MiB' });
  await waitFor(() => user.click(mibOption));
};

const goToReviewStep = async () => {
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
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId(
    'file-system-configuration-expandable'
  );
  const revisitButton = await within(expandable).findByTestId(
    'revisit-file-system'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step File system configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('button Review and finish is disabled for invalid state', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    // Create duplicate partitions
    await addPartition();
    await addPartition();

    await clickReviewAndFinish();
    expect(
      await screen.findByRole('button', { name: /Review and finish/ })
    ).toBeDisabled();
  });

  test('error validation occurs upon clicking next button', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    // Create duplicate partitions
    await addPartition();
    await addPartition();

    // Clicking next causes errors to appear
    await clickNext();
    expect(await getNextButton()).toBeDisabled();
    const mountPointAlerts = screen.getAllByRole('heading', {
      name: /danger alert: duplicate mount point/i,
    });
    const fscTable = await screen.findByTestId(
      'file-system-configuration-tbody'
    );
    const rows = within(fscTable).getAllByRole('row');
    expect(rows).toHaveLength(3);

    //Change mountpoint of final row to /var, resolving errors
    const mountPointOptions = await within(rows[2]).findByTestId(
      'prefix-select'
    );
    user.click(mountPointOptions);
    const varButton = await within(rows[2]).findByRole('option', {
      name: '/var',
    });
    user.click(varButton);
    await waitFor(() => expect(mountPointAlerts[0]).not.toBeInTheDocument());
    await waitFor(() => expect(mountPointAlerts[1]).not.toBeInTheDocument());
    expect(await getNextButton()).toBeEnabled();
  });

  test('manual partitioning is hidden for ISO targets only', async () => {
    await renderCreateMode();
    await selectImageInstaller();
    await goToFileSystemConfigurationStep();
    expect(
      screen.queryByText(/manually configure partitions/i)
    ).not.toBeInTheDocument();
  });

  test('manual partitioning is shown for ISO target and other target', async () => {
    await renderCreateMode();
    await selectImageInstaller();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    await screen.findByText('Configure partitions');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /File system configuration/ });
  });
});

describe('File system configuration request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('10 GiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 10 * UNIT_GIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('15 GiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await changePartitionSize();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 15 * UNIT_GIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('MiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await changePartitionUnitsToMiB();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 10 * UNIT_MIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('KiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await changePartitionUnitsToKiB();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 10 * UNIT_KIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('/home correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await addPartition();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 10 * UNIT_GIB,
            mountpoint: '/',
          },
          {
            min_size: 1 * UNIT_GIB,
            mountpoint: '/home',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('/home/cakerecipes correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await addPartition();
    await customizePartition();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 10 * UNIT_GIB,
            mountpoint: '/',
          },
          {
            min_size: 1 * UNIT_GIB,
            mountpoint: '/home/cakerecipes',
          },
        ],
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('File system configuration edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['fsc'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = fscCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
