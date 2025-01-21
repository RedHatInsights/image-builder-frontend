import React from 'react';

import './ImageBuildStatus.scss';
import {
  Alert,
  Button,
  CodeBlock,
  CodeBlockCode,
  Flex,
  Panel,
  PanelMain,
  Popover,
  Skeleton,
  Spinner,
  Text,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CopyIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OffIcon,
  PendingIcon,
} from '@patternfly/react-icons';

import {
  AWS_S3_EXPIRATION_TIME_IN_HOURS,
  OCI_STORAGE_EXPIRATION_TIME_IN_DAYS,
} from '../../constants';
import {
  ClonesResponseItem,
  ComposeStatus,
  ComposeStatusError,
  ComposesResponseItem,
  UploadStatus,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';

type StatusClonePropTypes = {
  clone: ClonesResponseItem;
  status: UploadStatus | undefined;
};

export const StatusClone = ({ clone, status }: StatusClonePropTypes) => {
  switch (status?.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses.failureSharing.icon}
          text={statuses.failureSharing.text}
          error={`Failed to share image to ${clone.request.region}`}
        />
      );
    case 'success':
    case 'running':
    case 'pending':
      return (
        <Status
          icon={statuses[status.status].icon}
          text={statuses[status.status].text}
        />
      );
    default:
      return <></>;
  }
};

type ComposeStatusPropTypes = {
  compose: ComposesResponseItem;
};

export const AwsDetailsStatus = ({ compose }: ComposeStatusPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <></>;
  }

  switch (data?.image_status.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses[data.image_status.status].icon}
          text={statuses[data.image_status.status].text}
          error={data.image_status.error || ''}
        />
      );
    default:
      return (
        <Status
          icon={statuses[data!.image_status.status].icon}
          text={statuses[data!.image_status.status].text}
        />
      );
  }
};

type CloudStatusPropTypes = {
  compose: ComposesResponseItem;
};

export const CloudStatus = ({ compose }: CloudStatusPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  switch (data?.image_status.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses['failure'].icon}
          text={statuses['failure'].text}
          error={data.image_status.error || ''}
        />
      );
    default:
      return (
        <Status
          icon={statuses[data!.image_status.status].icon}
          text={statuses[data!.image_status.status].text}
        />
      );
  }
};

type AzureStatusPropTypes = {
  status: ComposeStatus;
};

export const AzureStatus = ({ status }: AzureStatusPropTypes) => {
  switch (status.image_status.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
          error={status.image_status.error || ''}
        />
      );
    default:
      return (
        <Status
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
        />
      );
  }
};

type ExpiringStatusPropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
  timeToExpiration: number;
};

export const ExpiringStatus = ({
  compose,
  isExpired,
  timeToExpiration,
}: ExpiringStatusPropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const status = composeStatus!.image_status.status;
  const remainingHours = AWS_S3_EXPIRATION_TIME_IN_HOURS - timeToExpiration;
  const remainingDays = OCI_STORAGE_EXPIRATION_TIME_IN_DAYS - timeToExpiration;

  const imageType = compose.request.image_requests[0].upload_request.type;

  if (isExpired) {
    return (
      <Status icon={statuses['expired'].icon} text={statuses['expired'].text} />
    );
  } else if (imageType === 'aws.s3' && status === 'success') {
    return (
      <Status
        icon={statuses['expiring'].icon}
        text={`Expires in ${remainingHours} ${
          remainingHours > 1 ? 'hours' : 'hour'
        }`}
      />
    );
  } else if (imageType === 'oci.objectstorage' && status === 'success') {
    return (
      <Status
        icon={statuses['expiring'].icon}
        text={`Expires in ${remainingDays} ${
          remainingDays > 1 ? 'days' : 'day'
        }`}
      />
    );
  } else if (status === 'failure') {
    return (
      <ErrorStatus
        icon={statuses[status].icon}
        text={statuses[status].text}
        error={composeStatus?.image_status.error || ''}
      />
    );
  } else {
    return <Status icon={statuses[status].icon} text={statuses[status].text} />;
  }
};

const statuses = {
  failure: {
    icon: <ExclamationCircleIcon className="error" />,
    text: 'Image build failed',
  },

  pending: {
    icon: <PendingIcon />,
    text: 'Image build is pending',
  },

  building: {
    icon: <Spinner isInline />,
    text: 'Image build in progress',
  },

  uploading: {
    icon: <Spinner isInline />,
    text: 'Image upload in progress',
  },

  registering: {
    icon: <Spinner isInline />,
    text: 'Cloud registration in progress',
  },

  running: {
    icon: <Spinner isInline />,
    text: 'Running',
  },

  success: {
    icon: <CheckCircleIcon className="success" />,
    text: 'Ready',
  },

  expired: {
    icon: <OffIcon />,
    text: 'Expired',
  },

  expiring: {
    icon: <ExclamationTriangleIcon className="expiring" />,
  },

  failureSharing: {
    icon: <ExclamationCircleIcon className="error" />,
    text: 'Sharing image failed',
  },

  failedClone: {
    icon: <ExclamationCircleIcon className="error" />,
    text: 'Failure sharing',
  },
};

type StatusPropTypes = {
  icon: JSX.Element;
  text: string;
};

const Status = ({ icon, text }: StatusPropTypes) => {
  return (
    <Flex className="pf-v5-u-align-items-baseline pf-m-nowrap">
      <div className="pf-v5-u-mr-sm">{icon}</div>
      <p>{text}</p>
    </Flex>
  );
};

type ErrorStatusPropTypes = {
  icon: JSX.Element;
  text: string;
  error: ComposeStatusError | string;
};

const ErrorStatus = ({ icon, text, error }: ErrorStatusPropTypes) => {
  let reason = '';
  const detailsArray: string[] = [];
  if (typeof error === 'string') {
    reason = error;
  } else {
    if (error.reason) {
      reason = error.reason;
    }
    if (Array.isArray(error.details)) {
      for (const line in error.details) {
        detailsArray.push(`${error.details[line]}`);
      }
    }
    if (typeof error.details === 'string') {
      detailsArray.push(error.details);
    }
    if (error.details?.reason) {
      detailsArray.push(`${error.details.reason}`);
    }
  }

  return (
    <Flex className="pf-v5-u-align-items-baseline pf-m-nowrap">
      <div className="pf-v5-u-mr-sm">{icon}</div>
      <Popover
        data-testid="errorstatus-popover"
        position="bottom"
        minWidth="40rem"
        bodyContent={
          <>
            <Alert variant="danger" title={text} isInline isPlain />
            <Text className="pf-v5-u-pt-md pf-v5-u-pb-md">{reason}</Text>
            <Panel isScrollable>
              <PanelMain maxHeight="25rem">
                <CodeBlock>
                  <CodeBlockCode>{detailsArray.join('\n')}</CodeBlockCode>
                </CodeBlock>
              </PanelMain>
            </Panel>
            <Button
              variant="link"
              onClick={() =>
                navigator.clipboard.writeText(
                  reason + '\n\n' + detailsArray.join('\n')
                )
              }
              className="pf-v5-u-pl-0 pf-v5-u-mt-md"
            >
              Copy error text to clipboard <CopyIcon />
            </Button>
          </>
        }
      >
        <Button variant="link" className="pf-v5-u-p-0 pf-v5-u-font-size-sm">
          <div className="failure-button">{text}</div>
        </Button>
      </Popover>
    </Flex>
  );
};
