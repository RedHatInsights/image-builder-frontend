import React, { ReactElement, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { ARCHES } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { ImageRequest } from '../../../../store/imageBuilderApi';
import {
  changeArchitecture,
  selectArchitecture,
} from '../../../../store/wizardSlice';

const ArchSelect = () => {
  const arch = useAppSelector(selectArchitecture);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const setArch = (
    _event: React.MouseEvent,
    selection: ImageRequest['architecture']
  ) => {
    dispatch(changeArchitecture(selection));
    setIsOpen(false);
  };

  const setSelectOptions = () => {
    const options: ReactElement[] = [];
    const arches = ARCHES.filter((a) => {
      // we don't want to support cross-arch
      // builds for on-prem for now
      if (process.env.IS_ON_PREMISE) {
        return a === arch;
      }
      return true;
    });
    arches.forEach((arch) => {
      options.push(
        <SelectOption key={arch} value={arch}>
          {arch}
        </SelectOption>
      );
    });

    return options;
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
      data-testid="arch_select"
    >
      {arch}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={true} label="Architecture">
      <Select
        ouiaId="arch_select"
        isOpen={isOpen}
        selected={arch}
        onSelect={setArch}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>{setSelectOptions()}</SelectList>
      </Select>
    </FormGroup>
  );
};

export default ArchSelect;
