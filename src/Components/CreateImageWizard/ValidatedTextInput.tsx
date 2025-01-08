import React, { useState } from 'react';

import {
  HelperText,
  HelperTextItem,
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

interface HookValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  value: string;
  placeholder?: string;
  stepValidation: StepValidation;
  fieldName: string;
  warning?: string;
}

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
}: HookValidatedTextInputPropTypes) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <HookValidatedInput
            isRequired
            type={isPasswordVisible ? 'text' : 'password'}
            ouiaId={ouiaId || ''}
            data-testid={dataTestId}
            aria-label={ariaLabel || ''}
            value={value}
            onChange={onChange!}
            stepValidation={stepValidation}
            ariaLabel={ariaLabel || ''}
            fieldName={fieldName}
            placeholder={placeholder || ''}
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
      {warning !== undefined && (
        <HelperText>
          <HelperTextItem variant="warning" hasIcon>
            {warning}
          </HelperTextItem>
        </HelperText>
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
  warning = undefined,
}: HookValidatedTextInputPropTypes) => {
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

export const ValidatedTextInput = ({
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
