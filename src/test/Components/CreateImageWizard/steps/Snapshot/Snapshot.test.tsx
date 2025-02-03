import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  expectedCustomRepositories,
  expectedPayloadRepositories,
  snapshotCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { clickNext, clickReviewAndFinish } from '../../wizardTestUtils';
import {
  blueprintRequest,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const goToSnapshotStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext(); // Repositories snapshot
};

const goToReviewStep = async () => {
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
  await enterBlueprintName();
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('content-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-custom-repositories'
  );
  await waitFor(() => user.click(revisitButton));
};

const searchForRepository = async (repo: string) => {
  const user = userEvent.setup();
  const search = await screen.findByLabelText('Search repositories');
  await waitFor(() => user.type(search, repo));
  await waitFor(() => expect(screen.getByText(repo)).toBeInTheDocument);
};

const selectFirstRepository = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const clickBulkSelect = async () => {
  const user = userEvent.setup();
  const bulkSelectCheckbox = await screen.findByRole('checkbox', {
    name: /select all/i,
  });
  await waitFor(async () => user.click(bulkSelectCheckbox));
};

const selectUseSnapshot = async () => {
  const user = userEvent.setup();
  const snapshotRadio = await screen.findByRole('radio', {
    name: /Use a snapshot/i,
  });
  await waitFor(async () => user.click(snapshotRadio));
};

const updateDatePickerWithValue = async (date: string) => {
  const user = userEvent.setup();
  const dateTextbox = await screen.findByRole('textbox', {
    name: /Date picker/i,
  });
  await waitFor(async () => user.type(dateTextbox, date));
};

const clickContentDropdown = async () => {
  const user = userEvent.setup();
  const contentExpandable = await screen.findByTestId('content-expandable');
  await waitFor(async () => user.click(contentExpandable));
};

const getSnapshotMethodElement = async () =>
  await screen.findByRole('button', { name: /Snapshot method/i });

const clickReset = async () => {
  const user = userEvent.setup();
  const resetButton = await screen.findByRole('button', {
    name: /Reset/i,
  });
  await waitFor(async () => user.click(resetButton));
};

describe('repository snapshot tab - ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('button Review and finish is disabled for invalid state', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-00-00');
    expect(
      await screen.findByRole('button', { name: /Review and finish/ })
    ).toBeDisabled();
  });

  test('select use a snapshot with 1 repo selected', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await selectFirstRepository();
    await goToReviewStep();
    await clickContentDropdown();

    const snapshotMethodElement = await getSnapshotMethodElement();
    // Check date was recorded correctly
    expect(snapshotMethodElement).toHaveTextContent('State as of 2024-04-22');
    // Check that the button is clickable (has 1 repo selected)
    expect(snapshotMethodElement).toHaveAttribute('aria-disabled', 'false');

    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    // Check the date was passed correctly to the blueprint
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    blueprintRequest.image_requests[0].snapshot_date =
      '2024-04-22T00:00:00.000Z';

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: expectedCustomRepositories,
        payload_repositories: expectedPayloadRepositories,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('select use a snapshot with no repos selected', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await goToReviewStep();
    await clickContentDropdown();

    const snapshotMethodElement = await getSnapshotMethodElement();
    // Check date was recorded correctly
    expect(snapshotMethodElement).toHaveTextContent('State as of 2024-04-22');
    // Check that the button is clickable (has 1 repo selected)
    await waitFor(() => {
      expect(snapshotMethodElement).toHaveAttribute('aria-disabled', 'true');
    });
  });

  test('select is disabled for non-snapshot repository', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await searchForRepository('nosnapshot');

    const row0Checkbox = await screen.findByRole('checkbox', {
      name: /select row 0/i,
    });
    expect(row0Checkbox).toBeDisabled();

    const bulkSelectCheckbox = await screen.findByRole('checkbox', {
      name: /select all/i,
    });
    // eslint-disable-next-line testing-library/no-node-access
    expect(bulkSelectCheckbox.closest('div')).toHaveClass('pf-m-disabled');
  });

  test('button Reset works to empty the snapshot date', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    // Check the Next button is enabled
    const nextBtn = await screen.findByRole('button', { name: /Next/i });
    await waitFor(() => {
      expect(nextBtn).toHaveAttribute('aria-disabled', 'false');
    });
    // Check the Next button is disabled after resetting the date
    await clickReset();
    await waitFor(() => {
      expect(nextBtn).toHaveAttribute('aria-disabled', 'true');
    });
    await screen.findByText(/Date cannot be blank/i);
  });

  test('select using bulk select works ', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await searchForRepository('01-test-valid-repo');

    // wait until there's only 1 repository on the page
    await waitFor(async () => {
      const rows = await screen.findAllByRole('row');
      // header row + repo row
      expect(rows).toHaveLength(2);
    });

    await clickBulkSelect();
    await goToReviewStep();

    // Check the date was passed correctly to the blueprint
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    blueprintRequest.image_requests[0].snapshot_date =
      '2024-04-22T00:00:00.000Z';

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: expectedCustomRepositories,
        payload_repositories: expectedPayloadRepositories,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Custom repositories/i });
  });
});

describe('Snapshot edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['snapshot'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = snapshotCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
