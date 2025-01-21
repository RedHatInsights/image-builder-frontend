import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from '@patternfly/react-core';
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintExportResponse,
  useLazyExportBlueprintQuery,
} from '../../store/imageBuilderApi';
import { useFlagWithEphemDefault } from '../../Utilities/useGetEnvironment';
import BetaLabel from '../sharedComponents/BetaLabel';

interface BlueprintActionsMenuProps {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BlueprintActionsMenu: React.FunctionComponent<
  BlueprintActionsMenuProps
> = ({ setShowDeleteModal }: BlueprintActionsMenuProps) => {
  const [showBlueprintActionsMenu, setShowBlueprintActionsMenu] =
    useState(false);
  const onSelect = () => {
    setShowBlueprintActionsMenu(!showBlueprintActionsMenu);
  };
  const importExportFlag = useFlagWithEphemDefault(
    'image-builder.import.enabled'
  );

  const [trigger] = useLazyExportBlueprintQuery();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  if (selectedBlueprintId === undefined) {
    return null;
  }
  const handleClick = () => {
    trigger({ id: selectedBlueprintId })
      .unwrap()
      .then((response: BlueprintExportResponse) => {
        handleExportBlueprint(response.name, response);
      });
  };
  return (
    <Dropdown
      ouiaId={`blueprints-dropdown`}
      isOpen={showBlueprintActionsMenu}
      onSelect={onSelect}
      onOpenChange={(showBlueprintActionsMenu: boolean) =>
        setShowBlueprintActionsMenu(showBlueprintActionsMenu)
      }
      shouldFocusToggleOnSelect
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          isExpanded={showBlueprintActionsMenu}
          onClick={() => setShowBlueprintActionsMenu(!showBlueprintActionsMenu)}
          variant="plain"
          aria-label="blueprint menu toggle"
          data-testid="blueprint-action-menu-toggle"
        >
          <EllipsisVIcon aria-hidden="true" />
        </MenuToggle>
      )}
    >
      <DropdownList>
        {importExportFlag && (
          <DropdownItem onClick={handleClick}>
            Download blueprint (.json) <BetaLabel />
          </DropdownItem>
        )}
        <DropdownItem onClick={() => setShowDeleteModal(true)}>
          Delete blueprint
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

async function handleExportBlueprint(
  blueprintName: string,
  blueprint: BlueprintExportResponse
) {
  const jsonData = JSON.stringify(blueprint, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = blueprintName.replace(/\s/g, '_').toLowerCase() + '.json';
  link.click();
  URL.revokeObjectURL(url);
}
