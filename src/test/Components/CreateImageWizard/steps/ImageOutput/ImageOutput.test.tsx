import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  AARCH64,
  CENTOS_9,
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_8,
  RHEL_9,
  X86_64,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockArchitecturesByDistro } from '../../../../fixtures/architectures';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  aarch64CreateBlueprintRequest,
  centos9CreateBlueprintRequest,
  rhel8CreateBlueprintRequest,
  rhel9CreateBlueprintRequest,
  x86_64CreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import {
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

let router: RemixRouter | undefined = undefined;

const openReleaseMenu = async () => {
  const user = userEvent.setup();
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[0];
  await waitFor(() => user.click(releaseMenu));
};

const clickShowOptions = async () => {
  const user = userEvent.setup();
  const showOptions = await screen.findByRole('button', {
    name: /show options for further development of rhel/i,
  });
  await waitFor(() => user.click(showOptions));
};

const selectRhel8 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  const rhel8 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 8 full support ends: may 2024 \| maintenance support ends: may 2029/i,
  });
  await waitFor(() => user.click(rhel8));
};

const selectRhel9 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  const rhel9 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 9 full support ends: may 2027 \| maintenance support ends: may 2032/i,
  });
  await waitFor(() => user.click(rhel9));
};

const selectCentos9 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  await clickShowOptions();
  const centos9 = await screen.findByRole('option', {
    name: 'CentOS Stream 9',
  });
  await waitFor(() => user.click(centos9));
};

const openArchitectureMenu = async () => {
  const user = userEvent.setup();
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[1];
  await waitFor(() => user.click(releaseMenu));
};

const selectX86_64 = async () => {
  const user = userEvent.setup();
  await openArchitectureMenu();
  const x86_64 = await screen.findByRole('option', {
    name: 'x86_64',
  });
  await waitFor(() => user.click(x86_64));
};

const selectAarch64 = async () => {
  const user = userEvent.setup();
  await openArchitectureMenu();
  const aarch64 = await screen.findByRole('option', {
    name: 'aarch64',
  });
  await waitFor(() => user.click(aarch64));
};

const selectGuestImageTarget = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const selectVMwareTarget = async () => {
  const user = userEvent.setup();
  const vmwareImageCheckBox = await screen.findByTestId('checkbox-vmware');
  await waitFor(() => user.click(vmwareImageCheckBox));
};

const goToReviewStep = async () => {
  await clickNext(); // Registration
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
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
  await clickNext(); // First boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('image-output-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-image-output'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Image output', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Register systems using this image',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await verifyCancelButton(router);
  });

  test('target environment is required', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();

    const destination = await screen.findByTestId('target-select');
    const required = await within(destination).findByText('*');

    expect(destination).toBeEnabled();
    expect(destination).toContainElement(required);
  });

  test('selecting and deselecting a tile disables the next button', async () => {
    await renderCreateMode();
    const nextButton = await getNextButton();

    const awsTile = await screen.findByTestId('upload-aws');
    user.click(awsTile); // select
    user.click(awsTile); // deselect

    const googleTile = await screen.findByTestId('upload-google');
    user.click(googleTile); // select
    user.click(googleTile); // deselect

    const azureTile = await screen.findByTestId('upload-azure');
    user.click(azureTile); // select
    user.click(azureTile); // deselect

    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('expect only RHEL releases before expansion', async () => {
    await renderCreateMode();
    await openReleaseMenu();

    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    await screen.findAllByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });
    await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });
  });

  test('expect all releases after expansion', async () => {
    await renderCreateMode();
    await openReleaseMenu();

    const showOptionsButton = await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    user.click(showOptionsButton);

    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    await screen.findAllByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });
    await screen.findByRole('option', {
      name: 'CentOS Stream 9',
    });

    expect(showOptionsButton).not.toBeInTheDocument();
  });

  test('release lifecycle chart appears only when RHEL 8 is chosen', async () => {
    await renderCreateMode();

    await selectRhel8();
    await screen.findByTestId('release-lifecycle-chart');

    await selectRhel9();
    await waitFor(() =>
      expect(
        screen.queryByTestId('release-lifecycle-chart')
      ).not.toBeInTheDocument()
    );
  });

  test('CentOS acknowledgement appears', async () => {
    await renderCreateMode();
    await selectCentos9();
    await screen.findByText(
      'CentOS Stream builds are intended for the development of future versions of RHEL and are not supported for production workloads or other use cases.'
    );
  });

  test('VMware checkbox select and unselect works', async () => {
    await renderCreateMode();
    await selectVMwareTarget();

    let vmwareCheckbox = await screen.findByTestId('checkbox-vmware');
    let ovaFileRadio = await screen.findByTestId('radio-vsphere-ova');
    let vmdkFileRadio = await screen.findByTestId('radio-vsphere-vmdk');

    expect(await screen.findByTestId('checkbox-vmware')).toBeChecked();
    expect(ovaFileRadio).toBeChecked();
    expect(vmdkFileRadio).not.toBeChecked();

    // switch to VMDK
    user.click(vmdkFileRadio);

    // refresh values
    vmwareCheckbox = await screen.findByTestId('checkbox-vmware');
    ovaFileRadio = await screen.findByTestId('radio-vsphere-ova');
    vmdkFileRadio = await screen.findByTestId('radio-vsphere-vmdk');

    expect(vmwareCheckbox).toBeChecked();
    expect(ovaFileRadio).not.toBeChecked();
    expect(vmdkFileRadio).toBeChecked();

    // unselect VMware
    user.click(vmwareCheckbox);

    // refresh values
    vmwareCheckbox = await screen.findByTestId('checkbox-vmware');
    ovaFileRadio = await screen.findByTestId('radio-vsphere-ova');
    vmdkFileRadio = await screen.findByTestId('radio-vsphere-vmdk');

    expect(vmwareCheckbox).not.toBeChecked();
    expect(ovaFileRadio).not.toBeChecked();
    expect(vmdkFileRadio).not.toBeChecked();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Image output/ });
  });
});

