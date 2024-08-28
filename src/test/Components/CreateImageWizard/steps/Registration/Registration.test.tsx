import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_9,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { registrationCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  enterBlueprintName,
  renderCreateMode,
  interceptBlueprintRequest,
  goToRegistrationStep,
  clickRegisterLater,
  renderEditMode,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  clickNext,
  clickBack,
  verifyCancelButton,
} from '../../wizardTestUtils';

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => (store = {}),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Initiliaze the router
const router: RemixRouter | undefined = undefined;

const clickShowAdditionalConnectionOptions = async () => {
  const user = userEvent.setup();
  const link = await screen.findByText('Show additional connection options');
  await waitFor(() => user.click(link));
};

const deselectEnableRemoteRemediations = async () => {
  const user = userEvent.setup();
  const checkBox = await screen.findByRole('checkbox', {
    name: 'Enable remote remediations and system management with automation',
  });
  await waitFor(() => user.click(checkBox));
};

const deselectPredictiveAnalytics = async () => {
  const user = userEvent.setup();
  const checkBox = await screen.findByRole('checkbox', {
    name: 'Enable predictive analytics and management capabilities',
  });
  await waitFor(() => user.click(checkBox));
};

const openActivationKeyDropdown = async () => {
  const user = userEvent.setup();
  const activationKeyDropdown = await screen.findByRole('textbox', {
    name: 'Select activation key',
  });
  user.click(activationKeyDropdown);
};

const selectActivationKey = async (key: string) => {
  const user = userEvent.setup();
  const activationKey = await screen.findByRole('option', {
    name: key,
  });
  user.click(activationKey);
  await screen.findByDisplayValue(key);
};

const goToReviewStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await enterBlueprintName();
  await clickNext();
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('registration-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-registration'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('clicking Next leads to OpenSCAP step', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'OpenSCAP profile',
    });
  });

  test('clicking Back leads to Image output step', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Image output',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await verifyCancelButton(router);
  });

  test('default registration includes rhsm, rhc and insights', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await openActivationKeyDropdown();
    await selectActivationKey('name0');
    await goToReviewStep();

    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    expect(review).toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
  });

  test('should disable dropdown when clicking Register the system later', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();

    await waitFor(() =>
      expect(
        screen.queryByTestId('selected-activation-key')
      ).not.toBeInTheDocument()
    );
    await waitFor(async () =>
      expect(
        await screen.findByRole('button', { name: /options menu/i })
      ).toBeDisabled()
    );
    await goToReviewStep();
    await screen.findByText('Register the system later');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await openActivationKeyDropdown();
    await selectActivationKey('name0');
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', {
      name: /Register systems using this image/,
    });
  });
});

describe('Registration request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const imageRequest: ImageRequest = {
    architecture: 'x86_64',
    image_type: 'guest-image',
    upload_request: {
      options: {},
      type: 'aws.s3',
    },
  };

  const blueprintRequest: CreateBlueprintRequest = {
    name: 'Red Velvet',
    description: '',
    distribution: RHEL_9,
    image_requests: [imageRequest],
    customizations: {},
  };

  test('register + insights + rhc', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedSubscription = {
      'activation-key': 'name0',
      insights: true,
      rhc: true,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('register + insights', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickShowAdditionalConnectionOptions();
    await deselectEnableRemoteRemediations();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedSubscription = {
      'activation-key': 'name0',
      insights: true,
      rhc: false,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('register now', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickShowAdditionalConnectionOptions();
    await deselectPredictiveAnalytics();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedSubscription = {
      'activation-key': 'name0',
      insights: false,
      rhc: false,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('register later', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {},
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('register with no key in local storage', async () => {
    await renderCreateMode();
    await goToRegistrationStep();

    await screen.findByDisplayValue('name0');
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedSubscription = {
      'activation-key': 'name0',
      insights: true,
      rhc: true,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('register with a key in local storage', async () => {
    await renderCreateMode();
    localStorage.setItem('imageBuilder.recentActivationKey', 'name1');
    await goToRegistrationStep();

    await screen.findByDisplayValue('name1');
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedSubscription = {
      'activation-key': 'name1',
      insights: true,
      rhc: true,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });

    // clear mocked values in localStorage so they don't affect following tests
    localStorage.clear();
  });
});

describe('Registration edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['registration'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = registrationCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
