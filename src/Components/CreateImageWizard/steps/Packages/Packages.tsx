import React, { ReactElement, useEffect, useMemo, useState } from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Icon,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Pagination,
  PaginationVariant,
  Popover,
  Spinner,
  Stack,
  Text,
  TextContent,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  HelpIcon,
  OptimizeIcon,
  SearchIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useDispatch } from 'react-redux';

import CustomHelperText from './components/CustomHelperText';
import PackageInfoNotAvailablePopover from './components/PackageInfoNotAvailablePopover';

import {
  CONTENT_URL,
  ContentOrigin,
  EPEL_8_REPO_DEFINITION,
  EPEL_9_REPO_DEFINITION,
  RH_ICON_SIZE,
} from '../../../../constants';
import {
  ApiRepositoryResponseRead,
  useCreateRepositoryMutation,
  useListRepositoriesQuery,
  useSearchRpmMutation,
  useSearchPackageGroupMutation,
} from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import {
  Package,
  useGetArchitecturesQuery,
} from '../../../../store/imageBuilderApi';
import {
  selectArchitecture,
  selectPackages,
  selectGroups,
  selectCustomRepositories,
  selectDistribution,
  addPackage,
  removePackage,
  addGroup,
  removeGroup,
  addRecommendedRepository,
  removeRecommendedRepository,
  selectRecommendedRepositories,
} from '../../../../store/wizardSlice';
import sortfn from '../../../../Utilities/sortfn';
import useDebounce from '../../../../Utilities/useDebounce';

export type PackageRepository = 'distro' | 'custom' | 'recommended' | '';

export type IBPackageWithRepositoryInfo = {
  name: Package['name'];
  summary: Package['summary'];
  repository: PackageRepository;
};

export type GroupWithRepositoryInfo = {
  name: string;
  description: string;
  repository: PackageRepository;
  package_list: string[];
};

export enum RepoToggle {
  INCLUDED = 'toggle-included-repos',
  OTHER = 'toggle-other-repos',
}

export const RedHatRepository = () => {
  return (
    <>
      {' '}
      <img
        src={'/apps/frontend-assets/red-hat-logos/logo_hat-only.svg'}
        alt="Red Hat logo"
        height={RH_ICON_SIZE}
        width={RH_ICON_SIZE}
      />{' '}
      Red Hat repository
    </>
  );
};

