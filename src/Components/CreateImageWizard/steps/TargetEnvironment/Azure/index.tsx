import React from 'react';

import {
  Radio,
  Text,
  Form,
  Title,
  FormGroup,
  TextInput,
  Gallery,
  GalleryItem,
  Button,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { AzureAuthButton } from './AzureAuthButton';
import { AzureHyperVSelect } from './AzureHyperVSelect';
import { AzureResourceGroups } from './AzureResourceGroups';
import { AzureSourcesSelect } from './AzureSourcesSelect';

import { AZURE_AUTH_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAzureResourceGroup,
  changeAzureShareMethod,
  changeAzureSource,
  changeAzureSubscriptionId,
  changeAzureTenantId,
  selectAzureResourceGroup,
  selectAzureShareMethod,
  selectAzureSubscriptionId,
  selectAzureTenantId,
} from '../../../../../store/wizardSlice';
import { ValidatedInput } from '../../../ValidatedInput';
import {
  isAzureResourceGroupValid,
  isAzureSubscriptionIdValid,
  isAzureTenantGUIDValid,
} from '../../../validators';

export type AzureShareMethod = 'manual' | 'sources';

const SourcesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={'settings/sources'}
    >
      Create and manage sources here
    </Button>
  );
};

const Azure = () => {
  const dispatch = useAppDispatch();
  const shareMethod = useAppSelector(selectAzureShareMethod);
  const tenantId = useAppSelector(selectAzureTenantId);
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);
  const resourceGroup = useAppSelector(selectAzureResourceGroup);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Target environment - Microsoft Azure
      </Title>
      <Text>
        Upon build, Image Builder sends the image to the selected authorized
        Azure account. The image will be uploaded to the resource group in the
        subscription you specify.
      </Text>
      <Text>
        To authorize Image Builder to push images to Microsoft Azure, the
        account owner must configure Image Builder as an authorized application
        for a specific tenant ID and give it the role of &quot;Contributor&quot;
        for the resource group you want to upload to. This applies even when
        defining target by Source selection.
        <br />
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          isInline
          href={AZURE_AUTH_URL}
        >
          Learn more about OAuth 2.0
        </Button>
      </Text>
      <AzureHyperVSelect />
      <FormGroup label="Share method:">
        <Radio
          id="radio-with-description"
          label="Use an account configured from Sources."
          name="radio-7"
          description="Use a configured source to launch environments directly from the console."
          isChecked={shareMethod === 'sources'}
          onChange={() => {
            dispatch(changeAzureSource(''));
            dispatch(changeAzureTenantId(''));
            dispatch(changeAzureSubscriptionId(''));
            dispatch(changeAzureShareMethod('sources'));
            dispatch(changeAzureResourceGroup(''));
          }}
          autoFocus
        />
        <Radio
          id="radio"
          label="Manually enter the account information."
          name="radio-8"
          isChecked={shareMethod === 'manual'}
          onChange={() => {
            dispatch(changeAzureSource(''));
            dispatch(changeAzureTenantId(''));
            dispatch(changeAzureSubscriptionId(''));
            dispatch(changeAzureShareMethod('manual'));
            dispatch(changeAzureResourceGroup(''));
          }}
        />
      </FormGroup>
      {shareMethod === 'sources' && (
        <>
          <AzureSourcesSelect />
          <SourcesButton />
          <Gallery hasGutter>
            <GalleryItem>
              <FormGroup label="Azure tenant GUID" isRequired>
                <TextInput
                  aria-label="Azure tenant GUID"
                  readOnlyVariant="default"
                  isRequired
                  id="tenant id"
                  value={tenantId}
                />
              </FormGroup>
            </GalleryItem>
            <GalleryItem>
              <FormGroup label="Subscription ID" isRequired>
                <TextInput
                  aria-label="Subscription ID"
                  label="Subscription ID"
                  readOnlyVariant="default"
                  isRequired
                  id="subscription id"
                  value={subscriptionId}
                />
              </FormGroup>
            </GalleryItem>
          </Gallery>
          <AzureAuthButton />
          <AzureResourceGroups />
        </>
      )}
      {shareMethod === 'manual' && (
        <>
          <FormGroup label="Azure tenant GUID" isRequired>
            <ValidatedInput
              ariaLabel="Azure tenant GUID"
              value={tenantId || ''}
              validator={isAzureTenantGUIDValid}
              onChange={(_event, value) => dispatch(changeAzureTenantId(value))}
              helperText="Please enter a valid tenant ID"
            />
          </FormGroup>
          <AzureAuthButton />
          <FormGroup label="Subscription ID" isRequired>
            <ValidatedInput
              ariaLabel="subscription id"
              value={subscriptionId}
              validator={isAzureSubscriptionIdValid}
              onChange={(_event, value) =>
                dispatch(changeAzureSubscriptionId(value))
              }
              helperText="Please enter a valid subscription ID"
            />
          </FormGroup>
          <FormGroup label="Resource group" isRequired>
            <ValidatedInput
              ariaLabel="resource group"
              value={resourceGroup}
              validator={isAzureResourceGroupValid}
              onChange={(_event, value) =>
                dispatch(changeAzureResourceGroup(value))
              }
              helperText="Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period"
            />
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Azure;
