import React, { useState, useRef, useEffect, useCallback } from 'react';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import api from '../../../api';
import PropTypes from 'prop-types';
import {
    Button,
    DualListSelector,
    DualListSelectorPane,
    DualListSelectorList,
    DualListSelectorListItem,
    DualListSelectorControlsWrapper,
    DualListSelectorControl,
    SearchInput,
    TextContent
} from '@patternfly/react-core';
import { AngleDoubleLeftIcon, AngleLeftIcon, AngleDoubleRightIcon, AngleRightIcon } from '@patternfly/react-icons';

// the fields isHidden and isSelected should not be included in the package list sent for image creation
const removePackagesDisplayFields = (packages) => packages.map((pack) => ({
    name: pack.name,
    summary: pack.summary,
}));

const Packages = ({ defaultArch, ...props }) => {
    const { change, getState } = useFormApi();
    const { input } = useFieldApi(props);
    const packagesSearchName = useRef();
    const [ packagesAvailable, setPackagesAvailable ] = useState([]);
    const [ packagesAvailableFound, setPackagesAvailableFound ] = useState(true);
    const [ packagesChosen, setPackagesChosen ] = useState([]);
    const [ packagesChosenFound, setPackagesChosenFound ] = useState(true);
    const [ filterChosen, setFilterChosen ] = useState('');
    const [ focus, setFocus ] = useState('');

    // this effect only triggers on mount
    useEffect(() => {
        const selectedPackages = getState()?.values?.['selected-packages'];
        if (selectedPackages) {
            setPackagesChosen(selectedPackages);
        }
    }, []);

    const searchResultsComparator = useCallback((searchTerm) => {
        return (a, b) => {
            // check exact match first
            if (a.name === searchTerm) {
                return -1;
            }

            if (b.name === searchTerm) {
                return 1;
            }

            // check for packages that start with the search term
            if (a.name.startsWith(searchTerm) && !b.name.startsWith(searchTerm)) {
                return -1;
            }

            if (b.name.startsWith(searchTerm) && !a.name.startsWith(searchTerm)) {
                return 1;
            }

            // if both (or neither) start with the search term
            // sort alphabetically
            if (a.name < b.name) {
                return -1;
            }

            if (b.name < a.name) {
                return 1;
            }

            return 0;
        };
    });

    const sortPackages = useCallback((packageList) => {
        const sortResults = packageList.sort(searchResultsComparator(packagesSearchName.current));
        setPackagesAvailable(sortResults);
    });

    // filter the packages by name
    const filterPackagesAvailable = useCallback((packageList) => {
        return packageList.filter((availablePackage) => {
            // returns true if no packages in the available or chosen list have the same name
            return !packagesChosen.some((chosenPackage) => availablePackage.name === chosenPackage.name);
        });
    });

    const getAllPackages = async () => {
        const args = [
            getState()?.values?.release,
            getState()?.values?.architecture || defaultArch,
            packagesSearchName.current
        ];
        let { data, meta } = await api.getPackages(...args);
        if (data?.length === meta.count) {
            return data;
        } else if (data) {
            ({ data } = await api.getPackages(...args, meta.count));
            return data;
        }
    };

    // call api to list available packages
    const handlePackagesAvailableSearch = async () => {
        const packageList = await getAllPackages();
        if (packageList) {
            const packagesAvailableFiltered = filterPackagesAvailable(packageList);
            sortPackages(packagesAvailableFiltered);
            setPackagesAvailableFound(true);
        } else {
            setPackagesAvailableFound(false);
        }
    };

    // filter displayed selected packages
    const handlePackagesChosenSearch = () => {
        let found = false;
        const filteredPackagesChosen = packagesChosen.map((pack) => {
            if (!pack.name.includes(filterChosen)) {
                pack.isHidden = true;
            } else {
                pack.isHidden = false;
                found = true;
            }

            return pack;
        });
        setPackagesChosenFound(found);
        setPackagesChosen(filteredPackagesChosen);
    };

    const keydownHandler = (event) => {
        if (event.key === 'Enter') {
            if (focus === 'available') {
                event.stopPropagation();
                handlePackagesAvailableSearch();
            } else if (focus === 'chosen') {
                event.stopPropagation();
                handlePackagesChosenSearch();
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', keydownHandler, true);

        return () => {
            document.removeEventListener('keydown', keydownHandler, true);
        };
    });

    // move selected packages
    const moveSelected = (fromAvailable) => {
        const sourcePackages = fromAvailable ? packagesAvailable : packagesChosen;
        const destinationPackages = fromAvailable ? packagesChosen : packagesAvailable;

        const updatedSourcePackages = sourcePackages.filter((pack) => {
            if (pack.selected) {
                pack.selected = false;
                destinationPackages.push(pack);
                return false;
            }

            return true;
        });

        if (fromAvailable) {
            sortPackages(updatedSourcePackages);
            setPackagesChosen(destinationPackages);
            // set the steps field to the current chosen packages list
            change(input.name, removePackagesDisplayFields(destinationPackages));
        } else {
            setPackagesChosen(updatedSourcePackages);
            sortPackages(packagesAvailable);
            // set the steps field to the current chosen packages list
            change(input.name, removePackagesDisplayFields(updatedSourcePackages));
        }
    };

    // move all packages
    const moveAll = (fromAvailable) => {
        let chosenPackages = [];
        if (fromAvailable) {
            chosenPackages = [ ...packagesAvailable.filter(pack => !pack.isHidden), ...packagesChosen ];
            setPackagesChosen(chosenPackages);
            sortPackages([ ...packagesAvailable.filter(pack => pack.isHidden) ]);
        } else {
            chosenPackages = [ ...packagesChosen.filter(pack => pack.isHidden) ];
            sortPackages([ ...packagesChosen.filter(pack => !pack.isHidden), ...packagesAvailable ]);
            setPackagesChosen(chosenPackages);
        }

        // set the steps field to the current chosen packages list
        change(input.name, removePackagesDisplayFields(chosenPackages));
    };

    const onOptionSelect = (event, index, isChosen) => {
        if (isChosen) {
            const newChosen = [ ...packagesChosen ];
            newChosen[index].selected = !packagesChosen[index].selected;
            setPackagesChosen(newChosen);
        } else {
            const newAvailable = [ ...packagesAvailable ];
            newAvailable[index].selected = !packagesAvailable[index].selected;
            sortPackages(newAvailable);
        }
    };

    return (
        <DualListSelector>
            <DualListSelectorPane
                title="Available packages"
                searchInput={ <SearchInput
                    placeholder="Search for a package"
                    data-testid="search-available-pkgs-input"
                    value={ packagesSearchName.current }
                    onFocus={ () => setFocus('available') }
                    onBlur={ () => setFocus('') }
                    onChange={ (val) => {
                        packagesSearchName.current = val;
                    } } /> }
                actions={ [
                    <Button
                        aria-label="Search button for available packages"
                        key="availableSearchButton"
                        data-testid="search-available-pkgs-button"
                        onClick={ handlePackagesAvailableSearch }>
                        Search
                    </Button>
                ] }>
                <DualListSelectorList data-testid="available-pkgs-list">
                    {!packagesAvailable.length ? (
                        <p className="pf-u-text-align-center pf-u-mt-md">
                            {!packagesAvailableFound
                                ? 'No packages found'
                                : <>Search above to add additional<br />packages to your image</>
                            }
                        </p>
                    ) : (packagesAvailable.map((pack, index) => {
                        return !pack.isHidden ? (
                            <DualListSelectorListItem
                                key={ index }
                                isSelected={ pack.selected }
                                onOptionSelect={ (e) => onOptionSelect(e, index, false) }>
                                <TextContent key={ `${pack.name}-${index}` }>
                                    <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
                                    <small>{ pack.summary }</small>
                                </TextContent>
                            </DualListSelectorListItem>
                        ) : null;
                    }))}
                </DualListSelectorList>
            </DualListSelectorPane>
            <DualListSelectorControlsWrapper
                aria-label="Selector controls">
                <DualListSelectorControl
                    isDisabled={ !packagesAvailable.some(option => option.selected) }
                    onClick={ () => moveSelected(true) }
                    aria-label="Add selected"
                    tooltipContent="Add selected">
                    <AngleRightIcon />
                </DualListSelectorControl>
                <DualListSelectorControl
                    isDisabled={ !packagesAvailable.length }
                    onClick={ () => moveAll(true) }
                    aria-label="Add all"
                    tooltipContent="Add all">
                    <AngleDoubleRightIcon />
                </DualListSelectorControl>
                <DualListSelectorControl
                    isDisabled={ !packagesChosen.length || !packagesChosenFound }
                    onClick={ () => moveAll(false) }
                    aria-label="Remove all"
                    tooltipContent="Remove all">
                    <AngleDoubleLeftIcon />
                </DualListSelectorControl>
                <DualListSelectorControl
                    onClick={ () => moveSelected(false) }
                    isDisabled={ !packagesChosen.some(option => option.selected) || !packagesChosenFound }
                    aria-label="Remove selected"
                    tooltipContent="Remove selected">
                    <AngleLeftIcon />
                </DualListSelectorControl>
            </DualListSelectorControlsWrapper>
            <DualListSelectorPane
                title="Chosen packages"
                searchInput={ <SearchInput
                    placeholder="Search for a package"
                    data-testid="search-chosen-pkgs-input"
                    value={ filterChosen }
                    onFocus={ () => setFocus('chosen') }
                    onBlur={ () => setFocus('') }
                    onChange={ (val) => setFilterChosen(val) } /> }
                actions={ [
                    <Button
                        aria-label="Search button for selected packages"
                        key="selectedSearchButton"
                        data-testid="search-chosen-pkgs-button"
                        onClick={ handlePackagesChosenSearch }>
                        Search
                    </Button>
                ] }
                isChosen>
                <DualListSelectorList data-testid="chosen-pkgs-list">
                    {!packagesChosen.length ? (
                        <p className="pf-u-text-align-center pf-u-mt-md">
                            No packages added
                        </p>
                    ) : !packagesChosenFound ? (
                        <p className="pf-u-text-align-center pf-u-mt-md">
                            No packages found
                        </p>
                    ) : (packagesChosen.map((pack, index) => {
                        return !pack.isHidden ? (
                            <DualListSelectorListItem
                                key={ index }
                                isSelected={ pack.selected }
                                onOptionSelect={ (e) => onOptionSelect(e, index, true) }>
                                <TextContent key={ `${pack.name}-${index}` }>
                                    <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
                                    <small>{ pack.summary }</small>
                                </TextContent>
                            </DualListSelectorListItem>
                        ) : null;
                    }))}
                </DualListSelectorList>
            </DualListSelectorPane>
        </DualListSelector>
    );
};

Packages.propTypes = {
    defaultArch: PropTypes.string,
};

export default Packages;
