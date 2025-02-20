import React, { ReactElement, useState } from 'react';

import { FormGroup } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import {
  RELEASES,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
  RHEL_9_BETA,
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
  RHEL_10_BETA,
  ON_PREM_RELEASES,
} from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { Distributions } from '../../../../store/imageBuilderApi';
import {
  changeDistribution,
  changeRegistrationType,
  selectDistribution,
} from '../../../../store/wizardSlice';
import isRhel from '../../../../Utilities/isRhel';
import { toMonthAndYear } from '../../../../Utilities/time';
import { useFlag } from '../../../../Utilities/useGetEnvironment';

const ReleaseSelect = () => {
  // What the UI refers to as the "release" is referred to as the "distribution" in the API.
  // The Redux store follows the API convention, and data read from or to the store will use
  // the word "Distribution" instead of "Release".
  const distribution = useAppSelector(selectDistribution);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showDevelopmentOptions, setShowDevelopmentOptions] = useState(false);

  const isRHEL9BetaEnabled = useFlag('image-builder.rhel9.beta.enabled');
  const isRHEL10BetaEnabled = useFlag('image-builder.rhel10.beta.enabled');

  const releases = process.env.IS_ON_PREMISE ? ON_PREM_RELEASES : RELEASES;

  const handleSelect = (_event: React.MouseEvent, selection: Distributions) => {
    if (!isRhel(selection)) {
      dispatch(changeRegistrationType('register-later'));
    } else {
      dispatch(changeRegistrationType('register-now-rhc'));
    }
    dispatch(changeDistribution(selection));
    setIsOpen(false);
  };

  const handleExpand = () => {
    setShowDevelopmentOptions(true);
  };

  const setDescription = (key: Distributions) => {
    if (process.env.IS_ON_PREMISE) {
      return '';
    }

    if (key === RHEL_9_BETA || key === RHEL_10_BETA) {
      return '';
    }

    let fullSupportEnd = '';
    let maintenanceSupportEnd = '';

    if (key === RHEL_8) {
      fullSupportEnd = toMonthAndYear(RHEL_8_FULL_SUPPORT[1]);
      maintenanceSupportEnd = toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[1]);
    }

    if (key === RHEL_9) {
      fullSupportEnd = toMonthAndYear(RHEL_9_FULL_SUPPORT[1]);
      maintenanceSupportEnd = toMonthAndYear(RHEL_9_MAINTENANCE_SUPPORT[1]);
    }

    if (isRhel(key)) {
      return `Full support ends: ${fullSupportEnd} | Maintenance support ends: ${maintenanceSupportEnd}`;
    }
  };

  const setSelectOptions = () => {
    const options: ReactElement[] = [];
    const filteredRhel = new Map(
      [...releases].filter(([key]) => {
        if (process.env.IS_ON_PREMISE) {
          return key === distribution;
        }

        if (key === RHEL_9_BETA) {
          return isRHEL9BetaEnabled;
        }

        if (key === RHEL_10_BETA) {
          return isRHEL10BetaEnabled;
        }

        // Only show non-RHEL distros if expanded
        if (showDevelopmentOptions) {
          return true;
        }
        return isRhel(key);
      })
    );

    filteredRhel.forEach((value, key) => {
      options.push(
        <SelectOption
          key={value}
          value={key}
          description={setDescription(key as Distributions)}
        >
          {releases.get(key)}
        </SelectOption>
      );
    });

    return options;
  };

  return (
    <FormGroup isRequired={true} label="Release">
      <Select
        ouiaId="release_select"
        variant={SelectVariant.single}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={handleSelect}
        selections={releases.get(distribution)}
        isOpen={isOpen}
        {...(!showDevelopmentOptions &&
          // Hide this for on-prem since the host
          // could be centos or fedora
          !process.env.IS_ON_PREMISE && {
            loadingVariant: {
              text: 'Show options for further development of RHEL',
              onClick: handleExpand,
            },
          })}
      >
        {setSelectOptions()}
      </Select>
    </FormGroup>
  );
};

export default ReleaseSelect;
