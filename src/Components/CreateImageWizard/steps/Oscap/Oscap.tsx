import React, { useEffect, useState } from 'react';

import {
  Alert,
  FormGroup,
  Popover,
  TextContent,
  Text,
  Button,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { HelpIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import OscapProfileInformation from './OscapProfileInformation';

import {
  RHEL_9_BETA,
  RHEL_9,
  RHEL_10_BETA,
  RHEL_10,
} from '../../../../constants';
import { useGetOscapProfilesQuery } from '../../../../store/backendApi';
import { usePoliciesQuery, PolicyRead } from '../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  Distributions,
  DistributionProfileItem,
  Filesystem,
  OpenScapProfile,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  Services,
} from '../../../../store/imageBuilderApi';
import {
  changeCompliance,
  selectDistribution,
  selectComplianceProfileID,
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  addPackage,
  addPartition,
  changeFileSystemConfigurationType,
  removePackage,
  clearPartitions,
  selectImageTypes,
  changeEnabledServices,
  changeMaskedServices,
  changeDisabledServices,
  changeKernelAppend,
  selectComplianceType,
} from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';
import { parseSizeUnit } from '../../utilities/parseSizeUnit';
import { Partition, Units } from '../FileSystem/FileSystemTable';

const OpenSCAPFGLabel = () => {
  return (
    <>
      OpenSCAP profile
      <Popover
        maxWidth="30rem"
        bodyContent={
          <TextContent>
            <Text>
              To run a manual compliance scan in OpenSCAP, download this image.
            </Text>
          </TextContent>
        }
      >
        <Button
          variant="plain"
          aria-label="About OpenSCAP"
          isInline
          className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0 pf-v5-u-pr-0"
        >
          <HelpIcon />
        </Button>
      </Popover>
    </>
  );
};

const ProfileSelector = () => {
  const policyID = useAppSelector(selectCompliancePolicyID);
  const policyTitle = useAppSelector(selectCompliancePolicyTitle);
  const profileID = useAppSelector(selectComplianceProfileID);
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const majorVersion = release.split('-')[1];
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const complianceType = useAppSelector(selectComplianceType);

  const {
    data: profiles,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetOscapProfilesQuery(
    {
      distribution: release,
    },
    {
      skip: complianceType === 'compliance',
    }
  );

  const {
    data: policies,
    isFetching: isFetchingPolicies,
    isSuccess: isSuccessPolicies,
  } = usePoliciesQuery(
    {
      filter: `os_major_version=${majorVersion}`,
    },
    {
      skip: complianceType === 'openscap',
    }
  );

  const { data: currentProfileData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: profileID,
    },
    { skip: !profileID }
  );

  const [trigger] = useLazyGetOscapCustomizationsQuery();

  useEffect(() => {
    if (!policies || policies.data === undefined) {
      return;
    }

    if (policyID && !policyTitle) {
      for (const p of policies.data) {
        const pol = p as PolicyRead;
        if (pol.id === policyID) {
          dispatch(
            changeCompliance({
              policyID: pol.id,
              profileID: pol.ref_id,
              policyTitle: pol.title,
            })
          );
        }
      }
    }
  }, [isSuccessPolicies]);

  const handleToggle = () => {
    if (!isOpen && complianceType === 'openscap') {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(
      changeCompliance({
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      })
    );
    clearOscapPackages(currentProfileData?.packages || []);
    dispatch(changeFileSystemConfigurationType('automatic'));
    handleServices(undefined);
    dispatch(changeKernelAppend(''));
  };

  const handlePackages = (
    oldOscapPackages: string[],
    newOscapPackages: string[]
  ) => {
    clearOscapPackages(oldOscapPackages);

    for (const pkg of newOscapPackages) {
      dispatch(
        addPackage({
          name: pkg,
          summary: 'Required by chosen OpenSCAP profile',
          repository: 'distro',
        })
      );
    }
  };

  const clearOscapPackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
  };

  const handlePartitions = (oscapPartitions: Filesystem[]) => {
    dispatch(clearPartitions());

    const newPartitions = oscapPartitions.map((filesystem) => {
      const [size, unit] = parseSizeUnit(filesystem.min_size);
      const partition: Partition = {
        mountpoint: filesystem.mountpoint,
        min_size: size.toString(),
        unit: unit as Units,
        id: uuidv4(),
      };
      return partition;
    });

    if (newPartitions) {
      dispatch(changeFileSystemConfigurationType('manual'));
      for (const partition of newPartitions) {
        dispatch(addPartition(partition));
      }
    }
  };

  const handleServices = (services: Services | undefined) => {
    dispatch(changeEnabledServices(services?.enabled || []));
    dispatch(changeMaskedServices(services?.masked || []));
    dispatch(changeDisabledServices(services?.disabled || []));
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: OScapSelectOptionValueType | ComplianceSelectOptionValueType
  ) => {
    if (selection.profileID === undefined) {
      // handle user has selected 'None' case
      handleClear();
    } else {
      const oldOscapPackages = currentProfileData?.packages || [];
      trigger(
        {
          distribution: release,
          profile: selection.profileID as DistributionProfileItem,
        },
        true // preferCacheValue
      )
        .unwrap()
        .then((response) => {
          const oscapPartitions = response.filesystem || [];
          const newOscapPackages = response.packages || [];
          handlePartitions(oscapPartitions);
          handlePackages(oldOscapPackages, newOscapPackages);
          handleServices(response.services);
          dispatch(changeKernelAppend(response.kernel?.append || ''));
          if (complianceType === 'openscap') {
            dispatch(
              changeCompliance({
                profileID: selection.profileID,
                policyID: undefined,
                policyTitle: undefined,
              })
            );
          } else {
            const compl = selection as ComplianceSelectOptionValueType;
            dispatch(
              changeCompliance({
                profileID: compl.profileID,
                policyID: compl.policyID,
                policyTitle: compl.toString(),
              })
            );
          }
        });
    }
    setIsOpen(false);
  };

  const options = () => {
    if (profiles) {
      return [<OScapNoneOption key="oscap-none-option" />].concat(
        profiles.map((profile_id, index) => {
          return <OScapSelectOption key={index} profile_id={profile_id} />;
        })
      );
    }
  };

  const complianceOptions = () => {
    if (!policies || policies.data === undefined) {
      return [];
    }

    const res = [<ComplianceNoneOption key="compliance-non-option" />];
    for (const p of policies.data) {
      if (p === undefined) {
        continue;
      }
      const pol = p as PolicyRead;
      res.push(<ComplianceSelectOption key={pol.id} policy={pol} />);
    }
    return res;
  };

  return (
    <FormGroup
      data-testid="profiles-form-group"
      label={complianceType === 'openscap' ? <OpenSCAPFGLabel /> : <>Policy</>}
    >
      {complianceType === 'openscap' && (
        <Select
          loadingVariant={isFetching ? 'spinner' : undefined}
          ouiaId="profileSelect"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          maxHeight="300px"
          selections={profileID}
          isOpen={isOpen}
          placeholderText="Select a profile"
          typeAheadAriaLabel="Select a profile"
          isDisabled={!isSuccess || hasWslTargetOnly}
          onFilter={(_event, value) => {
            if (profiles) {
              return [<OScapNoneOption key="oscap-none-option" />].concat(
                profiles.map((profile_id, index) => {
                  return (
                    <OScapSelectOption
                      key={index}
                      profile_id={profile_id}
                      filter={value}
                    />
                  );
                })
              );
            }
          }}
        >
          {options()}
        </Select>
      )}
      {complianceType === 'compliance' && (
        <Select
          isDisabled={isFetchingPolicies}
          isOpen={isOpen}
          onSelect={handleSelect}
          onToggle={handleToggle}
          selections={
            isFetchingPolicies
              ? 'Loading policies'
              : policyTitle || policyID || 'None'
          }
          ouiaId="compliancePolicySelect"
        >
          {complianceOptions()}
        </Select>
      )}
      {isError && (
        <Alert
          title="Error fetching the profiles"
          variant="danger"
          isPlain
          isInline
        >
          Cannot get the list of profiles
        </Alert>
      )}
    </FormGroup>
  );
};

const OScapNoneOption = () => {
  return (
    <SelectOption value={{ toString: () => 'None', compareTo: () => false }} />
  );
};

type OScapSelectOptionPropType = {
  profile_id: DistributionProfileItem;
  filter?: string;
};

type OScapSelectOptionValueType = {
  profileID: DistributionProfileItem;
  toString: () => string;
};

const OScapSelectOption = ({
  profile_id,
  filter,
}: OScapSelectOptionPropType) => {
  const release = useAppSelector(selectDistribution);
  const { data } = useGetOscapCustomizationsQuery({
    distribution: release,
    profile: profile_id,
  });
  const oscapProfile = data?.openscap as OpenScapProfile;
  if (
    filter &&
    !oscapProfile?.profile_name?.toLowerCase().includes(filter.toLowerCase())
  ) {
    return null;
  }
  const selectObject = (
    id: DistributionProfileItem,
    name?: string
  ): OScapSelectOptionValueType => ({
    profileID: id,
    toString: () => name || '',
  });

  return (
    <SelectOption
      key={profile_id}
      value={selectObject(profile_id, oscapProfile?.profile_name)}
      description={oscapProfile?.profile_description}
    />
  );
};
type ComplianceSelectOptionPropType = {
  policy: PolicyRead;
};

type ComplianceSelectOptionValueType = {
  policyID: string;
  profileID: string;
  toString: () => string;
};

const ComplianceNoneOption = () => {
  return (
    <SelectOption value={{ toString: () => 'None', compareTo: () => false }} />
  );
};

const ComplianceSelectOption = ({ policy }: ComplianceSelectOptionPropType) => {
  const selectObj = (
    policyID: string,
    profileID: string,
    title: string
  ): ComplianceSelectOptionValueType => ({
    policyID,
    profileID,
    toString: () => title,
  });

  const descr = (
    <>
      Threshold: {policy.compliance_threshold}
      <br />
      Active systems: {policy.total_system_count}
    </>
  );

  return (
    <SelectOption
      key={policy.id}
      value={selectObj(policy.id!, policy.ref_id!, policy.title!)}
      description={descr}
    />
  );
};

// The beta releases won't have any oscap profiles associated with them,
// so just use the ones from the major release.
export const removeBetaFromRelease = (dist: Distributions): Distributions => {
  switch (dist) {
    case RHEL_10_BETA:
      return RHEL_10 as Distributions;
    case RHEL_9_BETA:
      return RHEL_9;
    default:
      return dist;
  }
};

export const Oscap = () => {
  const oscapProfile = useAppSelector(selectComplianceProfileID);
  const environments = useAppSelector(selectImageTypes);

  return (
    <>
      {environments.includes('wsl') && (
        <Alert
          variant="warning"
          isInline
          title="OpenSCAP profiles are not compatible with WSL images."
        />
      )}
      <ProfileSelector />
      <OscapProfileInformation />
      {oscapProfile && (
        <Alert
          variant="info"
          isInline
          isPlain
          title="Additional customizations"
        >
          Selecting an OpenSCAP profile will cause the appropriate packages,
          file system configuration, kernel arguments, and services to be added
          to your image.
        </Alert>
      )}
    </>
  );
};
