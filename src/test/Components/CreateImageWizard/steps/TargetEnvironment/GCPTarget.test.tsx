import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { gcpCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  clickBack,
  clickNext,
  getNextButton,
  verifyCancelButton,
} from '../../wizardTestUtils';
import {
  blueprintRequest,
  enterBlueprintName,
  imageRequest,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const GCP_ACCOUNT = 'test@gmail.com';

const goToReview = async () => {
  await clickNext();
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

const createGCPCloudImage = (
  image_type: ImageTypes,
  options: GcpUploadRequestOptions
): ImageRequest => {
  return {
    ...imageRequest,
    image_type,
    upload_request: {
      type: 'gcp',
      options,
    },
  };
};

const clickGCPTarget = async () => {
  const user = userEvent.setup();
  const googleOption = await screen.findByTestId('upload-google');
  await waitFor(() => user.click(googleOption));
  await clickNext();
};

const deselectGcpAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const googleCard = await screen.findByTestId('upload-google');
  await waitFor(() => user.click(googleCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const selectGoogleAccount = async (optionId: string) => {
  const user = userEvent.setup();
  const googleAccountOption = await screen.findByTestId(optionId);
  await waitFor(() => user.click(googleAccountOption));
  const principalInput = await screen.findByTestId('principal');
  await waitFor(() => user.type(principalInput, GCP_ACCOUNT));
};

let router: RemixRouter | undefined = undefined;

describe('Step Upload to Google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('google-account');
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Register systems using this image',
    });
  });

  test('clicking Back loads Image output', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await clickBack();
    await screen.findByRole('heading', { name: 'Image output' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await verifyCancelButton(router);
  });

  test('the google account id field is shown and required', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    const principalInput = await screen.findByTestId('principal');
    expect(principalInput).toHaveValue('');
    expect(await getNextButton()).toBeDisabled();
  });

  test('the google email field must be a valid email', async () => {
    await renderCreateMode();
    await clickGCPTarget();

    await waitFor(async () =>
      user.type(await screen.findByTestId('principal'), 'a')
    );
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();

    await waitFor(async () =>
      user.type(await screen.findByTestId('principal'), 'test@test.com')
    );
    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('google-account');
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Image output/ });
  });
});

describe('GCP image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('share image with google account', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('google-account');
    await goToReview();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`user:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with service account', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('service-account');
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`serviceAccount:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with google group', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('google-group');
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`group:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with domain', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('google-domain');
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`domain:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with red hat insight only', async () => {
    const user = userEvent.setup();
    await renderCreateMode();
    await clickGCPTarget();
    const shareWithInsightOption = await screen.findByTestId(
      'share-with-insights'
    );

    user.click(shareWithInsightOption);
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {});
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('after selecting and deselecting gcp', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('google-domain');
    await clickBack();
    await deselectGcpAndSelectGuestImage();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('GCP edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['gcp'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = gcpCreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
});
