import React from 'react';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Unavailable from '@redhat-cloud-services/frontend-components/Unavailable';
import { useFlag } from '@unleash/proxy-client-react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import {
  getNotificationProp,
  manageEdgeImagesUrlName,
} from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';

const ImageDetail = () => {
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
    <AsyncComponent
      appName="edge"
      module="./ImagesDetail"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeImagesUrlName}
      paramsProp={useParams}
    />;
  }
  return <Unavailable />;
};

export default ImageDetail;
