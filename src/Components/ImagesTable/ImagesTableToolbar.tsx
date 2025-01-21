import React, { useState } from 'react';

import {
  Alert,
  AlertActionLink,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Title,
} from '@patternfly/react-core';

import { useGetBlueprintsQuery } from '../../store/backendApi';
import {
  selectSelectedBlueprintId,
  selectBlueprintSearchInput,
  selectBlueprintVersionFilterAPI,
} from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  useGetBlueprintComposesQuery,
  Distributions,
  GetBlueprintComposesApiArg,
} from '../../store/imageBuilderApi';
import { BlueprintActionsMenu } from '../Blueprints/BlueprintActionsMenu';
import BlueprintDiffModal from '../Blueprints/BlueprintDiffModal';
import BlueprintVersionFilter from '../Blueprints/BlueprintVersionFilter';
import { BuildImagesButton } from '../Blueprints/BuildImagesButton';
import { DeleteBlueprintModal } from '../Blueprints/DeleteBlueprintModal';
import { EditBlueprintButton } from '../Blueprints/EditBlueprintButton';

interface imagesTableToolbarProps {
  itemCount: number;
  perPage: number;
  page: number;
  setPage: (page: number) => void;
  onPerPageSelect: (event: React.MouseEvent, perPage: number) => void;
}

const ImagesTableToolbar: React.FC<imagesTableToolbarProps> = ({
  itemCount,
  perPage,
  page,
  setPage,
  onPerPageSelect,
}: imagesTableToolbarProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintVersionFilterAPI = useAppSelector(
    selectBlueprintVersionFilterAPI
  );

  const searchParams: GetBlueprintComposesApiArg = {
    id: selectedBlueprintId as string,
    limit: perPage,
    offset: perPage * (page - 1),
  };

  if (blueprintVersionFilterAPI) {
    searchParams.blueprintVersion = blueprintVersionFilterAPI;
  }

  const {
    data: blueprintsComposes,
    isFetching: isFetchingBlueprintsCompose,
    isSuccess: isSuccessBlueprintsCompose,
  } = useGetBlueprintComposesQuery(searchParams, {
    skip: !selectedBlueprintId,
  });

  const { selectedBlueprintName, selectedBlueprintVersion } =
    useGetBlueprintsQuery(
      { search: blueprintSearchInput as string },
      {
        selectFromResult: ({ data }) => {
          const bp = data?.data.find(
            (blueprint: BlueprintItem) => blueprint.id === selectedBlueprintId
          );
          return {
            selectedBlueprintName: bp?.name,
            selectedBlueprintVersion: bp?.version,
          };
        },
      }
    );

  const latestImageVersion = blueprintsComposes?.data[0]?.blueprint_version;

  const isBlueprintOutSync =
    selectedBlueprintId &&
    !isFetchingBlueprintsCompose &&
    latestImageVersion !== selectedBlueprintVersion;

  const pagination = (
    <Pagination
      itemCount={itemCount}
      perPage={perPage}
      page={page}
      onSetPage={(_, page) => setPage(page)}
      onPerPageSelect={onPerPageSelect}
      widgetId="compose-pagination-top"
      data-testid="images-pagination-top"
      isCompact
    />
  );

  const isBlueprintDistroCentos8 = () => {
    if (isSuccessBlueprintsCompose) {
      return (
        blueprintsComposes?.data[0].request.distribution ===
        ('centos-8' as Distributions)
      );
    }
  };

  return (
    <>
      <DeleteBlueprintModal
        setShowDeleteModal={setShowDeleteModal}
        isOpen={showDeleteModal}
      />
      {itemCount > 0 && isBlueprintOutSync && (
        <BlueprintDiffModal
          baseVersion={latestImageVersion}
          blueprintName={selectedBlueprintName}
          isOpen={showDiffModal}
          onClose={() => setShowDiffModal(false)}
        />
      )}
      <Toolbar>
        <ToolbarContent>
          <Title headingLevel="h2">
            {selectedBlueprintName
              ? `${selectedBlueprintName} images`
              : 'All images'}
          </Title>
        </ToolbarContent>
        {itemCount > 0 && isBlueprintOutSync && (
          <Alert
            style={{
              margin:
                '0 var(--pf-v5-c-toolbar__content--PaddingRight) 0 var(--pf-v5-c-toolbar__content--PaddingLeft)',
            }}
            isInline
            title={`The selected blueprint is at version ${selectedBlueprintVersion}, the latest images are at version ${latestImageVersion}. Build images to synchronize with the latest version.`}
            ouiaId="blueprint-out-of-sync-alert"
            actionLinks={
              <AlertActionLink
                onClick={() => setShowDiffModal(true)}
                id="blueprint_view_version_difference"
              >
                View the difference
              </AlertActionLink>
            }
          />
        )}
        {blueprintsComposes &&
          blueprintsComposes.data.length > 0 &&
          isBlueprintDistroCentos8() && (
            <Alert
              style={{
                margin:
                  '0 var(--pf-v5-c-toolbar__content--PaddingRight) 0 var(--pf-v5-c-toolbar__content--PaddingLeft)',
              }}
              isInline
              variant="warning"
              title="CentOS Stream 8 is no longer supported, building images from this blueprint will fail. Edit blueprint to update the release to CentOS Stream 9."
              ouiaId="centos-8-blueprint-alert"
            />
          )}

        <ToolbarContent>
          {selectedBlueprintId && (
            <>
              <ToolbarItem>
                <BlueprintVersionFilter onFilterChange={() => setPage(1)} />
              </ToolbarItem>
              <ToolbarItem>
                <BuildImagesButton />
              </ToolbarItem>
              <ToolbarItem>
                <EditBlueprintButton />
              </ToolbarItem>
              <ToolbarItem>
                <BlueprintActionsMenu setShowDeleteModal={setShowDeleteModal} />
              </ToolbarItem>
            </>
          )}
          <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
            {pagination}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </>
  );
};

export default ImagesTableToolbar;
