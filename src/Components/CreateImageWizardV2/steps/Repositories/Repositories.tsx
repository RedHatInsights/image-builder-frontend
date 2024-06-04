import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Button,
  Pagination,
  Panel,
  PanelMain,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToggleGroup,
  ToggleGroupItem,
  PaginationVariant,
  Grid,
  Modal,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { BulkSelect } from './components/BulkSelect';
import Empty from './components/Empty';
import { Error } from './components/Error';
import { Loading } from './components/Loading';
import {
  convertSchemaToIBCustomRepo,
  convertSchemaToIBPayloadRepo,
} from './components/Utilities';
import RepositoriesStatus from './RepositoriesStatus';
import RepositoryUnavailable from './RepositoryUnavailable';

import {
  ApiRepositoryResponseRead,
  useListRepositoriesQuery,
} from '../../../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeCustomRepositories,
  changePayloadRepositories,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectPackages,
  selectPayloadRepositories,
  selectRecommendedRepositories,
  selectWizardMode,
} from '../../../../store/wizardSlice';
import { releaseToVersion } from '../../../../Utilities/releaseToVersion';
import useDebounce from '../../../../Utilities/useDebounce';

const Repositories = () => {
  const dispatch = useAppDispatch();
  const wizardMode = useAppSelector(selectWizardMode);
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const packages = useAppSelector(selectPackages);
  const payloadRepositories = useAppSelector(selectPayloadRepositories);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);

  const [modalOpen, setModalOpen] = useState(false);
  const [reposToRemove, setReposToRemove] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [toggleSelected, setToggleSelected] = useState<
    'toggle-group-all' | 'toggle-group-selected'
  >('toggle-group-all');

  const debouncedFilterValue = useDebounce(filterValue);

  const selected = useMemo(
    () =>
      new Set(
        [
          ...customRepositories.map(({ baseurl }) => baseurl || []).flat(1),
          ...(payloadRepositories.map(({ baseurl }) => baseurl) || []),
          ...(recommendedRepos.map(({ url }) => url) || []),
        ].filter((url) => !!url) as string[]
      ),
    [customRepositories, payloadRepositories, recommendedRepos]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialSelectedState = useMemo(() => new Set([...selected]), []);

  const {
    data: { data: previousReposData = [] } = {},
    isLoading: previousLoading,
    isSuccess: previousSuccess,
    refetch: refetchIntial,
  } = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      origin: 'external',
      limit: 999,
      offset: 0,
      url: [...initialSelectedState].join(','),
    },
    { refetchOnMountOrArgChange: false }
  );

  useEffect(() => {
    if (toggleSelected === 'toggle-group-selected' && !selected.size) {
      setToggleSelected('toggle-group-all');
    }
  }, [selected, toggleSelected]);

  const {
    data: { data: contentList = [], meta: { count } = { count: 0 } } = {},
    isError,
    isFetching,
    isLoading,
    refetch: refetchMain,
  } = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      contentType: 'rpm',
      origin: 'external',
      limit: perPage,
      offset: perPage * (page - 1),
      search: debouncedFilterValue,
      url:
        toggleSelected === 'toggle-group-selected'
          ? [...selected].join(',')
          : undefined,
    },
    { refetchOnMountOrArgChange: 60 }
  );

  const refresh = () => {
    // In case the user deletes an intially selected repository.
    // Refetching will react to both added and removed repositories.
    refetchMain();
    refetchIntial();
  };

  const addSelected = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[]
  ) => {
    let reposToAdd: ApiRepositoryResponseRead[] = [];
    // Check if array of items
    if ((repo as ApiRepositoryResponseRead[])?.length) {
      reposToAdd = (repo as ApiRepositoryResponseRead[]).filter(
        ({ url }) => url && !selected.has(url)
      );
    } else {
      // Then it should be a single item
      const singleRepo = repo as ApiRepositoryResponseRead;
      if (singleRepo?.url && !selected.has(singleRepo.url)) {
        reposToAdd.push(singleRepo);
      }
    }

    const customToAdd = reposToAdd.map((repo) =>
      convertSchemaToIBCustomRepo(repo!)
    );

    const payloadToAdd = reposToAdd.map((repo) =>
      convertSchemaToIBPayloadRepo(repo!)
    );

    dispatch(changeCustomRepositories([...customRepositories, ...customToAdd]));
    dispatch(
      changePayloadRepositories([...payloadRepositories, ...payloadToAdd])
    );
  };

  const clearSelected = () => {
    const recommendedReposSet = new Set(recommendedRepos.map(({ url }) => url));
    const initiallySelected = [...selected].some(
      (url) => url && initialSelectedState.has(url)
    );

    if (initiallySelected) {
      setModalOpen(true);
      setReposToRemove([...selected]);
      return;
    }

    dispatch(
      changeCustomRepositories(
        customRepositories.filter(({ baseurl }) =>
          baseurl?.some((url) => recommendedReposSet.has(url))
        )
      )
    );

    dispatch(
      changePayloadRepositories(
        payloadRepositories.filter(({ baseurl }) =>
          recommendedReposSet.has(baseurl)
        )
      )
    );
  };

  const removeSelected = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[]
  ) => {
    if ((repo as ApiRepositoryResponseRead[])?.length) {
      const itemsToRemove = new Set(
        (repo as ApiRepositoryResponseRead[]).map(({ url }) => url)
      );

      dispatch(
        changeCustomRepositories(
          customRepositories.filter(
            ({ baseurl }) => !baseurl?.some((url) => itemsToRemove.has(url))
          )
        )
      );

      dispatch(
        changePayloadRepositories(
          payloadRepositories.filter(
            ({ baseurl }) => !itemsToRemove.has(baseurl)
          )
        )
      );

      return;
    }

    const urlToRemove = (repo as ApiRepositoryResponseRead)?.url;
    if (urlToRemove) {
      dispatch(
        changeCustomRepositories(
          customRepositories.filter(
            ({ baseurl }) => !baseurl?.some((url) => urlToRemove === url)
          )
        )
      );

      dispatch(
        changePayloadRepositories(
          payloadRepositories.filter(({ baseurl }) => urlToRemove !== baseurl)
        )
      );
    }
  };

  const handleAddRemove = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
    selected: boolean
  ) => {
    if (selected) return addSelected(repo);
    if ((repo as ApiRepositoryResponseRead[])?.length) {
      const initiallySelectedItems = (repo as ApiRepositoryResponseRead[]).map(
        ({ url }) => url
      );

      const hasSome = initiallySelectedItems.some(
        (url) => url && initialSelectedState.has(url)
      );

      if (hasSome) {
        setModalOpen(true);
        setReposToRemove(initiallySelectedItems as string[]);
        return;
      }
    } else {
      const isInitiallySelected =
        (repo as ApiRepositoryResponseRead).url &&
        initialSelectedState.has((repo as ApiRepositoryResponseRead).url || '');
      if (isInitiallySelected) {
        setModalOpen(true);
        setReposToRemove([(repo as ApiRepositoryResponseRead).url as string]);
        return;
      }
    }
    return removeSelected(repo);
  };

  const previousReposNowUnavailable: number = useMemo(() => {
    if (
      !previousLoading &&
      previousSuccess &&
      previousReposData.length !== initialSelectedState.size &&
      previousReposData.length < initialSelectedState.size
    ) {
      const prevSet = new Set(previousReposData.map(({ url }) => url));
      const itemsToRemove = [...initialSelectedState]
        .filter((url) => !prevSet.has(url))
        .map((url) => ({ url })) as ApiRepositoryResponseRead[];
      removeSelected(itemsToRemove);
      return initialSelectedState.size - previousReposData.length;
    }
    return 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previousLoading,
    previousSuccess,
    previousReposData,
    initialSelectedState,
  ]);

  const handleToggleClick = (
    toggleType: 'toggle-group-all' | 'toggle-group-selected'
  ) => {
    setPage(1);
    setToggleSelected(toggleType);
  };

  const isRepoDisabled = (
    repo: ApiRepositoryResponseRead,
    isSelected: boolean
  ): [boolean, string] => {
    if (isFetching) {
      return [true, 'Repository data is still fetching, please wait.'];
    }

    if (
      recommendedRepos.length > 0 &&
      repo.url?.includes('epel') &&
      isSelected &&
      packages.length
    ) {
      return [
        true,
        'This repository was added because of previously recommended packages added to the image.\n' +
          'To remove the repository, its related packages must be removed first.',
      ];
    }

    if (repo.status !== 'Valid') {
      return [
        true,
        `Repository can't be selected. The status is still '${repo.status}'.`,
      ];
    }

    return [false, '']; // Repository is enabled
  };

  const handlePerPageSelect = (
    _: React.MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleFilterRepositories = (
    e: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    e.preventDefault();
    setPage(1);
    setFilterValue(value);
  };

  const onClose = () => setModalOpen(false);

  const handleRemoveAnyway = () => {
    const itemsToRemove = new Set(reposToRemove);

    dispatch(
      changeCustomRepositories(
        customRepositories.filter(
          ({ baseurl }) => !baseurl?.some((url) => itemsToRemove.has(url))
        )
      )
    );

    dispatch(
      changePayloadRepositories(
        payloadRepositories.filter(
          ({ baseurl }) => !itemsToRemove.has(baseurl || '')
        )
      )
    );

    setReposToRemove([]);
    onClose();
  };

  if (isError) return <Error />;
  if (isLoading) return <Loading />;
  return (
    <Grid>
      <Modal
        titleIconVariant="warning"
        title="Are you sure?"
        isOpen={modalOpen}
        onClose={onClose}
        variant="small"
        actions={[
          <Button key="remove" variant="primary" onClick={handleRemoveAnyway}>
            Remove anyway
          </Button>,
          <Button key="back" variant="link" onClick={onClose}>
            Back
          </Button>,
        ]}
      >
        You are removing a previously added repository.
        <br />
        We do not recommend removing repositories if you have added packages
        from them.
      </Modal>
      {wizardMode === 'edit' && (
        <Alert
          title="Removing previously added repositories may lead to issues with selected packages"
          variant="warning"
          isPlain
          isInline
        />
      )}
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="bulk-select">
            <BulkSelect
              selected={selected}
              contentList={contentList}
              deselectAll={clearSelected}
              perPage={perPage}
              handleAddRemove={handleAddRemove}
              isDisabled={isFetching || (!selected.size && !contentList.length)}
            />
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
            <SearchInput
              aria-label="Search repositories"
              onChange={handleFilterRepositories}
              value={filterValue}
              onClear={() => setFilterValue('')}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="primary"
              isInline
              onClick={() => refresh()}
              isLoading={isFetching}
            >
              {isFetching ? 'Refreshing' : 'Refresh'}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ToggleGroup aria-label="Filter repositories list">
              <ToggleGroupItem
                text="All"
                aria-label="All repositories"
                buttonId="toggle-group-all"
                isSelected={toggleSelected === 'toggle-group-all'}
                onChange={() => handleToggleClick('toggle-group-all')}
              />
              <ToggleGroupItem
                text="Selected"
                isDisabled={!selected.size}
                aria-label="Selected repositories"
                buttonId="toggle-group-selected"
                isSelected={toggleSelected === 'toggle-group-selected'}
                onChange={() => handleToggleClick('toggle-group-selected')}
              />
            </ToggleGroup>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Panel>
        <PanelMain>
          {previousReposNowUnavailable ? (
            <RepositoryUnavailable quantity={previousReposNowUnavailable} />
          ) : (
            ''
          )}
          {contentList.length === 0 ? (
            <Empty hasFilterValue={!!debouncedFilterValue} refetch={refresh} />
          ) : (
            <Table variant="compact" data-testid="repositories-table">
              <Thead>
                <Tr>
                  <Th aria-label="Selected" />
                  <Th width={45}>Name</Th>
                  <Th width={15}>Architecture</Th>
                  <Th>Version</Th>
                  <Th width={10}>Packages</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contentList.map((repo, rowIndex) => {
                  const {
                    url = '',
                    name,
                    status = '',
                    distribution_arch,
                    distribution_versions,
                    package_count,
                    last_introspection_time,
                    failed_introspections_count,
                  } = repo;

                  const [isDisabled, disabledReason] = isRepoDisabled(
                    repo,
                    selected.has(url)
                  );

                  return (
                    <Tr key={url}>
                      <Td
                        select={{
                          isSelected: selected.has(url),
                          rowIndex: rowIndex,
                          onSelect: (_, isSelecting) =>
                            handleAddRemove(repo, isSelecting),
                          isDisabled: isDisabled,
                        }}
                        title={disabledReason}
                      />
                      <Td dataLabel={'Name'}>
                        {name}
                        <br />
                        <Button
                          component="a"
                          target="_blank"
                          variant="link"
                          icon={<ExternalLinkAltIcon />}
                          iconPosition="right"
                          isInline
                          href={url}
                        >
                          {url}
                        </Button>
                      </Td>
                      <Td dataLabel={'Architecture'}>
                        {distribution_arch || '-'}
                      </Td>
                      <Td dataLabel={'Version'}>
                        {distribution_versions || '-'}
                      </Td>
                      <Td dataLabel={'Packages'}>{package_count || '-'}</Td>
                      <Td dataLabel={'Status'}>
                        <RepositoriesStatus
                          repoStatus={status || 'Unavailable'}
                          repoUrl={url}
                          repoIntrospections={last_introspection_time}
                          repoFailCount={failed_introspections_count}
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </PanelMain>
      </Panel>
      <Pagination
        itemCount={count}
        perPage={perPage}
        page={page}
        onSetPage={(_, newPage) => setPage(newPage)}
        onPerPageSelect={handlePerPageSelect}
        variant={PaginationVariant.bottom}
      />
    </Grid>
  );
};

export default Repositories;
