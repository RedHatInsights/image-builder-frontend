import React from 'react';

import {
  ActionGroup,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

import { PAGINATION_LIMIT, PAGINATION_OFFSET } from '../../constants';
import {
  backendApi,
  useDeleteBlueprintMutation,
  useGetBlueprintsQuery,
} from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectLimit,
  selectOffset,
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { GetBlueprintsApiArg } from '../../store/imageBuilderApi';

interface DeleteBlueprintModalProps {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const DeleteBlueprintModal: React.FunctionComponent<
  DeleteBlueprintModalProps
> = ({ setShowDeleteModal, isOpen }: DeleteBlueprintModalProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintsOffset = useAppSelector(selectOffset) || PAGINATION_OFFSET;
  const blueprintsLimit = useAppSelector(selectLimit) || PAGINATION_LIMIT;
  const dispatch = useAppDispatch();

  const searchParams: GetBlueprintsApiArg = {
    limit: blueprintsLimit,
    offset: blueprintsOffset,
  };

  if (blueprintSearchInput) {
    searchParams.search = blueprintSearchInput;
  }

  const { blueprintName } = useGetBlueprintsQuery(searchParams, {
    selectFromResult: ({ data }) => ({
      blueprintName: data?.data.find(
        (blueprint: { id: string | undefined }) =>
          blueprint.id === selectedBlueprintId
      )?.name,
    }),
  });
  const [deleteBlueprint] = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });
  const handleDelete = async () => {
    if (selectedBlueprintId) {
      setShowDeleteModal(false);
      await deleteBlueprint({ id: selectedBlueprintId });
      dispatch(setBlueprintId(undefined));
      dispatch(backendApi.util.invalidateTags([{ type: 'Blueprints' }]));
    }
  };
  const onDeleteClose = () => {
    setShowDeleteModal(false);
  };
  return (
    <Modal
      variant={ModalVariant.small}
      titleIconVariant="warning"
      isOpen={isOpen}
      onClose={onDeleteClose}
      title={'Delete blueprint?'}
      description={`All versions of ${blueprintName} and its associated images will be deleted.`}
    >
      <ActionGroup>
        <Button variant="danger" type="button" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="link" type="button" onClick={onDeleteClose}>
          Cancel
        </Button>
      </ActionGroup>
    </Modal>
  );
};
