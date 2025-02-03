import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { kernelCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  getNextButton,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const CUSTOM_NAME = 'custom-kernel-name';

const goToKernelStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
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

const goToOpenSCAPStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickNext(); // OpenSCAP
};

const goFromOpenSCAPToKernel = async () => {
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
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const getKernelNameOptions = async () => {
  return await screen.findByPlaceholderText(/Select kernel package/i);
};

const openKernelNameOptions = async (dropdown: Element) => {
  const user = userEvent.setup();
  await waitFor(() => user.click(dropdown));
};

const selectKernelName = async (kernelName: string) => {
  const user = userEvent.setup();
  const kernelNameDropdown = await getKernelNameOptions();
  await openKernelNameOptions(kernelNameDropdown);

  const kernelOption = await screen.findByText(kernelName);
  await waitFor(() => user.click(kernelOption));
};

const selectCustomKernelName = async (kernelName: string) => {
  const user = userEvent.setup();
  const kernelNameDropdown = await getKernelNameOptions();
  await waitFor(() => user.type(kernelNameDropdown, kernelName));

  const customOption = await screen.findByText(/custom kernel package/i);
  await waitFor(() => user.click(customOption));
};

const clearKernelName = async () => {
  const user = userEvent.setup();
  const kernelNameClearBtn = await screen.findAllByRole('button', {
    name: /clear input/i,
  });
  await waitFor(() => user.click(kernelNameClearBtn[0]));
};

const addKernelAppend = async (kernelArg: string) => {
  const user = userEvent.setup();
  const kernelAppendInput = await screen.findByPlaceholderText(
    'Add kernel argument'
  );
  await waitFor(() => user.click(kernelAppendInput));
  await waitFor(() => user.type(kernelAppendInput, kernelArg));

  const addKernelArg = await screen.findByRole('button', {
    name: /Add kernel argument/,
  });
  await waitFor(() => user.click(addKernelArg));
};

const removeKernelArg = async (kernelArg: string) => {
  const user = userEvent.setup();

  const removeNosmtArgButton = await screen.findByRole('button', {
    name: `close ${kernelArg}`,
  });
  await waitFor(() => user.click(removeNosmtArgButton));
};

const selectProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const cis1Profile = await screen.findByText(/Kernel append only profile/i);
  await waitFor(() => user.click(cis1Profile));
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

  test('adds custom kernel package to options', async () => {
    await renderCreateMode();
    await goToKernelStep();

    const kernelNameDropdown = await getKernelNameOptions();
    await openKernelNameOptions(kernelNameDropdown);
    expect(screen.queryByText(CUSTOM_NAME)).not.toBeInTheDocument();

    await selectCustomKernelName(CUSTOM_NAME);
    await openKernelNameOptions(kernelNameDropdown);
    await screen.findByText(CUSTOM_NAME);
  });

  test('disable Next with invalid custom kernel name', async () => {
    await renderCreateMode();
    await goToKernelStep();

    await selectCustomKernelName('-----------');
    await screen.findByText(/Invalid format/);
    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();

    await clearKernelName();
    expect(screen.queryByText(/Invalid format/)).not.toBeInTheDocument();
    expect(nextButton).toBeEnabled();
  });

  test('kernel argument can be added and removed', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await addKernelAppend('nosmt=force');
    await addKernelAppend('page_poison=1');
    await removeKernelArg('nosmt=force');
    expect(screen.queryByText('nosmt=force')).not.toBeInTheDocument();
  });

  test('kernel append from OpenSCAP gets added correctly and cannot be removed', async () => {
    await renderCreateMode();
    await goToOpenSCAPStep();
    await selectProfile();
    await goFromOpenSCAPToKernel();
    await screen.findByText('Required by OpenSCAP');
    await screen.findByText('audit_backlog_limit=8192');
    await screen.findByText('audit=1');
    expect(
      screen.queryByRole('button', { name: /close audit_backlog_limit=8192/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /close audit=1/i })
    ).not.toBeInTheDocument();
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

describe('Kernel request generated correctly', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('with kernel name', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await selectKernelName('kernel-debug');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        kernel: {
          name: 'kernel-debug',
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('when unselecting kernel name', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await selectKernelName('kernel-debug');
    await clearKernelName();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with kernel arg added and removed', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await addKernelAppend('nosmt=force');
    await removeKernelArg('nosmt=force');
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

  test('with kernel append', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await addKernelAppend('nosmt=force');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        kernel: {
          append: 'nosmt=force',
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with OpenSCAP profile that includes kernel append', async () => {
    await renderCreateMode();
    await goToOpenSCAPStep();
    await selectProfile();
    await goFromOpenSCAPToKernel();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [{ min_size: 10737418240, mountpoint: '/' }],
        openscap: {
          profile_id: 'xccdf_org.ssgproject.content_profile_ccn_basic',
        },
        kernel: {
          append: 'audit_backlog_limit=8192 audit=1',
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Kernel edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['kernel'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = kernelCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
