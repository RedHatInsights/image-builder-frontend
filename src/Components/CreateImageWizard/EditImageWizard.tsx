import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import CreateImageWizard from './CreateImageWizard';
import { mapRequestToState } from './utilities/requestMapper';

import { useGetBlueprintQuery } from '../../store/backendApi';
import { useAppDispatch } from '../../store/hooks';
import { loadWizardState } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';

type EditImageWizardProps = {
  blueprintId: string;
};

const EditImageWizard = ({ blueprintId }: EditImageWizardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    data: blueprintDetails,
    error,
    isSuccess,
  } = useGetBlueprintQuery({
    id: blueprintId,
  });

  useEffect(() => {
    if (blueprintId && blueprintDetails) {
      const editBlueprintState = mapRequestToState(blueprintDetails);
      dispatch(loadWizardState(editBlueprintState));
    }
  }, [blueprintId, blueprintDetails, dispatch]);
  useEffect(() => {
    // redirect to the main page if the composeId is invalid

    if (error) {
      navigate(resolveRelPath(''));
    }
  }, [error, navigate]);
  return isSuccess ? <CreateImageWizard isEdit /> : undefined;
};

export default EditImageWizard;