describe('Check that the target filtering is in accordance to mock content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel9 x86_64', async () => {
    await renderCreateMode();
    await selectX86_64();

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = []; // type is `string[]` and not `ImageType[]` because in imageBuilderAPI ArchitectureItem['image_types'] is type string
    mockArchitecturesByDistro(RHEL_9).forEach((elem) => {
      if (elem.arch === X86_64) {
        images_types = elem.image_types;
      }
    });

    expect(images_types).toContain('aws');
    expect(images_types).toContain('gcp');
    expect(images_types).toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).toContain('vsphere');
    expect(images_types).toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');

    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await screen.findByTestId('upload-google');
    await screen.findByTestId('upload-azure');
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    await screen.findByText(/vmware vsphere/i);
    await screen.findByText(/open virtualization format \(\.ova\)/i);
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });

  test('rhel8 x86_64', async () => {
    await renderCreateMode();
    await selectX86_64();
    await selectRhel8();

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_8).forEach((elem) => {
      if (elem.arch === X86_64) {
        images_types = elem.image_types;
      }
    });

    expect(images_types).toContain('aws');
    expect(images_types).toContain('gcp');
    expect(images_types).toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).toContain('vsphere');
    expect(images_types).toContain('vsphere-ova');
    expect(images_types).toContain('wsl');

    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await screen.findByTestId('upload-google');
    await screen.findByTestId('upload-azure');
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    await screen.findByText(/vmware vsphere/i);
    await screen.findByText(/open virtualization format \(\.ova\)/i);
    await screen.findByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i);
  });

  test('rhel9 aarch64', async () => {
    await renderCreateMode();
    await selectAarch64();

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_9).forEach((elem) => {
      if (elem.arch === AARCH64) {
        images_types = elem.image_types;
      }
    });

    expect(images_types).toContain('aws');
    expect(images_types).not.toContain('gcp');
    expect(images_types).not.toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).not.toContain('vsphere');
    expect(images_types).not.toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');

    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await waitFor(() =>
      expect(screen.queryByTestId('upload-google')).not.toBeInTheDocument()
    );
    expect(screen.queryByTestId('upload-azure')).not.toBeInTheDocument();
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    expect(screen.queryByText(/vmware vsphere/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/open virtualization format \(\.ova\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });

  test('rhel8 aarch64', async () => {
    await renderCreateMode();
    await selectAarch64();
    await selectRhel8();

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_8).forEach((elem) => {
      if (elem.arch === AARCH64) {
        images_types = elem.image_types;
      }
    });

    expect(images_types).toContain('aws');
    expect(images_types).not.toContain('gcp');
    expect(images_types).not.toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).not.toContain('vsphere');
    expect(images_types).not.toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');

    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    expect(screen.queryByTestId('upload-google')).not.toBeInTheDocument();
    expect(screen.queryByTestId('upload-azure')).not.toBeInTheDocument();
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    expect(screen.queryByText(/vmware vsphere/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/open virtualization format \(\.ova\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });
});

