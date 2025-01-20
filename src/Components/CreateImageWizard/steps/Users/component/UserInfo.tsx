import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateFooter,
  EmptyStateVariant,
  FormGroup,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

import { GENERATING_SSH_KEY_PAIRS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  removeUser,
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

  const onRemoveUserClick = () => {
    dispatch(removeUser());
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
      <EmptyState variant={EmptyStateVariant.lg}>
        <EmptyStateFooter>
          <Popover
            hasAutoWidth
            maxWidth="35rem"
            bodyContent={
              <TextContent>
                <Text>
                  If you regret and do not want to add a user it is totally
                  fine, just click the button to remove it
                </Text>
              </TextContent>
            }
          >
            <Button
              variant="plain"
              aria-label="Activation key popover"
              aria-describedby="subscription-activation-key"
              className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0 pf-v5-u-pr-0"
            >
              <HelpIcon />
            </Button>
          </Popover>
          <Button variant="secondary" onClick={onRemoveUserClick}>
            Remove a user
          </Button>
        </EmptyStateFooter>
      </EmptyState>
    </>
  );
};

export default UserInfo;
