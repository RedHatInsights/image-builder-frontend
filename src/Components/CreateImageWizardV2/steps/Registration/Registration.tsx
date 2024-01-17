import React, { useState } from 'react';

import {
  Button,
  Checkbox,
  FormGroup,
  Popover,
  Radio,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { HelpIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeActivationKey,
  changeRegistrationType,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

const RHSMPopover = () => {
  return (
    <Popover
      headerContent="About Red Hat Subscription Management"
      position="right"
      minWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            Registered systems are entitled to support services, errata,
            patches, and upgrades.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/products/red-hat-subscription-management"
          >
            Learn more about Red Hat Subscription Management
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-c-form__group-label-help"
        aria-label="About remote host configuration (rhc)"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const InsightsPopover = () => {
  return (
    <Popover
      headerContent="About Red Hat Insights"
      position="right"
      minWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            Red Hat Insights client provides actionable intelligence about your
            Red Hat Enterprise Linux environments, helping to identify and
            address operational and vulnerability risks before an issue results
            in downtime.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/products/red-hat-insights"
          >
            Learn more about Red Hat Insights
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-c-form__group-label-help"
        aria-label="About remote host configuration (rhc)"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const RhcPopover = () => {
  return (
    <Popover
      headerContent="About remote host configuration (rhc)"
      position="right"
      minWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            Remote host configuration allows Red Hat Enterprise Linux hosts to
            connect to Red Hat Insights. Remote host configuration is required
            to use the Red Hat Insights Remediations service.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/articles/rhc"
          >
            Learn more about remote host configuration
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-c-form__group-label-help"
        aria-label="About remote host configuration (rhc)"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const Registration = () => {
  const dispatch = useAppDispatch();

  const registrationType = useAppSelector((state) =>
    selectRegistrationType(state)
  );

  const [showOptions, setShowOptions] = useState(
    registrationType === 'register-now-insights' ||
      registrationType === 'register-now'
  );

  return (
    <FormGroup label="Registration method">
      <Radio
        autoFocus
        label={
          (!showOptions &&
            'Automatically register and enable advanced capabilities') || (
            <>
              Monitor & manage subscriptions and access to Red Hat content
              <RHSMPopover />
            </>
          )
        }
        data-testid="registration-radio-now"
        name="register-system"
        id="register-system-now"
        isChecked={registrationType.startsWith('register-now')}
        onChange={() => {
          dispatch(changeRegistrationType('register-now-rhc'));
        }}
        description={
          !showOptions && (
            <Button
              component="a"
              data-testid="registration-additional-options"
              variant="link"
              isDisabled={!registrationType.startsWith('register-now')}
              isInline
              onClick={() => setShowOptions(!showOptions)}
            >
              Show additional connection options
            </Button>
          )
        }
        body={
          showOptions && (
            <Checkbox
              className="pf-u-ml-lg"
              label={
                <>
                  Enable predictive analytics and management capabilities
                  <InsightsPopover />
                </>
              }
              data-testid="registration-checkbox-insights"
              isChecked={
                registrationType === 'register-now-insights' ||
                registrationType === 'register-now-rhc'
              }
              onChange={(_event, checked) => {
                if (checked) {
                  dispatch(changeRegistrationType('register-now-insights'));
                } else {
                  dispatch(changeRegistrationType('register-now'));
                }
              }}
              id="register-system-now-insights"
              name="register-system-insights"
              body={
                <Checkbox
                  label={
                    <>
                      Enable remote remediations and system management with
                      automation
                      <RhcPopover />
                    </>
                  }
                  data-testid="registration-checkbox-rhc"
                  isChecked={registrationType === 'register-now-rhc'}
                  onChange={(_event, checked) => {
                    if (checked) {
                      dispatch(changeRegistrationType('register-now-rhc'));
                    } else {
                      dispatch(changeRegistrationType('register-now-insights'));
                    }
                  }}
                  id="register-system-now-rhc"
                  name="register-system-rhc"
                />
              }
            />
          )
        }
      />
      <Radio
        name="register-system"
        className="pf-u-mt-md"
        data-testid="registration-radio-later"
        id="register-system-later"
        label="Register later"
        isChecked={registrationType === 'register-later'}
        onChange={() => {
          setShowOptions(false);
          dispatch(changeRegistrationType('register-later'));
          dispatch(changeActivationKey(undefined));
        }}
      />
    </FormGroup>
  );
};

export default Registration;
