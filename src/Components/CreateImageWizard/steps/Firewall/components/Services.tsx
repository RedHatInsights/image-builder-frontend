import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import {
  addDisabledFirewallService,
  addEnabledFirewallService,
  removeDisabledFirewallService,
  removeEnabledFirewallService,
  selectFirewall,
} from '../../../../../store/wizardSlice';
import ChippingInput from '../../../ChippingInput';
import { isServiceValid } from '../../../validators';

const Services = () => {
  const disabledServices = useAppSelector(selectFirewall).services.disabled;
  const enabledServices = useAppSelector(selectFirewall).services.enabled;

  return (
    <>
      <FormGroup label="Disabled services">
        <ChippingInput
          ariaLabel="Add disabled service"
          placeholder="Add disabled service"
          validator={isServiceValid}
          list={disabledServices}
          item="Disabled service"
          addAction={addDisabledFirewallService}
          removeAction={removeDisabledFirewallService}
        />
      </FormGroup>
      <FormGroup label="Enabled services">
        <ChippingInput
          ariaLabel="Add enabled service"
          placeholder="Add enabled service"
          validator={isServiceValid}
          list={enabledServices}
          item="Enabled service"
          addAction={addEnabledFirewallService}
          removeAction={removeEnabledFirewallService}
        />
      </FormGroup>
    </>
  );
};

export default Services;
