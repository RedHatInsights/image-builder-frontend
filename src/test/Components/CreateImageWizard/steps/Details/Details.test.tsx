import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { detailsCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { clickNext, getNextButton } from '../../wizardTestUtils';
import {
  blueprintRequest,
  enterBlueprintName,
  goToRegistrationStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const goToDetailsStep = async () => {
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
};

const enterBlueprintDescription = async (
  description: string = 'Now with extra carmine!'
) => {
  const user = userEvent.setup({ delay: null });
  const blueprintDescription = await screen.findByRole('textbox', {
    name: /blueprint description/i,
  });

  await waitFor(() => user.clear(blueprintDescription));
  await waitFor(() => expect(blueprintDescription).toHaveValue(''));
  await waitFor(() => user.type(blueprintDescription, description));
};

const goToReviewStep = async () => {
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('image-details-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-details'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Details', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('with invalid name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();
    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();
    await enterBlueprintName(' ');
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('with valid name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();
    await enterBlueprintName('🤣Red Velvet🤣');
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeEnabled());
  });

  test('with non-unique name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();
    await enterBlueprintName('Lemon Pie');
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('name invalid for more than 100 chars', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();

    // enter invalid image name
    const invalidName = 'a'.repeat(101);
    await enterBlueprintName(invalidName);
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();

    // enter valid image name
    await enterBlueprintName();
    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  });

  test('description invalid for more than 250', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();

    // enter invalid image description
    const invalidDescription = 'a'.repeat(251);
    await enterBlueprintDescription(invalidDescription);
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();

    // enter valid image description
    await enterBlueprintDescription();
    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Details/ });
  });
});

describe('Details request generated correctly', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('without description', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();
    await enterBlueprintName();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = { ...blueprintRequest };

    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });

  test('with description', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToDetailsStep();
    await enterBlueprintName();
    await enterBlueprintDescription();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      description: 'Now with extra carmine!',
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Details edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['details'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = detailsCreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
});
