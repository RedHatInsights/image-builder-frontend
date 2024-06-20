import React from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { useNavigate } from 'react-router-dom';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import { resolveRelPath } from '../../Utilities/path';

export const EditBlueprintButton = () => {
  const navigate = useNavigate();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);

  return (
    <Button
      ouiaId="edit-blueprint-button"
      onClick={() =>
        navigate(resolveRelPath(`imagewizard/${selectedBlueprintId}`))
      }
      variant="secondary"
    >
      Edit blueprint
    </Button>
  );
};
