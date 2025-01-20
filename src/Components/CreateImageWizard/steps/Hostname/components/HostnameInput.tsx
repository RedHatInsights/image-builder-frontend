import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeHostname,
  selectHostname,
} from '../../../../../store/wizardSlice';
import { useHostnameValidation } from '../../../utilities/useValidation';
import { HookValidatedInput } from '../../../ValidatedInput';

const HostnameInput = () => {
  const dispatch = useAppDispatch();
  const hostname = useAppSelector(selectHostname);

  const stepValidation = useHostnameValidation();

  const handleChange = (e: React.FormEvent, value: string) => {
    dispatch(changeHostname(value));
  };

  return (
    <FormGroup label="Hostname">
      <HookValidatedInput
        ariaLabel="hostname input"
        value={hostname}
        onChange={handleChange}
        placeholder="Add a hostname"
        stepValidation={stepValidation}
        fieldName="hostname"
      />
    </FormGroup>
  );
};

export default HostnameInput;
