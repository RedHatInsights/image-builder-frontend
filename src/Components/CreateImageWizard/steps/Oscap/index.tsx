import React, { useEffect } from 'react';

import {
  Button,
  Form,
  FormGroup,
  Radio,
  Text,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { Oscap, removeBetaFromRelease } from './Oscap';

import {
  COMPLIANCE_AND_VULN_SCANNING_URL,
  COMPLIANCE_PROD_URL,
  COMPLIANCE_STAGE_URL,
} from '../../../../constants';
import { useBackendPrefetch } from '../../../../store/backendApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../store/imageBuilderApi';
import {
  ComplianceType,
  selectComplianceProfileID,
  changeCompliance,
  changeComplianceType,
  changeEnabledServices,
  changeMaskedServices,
  changeDisabledServices,
  removePackage,
  changeFileSystemConfigurationType,
  changeKernelAppend,
  selectDistribution,
  selectComplianceType,
} from '../../../../store/wizardSlice';
import {
  useFlag,
  useGetEnvironment,
} from '../../../../Utilities/useGetEnvironment';

const OscapStep = () => {
  const dispatch = useAppDispatch();
  const complianceEnabled = useFlag('image-builder.compliance.enabled');
  const complianceType = useAppSelector(selectComplianceType);
  const profileID = useAppSelector(selectComplianceProfileID);
  const prefetchOscapProfile = useBackendPrefetch('getOscapProfiles', {});
  const { isProd } = useGetEnvironment();
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const { data: currentProfileData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: profileID,
    },
    { skip: !profileID }
  );

  useEffect(() => {
    prefetchOscapProfile({ distribution: release });
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTypeChange = (complianceType: string) => {
    dispatch(changeComplianceType(complianceType as ComplianceType));

    // Avoid showing profile information when switching between types by
    // clearing the compliance data.
    dispatch(
      changeCompliance({
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      })
    );
    const pkgs = currentProfileData?.packages || [];
    for (const pkg of pkgs) {
      dispatch(removePackage(pkg));
    }
    dispatch(changeFileSystemConfigurationType('automatic'));
    dispatch(changeEnabledServices([]));
    dispatch(changeMaskedServices([]));
    dispatch(changeDisabledServices([]));
    dispatch(changeKernelAppend(''));
  };

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        {complianceEnabled ? 'Compliance' : 'OpenSCAP profile'}
      </Title>
      {complianceEnabled && (
        <FormGroup>
          <Radio
            id="openscap radio openscap type"
            label="OpenSCAP"
            name="oscap-radio-openscap"
            isChecked={complianceType === 'openscap'}
            onChange={() => handleTypeChange('openscap')}
          />
          <Radio
            id="openscap radio compliance type"
            label="Insights compliance"
            name="oscap-radio-compliance"
            isChecked={complianceType === 'compliance'}
            onChange={() => handleTypeChange('compliance')}
          />
        </FormGroup>
      )}
      {(!complianceEnabled || complianceType === 'openscap') && (
        <Text>
          OpenSCAP enables you to automatically monitor the adherence of your
          registered RHEL systems to a selected regulatory compliance profile.
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={COMPLIANCE_AND_VULN_SCANNING_URL}
          >
            Documentation
          </Button>
        </Text>
      )}
      {complianceType === 'compliance' && (
        <Text>
          Insights compliance enables you to monitor the adherence of your
          registered RHEL systems to a selected compliance policy.
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={isProd() ? COMPLIANCE_PROD_URL : COMPLIANCE_STAGE_URL}
          >
            Define new policies in Insights Compliance
          </Button>
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={COMPLIANCE_AND_VULN_SCANNING_URL}
          >
            Documentation
          </Button>
        </Text>
      )}
      <Oscap />
    </Form>
  );
};

export default OscapStep;
