import React, { useEffect, useMemo } from 'react';

import {
  Alert,
  Button,
  Popover,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  TextVariants,
  FormGroup,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import ActivationKeyInformation from './../Registration/ActivationKeyInformation';
import {
  PackagesTable,
  RepositoriesTable,
  SnapshotTable,
} from './ReviewStepTables';
import { FSReviewTable } from './ReviewStepTables';

import {
  ON_PREM_RELEASES,
  RELEASES,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
  targetOptions,
  UNIT_GIB,
} from '../../../../constants';
import { useListSnapshotsByDateMutation } from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import { useGetSourceListQuery } from '../../../../store/provisioningApi';
import { useShowActivationKeyQuery } from '../../../../store/rhsmApi';
import {
  selectActivationKey,
  selectArchitecture,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAzureShareMethod,
  selectAzureSource,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectAwsSourceId,
  selectBlueprintDescription,
  selectBlueprintName,
  selectCustomRepositories,
  selectDistribution,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectPackages,
  selectGroups,
  selectRegistrationType,
  selectFileSystemConfigurationType,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectUseLatest,
  selectPartitions,
  selectFirstBootScript,
  selectTimezone,
  selectNtpServers,
  selectLanguages,
  selectKeyboard,
  selectHostname,
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  selectKernel,
  selectUserAdministrator,
  selectFirewall,
  selectServices,
} from '../../../../store/wizardSlice';
import { toMonthAndYear, yyyyMMddFormat } from '../../../../Utilities/time';
import {
  getConversionFactor,
  MinimumSizePopover,
  Partition,
} from '../FileSystem/FileSystemTable';
import { MajorReleasesLifecyclesChart } from '../ImageOutput/ReleaseLifecycle';
import OscapProfileInformation from '../Oscap/OscapProfileInformation';
import { PopoverActivation } from '../Registration/ActivationKeysList';

const ExpirationWarning = () => {
  return (
    <div className="pf-v5-u-mr-sm pf-v5-u-font-size-sm pf-v5-u-warning-color-200">
      <ExclamationTriangleIcon /> Expires 14 days after creation
    </div>
  );
};

export const ImageOutputList = () => {
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const releases = process.env.IS_ON_PREMISE ? ON_PREM_RELEASES : RELEASES;
  return (
    <TextContent>
      {distribution === RHEL_8 && (
        <>
          <Text className="pf-v5-u-font-size-sm">
            {RELEASES.get(distribution)} will be supported through{' '}
            {toMonthAndYear(RHEL_8_FULL_SUPPORT[1])}, with optional ELS support
            through {toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[1])}. Consider
            building an image with {RELEASES.get(RHEL_9)} to extend the support
            period.
          </Text>
          <FormGroup label="Release lifecycle">
            <MajorReleasesLifecyclesChart />
          </FormGroup>
          <br />
        </>
      )}
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Release
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {releases.get(distribution)}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Architecture
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{arch}</TextListItem>
      </TextList>
    </TextContent>
  );
};
export const FSCList = () => {
  const fileSystemConfigurationType = useAppSelector(
    selectFileSystemConfigurationType
  );
  const partitions = useAppSelector(selectPartitions);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Configuration type
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dd}
          data-testid="partitioning-auto-manual"
        >
          {fileSystemConfigurationType === 'manual' ? 'Manual' : 'Automatic'}
          {fileSystemConfigurationType === 'manual' && (
            <>
              {' '}
              <Popover
                position="bottom"
                headerContent="Partitions"
                hasAutoWidth
                minWidth="30rem"
                bodyContent={<FSReviewTable />}
              >
                <Button
                  data-testid="file-system-configuration-popover"
                  variant="link"
                  aria-label="File system configuration info"
                  aria-describedby="file-system-configuration-info"
                  className="pf-v5-u-pt-0 pf-v5-u-pb-0"
                >
                  View partitions
                </Button>
              </Popover>
            </>
          )}
        </TextListItem>
        {fileSystemConfigurationType === 'manual' && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Image size (minimum) <MinimumSizePopover />
            </TextListItem>
            <MinSize partitions={partitions} />
          </>
        )}
      </TextList>
    </TextContent>
  );
};