const Packages = () => {
  const dispatch = useDispatch();

  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useGetArchitecturesQuery({
      distribution: distribution,
    });

  // select the correct version of EPEL repository
  // the urls are copied over from the content service
  const epelRepoUrlByDistribution = distribution.startsWith('rhel-8')
    ? EPEL_8_REPO_DEFINITION.url
    : EPEL_9_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.EXTERNAL,
    });

  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [toggleSelected, setToggleSelected] = useState('toggle-available');

  const [toggleSourceRepos, setToggleSourceRepos] = useState<RepoToggle>(
    RepoToggle.INCLUDED
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [
    searchCustomRpms,
    {
      data: dataCustomPackages,
      isSuccess: isSuccessCustomPackages,
      isLoading: isLoadingCustomPackages,
    },
  ] = useSearchRpmMutation();

  const debouncedSearchTerm = useDebounce(searchTerm.trim());
  const debouncedSearchTermLengthOf1 = debouncedSearchTerm.length === 1;
  const debouncedSearchTermIsGroup = debouncedSearchTerm.startsWith('@');

  // While it's searching for packages or groups, only show either packages or groups, without mixing the two.
  const showPackages =
    (debouncedSearchTerm && !debouncedSearchTermIsGroup) ||
    toggleSelected === 'toggle-selected';
  const showGroups =
    (debouncedSearchTerm && debouncedSearchTermIsGroup) ||
    toggleSelected === 'toggle-selected';

  const [
    searchRecommendedRpms,
    {
      data: dataRecommendedPackages,
      isSuccess: isSuccessRecommendedPackages,
      isLoading: isLoadingRecommendedPackages,
    },
  ] = useSearchRpmMutation();

  const [
    searchDistroRpms,
    {
      data: dataDistroPackages,
      isSuccess: isSuccessDistroPackages,
      isLoading: isLoadingDistroPackages,
    },
  ] = useSearchRpmMutation();

  const [
    searchDistroGroups,
    {
      data: dataDistroGroups,
      isSuccess: isSuccessDistroGroups,
      isLoading: isLoadingDistroGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchCustomGroups,
    {
      data: dataCustomGroups,
      isSuccess: isSuccessCustomGroups,
      isLoading: isLoadingCustomGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchRecommendedGroups,
    {
      data: dataRecommendedGroups,
      isSuccess: isSuccessRecommendedGroups,
      isLoading: isLoadingRecommendedGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [createRepository, { isLoading: createLoading }] =
    useCreateRepositoryMutation();

  useEffect(() => {
    if (debouncedSearchTermIsGroup) {
      return;
    }
    if (debouncedSearchTerm.length > 1 && isSuccessDistroRepositories) {
      searchDistroRpms({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          urls: distroRepositories
            ?.filter((archItem) => {
              return archItem.arch === arch;
            })[0]
            .repositories.flatMap((repo) => {
              if (!repo.baseurl) {
                throw new Error(`Repository ${repo} missing baseurl`);
              }
              return repo.baseurl;
            }),
        },
      });
    }
    if (debouncedSearchTerm.length > 2) {
      if (
        toggleSourceRepos === RepoToggle.INCLUDED &&
        customRepositories.length > 0
      ) {
        searchCustomRpms({
          apiContentUnitSearchRequest: {
            search: debouncedSearchTerm,
            uuids: customRepositories.flatMap((repo) => {
              return repo.id;
            }),
          },
        });
      } else {
        searchRecommendedRpms({
          apiContentUnitSearchRequest: {
            search: debouncedSearchTerm,
            urls: [epelRepoUrlByDistribution],
          },
        });
      }
    }
  }, [
    customRepositories,
    searchCustomRpms,
    searchDistroRpms,
    debouncedSearchTerm,
    toggleSourceRepos,
    searchRecommendedRpms,
    epelRepoUrlByDistribution,
    isSuccessDistroRepositories,
    searchDistroRpms,
    distroRepositories,
    arch,
  ]);

  useEffect(() => {
    if (!debouncedSearchTermIsGroup) {
      return;
    }
    if (isSuccessDistroRepositories) {
      searchDistroGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substr(1),
          urls: distroRepositories
            ?.filter((archItem) => {
              return archItem.arch === arch;
            })[0]
            .repositories.flatMap((repo) => {
              if (!repo.baseurl) {
                throw new Error(`Repository ${repo} missing baseurl`);
              }
              return repo.baseurl;
            }),
        },
      });
    }
    if (
      toggleSourceRepos === RepoToggle.INCLUDED &&
      customRepositories.length > 0
    ) {
      searchCustomGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substr(1),
          uuids: customRepositories.flatMap((repo) => {
            return repo.id;
          }),
        },
      });
    } else if (toggleSourceRepos === RepoToggle.OTHER && isSuccessEpelRepo) {
      searchRecommendedGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substr(1),
          urls: [epelRepoUrlByDistribution],
        },
      });
    }
  }, [
    customRepositories,
    searchDistroGroups,
    searchCustomGroups,
    searchRecommendedGroups,
    debouncedSearchTerm,
    toggleSourceRepos,
    epelRepoUrlByDistribution,
  ]);

  const EmptySearch = () => {
    return (
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader icon={<EmptyStateIcon icon={SearchIcon} />} />
              {toggleSelected === 'toggle-available' ? (
                <EmptyStateBody>
                  Search above to add additional
                  <br />
                  packages to your image.
                </EmptyStateBody>
              ) : (
                <EmptyStateBody>
                  No packages selected.
                  <br />
                  Search above to see available packages.
                </EmptyStateBody>
              )}
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const Searching = () => {
    return (
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader icon={<EmptyStateIcon icon={Spinner} />} />
              <EmptyStateBody>
                {toggleSourceRepos === RepoToggle.OTHER
                  ? 'Searching for recommendations'
                  : 'Searching'}
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const TooManyResults = () => {
    return (
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader
                icon={<EmptyStateIcon icon={SearchIcon} />}
                titleText="Too many results to display"
                headingLevel="h4"
              />
              <EmptyStateBody>
                Please make the search more specific and try again.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const TooShort = () => {
    return (
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader
                icon={<EmptyStateIcon icon={SearchIcon} />}
                titleText="The search value is too short"
                headingLevel="h4"
              />
              <EmptyStateBody>
                Please make the search more specific and try again.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const TooManyResultsWithExactMatch = () => {
    return (
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader
                titleText="Too many results to display"
                headingLevel="h4"
              />
              <EmptyStateBody>
                To see more results, please make the search more specific and
                try again.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const TryLookingUnderIncluded = () => {
    return (
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader
                titleText="No selected packages in Other repos"
                headingLevel="h4"
              />
              <EmptyStateBody>
                Try looking under &quot;
                <Button
                  variant="link"
                  onClick={() => setToggleSourceRepos(RepoToggle.INCLUDED)}
                  isInline
                >
                  Included repos
                </Button>
                &quot;.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const NoResultsFound = () => {
    if (toggleSourceRepos === RepoToggle.INCLUDED) {
      return (
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.sm}>
                <EmptyStateHeader icon={<EmptyStateIcon icon={SearchIcon} />} />
                <EmptyStateHeader
                  titleText="No results found"
                  headingLevel="h4"
                />
                <EmptyStateBody>
                  Adjust your search and try again, or search in other
                  repositories (your repositories and popular repositories).
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button
                      variant="primary"
                      ouiaId="search-other-repositories"
                      onClick={() => setToggleSourceRepos(RepoToggle.OTHER)}
                    >
                      Search other repositories
                    </Button>
                  </EmptyStateActions>
                  <EmptyStateActions>
                    <Button
                      className="pf-v5-u-pt-md"
                      variant="link"
                      isInline
                      component="a"
                      target="_blank"
                      iconPosition="right"
                      icon={<ExternalLinkAltIcon />}
                      href={CONTENT_URL}
                    >
                      Manage your repositories and popular repositories
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      );
    } else {
      return (
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.sm}>
                <EmptyStateHeader icon={<EmptyStateIcon icon={SearchIcon} />} />
                <EmptyStateHeader
                  titleText="No results found"
                  headingLevel="h4"
                />
                <EmptyStateBody>
                  No packages found in known repositories. If you know of a
                  repository containing this packages, add it to{' '}
                  <Button
                    variant="link"
                    isInline
                    component="a"
                    target="_blank"
                    href={CONTENT_URL}
                  >
                    your repositories
                  </Button>{' '}
                  and try searching for it again.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      );
    }
  };

  const RepositoryModal = () => {
    return (
      <Modal
        titleIconVariant="warning"
        title="Custom repositories will be added to your image"
        isOpen={isRepoModalOpen}
        onClose={handleCloseModalToggle}
        width="50%"
        actions={[
          <Button
            key="add"
            variant="primary"
            isLoading={createLoading}
            isDisabled={createLoading}
            onClick={handleConfirmModalToggle}
            ouiaId="Add-listed-repos"
          >
            Add listed repositories
          </Button>,
          <Button key="back" variant="link" onClick={handleCloseModalToggle}>
            Back
          </Button>,
        ]}
        ouiaId="Custom-repos-warning-modal"
      >
        You have selected packages that belong to custom repositories. By
        continuing, you are acknowledging and consenting to adding the following
        custom repositories to your image.
        <br />
        <br />
        The repositories will also get enabled in{' '}
        <Button
          component="a"
          target="_blank"
          variant="link"
          iconPosition="right"
          isInline
          icon={<ExternalLinkAltIcon />}
          href={CONTENT_URL}
        >
          content services
        </Button>{' '}
        if they were not enabled yet:
        <br />
        <Table variant="compact">
          <Thead>
            <Tr>
              {isSelectingPackage ? <Th>Packages</Th> : <Th>Package groups</Th>}
              <Th>Repositories</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              {isSelectingPackage ? (
                <Td>{isSelectingPackage?.name}</Td>
              ) : (
                <Td>{isSelectingGroup?.name}</Td>
              )}
              <Td>
                EPEL {distribution === 'rhel-8' ? '8' : '9'} Everything x86_64
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <br />
        To move forward, either add the repos to your image, or go back to
        review your package selections.
      </Modal>
    );
  };

  const transformedPackages = useMemo(() => {
    let transformedDistroData: IBPackageWithRepositoryInfo[] = [];
    let transformedCustomData: IBPackageWithRepositoryInfo[] = [];
    let transformedRecommendedData: IBPackageWithRepositoryInfo[] = [];

    if (isSuccessDistroPackages) {
      transformedDistroData = dataDistroPackages!.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'distro',
      }));
    }

    if (isSuccessCustomPackages) {
      transformedCustomData = dataCustomPackages!.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'custom',
      }));
    }

    let combinedPackageData = transformedDistroData.concat(
      transformedCustomData
    );

    if (
      debouncedSearchTerm !== '' &&
      combinedPackageData.length === 0 &&
      isSuccessRecommendedPackages &&
      toggleSourceRepos === RepoToggle.OTHER
    ) {
      transformedRecommendedData = dataRecommendedPackages!.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'recommended',
      }));

      combinedPackageData = combinedPackageData.concat(
        transformedRecommendedData
      );
    }

    if (toggleSelected === 'toggle-available') {
      if (toggleSourceRepos === RepoToggle.INCLUDED) {
        return combinedPackageData.filter(
          (pkg) => pkg.repository !== 'recommended'
        );
      } else {
        return combinedPackageData.filter(
          (pkg) => pkg.repository === 'recommended'
        );
      }
    } else {
      const selectedPackages = [...packages];
      if (toggleSourceRepos === RepoToggle.INCLUDED) {
        return selectedPackages;
      } else {
        return [];
      }
    }
  }, [
    dataCustomPackages,
    dataDistroPackages,
    dataRecommendedPackages,
    debouncedSearchTerm,
    isSuccessCustomPackages,
    isSuccessDistroPackages,
    isSuccessRecommendedPackages,
    packages,
    toggleSelected,
    toggleSourceRepos,
  ]).sort((a, b) => sortfn(a.name, b.name, debouncedSearchTerm));

  const transformedGroups = useMemo(() => {
    let combinedGroupData: GroupWithRepositoryInfo[] = [];

    if (isSuccessDistroGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataDistroGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'distro',
          package_list: values.package_list!,
        }))
      );
    }
    if (isSuccessCustomGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataCustomGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'custom',
          package_list: values.package_list!,
        }))
      );
    }
    if (isSuccessRecommendedGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataRecommendedGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'recommended',
          package_list: values.package_list!,
        }))
      );
    }

    if (toggleSelected === 'toggle-available') {
      if (toggleSourceRepos === RepoToggle.INCLUDED) {
        return combinedGroupData.filter(
          (pkg) => pkg.repository !== 'recommended'
        );
      } else {
        return combinedGroupData.filter(
          (pkg) => pkg.repository === 'recommended'
        );
      }
    } else {
      const selectedGroups = [...groups];
      if (toggleSourceRepos === RepoToggle.INCLUDED) {
        return selectedGroups;
      } else {
        return [];
      }
    }

    return combinedGroupData;
  }, [
    dataDistroGroups,
    dataCustomGroups,
    dataRecommendedGroups,
    debouncedSearchTerm,
    isSuccessDistroGroups,
    isSuccessCustomGroups,
    isSuccessRecommendedGroups,
    groups,
    toggleSelected,
    toggleSourceRepos,
  ]).sort((a, b) => sortfn(a.name, b.name, debouncedSearchTerm));

  const handleSearch = async (
    event: React.FormEvent<HTMLInputElement>,
    selection: string
  ) => {
    setSearchTerm(selection);
    setToggleSourceRepos(RepoToggle.INCLUDED);
  };

  const handleClear = async () => {
    setSearchTerm('');
    setToggleSourceRepos(RepoToggle.INCLUDED);
  };

  const handleSelect = (
    pkg: IBPackageWithRepositoryInfo,
    _: number,
    isSelecting: boolean
  ) => {
    if (isSelecting) {
      if (
        isSuccessEpelRepo &&
        epelRepo?.data &&
        pkg.repository === 'recommended' &&
        !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
      ) {
        setIsRepoModalOpen(true);
        setIsSelectingPackage(pkg);
      } else {
        dispatch(addPackage(pkg));
      }
    } else {
      dispatch(removePackage(pkg.name));
      if (
        isSuccessEpelRepo &&
        epelRepo?.data &&
        packages.filter((pkg) => pkg.repository === 'recommended').length ===
          1 &&
        groups.filter((grp) => grp.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const handleGroupSelect = (
    grp: GroupWithRepositoryInfo,
    _: number,
    isSelecting: boolean
  ) => {
    if (isSelecting) {
      if (
        isSuccessEpelRepo &&
        epelRepo?.data &&
        grp.repository === 'recommended' &&
        !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
      ) {
        setIsRepoModalOpen(true);
        setIsSelectingGroup(grp);
      } else {
        dispatch(addGroup(grp));
      }
    } else {
      dispatch(removeGroup(grp.name));
      if (
        isSuccessEpelRepo &&
        epelRepo?.data &&
        groups.filter((grp) => grp.repository === 'recommended').length === 1 &&
        packages.filter((pkg) => pkg.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const handleFilterToggleClick = (event: React.MouseEvent) => {
    const id = event.currentTarget.id;
    setPage(1);
    setToggleSelected(id);
  };

  const handleRepoToggleClick = (type: RepoToggle) => {
    if (toggleSourceRepos !== type) {
      setPage(1);
      setToggleSourceRepos(type);
    }
  };

  const handleSetPage = (_: React.MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (
    _: React.MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

  const handleExactMatch = () => {
    const exactMatch = transformedPackages.find(
      (pkg) => pkg.name === debouncedSearchTerm
    );

    if (exactMatch) {
      return (
        <>
          <Tr key={`${exactMatch.name}`} data-testid="exact-match-row">
            <Td
              select={{
                isSelected: packages.some((p) => p.name === exactMatch.name),
                rowIndex: 0,
                onSelect: (event, isSelecting) =>
                  handleSelect(exactMatch, 0, isSelecting),
              }}
            />
            <Td>{exactMatch.name}</Td>
            <Td>{exactMatch.summary}</Td>
            {exactMatch.repository === 'distro' ? (
              <>
                <Td>
                  <RedHatRepository />
                </Td>
                <Td>Supported</Td>
              </>
            ) : (
              <>
                <Td>Third party repository</Td>
                <Td>Not supported</Td>
              </>
            )}
          </Tr>
          <TooManyResultsWithExactMatch />
        </>
      );
    } else {
      return <TooManyResults />;
    }
  };

  const handleCloseModalToggle = () => {
    setIsRepoModalOpen(!isRepoModalOpen);
    setIsSelectingPackage(undefined);
  };

  const handleConfirmModalToggle = async () => {
    if (!epelRepo || !epelRepo.data) {
      throw new Error(
        `There was an error while adding the recommended repository.`
      );
    }

    if (epelRepo.data.length === 0) {
      const result = await createRepository({
        apiRepositoryRequest: distribution.startsWith('rhel-8')
          ? EPEL_8_REPO_DEFINITION
          : EPEL_9_REPO_DEFINITION,
      });
      dispatch(
        addRecommendedRepository(
          (result as { data: ApiRepositoryResponseRead }).data
        )
      );
    } else {
      dispatch(addRecommendedRepository(epelRepo.data[0]));
    }
    if (isSelectingPackage) {
      dispatch(addPackage(isSelectingPackage!));
    }
    if (isSelectingGroup) {
      dispatch(addGroup(isSelectingGroup!));
    }
    setIsRepoModalOpen(!isRepoModalOpen);
  };

  const composePkgTable = () => {
    let rows: ReactElement[] = [];

    if (showGroups) {
      rows = rows.concat(
        transformedGroups
          .slice(computeStart(), computeEnd())
          .map((grp, rowIndex) => (
            <Tr key={`${grp.name}-${rowIndex}`} data-testid="package-row">
              <Td
                select={{
                  isSelected: groups.some((g) => g.name === grp.name),
                  rowIndex: rowIndex,
                  onSelect: (event, isSelecting) =>
                    handleGroupSelect(grp, rowIndex, isSelecting),
                }}
              />
              <Td>
                @{grp.name}
                <Popover
                  minWidth="25rem"
                  headerContent="Included packages"
                  bodyContent={
                    <div
                      style={
                        grp.package_list.length > 0
                          ? { height: '40em', overflow: 'scroll' }
                          : {}
                      }
                    >
                      {grp.package_list.length > 0 ? (
                        <Table
                          variant="compact"
                          data-testid="group-included-packages-table"
                        >
                          <Tbody>
                            {grp.package_list.map((pkg) => (
                              <Tr key={`details-${pkg}`}>
                                <Td>{pkg}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      ) : (
                        <Text>This group has no packages</Text>
                      )}
                    </div>
                  }
                >
                  <Button
                    variant="plain"
                    aria-label="About included packages"
                    component="span"
                    className="pf-v5-u-p-0"
                    isInline
                  >
                    <HelpIcon className="pf-v5-u-ml-xs" />
                  </Button>
                </Popover>
              </Td>
              <Td>
                {grp.description ? (
                  grp.description
                ) : (
                  <span className="not-available">Not available</span>
                )}
              </Td>
              {grp.repository === 'distro' ? (
                <>
                  <Td>
                    <img
                      src={
                        '/apps/frontend-assets/red-hat-logos/logo_hat-only.svg'
                      }
                      alt="Red Hat logo"
                      height={RH_ICON_SIZE}
                      width={RH_ICON_SIZE}
                    />{' '}
                    Red Hat repository
                  </Td>
                  <Td>Supported</Td>
                </>
              ) : grp.repository === 'custom' ? (
                <>
                  <Td>Third party repository</Td>
                  <Td>Not supported</Td>
                </>
              ) : grp.repository === 'recommended' ? (
                <>
                  <Td>
                    <Icon status="warning">
                      <OptimizeIcon />
                    </Icon>{' '}
                    EPEL {distribution.startsWith('rhel-8') ? '8' : '9'}{' '}
                    Everything x86_64
                  </Td>
                  <Td>Not supported</Td>
                </>
              ) : (
                <>
                  <Td className="not-available">Not available</Td>
                  <Td className="not-available">Not available</Td>
                </>
              )}
            </Tr>
          ))
      );
    }

    if (showPackages) {
      rows = rows.concat(
        transformedPackages
          .slice(computeStart(), computeEnd())
          .map((pkg, rowIndex) => (
            <Tr key={`${pkg.name}-${rowIndex}`} data-testid="package-row">
              <Td
                select={{
                  isSelected: packages.some((p) => p.name === pkg.name),
                  rowIndex: rowIndex,
                  onSelect: (event, isSelecting) =>
                    handleSelect(pkg, rowIndex, isSelecting),
                }}
              />
              <Td>{pkg.name}</Td>
              <Td>
                {pkg.summary ? (
                  pkg.summary
                ) : (
                  <span className="not-available">Not available</span>
                )}
              </Td>
              {pkg.repository === 'distro' ? (
                <>
                  <Td>
                    <img
                      src={
                        '/apps/frontend-assets/red-hat-logos/logo_hat-only.svg'
                      }
                      alt="Red Hat logo"
                      height={RH_ICON_SIZE}
                      width={RH_ICON_SIZE}
                    />{' '}
                    Red Hat repository
                  </Td>
                  <Td>Supported</Td>
                </>
              ) : pkg.repository === 'custom' ? (
                <>
                  <Td>Third party repository</Td>
                  <Td>Not supported</Td>
                </>
              ) : pkg.repository === 'recommended' ? (
                <>
                  <Td>
                    <Icon status="warning">
                      <OptimizeIcon />
                    </Icon>{' '}
                    EPEL {distribution.startsWith('rhel-8') ? '8' : '9'}{' '}
                    Everything x86_64
                  </Td>
                  <Td>Not supported</Td>
                </>
              ) : (
                <>
                  <Td className="not-available">Not available</Td>
                  <Td className="not-available">Not available</Td>
                </>
              )}
            </Tr>
          ))
      );
    }
    return rows;
  };

  const bodyContent = useMemo(() => {
    switch (true) {
      case debouncedSearchTermLengthOf1 &&
        !debouncedSearchTermIsGroup &&
        transformedPackages.length === 0 &&
        transformedGroups.length === 0:
        return TooShort();
      case (toggleSelected === 'toggle-selected' &&
        packages.length === 0 &&
        groups.length === 0) ||
        (!debouncedSearchTerm && toggleSelected === 'toggle-available'):
        return <EmptySearch />;
      case (debouncedSearchTerm &&
        (isLoadingRecommendedPackages || isLoadingRecommendedGroups) &&
        toggleSourceRepos === RepoToggle.OTHER) ||
        (debouncedSearchTerm &&
          (isLoadingDistroPackages ||
            isLoadingCustomPackages ||
            isLoadingDistroGroups ||
            isLoadingCustomGroups) &&
          toggleSourceRepos === RepoToggle.INCLUDED):
        return <Searching />;
      case debouncedSearchTerm &&
        transformedPackages.length === 0 &&
        transformedGroups.length === 0 &&
        toggleSelected === 'toggle-available':
        return <NoResultsFound />;
      case debouncedSearchTerm &&
        toggleSelected === 'toggle-selected' &&
        toggleSourceRepos === RepoToggle.OTHER &&
        packages.length > 0 &&
        groups.length > 0:
        return <TryLookingUnderIncluded />;
      case debouncedSearchTerm && transformedPackages.length >= 100:
        return handleExactMatch();
      case (debouncedSearchTerm || toggleSelected === 'toggle-selected') &&
        transformedPackages.length < 100 &&
        transformedGroups.length < 100:
        return composePkgTable();
      default:
        return <></>;
    }
    // Would need significant rewrite to fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    perPage,
    debouncedSearchTerm,
    debouncedSearchTermLengthOf1,
    debouncedSearchTermIsGroup,
    isLoadingCustomPackages,
    isLoadingDistroPackages,
    isLoadingRecommendedPackages,
    isSuccessRecommendedPackages,
    isLoadingDistroGroups,
    isLoadingCustomGroups,
    isLoadingRecommendedGroups,
    packages.length,
    groups.length,
    toggleSelected,
    toggleSourceRepos,
    transformedPackages,
    isSelectingPackage,
    recommendedRepositories,
    transformedPackages.length,
    transformedGroups.length,
  ]);

  return (
    <>
      <RepositoryModal />
      <Toolbar>
        <Stack>
          <ToolbarContent>
            <ToolbarItem variant="search-filter">
              <InputGroup>
                <InputGroupItem isFill>
                  <InputGroupText id="search-icon">
                    <SearchIcon />
                  </InputGroupText>
                  <TextInput
                    data-ouia-component-id="packages-search-input"
                    type="text"
                    validated={
                      debouncedSearchTermLengthOf1 &&
                      !debouncedSearchTermIsGroup
                        ? 'error'
                        : 'default'
                    }
                    placeholder="Type to search"
                    aria-label="Search packages"
                    data-testid="packages-search-input"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroupItem>
                {searchTerm && (
                  <InputGroupItem>
                    <Button
                      variant="control"
                      aria-label="clear-package-search"
                      onClick={handleClear}
                      icon={<TimesIcon />}
                      ouiaId="clear-package-search-button"
                    />
                  </InputGroupItem>
                )}
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup>
                <ToggleGroupItem
                  text="Available"
                  buttonId="toggle-available"
                  data-testid="packages-available-toggle"
                  isSelected={toggleSelected === 'toggle-available'}
                  onChange={handleFilterToggleClick}
                />
                <ToggleGroupItem
                  text={`Selected (${
                    packages.length + groups.length <= 100
                      ? packages.length + groups.length
                      : '100+'
                  })`}
                  buttonId="toggle-selected"
                  data-testid="packages-selected-toggle"
                  isSelected={toggleSelected === 'toggle-selected'}
                  onChange={handleFilterToggleClick}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup>
                <ToggleGroupItem
                  text={
                    <>
                      Included repos{' '}
                      <Popover
                        bodyContent={
                          <TextContent>
                            <Text>
                              View packages from the Red Hat repository and
                              repositories you&apos;ve selected.
                            </Text>
                          </TextContent>
                        }
                      >
                        <Button
                          variant="plain"
                          aria-label="About included repositories"
                          component="span"
                          className="pf-v5-u-p-0"
                          size="sm"
                          isInline
                        >
                          <HelpIcon />
                        </Button>
                      </Popover>
                    </>
                  }
                  buttonId={RepoToggle.INCLUDED}
                  isSelected={toggleSourceRepos === RepoToggle.INCLUDED}
                  onChange={() => handleRepoToggleClick(RepoToggle.INCLUDED)}
                />
                <ToggleGroupItem
                  text={
                    <>
                      Other repos{' '}
                      <Popover
                        bodyContent={
                          <TextContent>
                            <Text>
                              View packages from popular repositories and your
                              other repositories not included in the image.
                            </Text>
                          </TextContent>
                        }
                      >
                        <Button
                          variant="plain"
                          aria-label="About other repositories"
                          component="span"
                          className="pf-v5-u-p-0"
                          size="sm"
                          isInline
                        >
                          <HelpIcon />
                        </Button>
                      </Popover>
                    </>
                  }
                  buttonId="toggle-other-repos"
                  isSelected={toggleSourceRepos === RepoToggle.OTHER}
                  onChange={() => handleRepoToggleClick(RepoToggle.OTHER)}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem variant="pagination">
              <Pagination
                data-testid="packages-pagination-top"
                itemCount={
                  searchTerm === '' && toggleSelected === 'toggle-available'
                    ? 0
                    : showPackages && showGroups
                    ? transformedPackages.length + transformedGroups.length
                    : showPackages
                    ? transformedPackages.length
                    : transformedGroups.length
                }
                perPage={perPage}
                page={page}
                onSetPage={handleSetPage}
                onPerPageSelect={handlePerPageSelect}
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
          <ToolbarContent>
            <CustomHelperText
              hide={!debouncedSearchTermLengthOf1 || debouncedSearchTermIsGroup}
              textValue="The search value must be greater than 1 character"
            />
          </ToolbarContent>
        </Stack>
      </Toolbar>

      <Table variant="compact" data-testid="packages-table">
        <Thead>
          <Tr>
            <Th aria-label="Selected" />
            <Th width={20}>Package name</Th>
            <Th width={35}>
              Description
              {toggleSelected === 'toggle-selected' && (
                <PackageInfoNotAvailablePopover />
              )}
            </Th>
            <Th width={25}>Package repository</Th>
            <Th width={20}>Support</Th>
          </Tr>
        </Thead>
        <Tbody>{bodyContent}</Tbody>
      </Table>
      <Pagination
        data-testid="packages-pagination-bottom"
        itemCount={
          searchTerm === '' && toggleSelected === 'toggle-available'
            ? 0
            : showPackages && showGroups
            ? transformedPackages.length + transformedGroups.length
            : showPackages
            ? transformedPackages.length
            : transformedGroups.length
        }
        perPage={perPage}
        page={page}
        onSetPage={handleSetPage}
        onPerPageSelect={handlePerPageSelect}
        variant={PaginationVariant.bottom}
      />
    </>
  );
};

export default Packages;
