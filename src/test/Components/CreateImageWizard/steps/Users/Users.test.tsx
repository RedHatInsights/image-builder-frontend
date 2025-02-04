import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { usersCreateBlueprintRequest } from '../../../../fixtures/editMode';
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
import {
  clickRegisterLater,
  goToRegistrationStep,
  renderCreateMode,
} from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;
const validUserName = 'best';
const validSshKey = 'ssh-rsa d';

const goToUsersStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
};

const goToReviewStep = async () => {
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
  const expandable = await screen.findByTestId('users-expandable');
  const revisitButton = await within(expandable).findByTestId('revisit-users');
  await waitFor(() => user.click(revisitButton));
};

const clickAddUser = async () => {
  const user = userEvent.setup();
  const addUser = await screen.findByRole('button', { name: /add a user/i });
  expect(addUser).toBeEnabled();
  await waitFor(() => user.click(addUser));
};

const clickRemoveUser = async () => {
  const user = userEvent.setup();
  const addUser = await screen.findByRole('button', { name: /remove user/i });
  expect(addUser).toBeEnabled();
  await waitFor(() => user.click(addUser));
};

const addSshKey = async (sshKey: string) => {
  const user = userEvent.setup();
  const enterSshKey = await screen.findByRole('textbox', {
    name: /public SSH key/i,
  });
  await waitFor(() => user.type(enterSshKey, sshKey));
  await waitFor(() => expect(enterSshKey).toHaveValue(sshKey));
};

const addUserName = async (userName: string) => {
  const user = userEvent.setup();
  const enterUserName = screen.getByRole('textbox', {
    name: /blueprint user name/i,
  });
  await waitFor(() => user.type(enterUserName, userName));
  await waitFor(() => expect(enterUserName).toHaveValue(userName));
};

const addPassword = async (password: string) => {
  const user = userEvent.setup();
  const enterPassword = screen.getByPlaceholderText(/enter password/i);
  await waitFor(() => user.type(enterPassword, password));
  await waitFor(() => expect(enterPassword).toHaveValue(password));
};

describe('Step Users', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('without adding user loads timezone', async () => {
    const user = userEvent.setup();
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();
    await waitFor(() => user.click(nextButton));
    await screen.findByText('Select a timezone for your image.');
  });

  test('clicking Back loads Additional packages', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Additional packages' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToUsersStep();
    await verifyCancelButton(router);
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await addSshKey(validSshKey);
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeEnabled());
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Users/ });
  });

  test('with invalid name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickAddUser();
    await addUserName('ss.');
    await addSshKey('ssh');
    const invalidUserMessage = screen.getByText(/invalid user name/i);
    await waitFor(() => expect(invalidUserMessage));
  });

  test('with invalid ssh key', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickAddUser();
    await addSshKey('ssh');
    await addPassword('inval');
    await addUserName('bestUser');
    const invalidUserMessage = screen.getByText(/invalid ssh key/i);
    await waitFor(() => expect(invalidUserMessage));
  });

  test('with invalid password', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await addPassword('inval');
    await addSshKey(validSshKey);

    const invalidUserMessage = screen.getByText(
      /Password must be between 6 and 128 characters/i
    );
    await waitFor(() => expect(invalidUserMessage));
  });
});

describe('User request generated correctly', () => {
  test('with valid name, ssh key and checked Administrator checkbox', async () => {
    const user = userEvent.setup();
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await addSshKey(validSshKey);
    await addPassword('thisIsValidPass@@');
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeEnabled());
    const isAdmin = screen.getByRole('checkbox', {
      name: /administrator/i,
    });
    await user.click(isAdmin);
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        users: [
          {
            name: 'best',
            ssh_key: 'ssh-rsa d',
            password: 'thisIsValidPass@@',
            groups: ['wheel'],
          },
        ],
      },
    };
    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('remove a user', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickAddUser();
    await addUserName('test');
    await addSshKey('ssh-rsa');
    await clickRemoveUser();
    await waitFor(() => expect('add a user to your image'));
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
});

describe('Users edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['users'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = usersCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
