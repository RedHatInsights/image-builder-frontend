import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { PROVISIONING_API } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { azureCreateBlueprintRequest } from '../../../../fixtures/editMode';
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

// The router is just initiliazed here, it's assigned a value in the tests
let router: RemixRouter | undefined = undefined;

const goToAzureStep = async () => {
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

const selectAzureTarget = async () => {
  const user = userEvent.setup();
  const azureCard = await screen.findByTestId('upload-azure');
  await waitFor(() => user.click(azureCard));
  await clickNext();
};

const deselectAzureAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const azureCard = await screen.findByTestId('upload-azure');
  await waitFor(() => user.click(azureCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const selectSource = async (sourceName: string) => {
  const user = userEvent.setup();
  const sourceTexbox = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(async () => user.click(sourceTexbox));

  const azureSource = await screen.findByRole('option', {
    name: sourceName,
  });
  await waitFor(async () => user.click(azureSource));
};

const selectResourceGroup = async () => {
  const user = userEvent.setup();
  const resourceGrpTextbox = await screen.findByRole('textbox', {
    name: /select resource group/i,
  });
  await waitFor(async () => user.click(resourceGrpTextbox));

  const myResourceGroup1 = await screen.findByRole('option', {
    name: /myResourceGroup1/i,
  });
  await waitFor(async () => user.click(myResourceGroup1));
};

const selectManuallyEnterInformation = async () => {
  const user = userEvent.setup();
  const manualOption = await screen.findByText(
    /manually enter the account information\./i
  );
  await waitFor(async () => user.click(manualOption));
};

const selectSourcesOption = async () => {
  const user = userEvent.setup();
  const sourcesOption = await screen.findByRole('radio', {
    name: /use an account configured from sources\./i,
  });
  await waitFor(async () => user.click(sourcesOption));
};

const getTenantGuidInput = async () => {
  const tenantGuidInput = await screen.findByRole('textbox', {
    name: /azure tenant guid/i,
  });
  return tenantGuidInput;
};

const enterTenantGuid = async () => {
  const user = userEvent.setup();
  const tenantGuid = await getTenantGuidInput();
  await waitFor(() =>
    user.type(tenantGuid, 'b8f86d22-4371-46ce-95e7-65c415f3b1e2')
  );
};

const getSubscriptionIdInput = async () => {
  const subscriptionIdInput = await screen.findByRole('textbox', {
    name: /subscription id/i,
  });
  return subscriptionIdInput;
};

const enterSubscriptionId = async () => {
  const user = userEvent.setup();
  const subscriptionId = await getSubscriptionIdInput();
  await waitFor(() =>
    user.type(subscriptionId, '60631143-a7dc-4d15-988b-ba83f3c99711')
  );
};

const selectV1 = async () => {
  const user = userEvent.setup();
  const hypervMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[0];

  await waitFor(() => user.click(hypervMenu));
  const v1 = await screen.findByRole('option', {
    name: /v1/i,
  });
  await waitFor(() => user.click(v1));
};

const getResourceGroupInput = async () => {
  const resourceGroupInput = await screen.findByRole('textbox', {
    name: /resource group/i,
  });
  return resourceGroupInput;
};

const enterResourceGroup = async () => {
  const user = userEvent.setup();
  const resourceGroup = await getResourceGroupInput();
  await waitFor(() => user.type(resourceGroup, 'testResourceGroup'));
};

describe('Step Upload to Azure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectManuallyEnterInformation();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Register systems using this image',
    });
  });

  test('clicking Back loads Image output', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Image output' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await verifyCancelButton(router);
  });

  test('basics work', { retry: 3 }, async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectManuallyEnterInformation();
    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();

    const tenantId = await getTenantGuidInput();
    expect(tenantId).toHaveValue('');
    expect(tenantId).toBeEnabled();
    await enterTenantGuid();

    const subscription = await getSubscriptionIdInput();
    expect(subscription).toHaveValue('');
    expect(subscription).toBeEnabled();
    await enterSubscriptionId();

    const resourceGroup = await getResourceGroupInput();
    expect(resourceGroup).toHaveValue('');
    expect(resourceGroup).toBeEnabled();
    await enterResourceGroup();

    expect(nextButton).toBeEnabled();

    // switch to Sources
    await selectSourcesOption();

    // manual values should be cleared out
    expect(await getTenantGuidInput()).toHaveValue('');
    expect(await getSubscriptionIdInput()).toHaveValue('');
    expect(await getResourceGroupInput()).toHaveValue('');

    expect(nextButton).toBeDisabled();

    await selectSource('azureSource1');

    // source information should be fetched
    expect(await getTenantGuidInput()).not.toHaveValue('');
    expect(await getSubscriptionIdInput()).not.toHaveValue('');
    await selectResourceGroup();

    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
  });

  test('handles change of selected Source', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectSource('azureSource1');
    await waitFor(async () => {
      expect(await getTenantGuidInput()).toHaveValue(
        '2fd7c95c-0d63-4e81-b914-3fbd5288daf7'
      );
    });

    await selectSource('azureSource2');
    await waitFor(async () => {
      expect(await getTenantGuidInput()).toHaveValue(
        '73d5694c-7a28-417e-9fca-55840084f508'
      );
    });

    user.click(await getResourceGroupInput());
    const groups = await screen.findByLabelText(/Resource group/);
    expect(groups).toBeInTheDocument();
    expect(
      await screen.findByLabelText('Resource group theirGroup2')
    ).toBeVisible();
  });

  test('component renders error state correctly', async () => {
    server.use(
      http.get(`${PROVISIONING_API}/sources`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await screen.findByText(
      /Sources cannot be reached, try again later or enter an account info for upload manually\./i
    );
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectSource('azureSource1');
    await selectResourceGroup();
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Image output/ });
  });
});

describe('Azure image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('using a source', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectSource('azureSource1');
    await selectResourceGroup();
    await goToReview();

    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'azure',
      upload_request: {
        options: {
          source_id: '666',
          resource_group: 'myResourceGroup1',
          hyper_v_generation: 'V2',
        },
        type: 'azure',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('manually entering info', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectManuallyEnterInformation();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'azure',
      upload_request: {
        type: 'azure',
        options: {
          tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
          subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
          resource_group: 'testResourceGroup',
          hyper_v_generation: 'V2',
        },
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('manually entering info V1', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectManuallyEnterInformation();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await selectV1();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'azure',
      upload_request: {
        type: 'azure',
        options: {
          tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
          subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
          resource_group: 'testResourceGroup',
          hyper_v_generation: 'V1',
        },
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('after selecting and deselecting azure', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await selectSource('azureSource1');
    await clickBack();
    await deselectAzureAndSelectGuestImage();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('Azure edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['azure'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = azureCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
