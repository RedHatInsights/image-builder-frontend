import React, { useEffect, useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  TextArea,
  TextAreaProps,
  TextInput,
  TextInputProps,
  Button,
  InputGroup,
  InputGroupItem,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import type { StepValidation } from './utilities/useValidation';

interface ValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  helperText: string | undefined;
  validator: (value: string | undefined) => boolean;
  value: string;
  placeholder?: string;
}

type HookValidatedInputPropTypes = TextInputProps &
  TextAreaProps & {
    dataTestId?: string | undefined;
    ouiaId?: string;
    ariaLabel: string | undefined;
    value: string;
    placeholder?: string;
    stepValidation: StepValidation;
    fieldName: string;
    warning?: string;
    inputType?: 'textInput' | 'textArea';
    isRequired?: boolean;
  };

export const HookPasswordValidatedInput = ({
  ariaLabel,
  placeholder,
  dataTestId,
  value,
  ouiaId,
  stepValidation,
  fieldName,
  onChange,
  warning = undefined,
  inputType,
  isDisabled,
  isRequired,
}: HookValidatedInputPropTypes) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <HookValidatedInput
            type={isPasswordVisible ? 'text' : 'password'}
            ouiaId={ouiaId || ''}
            data-testid={dataTestId}
            value={value}
            onChange={onChange!}
            stepValidation={stepValidation}
            ariaLabel={ariaLabel || ''}
            fieldName={fieldName}
            placeholder={placeholder || ''}
            inputType={inputType || 'textInput'}
            warning={warning || ''}
            isDisabled={isDisabled || false}
            isRequired={isRequired || false}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? 'Show password' : 'Hide password'}
          >
            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
          </Button>
        </InputGroupItem>
      </InputGroup>
    </>
  );
};

export const HookValidatedInput = ({
  dataTestId,
  ouiaId,
  ariaLabel,
  value,
  isDisabled,
  placeholder,
  onChange,
  stepValidation,
  fieldName,
  type = 'text',
  inputType,
  warning = undefined,
  isRequired = false,
}: HookValidatedInputPropTypes) => {
  const isEmpty = value === undefined || value === null || value === '';
  const [isPristine, setIsPristine] = useState(isEmpty);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated = isPristine
    ? 'default'
    : stepValidation.errors[fieldName] === 'default'
    ? 'default'
    : stepValidation.errors[fieldName]
    ? 'error'
    : 'success';

  const handleBlur = () => {
    if (isEmpty && !isRequired) {
      setIsPristine(true);
    } else {
      setIsPristine(false);
    }
  };
  useEffect(() => {
    if (isEmpty && !isRequired) {
      setIsPristine(true);
    }
  }, [value, setIsPristine]);

  return (
    <>
      {inputType === 'textArea' ? (
        <TextArea
          value={value}
          data-testid={dataTestId}
          onChange={onChange!}
          validated={validated}
          aria-label={ariaLabel || ''}
          onBlur={handleBlur}
          placeholder={placeholder || ''}
          isDisabled={isDisabled || false}
        />
      ) : (
        <TextInput
          value={value}
          data-testid={dataTestId}
          ouiaId={ouiaId || ''}
          type={type}
          onChange={onChange!}
          validated={validated}
          aria-label={ariaLabel || ''}
          onBlur={handleBlur}
          placeholder={placeholder || ''}
          isDisabled={isDisabled || false}
        />
      )}
      {validated === 'error' && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {stepValidation.errors[fieldName]}
          </HelperTextItem>
        </HelperText>
      )}
      {warning !== undefined && warning !== '' && (
        <HelperText>
          <HelperTextItem variant="warning" hasIcon>
            {warning}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export const ValidatedInput = ({
  dataTestId,
  ouiaId,
  ariaLabel,
  helperText,
  validator,
  value,
  placeholder,
  onChange,
}: ValidatedTextInputPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);

  const handleBlur = () => {
    setIsPristine(false);
  };

  const handleValidation = () => {
    // Prevent premature validation during user's first entry
    if (isPristine) {
      return 'default';
    }
    return validator(value) ? 'success' : 'error';
  };

  return (
    <>
      <TextInput
        value={value}
        data-testid={dataTestId}
        ouiaId={ouiaId || ''}
        type="text"
        onChange={onChange!}
        validated={handleValidation()}
        aria-label={ariaLabel || ''}
        onBlur={handleBlur}
        placeholder={placeholder || ''}
      />
      {!isPristine && !validator(value) && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {helperText}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};
