import React, { useEffect } from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  Spinner,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../constants';
import { PolicyRead, usePolicyQuery } from '../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  OpenScapProfile,
  useGetOscapCustomizationsQuery,
} from '../../../../store/imageBuilderApi';
import {
  changeCompliance,
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectDistribution,
} from '../../../../store/wizardSlice';

type OscapProfileInformationOptionPropType = {
  allowChangingCompliancePolicy?: boolean;
};

export const OscapProfileInformation = ({
  allowChangingCompliancePolicy = false,
}: OscapProfileInformationOptionPropType): JSX.Element => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(selectDistribution);
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const {
    data: oscapProfileInfo,
    isFetching: isFetchingOscapProfileInfo,
    isSuccess: isSuccessOscapProfileInfo,
  } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    }
  );

  const {
    data: policyInfo,
    isFetching: isFetchingPolicyInfo,
    isSuccess: isSuccessPolicyInfo,
  } = usePolicyQuery(
    {
      policyId: compliancePolicyID || '',
    },
    {
      skip:
        !allowChangingCompliancePolicy || complianceProfileID ? true : false,
    }
  );

  useEffect(() => {
    if (!policyInfo || policyInfo.data === undefined) {
      return;
    }
    const pol = policyInfo.data as PolicyRead;
    dispatch(
      changeCompliance({
        policyID: pol.id,
        profileID: pol.ref_id,
        policyTitle: pol.title,
      })
    );
  }, [isSuccessPolicyInfo]);

  const enabledServicesDisplayString =
    oscapProfileInfo?.services?.enabled?.join(' ');
  const disabledAndMaskedServices = [
    ...(oscapProfileInfo?.services?.disabled ?? []),
    ...(oscapProfileInfo?.services?.masked ?? []),
  ];
  const disabledAndMaskedServicesDisplayString =
    disabledAndMaskedServices.join(' ');

  const oscapProfile = oscapProfileInfo?.openscap as OpenScapProfile;

  return (
    <>
      {(isFetchingOscapProfileInfo || isFetchingPolicyInfo) && (
        <Spinner size="lg" />
      )}
      {isSuccessOscapProfileInfo && (
        <>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-v5-u-min-width"
              >
                Profile description:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {oscapProfile?.profile_description}
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-v5-u-min-width"
              >
                Operating system:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {RELEASES.get(release)}
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-v5-u-min-width"
              >
                Reference ID:
              </TextListItem>
              <TextListItem
                data-testid="oscap-profile-info-ref-id"
                component={TextListItemVariants.dd}
              >
                {oscapProfile?.profile_id}
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-v5-u-min-width"
              >
                Disabled services:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <CodeBlock>
                  <CodeBlockCode>
                    {disabledAndMaskedServicesDisplayString}
                  </CodeBlockCode>
                </CodeBlock>
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-v5-u-min-width"
              >
                Enabled services:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <CodeBlock>
                  <CodeBlockCode>{enabledServicesDisplayString}</CodeBlockCode>
                </CodeBlock>
              </TextListItem>
            </TextList>
          </TextContent>
        </>
      )}
    </>
  );
};

export default OscapProfileInformation;
