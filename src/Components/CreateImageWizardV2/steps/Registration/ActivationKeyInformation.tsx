import React from 'react';

import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Popover } from '@patternfly/react-core/dist/dynamic/components/Popover';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextList } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextListItem } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextListItemVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextListVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import HelpIcon from '@patternfly/react-icons/dist/dynamic/icons/help-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppSelector } from '../../../../store/hooks';
import { useShowActivationKeyQuery } from '../../../../store/rhsmApi';
import { selectActivationKey } from '../../../../store/wizardSlice';

const ActivationKeyInformation = (): JSX.Element => {
  const activationKey = useAppSelector(selectActivationKey);

  const {
    data: activationKeyInfo,
    isFetching: isFetchingActivationKeyInfo,
    isSuccess: isSuccessActivationKeyInfo,
    isError: isErrorActivationKeyInfo,
  } = useShowActivationKeyQuery(
    { name: activationKey! },
    {
      skip: !activationKey,
    }
  );

  return (
    <>
      {isFetchingActivationKeyInfo && <Spinner size="lg" />}
      {isSuccessActivationKeyInfo && (
        <TextContent>
          <TextList component={TextListVariants.dl}>
            <TextListItem component={TextListItemVariants.dt}>
              Name:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {activationKey}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              Role:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {activationKeyInfo.body?.role || 'Not defined'}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              SLA:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {activationKeyInfo.body?.serviceLevel || 'Not defined'}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              Usage:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {activationKeyInfo.body?.usage || 'Not defined'}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              Additional repositories:
              <Popover
                bodyContent={
                  <TextContent>
                    <Text>
                      The core repositories for your operating system version
                      are always enabled and do not need to be explicitly added
                      to the activation key.
                    </Text>
                  </TextContent>
                }
              >
                <Button
                  variant="plain"
                  aria-label="About additional repositories"
                  className="pf-u-pl-sm pf-u-pt-0 pf-u-pb-0"
                >
                  <HelpIcon />
                </Button>
              </Popover>
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dd}
              className="pf-u-display-flex pf-u-align-items-flex-end"
            >
              {activationKeyInfo.body?.additionalRepositories &&
              activationKeyInfo.body?.additionalRepositories?.length > 0 ? (
                <Popover
                  position="right"
                  minWidth="30rem"
                  bodyContent={
                    <TextContent>
                      <Text component={TextVariants.h3}>
                        Additional repositories
                      </Text>
                      <Table
                        aria-label="Additional repositories table"
                        variant="compact"
                      >
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                          </Tr>
                        </Thead>
                        <Tbody data-testid="additional-repositories-table">
                          {activationKeyInfo.body?.additionalRepositories?.map(
                            (repo, index) => (
                              <Tr key={index}>
                                <Td>{repo.repositoryLabel}</Td>
                              </Tr>
                            )
                          )}
                        </Tbody>
                      </Table>
                    </TextContent>
                  }
                >
                  <Button
                    data-testid="repositories-popover-button"
                    variant="link"
                    aria-label="Show additional repositories"
                    className="pf-u-pl-0 pf-u-pt-0 pf-u-pb-0"
                  >
                    {activationKeyInfo.body?.additionalRepositories?.length}{' '}
                    repositories
                  </Button>
                </Popover>
              ) : (
                'None'
              )}
            </TextListItem>
          </TextList>
        </TextContent>
      )}
      {isErrorActivationKeyInfo && (
        <TextContent>
          <TextList component={TextListVariants.dl}>
            <TextListItem component={TextListItemVariants.dt}>
              Name:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {activationKey}
            </TextListItem>
          </TextList>
          <br />
          <Alert
            title="Information about the activation key unavailable"
            variant="danger"
            isPlain
            isInline
          >
            Information about the activation key cannot be loaded. Please check
            the key was not removed and try again later.
          </Alert>
        </TextContent>
      )}
    </>
  );
};

export default ActivationKeyInformation;
