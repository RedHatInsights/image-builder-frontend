import React, { useEffect, useState } from 'react';

import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeKeyboard,
  selectKeyboard,
} from '../../../../../store/wizardSlice';
import sortfn from '../../../../../Utilities/sortfn';
import { useLocaleValidation } from '../../../utilities/useValidation';
import { keyboardsList } from '../keyboardsList';

const KeyboardDropDown = () => {
  const keyboard = useAppSelector(selectKeyboard);
  const dispatch = useAppDispatch();

  const stepValidation = useLocaleValidation();

  const [errorText, setErrorText] = useState(stepValidation.errors['keyboard']);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<string[]>(keyboardsList);

  useEffect(() => {
    let filteredKeyboards = keyboardsList;

    if (filterValue) {
      filteredKeyboards = keyboardsList.filter((keyboard: string) =>
        String(keyboard).toLowerCase().includes(filterValue.toLowerCase())
      );
      if (!filteredKeyboards.length) {
        filteredKeyboards = [`No results found for "${filterValue}"`];
      }
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(
      filteredKeyboards.sort((a, b) => sortfn(a, b, filterValue))
    );

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(!isOpen);
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onSelect = (_event: React.MouseEvent, value: string) => {
    if (value && !value.includes('No results')) {
      setInputValue(value);
      setFilterValue('');
      setErrorText('');
      dispatch(changeKeyboard(value));
      setIsOpen(false);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (value !== keyboard) {
      dispatch(changeKeyboard(''));
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setInputValue('');
    setFilterValue('');
    setErrorText('');
    dispatch(changeKeyboard(''));
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={keyboard ? keyboard : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select a keyboard"
          isExpanded={isOpen}
        />

        {keyboard && (
          <TextInputGroupUtilities>
            <Button
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input"
            >
              <TimesIcon />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label="Keyboard">
      <Select
        isScrollable
        isOpen={isOpen}
        selected={keyboard}
        onSelect={onSelect}
        onOpenChange={onToggle}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {selectOptions.map((option) => (
            <SelectOption key={option} value={option}>
              {option}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default KeyboardDropDown;