type MinSizeProps = {
  partitions: Partition[];
};

export const MinSize = ({ partitions }: MinSizeProps) => {
  let minSize = '';
  if (partitions) {
    let size = 0;
    for (const partition of partitions) {
      size += Number(partition.min_size) * getConversionFactor(partition.unit);
    }

    size = Number((size / UNIT_GIB).toFixed(1));
    if (size < 1) {
      minSize = `Less than 1 GiB`;
    } else {
      minSize = `${size} GiB`;
    }
  }

  return (
    <TextListItem component={TextListItemVariants.dd}> {minSize} </TextListItem>
  );
};

export const TargetEnvAWSList = () => {
  const { isSuccess } = useGetSourceListQuery({
    provider: 'aws',
  });
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const awsShareMethod = useAppSelector(selectAwsShareMethod);
  const sourceId = useAppSelector(selectAwsSourceId);
  const { source } = useGetSourceListQuery(
    {
      provider: 'aws',
    },
    {
      selectFromResult: ({ data }) => ({
        source: data?.data?.find((source) => source.id === sourceId),
      }),
    }
  );

  return (
    <TextContent>
      <Text component={TextVariants.h3}>{targetOptions.aws}</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Shared to account
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {awsAccountId}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          {awsShareMethod === 'sources' ? 'Source' : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {isSuccess && awsShareMethod === 'sources' ? source?.name : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Default region
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          us-east-1
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const TargetEnvGCPList = () => {
  const accountType = useAppSelector(selectGcpAccountType);
  const sharedMethod = useAppSelector(selectGcpShareMethod);
  const email = useAppSelector(selectGcpEmail);
  return (
    <TextContent>
      <Text component={TextVariants.h3}>{targetOptions.gcp}</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        <>
          {sharedMethod === 'withInsights' ? (
            <>
              <TextListItem component={TextListItemVariants.dt}>
                Shared with
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Red Hat Insights only
                <br />
              </TextListItem>
            </>
          ) : (
            <>
              <TextListItem component={TextListItemVariants.dt}>
                Account type
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {accountType === 'group'
                  ? 'Google group'
                  : accountType === 'serviceAccount'
                  ? 'Service account'
                  : accountType === 'user'
                  ? 'Google account'
                  : 'Domain'}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {accountType === 'domain' ? 'Domain' : 'Principal'}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {email || accountType}
              </TextListItem>
            </>
          )}
        </>
      </TextList>
    </TextContent>
  );
};

export const TargetEnvAzureList = () => {
  const { data: rawAzureSources, isSuccess: isSuccessAzureSources } =
    useGetSourceListQuery({ provider: 'azure' });
  const shareMethod = useAppSelector(selectAzureShareMethod);
  const tenantId = useAppSelector(selectAzureTenantId);
  const azureSource = useAppSelector(selectAzureSource);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);

  return (
    <TextContent>
      <Text component={TextVariants.h3}>{targetOptions.azure}</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        {shareMethod === 'sources' && isSuccessAzureSources && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Azure Source
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {
                rawAzureSources?.data?.find(
                  (source) => source.id === azureSource
                )?.name
              }
            </TextListItem>
          </>
        )}
        {shareMethod === 'manual' && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Azure tenant ID
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {tenantId}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              Subscription ID
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {subscriptionId}
            </TextListItem>
          </>
        )}
        <TextListItem component={TextListItemVariants.dt}>
          Resource group
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {azureResourceGroup}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const TargetEnvOciList = () => {
  return (
    <TextContent>
      <Text component={TextVariants.h3}>{targetOptions.oci}</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Object Storage URL
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          The URL for the built image will be ready to copy
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const TargetEnvOtherList = () => {
  return (
    <>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Built image will be available for download
        </TextListItem>
      </TextList>
    </>
  );
};

export const ContentList = () => {
  const customRepositories = useAppSelector(selectCustomRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);

  const customAndRecommendedRepositoryUUIDS = useMemo(
    () =>
      [
        ...customRepositories.map(({ id }) => id),
        ...recommendedRepositories.map(({ uuid }) => uuid),
      ] as string[],
    [customRepositories, recommendedRepositories]
  );

  const [listSnapshotsByDate, { data, isSuccess, isLoading, isError }] =
    useListSnapshotsByDateMutation();

  useEffect(() => {
    listSnapshotsByDate({
      apiListSnapshotByDateRequest: {
        repository_uuids: customAndRecommendedRepositoryUUIDS,
        date: useLatest ? yyyyMMddFormat(new Date()) : snapshotDate,
      },
    });
  }, [
    customAndRecommendedRepositoryUUIDS,
    listSnapshotsByDate,
    snapshotDate,
    useLatest,
  ]);

  const duplicatePackages = packages.filter(
    (item, index) => packages.indexOf(item) !== index
  );

  const noRepositoriesSelected =
    customAndRecommendedRepositoryUUIDS.length === 0;

  const hasSnapshotDateAfter = data?.data?.some(({ is_after }) => is_after);

  const snapshottingText = useMemo(() => {
    switch (true) {
      case isLoading:
        return '';
      case useLatest:
        return 'Use latest';
      case !!snapshotDate:
        return `State as of ${yyyyMMddFormat(new Date(snapshotDate))}`;
      default:
        return '';
    }
  }, [isLoading, useLatest, snapshotDate]);

  return (
    <>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-v5-u-min-width"
            >
              Repository snapshot
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dd}
              data-testid="snapshot-method"
            >
              <Popover
                position="bottom"
                headerContent={
                  useLatest
                    ? 'Repositories as of today'
                    : `Repositories as of ${yyyyMMddFormat(
                        new Date(snapshotDate)
                      )}`
                }
                hasAutoWidth
                minWidth="60rem"
                bodyContent={
                  <SnapshotTable snapshotForDate={data?.data || []} />
                }
              >
                <Button
                  variant="link"
                  aria-label="Snapshot method"
                  className="pf-v5-u-p-0"
                  isDisabled={noRepositoriesSelected || isLoading || isError}
                  isLoading={isLoading}
                >
                  {snapshottingText}
                </Button>
              </Popover>
              {!useLatest && !isLoading && isSuccess && hasSnapshotDateAfter ? (
                <Alert
                  variant="warning"
                  isInline
                  isPlain
                  title="A snapshot for this date is not available for some repositories."
                />
              ) : (
                ''
              )}
            </TextListItem>
          </>
          <TextListItem component={TextListItemVariants.dt}>
            Custom repositories
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            data-testid="custom-repositories-count"
          >
            {customRepositories?.length + recommendedRepositories.length > 0 ? (
              <Popover
                position="bottom"
                headerContent="Custom repositories"
                hasAutoWidth
                minWidth="30rem"
                bodyContent={<RepositoriesTable />}
              >
                <Button
                  variant="link"
                  aria-label="About custom repositories"
                  className="pf-v5-u-p-0"
                >
                  {customRepositories?.length +
                    recommendedRepositories.length || 0}
                </Button>
              </Popover>
            ) : (
              0
            )}
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width"
          >
            Additional packages
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            data-testid="chosen-packages-count"
          >
            {packages?.length > 0 || groups?.length > 0 ? (
              <Popover
                position="bottom"
                headerContent="Additional packages"
                hasAutoWidth
                minWidth="60rem"
                bodyContent={<PackagesTable />}
              >
                <Button
                  variant="link"
                  aria-label="About packages"
                  className="pf-v5-u-p-0"
                >
                  {packages?.length + groups?.length}
                </Button>
              </Popover>
            ) : (
              0
            )}
          </TextListItem>
        </TextList>
      </TextContent>
      {duplicatePackages.length > 0 && (
        <Alert
          title="Can not guarantee where some selected packages will come from"
          variant="warning"
          isInline
        >
          Some of the packages added to this image belong to multiple added
          repositories. We can not guarantee which repository the package will
          come from.
        </Alert>
      )}
    </>
  );
};

export const RegisterLaterList = () => {
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Registration type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Register the system later
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const RegisterNowList = () => {
  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);

  const { isError } = useShowActivationKeyQuery(
    // @ts-ignore type of 'activationKey' might not be strictly compatible with the expected type for 'name'.
    { name: activationKey },
    {
      skip: !activationKey,
    }
  );
  return (
    <>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width"
          >
            Registration type
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            data-testid="review-registration"
          >
            <TextList isPlain>
              {registrationType?.startsWith('register-now') && (
                <TextListItem>
                  Register with Red Hat Subscription Manager (RHSM)
                  <br />
                </TextListItem>
              )}
              {(registrationType === 'register-now-insights' ||
                registrationType === 'register-now-rhc') && (
                <TextListItem>
                  Connect to Red Hat Insights
                  <br />
                </TextListItem>
              )}
              {registrationType === 'register-now-rhc' && (
                <TextListItem>
                  Use remote host configuration (rhc) utility
                  <br />
                </TextListItem>
              )}
            </TextList>
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>
            Activation key <PopoverActivation />
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <ActivationKeyInformation />
          </TextListItem>
        </TextList>
      </TextContent>
      {isError && (
        <Alert
          title="Information about the activation key unavailable"
          variant="danger"
          isPlain
          isInline
        >
          Information about the activation key cannot be loaded. Please check
          the key was not removed and try again later.
        </Alert>
      )}
    </>
  );
};

export const DetailsList = () => {
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        {blueprintName && (
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-v5-u-min-width"
            >
              Blueprint name
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {blueprintName}
            </TextListItem>
          </>
        )}
        {blueprintDescription && (
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-v5-u-min-width"
            >
              Description
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {blueprintDescription}
            </TextListItem>
          </>
        )}
      </TextList>
    </TextContent>
  );
};

export const OscapList = () => {
  return <OscapProfileInformation allowChangingCompliancePolicy={true} />;
};

export const TimezoneList = () => {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Timezone
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {timezone ? timezone : 'None'}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          NTP servers
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {ntpServers && ntpServers.length > 0 ? ntpServers.join(', ') : 'None'}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const UsersList = () => {
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const userIsAdministratorSelector = selectUserAdministrator(index);
  const userIsAdministrator = useAppSelector(userIsAdministratorSelector);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width"
          >
            Username
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {userName ? userName : 'None'}
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width"
          >
            Password
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {userPassword ? '●'.repeat(8) : 'None'}
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width"
          >
            SSH key
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {userSshKey ? userSshKey : 'None'}
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width"
          >
            Administrator
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {userIsAdministrator ? 'True' : 'False'}
          </TextListItem>
        </>
      </TextList>
    </TextContent>
  );
};

export const LocaleList = () => {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Languages
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {languages && languages.length > 0 ? languages.join(', ') : 'None'}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Keyboard
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {keyboard ? keyboard : 'None'}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const HostnameList = () => {
  const hostname = useAppSelector(selectHostname);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Hostname
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {hostname ? hostname : 'None'}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const KernelList = () => {
  const kernel = useAppSelector(selectKernel);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Name
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {kernel.name ? kernel.name : 'None'}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Append
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {kernel.append.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{kernel.append.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const FirewallList = () => {
  const firewall = useAppSelector(selectFirewall);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Ports
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {firewall.ports.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{firewall.ports.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Disabled services
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {firewall.services.disabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>
                {firewall.services.disabled.join(' ')}
              </CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Enabled services
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {firewall.services.enabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>
                {firewall.services.enabled.join(' ')}
              </CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const ServicesList = () => {
  const services = useAppSelector(selectServices);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Disabled
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {services.disabled.length > 0 || services.masked.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>
                {services.disabled.concat(services.masked).join(' ')}
              </CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          Enabled
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {services.enabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{services.enabled.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const FirstBootList = () => {
  const isFirstbootEnabled = !!useAppSelector(selectFirstBootScript);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-v5-u-min-width"
        >
          First boot script
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {isFirstbootEnabled ? 'Enabled' : 'Disabled'}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};
