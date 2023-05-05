import React from 'react';

import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ImageBuildStatus } from './ImageBuildStatus';

import { useGetAWSSourcesQuery } from '../../store/apiSlice';
import {
  selectClonesById,
  selectComposeById,
  selectImageById,
} from '../../store/composesSlice';

const Row = ({ imageId }) => {
  const image = useSelector((state) => selectImageById(state, imageId));
  const { data: awsSources, isSuccess } = useGetAWSSourcesQuery();

  const getAccount = (image) => {
    if (image.share_with_sources?.[0]) {
      if (isSuccess) {
        const accountId = awsSources.find(
          (source) => source.id === image.share_with_sources[0]
        )?.account_id;
        return accountId;
      }
      return null;
    }
    return image.share_with_accounts?.[0];
  };

  return (
    <Tbody>
      <Tr>
        <Td dataLabel="UUID">{image.id}</Td>
        <Td dataLabel="Account">{getAccount(image)}</Td>
        <Td dataLabel="Region">{image.region}</Td>
        <Td dataLabel="Status">
          <ImageBuildStatus imageId={image.id} imageRegion={image.region} />
        </Td>
      </Tr>
    </Tbody>
  );
};

const ClonesTable = ({ composeId }) => {
  const parentCompose = useSelector((state) =>
    selectComposeById(state, composeId)
  );
  const clones = useSelector((state) => selectClonesById(state, composeId));

  return (
    <TableComposable
      variant="compact"
      className="pf-u-mb-md"
      data-testid="clones-table"
    >
      <Thead>
        <Tr className="no-bottom-border">
          <Th className="pf-m-width-40">UUID</Th>
          <Th className="pf-m-width-20">Account</Th>
          <Th className="pf-m-width-20">Region</Th>
          <Th className="pf-m-width-20">Status</Th>
        </Tr>
      </Thead>
      <Row imageId={parentCompose.id} imageType={'compose'} />
      {clones.map((clone) => (
        <Row imageId={clone.id} key={clone.id} />
      ))}
    </TableComposable>
  );
};

Row.propTypes = {
  imageId: PropTypes.string,
};

ClonesTable.propTypes = {
  composeId: PropTypes.string,
};

export default ClonesTable;
