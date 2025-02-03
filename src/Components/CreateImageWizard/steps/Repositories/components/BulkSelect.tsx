import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core/deprecated';

import { ApiRepositoryResponseRead } from '../../../../../store/contentSourcesApi';

interface BulkSelectProps {
  selected: Set<string>;
  contentList: ApiRepositoryResponseRead[];
  deselectAll: () => void;
  perPage: number;
  handleAddRemove: (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
    selected: boolean
  ) => void;
  isDisabled: boolean;
}

export function BulkSelect({
  selected,
  contentList,
  deselectAll,
  perPage,
  handleAddRemove,
  isDisabled,
}: BulkSelectProps) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  const allChecked = !contentList.some(({ uuid }) => !selected.has(uuid!));

  const someChecked =
    allChecked || contentList.some(({ uuid }) => selected.has(uuid!));

  const toggleDropdown = () => setDropdownIsOpen(!dropdownIsOpen);

  const handleSelectPage = () => handleAddRemove(contentList, !allChecked);

  return (
    <Dropdown
      toggle={
        <DropdownToggle
          id="stacked-example-toggle"
          isDisabled={isDisabled}
          splitButtonItems={[
            <DropdownToggleCheckbox
              id="example-checkbox-1"
              key="split-checkbox"
              aria-label="Select all"
              isChecked={allChecked || someChecked ? null : false}
              onClick={handleSelectPage}
            />,
          ]}
          onToggle={toggleDropdown}
        >
          {someChecked ? `${selected.size} selected` : null}
        </DropdownToggle>
      }
      isOpen={dropdownIsOpen}
      dropdownItems={[
        <DropdownItem
          key="none"
          isDisabled={!selected.size}
          onClick={() => {
            deselectAll();
            toggleDropdown();
          }}
        >{`Clear all (${selected.size} items)`}</DropdownItem>,
        <DropdownItem
          key="page"
          isDisabled={!contentList.length}
          onClick={() => {
            handleSelectPage();
            toggleDropdown();
          }}
        >{`${allChecked ? 'Remove' : 'Select'} page (${
          perPage > contentList.length ? contentList.length : perPage
        } items)`}</DropdownItem>,
      ]}
    />
  );
}
