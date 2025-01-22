import React from 'react';

import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
  Popover,
  Spinner,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';

import { CONTENT_URL } from '../../../../constants';
import { ApiRepositoryResponse } from '../../../../store/contentSourcesApi';
import {
  convertStringToDate,
  timestampToDisplayString,
} from '../../../../Utilities/time';

import '../../../ImagesTable/ImageBuildStatus.scss';

const getLastIntrospection = (
  repoIntrospections: RepositoryStatusProps['repoIntrospections']
) => {
  const currentDate = Date.now();
  const lastIntrospectionDate = convertStringToDate(repoIntrospections);
  const timeDeltaInSeconds = Math.floor(
    (currentDate - lastIntrospectionDate) / 1000
  );

  if (timeDeltaInSeconds <= 60) {
    return 'A few seconds ago';
  } else if (timeDeltaInSeconds <= 60 * 60) {
    return 'A few minutes ago';
  } else if (timeDeltaInSeconds <= 60 * 60 * 24) {
    return 'A few hours ago';
  } else {
    return timestampToDisplayString(repoIntrospections);
  }
};

type RepositoryStatusProps = {
  repoStatus: ApiRepositoryResponse['status'];
  repoUrl: ApiRepositoryResponse['url'];
  repoIntrospections: ApiRepositoryResponse['last_introspection_time'];
  repoFailCount: ApiRepositoryResponse['failed_introspections_count'];
};

const RepositoriesStatus = ({
  repoStatus,
  repoUrl,
  repoIntrospections,
  repoFailCount,
}: RepositoryStatusProps) => {
  if (repoStatus === 'Valid') {
    return (
      <>
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>{' '}
        <span className="pf-v5-u-font-weight-bold pf-v5-u-success-color-200">
          {repoStatus}
        </span>
      </>
    );
  } else if (repoStatus === 'Invalid' || repoStatus === 'Unavailable') {
    return (
      <>
        <Popover
          position="bottom"
          minWidth="30rem"
          bodyContent={
            <>
              <Alert
                variant={repoStatus === 'Invalid' ? 'danger' : 'warning'}
                title={repoStatus}
                className="pf-v5-u-pb-sm"
                isInline
                isPlain
              />
              {repoUrl ? (
                <p className="pf-v5-u-pb-md">Cannot fetch {repoUrl}</p>
              ) : (
                ''
              )}
              {(repoIntrospections || repoFailCount) && (
                <>
                  <DescriptionList
                    columnModifier={{
                      default: '2Col',
                    }}
                  >
                    {repoIntrospections && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          Last introspection
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {getLastIntrospection(repoIntrospections)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {repoFailCount && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          Failed attempts
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {repoFailCount}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                  </DescriptionList>
                  <br />
                </>
              )}
              <Button
                component="a"
                target="_blank"
                variant="link"
                iconPosition="right"
                isInline
                icon={<ExternalLinkAltIcon />}
                href={CONTENT_URL}
              >
                Go to Repositories
              </Button>
            </>
          }
        >
          <Button variant="link" className="pf-v5-u-p-0 pf-v5-u-font-size-sm">
            {repoStatus === 'Invalid' && (
              <>
                <Icon status="danger">
                  <ExclamationCircleIcon />
                </Icon>{' '}
                <span className="pf-v5-u-font-weight-bold pf-v5-u-danger-color-200 failure-button">
                  {repoStatus}
                </span>
              </>
            )}
            {repoStatus === 'Unavailable' && (
              <>
                <Icon status="warning">
                  <ExclamationTriangleIcon />
                </Icon>{' '}
                <span className="pf-v5-u-font-weight-bold pf-v5-u-warning-color-200 failure-button">
                  {repoStatus}
                </span>
              </>
            )}
          </Button>
        </Popover>
      </>
    );
  } else if (repoStatus === 'Pending') {
    return (
      <>
        <Spinner isInline />{' '}
        <span className="pf-v5-u-font-weight-bold pf-v5-u-info-color-200">
          {repoStatus}
        </span>
      </>
    );
  }
};

export default RepositoriesStatus;
