import React from 'react';

import { Pagination, PaginationVariant } from '@patternfly/react-core';
import { OnSetPage } from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';

import { useGetBlueprintsQuery } from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectLimit,
  selectOffset,
  setBlueprintLimit,
  setBlueprintsOffset,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { GetBlueprintsApiArg } from '../../store/imageBuilderApi';

const BlueprintsPagination = () => {
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintsOffset = useAppSelector(selectOffset) || 0;
  const blueprintsLimit = useAppSelector(selectLimit) || 10;
  const currPage = Math.floor(blueprintsOffset / blueprintsLimit) + 1;

  const searchParams: GetBlueprintsApiArg = {
    limit: blueprintsLimit,
    offset: blueprintsOffset,
  };

  if (blueprintSearchInput) {
    searchParams.search = blueprintSearchInput;
  }

  const { data: blueprintsData } = useGetBlueprintsQuery(searchParams);
  const dispatch = useAppDispatch();

  const blueprintsTotal = blueprintsData?.meta.count || 0;
  const onSetPage: OnSetPage = (_, page) => {
    const direction = page > currPage ? 1 : -1; // Calculate offset based on direction of paging
    const nextOffset = blueprintsOffset + direction * blueprintsLimit;
    dispatch(setBlueprintsOffset(nextOffset));
  };
  const onPerPageSelect: OnSetPage = (_, perPage) => {
    dispatch(setBlueprintsOffset(0));
    dispatch(setBlueprintLimit(perPage));
  };
  return (
    <Pagination
      variant={PaginationVariant.bottom}
      itemCount={blueprintsTotal}
      perPage={blueprintsLimit}
      page={currPage}
      onSetPage={onSetPage}
      onPerPageSelect={onPerPageSelect}
      widgetId="blueprints-pagination-bottom"
      data-testid="blueprints-pagination-bottom"
      isCompact
    />
  );
};

export default BlueprintsPagination;
