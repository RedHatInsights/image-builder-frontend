import React from 'react';

import { Button, FormGroup, Checkbox, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon, TrashIcon } from '@patternfly/react-icons';

import { GENERATING_SSH_KEY_PAIRS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUserAdministrator,
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  removeUser,
} from '../../../../../store/wizardSlice';
import { useUsersValidation } from '../../../utilities/useValidation';
import {
  HookValidatedInput,
  ValidatedPasswordInput,
} from '../../../ValidatedInput';
const UserInfo = () => {
  const dispatch = useAppDispatch();
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const userIsAdministratorSelector = selectUserAdministrator(index);
  const userIsAdministrator = useAppSelector(userIsAdministratorSelector);

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) => {
    dispatch(setUserNameByIndex({ index: index, name: value }));
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) => {
    dispatch(setUserPasswordByIndex({ index: index, password: value }));
  };

  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) => {
    dispatch(setUserSshKeyByIndex({ index: index, sshKey: value }));
  };

  const stepValidation = useUsersValidation();

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: boolean
  ) => {
    dispatch(
      setUserAdministratorByIndex({ index: index, isAdministrator: value })
    );
  };

  const onRemoveUserClick = () => {
    dispatch(removeUser(index));
  };

  return (
    <>
      <FormGroup isRequired label="Username">
        <HookValidatedInput
          ariaLabel="blueprint user name"
          value={userName || ''}
          placeholder="Enter username"
          onChange={(_e, value) => handleNameChange(_e, value)}
          stepValidation={stepValidation}
          fieldName="userName"
        />
      </FormGroup>
      <FormGroup isRequired label="Password">
        <ValidatedPasswordInput
          value={userPassword || ''}
          stepValidation={stepValidation}
          fieldName="userPassword"
          onChange={(_e, value) => handlePasswordChange(_e, value)}
          placeholder="Enter password"
        />
      </FormGroup>
      <FormGroup isRequired label="SSH key">
        <HookValidatedInput
          inputType={'textArea'}
          ariaLabel="public SSH key"
          value={userSshKey || ''}
          onChange={(_e, value) => handleSshKeyChange(_e, value)}
          placeholder="Paste your public SSH key"
          stepValidation={stepValidation}
          fieldName="userSshKey"
        />
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          href={GENERATING_SSH_KEY_PAIRS_URL}
          className="pf-v5-u-pl-0"
        >
          Learn more about SSH keys
        </Button>
      </FormGroup>
      <FormGroup>
        <Checkbox
          label="Administrator"
          isChecked={userIsAdministrator}
          onChange={(_e, value) => handleCheckboxChange(_e, value)}
          aria-label="Administrator"
          id="user Administrator"
          name="user Administrator"
        />
      </FormGroup>
      <Tooltip position="top-start" content={'Remove user'}>
        <FormGroup>
          <Button
            aria-label="remove user"
            onClick={onRemoveUserClick}
            variant="tertiary"
            icon={<TrashIcon />}
          ></Button>
        </FormGroup>
      </Tooltip>
    </>
  );
};

export default UserInfo;
