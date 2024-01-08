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
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
} from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { Distributions } from '../../../../store/imageBuilderApi';
import {
  changeDistribution,
  selectDistribution,
} from '../../../../store/wizardSlice';
import isRhel from '../../../../Utilities/isRhel';
import { toMonthAndYear } from '../../../../Utilities/time';

const ReleaseSelect = () => {
  // What the UI refers to as the "release" is referred to as the "distribution" in the API.
  // The Redux store follows the API convention, and data read from or to the store will use
  // the word "Distribution" instead of "Release".
  const distribution = useAppSelector((state) => selectDistribution(state));
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showDevelopmentOptions, setShowDevelopmentOptions] = useState(false);

  const handleSelect = (_event: React.MouseEvent, selection: Distributions) => {
    dispatch(changeDistribution(selection));
    setIsOpen(false);
  };

  const handleExpand = () => {
    setShowDevelopmentOptions(true);
  };

  const setDescription = (key: Distributions) => {
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
      [...RELEASES].filter(([key]) => {
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
          {RELEASES.get(key)}
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
        selections={RELEASES.get(distribution)}
        isOpen={isOpen}
        {...(!showDevelopmentOptions && {
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
