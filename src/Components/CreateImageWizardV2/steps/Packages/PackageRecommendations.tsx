import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  ExpandableSection,
  Flex,
  FlexItem,
  Icon,
  Panel,
  PanelMain,
  PanelMainBody,
  Popover,
  Spinner,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon, OptimizeIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useDispatch } from 'react-redux';

import PackageRecommendationDescription from './components/PackageRecommendationDescription';
import { RedHatRepository } from './Packages';

import { useListRepositoriesQuery } from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import { useRecommendPackageMutation } from '../../../../store/imageBuilderApi';
import {
  addPackage,
  selectArchitecture,
  selectDistribution,
  selectPackages,
} from '../../../../store/wizardSlice';
import { releaseToVersion } from '../../../../Utilities/releaseToVersion';
import useDebounce from '../../../../Utilities/useDebounce';

const PackageRecommendations = () => {
  const dispatch = useDispatch();

  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);
  const undebouncedPackages = useAppSelector(selectPackages);
  const packages = useDebounce(undebouncedPackages);
  let distroRepoUrls: string[] = [];

  const [isExpanded, setIsExpanded] = useState(true);

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useListRepositoriesQuery({
      availableForArch: arch,
      availableForVersion: version,
      contentType: 'rpm',
      origin: 'red_hat',
      limit: 100,
      offset: 0,
    });

  if (isSuccessDistroRepositories && distroRepositories.data) {
    distroRepoUrls = distroRepositories.data.map((repo) => repo.url || '');
  }

  const [fetchRecommendedPackages, { data, isSuccess, isLoading, isError }] =
    useRecommendPackageMutation();

  useEffect(() => {
    if (isExpanded && packages.length > 0) {
      (async () => {
        await fetchRecommendedPackages({
          recommendPackageRequest: {
            packages: packages.map((pkg) => pkg.name),
            recommendedPackages: 5,
          },
        });
      })();
    }
  }, [fetchRecommendedPackages, packages, isExpanded]);

  const addAllPackages = () => {
    if (data?.packages?.length) {
      data.packages.forEach((pkg) =>
        dispatch(
          addPackage({
            name: pkg,
            summary: 'Added from recommended packages',
            repository: 'distro',
          })
        )
      );
    }
  };

  const addRecommendedPackage = (pkg: string) => {
    dispatch(
      addPackage({
        name: pkg,
        summary: 'Added from recommended packages',
        repository: 'distro',
      })
    );
  };

  const isRecommendedPackageSelected = (recPkg: string) => {
    const foundInPackages = packages?.some((pkg) => recPkg === pkg.name);
    return foundInPackages;
  };

  return (
    <Panel variant="bordered" className="panel-border">
      <PanelMain>
        <PanelMainBody>
          <ExpandableSection
            toggleContent={
              <Flex>
                <FlexItem>
                  <Icon>
                    <OptimizeIcon />
                  </Icon>{' '}
                  Recommended Red Hat packages{' '}
                </FlexItem>
                <FlexItem>
                  <TextContent>
                    <Text component={TextVariants.small}>
                      <em>Powered by RHEL Lightspeed</em>{' '}
                      <Popover
                        maxWidth="30rem"
                        // overrides the expandable behaviour to allow placing
                        // a popover there
                        onShow={() => setIsExpanded(false)}
                        onHide={() => setIsExpanded(false)}
                        bodyContent={
                          <TextContent>
                            <Text>
                              RHEL Lightspeed provides intelligent tools to
                              improve the productivity and efficiency of teams
                              using RHEL.
                            </Text>
                          </TextContent>
                        }
                      >
                        <HelpIcon />
                      </Popover>
                    </Text>
                  </TextContent>
                </FlexItem>
              </Flex>
            }
            onToggle={(_, bool) => setIsExpanded(bool)}
            isExpanded={isExpanded}
          >
            {packages.length === 0 && (
              <>Select packages to generate recommendations.</>
            )}
            {isLoading && <Spinner size="lg" />}
            {isError && (
              <Alert
                title="Recommendations couldn't be fetched"
                variant="danger"
                isPlain
                isInline
              >
                There was an error when fetching package recommendations. Try
                again by changing your selected packages.
              </Alert>
            )}
            {isSuccess && !data?.packages?.length && (
              <>No recommendations found for the set of selected packages</>
            )}
            {isSuccess && data && data?.packages && (
              <>
                <TextContent>
                  <Text>
                    Other users commonly add these packages with the ones you
                    selected.
                  </Text>
                </TextContent>
                <Table variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={20}>Package name</Th>
                      <Th width={35}>Description</Th>
                      <Th width={25}>Package repository</Th>
                      <Th width={20}>
                        <Button
                          variant="link"
                          component="a"
                          onClick={() => addAllPackages()}
                          isInline
                          data-testid="add-all-recommendations-button"
                        >
                          Add all packages
                        </Button>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.packages.map((pkg) => (
                      <Tr key={pkg}>
                        <Td>{pkg}</Td>
                        <Td>
                          {distroRepoUrls && (
                            <PackageRecommendationDescription
                              pkg={pkg}
                              urls={distroRepoUrls}
                            />
                          )}
                        </Td>
                        <Td>
                          <RedHatRepository />
                        </Td>
                        <Td>
                          <Button
                            variant="link"
                            component="a"
                            onClick={() => addRecommendedPackage(pkg)}
                            isInline
                            isDisabled={isRecommendedPackageSelected(pkg)}
                            data-testid="add-recommendation-button"
                          >
                            Add package
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </ExpandableSection>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default PackageRecommendations;
