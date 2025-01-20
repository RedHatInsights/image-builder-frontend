import React from 'react';

import { Button, FormGroup } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { GENERATING_SSH_KEY_PAIRS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
} from '../../../../../store/wizardSlice';
import { useUsersValidation } from '../../../utilities/useValidation';
import { HookValidatedInput } from '../../../ValidatedTextInput';
const UserInfo = () => {
  const dispatch = useAppDispatch();
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    dispatch(setUserNameByIndex({ index: index, name: value }));
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    dispatch(setUserPasswordByIndex({ index: index, password: value }));
  };

  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    dispatch(setUserSshKeyByIndex({ index: index, sshKey: value }));
  };

  const stepValidation = useUsersValidation();

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
        <HookValidatedInput
          ariaLabel="blueprint user password"
          value={userPassword || ''}
          onChange={(_e, value) => handlePasswordChange(_e, value)}
          placeholder="Enter password"
          stepValidation={stepValidation}
          fieldName="userPassword"
        />
      </FormGroup>
      <FormGroup isRequired label="SSH key">
        <HookValidatedInput
          ariaLabel="public SSH key"
          value={userSshKey || ''}
          type={'text'}
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
    </>
  );
};

export default UserInfo;
