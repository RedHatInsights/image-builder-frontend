import React, { useCallback } from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Flex,
  FlexItem,
  SearchInput,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';
import debounce from 'lodash/debounce';
import { Link } from 'react-router-dom';

import BlueprintCard from './BlueprintCard';
import BlueprintsPagination from './BlueprintsPagination';

import {
  DEBOUNCED_SEARCH_WAIT_TIME,
  PAGINATION_OFFSET,
  PAGINATION_LIMIT,
} from '../../constants';
import { useGetBlueprintsQuery } from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectLimit,
  selectOffset,
  selectSelectedBlueprintId,
  setBlueprintId,
  setBlueprintSearchInput,
  setBlueprintsOffset,
} from '../../store/BlueprintSlice';
import { imageBuilderApi } from '../../store/enhancedImageBuilderApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  GetBlueprintsApiArg,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';

type blueprintSearchProps = {
  blueprintsTotal: number;
};

type emptyBlueprintStateProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentClass<SVGIconProps, any>;
  action: React.ReactNode;
  titleText: string;
  bodyText: string;
};

const BlueprintsSidebar = () => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintsOffset = useAppSelector(selectOffset) || PAGINATION_OFFSET;
  const blueprintsLimit = useAppSelector(selectLimit) || PAGINATION_LIMIT;

  const searchParams: GetBlueprintsApiArg = {
    limit: blueprintsLimit,
    offset: blueprintsOffset,
  };

  if (blueprintSearchInput) {
    searchParams.search = blueprintSearchInput;
  }

  const {
    data: blueprintsData,
    isLoading,
    isFetching,
  } = useGetBlueprintsQuery(searchParams);
  const dispatch = useAppDispatch();
  const blueprints = blueprintsData?.data;

  const blueprintsTotal = blueprintsData?.meta.count || 0;

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  if (
    blueprintsTotal === 0 &&
    blueprintSearchInput === undefined &&
    !isFetching
  ) {
    return (
      <EmptyBlueprintState
        icon={PlusCircleIcon}
        action={
          <Link
            to={resolveRelPath('imagewizard')}
            data-testid="create-blueprint-action-emptystate"
          >
            Add blueprint
          </Link>
        }
        titleText="No blueprints yet"
        bodyText="Add a blueprint and optionally build related images."
      />
    );
  }

  const handleClickViewAll = () => {
    dispatch(setBlueprintsOffset(0));
    dispatch(setBlueprintId(undefined));
  };

  return (
    <>
      <Stack hasGutter>
        {(blueprintsTotal > 0 ||
          blueprintSearchInput !== undefined ||
          isFetching) && (
          <>
            <StackItem>
              <BlueprintSearch blueprintsTotal={blueprintsTotal} />
            </StackItem>
            <StackItem>
              <Flex justifyContent={{ default: 'justifyContentCenter' }}>
                <FlexItem>
                  <Button
                    ouiaId={`clear-selected-blueprint-button`}
                    variant="link"
                    isDisabled={!selectedBlueprintId}
                    onClick={handleClickViewAll}
                  >
                    View all
                  </Button>
                </FlexItem>
              </Flex>
            </StackItem>
          </>
        )}
        {blueprintsTotal === 0 && (
          <EmptyBlueprintState
            icon={SearchIcon}
            action={
              <Button
                variant="link"
                onClick={() => dispatch(setBlueprintSearchInput(undefined))}
              >
                Clear all filters
              </Button>
            }
            titleText="No blueprints found"
            bodyText="No blueprints match your search criteria. Try a different search."
          />
        )}
        {blueprintsTotal > 0 &&
          blueprints?.map((blueprint: BlueprintItem) => (
            <StackItem key={blueprint.id}>
              <BlueprintCard blueprint={blueprint} />
            </StackItem>
          ))}
        <BlueprintsPagination />
      </Stack>
    </>
  );
};

const BlueprintSearch = ({ blueprintsTotal }: blueprintSearchProps) => {
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const dispatch = useAppDispatch();
  const debouncedSearch = useCallback(
    debounce((filter) => {
      dispatch(setBlueprintsOffset(0));
      dispatch(imageBuilderApi.util.invalidateTags([{ type: 'Blueprints' }]));
      dispatch(setBlueprintSearchInput(filter.length > 0 ? filter : undefined));
    }, DEBOUNCED_SEARCH_WAIT_TIME),
    []
  );
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  const onChange = (value: string) => {
    if (value.length === 0) {
      dispatch(setBlueprintSearchInput(undefined));
    } else {
      debouncedSearch(value);
    }
  };

  return (
    <SearchInput
      value={blueprintSearchInput || ''}
      placeholder="Search by name or description"
      onChange={(_event, value) => onChange(value)}
      onClear={() => onChange('')}
      resultsCount={`${blueprintsTotal} blueprints`}
      data-testid="blueprints-search-input"
    />
  );
};

const EmptyBlueprintState = ({
  titleText,
  bodyText,
  icon,
  action,
}: emptyBlueprintStateProps) => (
  <EmptyState variant="sm">
    <EmptyStateHeader
      titleText={titleText}
      headingLevel="h4"
      icon={<EmptyStateIcon icon={icon} />}
    />
    <EmptyStateBody>{bodyText}</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>{action}</EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export default BlueprintsSidebar;
