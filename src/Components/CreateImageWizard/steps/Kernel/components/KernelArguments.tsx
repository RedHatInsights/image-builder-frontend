import React, { useState } from 'react';

import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../../store/imageBuilderApi';
import {
  addKernelArg,
  removeKernelArg,
  selectComplianceProfileID,
  selectDistribution,
  selectKernel,
} from '../../../../../store/wizardSlice';
import { isKernelArgumentValid } from '../../../validators';

const KernelArguments = () => {
  const dispatch = useAppDispatch();
  const kernelAppend = useAppSelector(selectKernel).append;

  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    }
  );

  const [inputValue, setInputValue] = useState('');
  const [errorText, setErrorText] = useState('');

  const requiredByOpenSCAP = kernelAppend.filter((arg) =>
    oscapProfileInfo?.kernel?.append?.split(' ').includes(arg.name)
  );
  const notRequiredByOpenSCAP = kernelAppend.filter(
    (arg) => !oscapProfileInfo?.kernel?.append?.split(' ').includes(arg.name)
  );

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
    setErrorText('');
  };

  const addArgument = (value: string) => {
    if (
      isKernelArgumentValid(value) &&
      !kernelAppend.some((arg) => arg.name === value)
    ) {
      dispatch(addKernelArg({ name: value }));
      setInputValue('');
      setErrorText('');
    }

    if (kernelAppend.some((arg) => arg.name === value)) {
      setErrorText(`Kernel argument already exists.`);
    }

    if (!isKernelArgumentValid(value)) {
      setErrorText('Invalid format.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArgument(value);
    }
  };

  const handleAddItem = (e: React.MouseEvent, value: string) => {
    addArgument(value);
  };

  const handleClear = () => {
    setInputValue('');
    setErrorText('');
  };

  return (
    <FormGroup isRequired={false} label="Append">
      <TextInputGroup>
        <TextInputGroupMain
          placeholder="Add kernel argument"
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
        />
        <TextInputGroupUtilities>
          <Button
            variant="plain"
            onClick={(e) => handleAddItem(e, inputValue)}
            isDisabled={!inputValue}
            aria-label="Add kernel argument"
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
      <ChipGroup
        categoryName="Required by OpenSCAP"
        numChips={20}
        className="pf-v5-u-mt-sm pf-v5-u-w-100"
      >
        {requiredByOpenSCAP.map((arg) => (
          <Chip
            key={arg.name}
            onClick={() => dispatch(removeKernelArg(arg.name))}
            isReadOnly
          >
            {arg.name}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup numChips={20} className="pf-v5-u-mt-sm pf-v5-u-w-100">
        {notRequiredByOpenSCAP.map((arg) => (
          <Chip
            key={arg.name}
            onClick={() => dispatch(removeKernelArg(arg.name))}
          >
            {arg.name}
          </Chip>
        ))}
      </ChipGroup>
    </FormGroup>
  );
};

export default KernelArguments;
