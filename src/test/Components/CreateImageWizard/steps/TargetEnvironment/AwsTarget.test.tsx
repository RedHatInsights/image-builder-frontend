import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  PROVISIONING_API,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { awsCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { server } from '../../../../mocks/server';
import {
  clickBack,
  clickNext,
  getNextButton,
  verifyCancelButton,
} from '../../wizardTestUtils';
import {
  blueprintRequest,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const goToAwsStep = async () => {
  await clickNext();
};

const goToReview = async () => {
  await clickNext(); // Register
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
  await clickNext(); // Snapshot repositories
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // FirstBoot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId(
    'target-environments-expandable'
  );
  const revisitButton = await within(expandable).findByTestId(
    'revisit-target-environments'
  );
  await waitFor(() => user.click(revisitButton));
};

const selectAwsTarget = async () => {
  const user = userEvent.setup();
  const awsCard = await screen.findByTestId('upload-aws');
  await waitFor(() => user.click(awsCard));
  await clickNext();
};

const deselectAwsAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const awsCard = await screen.findByTestId('upload-aws');
  await waitFor(() => user.click(awsCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const chooseManualOption = async () => {
  const user = userEvent.setup();
  const manualOption = await screen.findByText(
    /manually enter an account id\./i
  );
  await waitFor(async () => user.click(manualOption));
};

const enterAccountId = async () => {
  const user = userEvent.setup();
  const awsAccountIdTextbox = await screen.findByRole('textbox', {
    name: 'aws account id',
  });
  await waitFor(async () => user.type(awsAccountIdTextbox, '123123123123'));
};

const chooseSourcesOption = async () => {
  const user = userEvent.setup();
  const sourceRadio = await screen.findByRole('radio', {
    name: /use an account configured from sources\./i,
  });
  user.click(sourceRadio);
};

const getSourceDropdown = async () => {
  const sourceDropdown = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(() => expect(sourceDropdown).toBeEnabled());

  return sourceDropdown;
};

const selectSource = async () => {
  const user = userEvent.setup();
  const sourceTexbox = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(async () => user.click(sourceTexbox));

  const sourceOption = await screen.findByRole('option', {
    name: /my_source/i,
  });
  await waitFor(async () => user.click(sourceOption));
};

let router: RemixRouter | undefined = undefined;

describe('Step Upload to AWS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await chooseManualOption();
    await enterAccountId();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Register systems using this image',
    });
  });

  test('clicking Back loads Image output', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Image output' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await verifyCancelButton(router);
  });

  test('component renders error state correctly', async () => {
    server.use(
      http.get(`${PROVISIONING_API}/sources`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await screen.findByText(
      /sources cannot be reached, try again later or enter an aws account id manually\./i
    );
  });

  test('validation works', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();

    const nextButton = await getNextButton();
    expect(nextButton).toHaveClass('pf-m-disabled');

    await chooseManualOption();
    expect(nextButton).toHaveClass('pf-m-disabled');

    await enterAccountId();
    expect(nextButton).not.toHaveClass('pf-m-disabled');

    await chooseSourcesOption();
    await waitFor(() => expect(nextButton).toHaveClass('pf-m-disabled'));

    await getSourceDropdown();
    await selectSource();
    await waitFor(() => expect(nextButton).not.toHaveClass('pf-m-disabled'));
  });

  test('compose request share_with_sources field is correct', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await getSourceDropdown();
    await selectSource();
    await goToReview();

    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const createBlueprintBtn = await screen.findByRole('button', {
      name: /Create blueprint/,
    });
    user.click(createBlueprintBtn);
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await chooseManualOption();
    await enterAccountId();
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Image output/ });
  });
});

describe('AWS image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('using a source', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        options: {
          share_with_sources: ['123'],
        },
        type: 'aws',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('using an account id', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await chooseManualOption();
    await enterAccountId();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        options: {
          share_with_accounts: ['123123123123'],
        },
        type: 'aws',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('after selecting and deselecting aws', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await clickBack();
    await deselectAwsAndSelectGuestImage();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('AWS edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['aws'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = awsCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