describe('Check step consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('going back and forth with selected options only keeps the one compatible', async () => {
    await renderCreateMode();
    await selectX86_64();
    const next = await screen.findByRole('button', { name: /Next/ });

    // select GCP, it's available for x86_64
    const uploadGcpBtn = await screen.findByTestId('upload-google');
    user.click(uploadGcpBtn);
    await waitFor(() => expect(next).toBeEnabled());

    // change to aarch, GCP not being compatible and gets removed from targets
    await selectAarch64();
    await waitFor(() => expect(next).toBeDisabled());

    // clicking on AWS enables the Next button
    const uploadAwsBtn = await screen.findByTestId('upload-aws');
    user.click(uploadAwsBtn);
    await waitFor(() => expect(next).toBeEnabled());

    // and going back to x86_64 the Next button stays enabled
    await selectX86_64();
    await waitFor(() => expect(next).toBeEnabled());
  });
});

describe('Set release using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel 9 by default (no query parameter)', async () => {
    await renderCreateMode();
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9', {
      exact: true,
    });
  });

  test('rhel 9 by default (invalid query parameter)', async () => {
    await renderCreateMode({ release: 'rhel9001' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9', {
      exact: true,
    });
  });

  test('rhel 8 (query parameter provided)', async () => {
    await renderCreateMode({ release: 'rhel8' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 8');
  });

  test('rhel 10 beta (query parameter provided)', async () => {
    await renderCreateMode({ release: 'rhel10beta' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 10 Beta');
  });
});

describe('Set architecture using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('x86_64 by default (no query parameter)', async () => {
    await renderCreateMode();
    await screen.findByText('x86_64');
  });

  test('x86_64 by default (invalid query parameter)', async () => {
    await renderCreateMode({ arch: 'arm' });
    await screen.findByText('x86_64');
  });

  test('aarch64 (query parameter provided)', async () => {
    await renderCreateMode({ arch: 'aarch64' });
    await screen.findByText('aarch64');
  });
});

describe('Set target using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('no target by default (no query parameter)', async () => {
    await renderCreateMode();
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('no target by default (invalid query parameter)', async () => {
    await renderCreateMode({ target: 'azure' });
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('image-installer (query parameter provided)', async () => {
    await renderCreateMode({ target: 'iso' });
    expect(await screen.findByTestId('checkbox-image-installer')).toBeChecked();
    await goToReviewStep();
    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    user.click(targetExpandable);
    await screen.findByText('Bare metal - Installer (.iso)');
  });

  test('guest-image (query parameter provided)', async () => {
    await renderCreateMode({ target: 'qcow2' });
    expect(await screen.findByTestId('checkbox-guest-image')).toBeChecked();
    await goToReviewStep();
    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    user.click(targetExpandable);
    await screen.findByText('Virtualization - Guest image (.qcow2)');
  });
});

describe('Distribution request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel-8', async () => {
    await renderCreateMode();
    await selectRhel8();
    await selectGuestImageTarget();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_8,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('rhel-9', async () => {
    await renderCreateMode();
    await selectRhel9();
    await selectGuestImageTarget();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_9,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('centos-9', async () => {
    await renderCreateMode();
    await selectCentos9();
    await selectGuestImageTarget();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: CENTOS_9,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('Architecture request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('x86_64', async () => {
    await renderCreateMode();
    await selectX86_64();
    await selectGuestImageTarget();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      ...imageRequest,
      architecture: X86_64,
    };
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('aarch64', async () => {
    await renderCreateMode();
    await selectAarch64();
    await selectGuestImageTarget();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      ...imageRequest,
      architecture: AARCH64,
    };
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('Image output edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works - rhel9', async () => {
    const id = mockBlueprintIds['rhel9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = rhel9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - rhel8', async () => {
    const id = mockBlueprintIds['rhel8'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = rhel8CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - centos9', async () => {
    const id = mockBlueprintIds['centos9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = centos9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - x86_64', async () => {
    const id = mockBlueprintIds['x86_64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = x86_64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - aarch64', async () => {
    const id = mockBlueprintIds['aarch64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = aarch64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
