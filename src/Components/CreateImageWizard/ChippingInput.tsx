import React, { useState } from 'react';

import {
  Button,
  Chip,
  ChipGroup,
  HelperText,
  HelperTextItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core/dist/esm';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { UnknownAction } from 'redux';

import { useAppDispatch } from '../../store/hooks';

type ChippingInputProps = {
  ariaLabel: string;
  placeholder: string;
  validator: (value: string) => boolean;
  list: string[] | undefined;
  item: string;
  addAction: (value: string) => UnknownAction;
  removeAction: (value: string) => UnknownAction;
};

const ChippingInput = ({
  ariaLabel,
  placeholder,
  validator,
  list,
  item,
  addAction,
  removeAction,
}: ChippingInputProps) => {
  const dispatch = useAppDispatch();

  const [inputValue, setInputValue] = useState('');
  const [errorText, setErrorText] = useState('');

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
    setErrorText('');
  };

  const addItem = (value: string) => {
    if (validator(value) && !list?.includes(value)) {
      dispatch(addAction(value));
      setInputValue('');
      setErrorText('');
    }

    if (list?.includes(value)) {
      setErrorText(`${item} already exists.`);
    }

    if (!validator(value)) {
      setErrorText('Invalid format.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addItem(value);
    }
  };

  const handleAddItem = (e: React.MouseEvent, value: string) => {
    addItem(value);
  };

  const handleClear = () => {
    setInputValue('');
    setErrorText('');
  };

  return (
    <>
      <TextInputGroup>
        <TextInputGroupMain
          placeholder={placeholder}
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
        />
        <TextInputGroupUtilities>
          <Button
            variant="plain"
            onClick={(e) => handleAddItem(e, inputValue)}
            isDisabled={!inputValue}
            aria-label={ariaLabel}
          >
            <PlusCircleIcon className="pf-v5-u-primary-color-100" />
          </Button>
          <Button
            variant="plain"
            onClick={handleClear}
            isDisabled={!inputValue}
            aria-label="Clear input"
          >
            <TimesIcon />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
        </HelperText>
      )}
      <ChipGroup numChips={5} className="pf-v5-u-mt-sm pf-v5-u-w-100">
        {list?.map((item) => (
          <Chip key={item} onClick={() => dispatch(removeAction(item))}>
            {item}
          </Chip>
        ))}
      </ChipGroup>
    </>
  );
};

export default ChippingInput;
