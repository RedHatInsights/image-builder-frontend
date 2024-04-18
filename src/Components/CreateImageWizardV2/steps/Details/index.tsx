import React from 'react';

import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Text,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeBlueprintDescription,
  changeBlueprintName,
  selectBlueprintDescription,
  selectBlueprintName,
} from '../../../../store/wizardSlice';
import { StateValidatedInput } from '../../ValidatedTextInput';
import {
  isBlueprintDescriptionValid,
  isBlueprintNameValid,
} from '../../validators';

const DetailsStep = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ) => {
    dispatch(changeBlueprintName(name));
  };

  const handleDescriptionChange = (
    _event: React.FormEvent<HTMLInputElement>,
    description: string
  ) => {
    dispatch(changeBlueprintDescription(description));
  };

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Details
      </Title>
      <Text>
        Enter a name to identify your blueprint. If no name is entered, the
        images created from this blueprint will use the name of the parent
        blueprint.
      </Text>
      <FormGroup isRequired label="Blueprint name" fieldId="blueprint-name">
        <StateValidatedInput
          ariaLabel="blueprint name"
          dataTestId="blueprint"
          stepId="details"
          inputId="blueprint-name"
          value={blueprintName}
          validator={isBlueprintNameValid}
          onChange={handleNameChange}
          helperText="Please enter a valid name"
          placeholder="Add blueprint name"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The name can be 2-100 characters with at least two word characters
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup
        label="Blueprint description"
        fieldId="blueprint-description-name"
      >
        <StateValidatedInput
          ariaLabel="blueprint description"
          dataTestId="blueprint description"
          stepId="details"
          inputId="blueprint-description"
          value={blueprintDescription || ''}
          validator={isBlueprintDescriptionValid}
          onChange={handleDescriptionChange}
          helperText="Please enter a valid description"
          placeholder="Add description"
        />
      </FormGroup>
    </Form>
  );
};

export default DetailsStep;
