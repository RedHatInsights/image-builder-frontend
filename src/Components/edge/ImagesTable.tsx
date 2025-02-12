import React from 'react';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Unavailable from '@redhat-cloud-services/frontend-components/Unavailable';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { CREATING_IMAGES_WITH_IB_URL } from '../../constants';
import {
  getNotificationProp,
  manageEdgeImagesUrlName,
} from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';
import { useFlag } from '../../Utilities/useGetEnvironment';

const ImagesTable = () => {
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
  // Feature flag for the federated modules
  const edgeParityFlag = useFlag('edgeParity.image-list');
  // Feature flag to access the 'local' images table list
  const edgeLocalImageTable = useFlag('image-builder.edge.local-image-table');

  if (edgeLocalImageTable) {
    return <div />;
  }
  if (edgeParityFlag) {
    return (
      <AsyncComponent
        scope="edge"
        module="./Images"
        ErrorComponent={<ErrorState />}
        navigateProp={useNavigate}
        locationProp={useLocation}
        showHeaderProp={false}
        docLinkProp={CREATING_IMAGES_WITH_IB_URL}
        notificationProp={notificationProp}
        pathPrefix={resolveRelPath('')}
        urlName={manageEdgeImagesUrlName}
      />
    );
  }
  return <Unavailable />;
};

export default ImagesTable;
