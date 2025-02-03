import React, { useEffect, useState } from 'react';

import {
  Button,
  Checkbox,
  FormGroup,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

import { INSIGHTS_URL, RHC_URL, RHEL_10_BETA } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeRegistrationType,
  selectDistribution,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

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
            href={INSIGHTS_URL}
          >
            Learn more about Red Hat Insights
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0"
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
            href={RHC_URL}
          >
            Learn more about remote host configuration
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0"
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
  const distribution = useAppSelector(selectDistribution);
  const registrationType = useAppSelector(selectRegistrationType);

  const [showOptions, setShowOptions] = useState(
    registrationType === 'register-now-rhc'
  );

  // TO DO: Remove when rhc starts working for RHEL 10 Beta
  useEffect(() => {
    if (distribution === RHEL_10_BETA) {
      dispatch(changeRegistrationType('register-now-insights'));
    }
  }, []);

  return (
    <FormGroup label="Registration method">
      <Checkbox
        label="Automatically register and enable advanced capabilities"
        data-testid="automatically-register-checkbox"
        isChecked={
          registrationType === 'register-now' ||
          registrationType === 'register-now-insights' ||
          registrationType === 'register-now-rhc'
        }
        onChange={(_event, checked) => {
          // TO DO: Update when rhc starts working for RHEL 10 Beta
          if (checked && distribution !== RHEL_10_BETA) {
            dispatch(changeRegistrationType('register-now-rhc'));
          } else if (checked && distribution === RHEL_10_BETA) {
            dispatch(changeRegistrationType('register-now-insights'));
          } else {
            dispatch(changeRegistrationType('register-later'));
            setShowOptions(false);
          }
        }}
        id="register-system-now"
        name="register-system-now"
        autoFocus
        description={
          <Button
            component="a"
            data-testid="registration-additional-options"
            variant="link"
            isDisabled={!registrationType.startsWith('register-now')}
            isInline
            onClick={() => setShowOptions(!showOptions)}
          >
            {`${!showOptions ? 'Show' : 'Hide'} additional connection options`}
          </Button>
        }
        body={
          showOptions && (
            <Checkbox
              className="pf-v5-u-ml-lg"
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
                  // TO DO: Remove when rhc starts working for RHEL 10 Beta
                  isDisabled={distribution === RHEL_10_BETA}
                  id="register-system-now-rhc"
                  name="register-system-rhc"
                />
              }
            />
          )
        }
      />
    </FormGroup>
  );
};

export default Registration;
