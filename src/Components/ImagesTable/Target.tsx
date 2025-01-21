import React from 'react';

import { Skeleton } from '@patternfly/react-core';

import { targetOptions } from '../../constants';
import { useGetComposeClonesQuery } from '../../store/imageBuilderApi';
import { ComposesResponseItem } from '../../store/imageBuilderApi';

type TargetPropTypes = {
  compose: ComposesResponseItem;
};

export const Target = ({ compose }: TargetPropTypes) => {
  return <p>{targetOptions[compose.request.image_requests[0].image_type]}</p>;
};

type AwsTargetPropTypes = {
  compose: ComposesResponseItem;
};

export const AwsTarget = ({ compose }: AwsTargetPropTypes) => {
  const { data, isSuccess } = useGetComposeClonesQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const text = `${targetOptions.aws} (${data?.data.length ?? 0 + 1})`;
  return <>{text}</>;
};
