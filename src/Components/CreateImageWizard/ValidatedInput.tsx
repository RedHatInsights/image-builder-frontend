import React, { useState } from 'react';

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
  };

type passwordPropTypes = TextInputProps & {
  value: string;
  stepValidation: StepValidation;
  fieldName: string;
};

type ValidatedInputPropTypes = TextInputProps &
  TextAreaProps & {
    dataTestId?: string | undefined;
    ouiaId?: string;
    ariaLabel: string | undefined;
    value: string;
    placeholder?: string;
    stepValidation: StepValidation;
    fieldName: string;
    inputType?: 'textInput' | 'textArea';
  };

export const PasswordInput = ({
  onChange,
  onBlur,
  placeholder,
  stepValidation,
  value,
  fieldName,
}: passwordPropTypes) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated =
    value === ''
      ? 'default'
      : stepValidation.errors[fieldName] === 'default'
      ? 'default'
      : stepValidation.errors[fieldName]
      ? 'error'
      : 'success';

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            value={value}
            validated={validated}
            placeholder={placeholder || ''}
            type={isPasswordVisible ? 'text' : 'password'}
            onChange={onChange!}
            onBlur={onBlur!}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
          </Button>
        </InputGroupItem>
      </InputGroup>
    </>
  );
};

interface PasswordValidationMessageProps {
  stepValidation: StepValidation;
  errorMessage?: string;
  fieldName: string;
  isPristine: boolean;
}

export const ValidationMessage = ({
  isPristine,
  stepValidation,
  errorMessage,
  fieldName,
}: PasswordValidationMessageProps) => {
  const showErrorMessage = !isPristine && stepValidation.errors[fieldName];
  if (!errorMessage) {
    return null;
  }

  return (
    <>
      {showErrorMessage && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {errorMessage}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export const InputAndTextArea = ({
  dataTestId,
  ouiaId,
  value,
  isDisabled,
  placeholder,
  onChange,
  stepValidation,
  fieldName,
  inputType,
  onBlur,
  ariaLabel,
}: ValidatedInputPropTypes) => {
  // Allow step validation to be set on pristine state, when needed
  const validated =
    value === ''
      ? 'default'
      : stepValidation.errors[fieldName] === 'default'
      ? 'default'
      : stepValidation.errors[fieldName]
      ? 'error'
      : 'success';

  return (
    <>
      {inputType === 'textArea' ? (
        <TextArea
          value={value}
          data-testid={dataTestId}
          onChange={onChange!}
          validated={validated}
          aria-label={ariaLabel || ''}
          onBlur={onBlur!}
          placeholder={placeholder || ''}
          isDisabled={isDisabled || false}
        />
      ) : (
        <TextInput
          value={value}
          data-testid={dataTestId}
          ouiaId={ouiaId || ''}
          onChange={onChange!}
          validated={validated}
          onBlur={onBlur!}
          placeholder={placeholder || ''}
          isDisabled={isDisabled || false}
        />
      )}
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
}: HookValidatedInputPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);
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
    setIsPristine(false);
  };

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
