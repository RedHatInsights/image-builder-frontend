import React from 'react';

import { Radio, Text, Form, Title, FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeGcpAccountType,
  changeGcpEmail,
  changeGcpShareMethod,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
} from '../../../../../store/wizardSlice';
import { ValidatedInput } from '../../../ValidatedInput';
import { isGcpEmailValid } from '../../../validators';

export type GcpShareMethod = 'withGoogle' | 'withInsights';
export type GcpAccountType =
  | 'user'
  | 'serviceAccount'
  | 'group'
  | 'domain'
  | undefined;

const Gcp = () => {
  const dispatch = useAppDispatch();

  const accountType = useAppSelector(selectGcpAccountType);
  const shareMethod = useAppSelector(selectGcpShareMethod);
  const gcpEmail = useAppSelector(selectGcpEmail);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Target environment - Google Cloud Platform
      </Title>
      <Text>
        Select how to share your image. The image you create can be used to
        launch instances on GCP, regardless of which method you select.
      </Text>
      <FormGroup label="Select image sharing" isRequired>
        <Radio
          id="share-with-google"
          data-testid="share-with-google"
          label="Share image with a Google account"
          name="radio-1"
          description={
            <Text>
              Your image will be uploaded to GCP and shared with the account you
              provide below.
              <b>The image expires in 14 days.</b> To keep permanent access to
              your image, copy it to your GCP project.
            </Text>
          }
          isChecked={shareMethod === 'withGoogle'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withGoogle'));
          }}
          autoFocus
        />
        <Radio
          id="share-with-insights"
          data-testid="share-with-insights"
          label="Share image with Red Hat Insights only"
          name="radio-2"
          description={
            <Text>
              Your image will be uploaded to GCP and shared with Red Hat
              Insights.
              <b> The image expires in 14 days.</b> You cannot access or
              recreate this image in your GCP project.
            </Text>
          }
          isChecked={shareMethod === 'withInsights'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withInsights'));
          }}
        />
      </FormGroup>
      {shareMethod === 'withGoogle' && (
        <>
          <FormGroup label="Account type" isRequired>
            <Radio
              id="google-account"
              data-testid="google-account"
              label="Google account"
              name="radio-3"
              isChecked={accountType === 'user'}
              onChange={() => {
                dispatch(changeGcpAccountType('user'));
              }}
            />
            <Radio
              id="service-account"
              data-testid="service-account"
              label="Service account"
              name="radio-4"
              isChecked={accountType === 'serviceAccount'}
              onChange={() => {
                dispatch(changeGcpAccountType('serviceAccount'));
              }}
            />
            <Radio
              id="google-group"
              data-testid="google-group"
              label="Google group"
              name="radio-5"
              isChecked={accountType === 'group'}
              onChange={() => {
                dispatch(changeGcpAccountType('group'));
              }}
            />
            <Radio
              id="google-domain"
              data-testid="google-domain"
              label="Google Workspace domain or Cloud Identity domain"
              name="radio-6"
              isChecked={accountType === 'domain'}
              onChange={() => {
                dispatch(changeGcpAccountType('domain'));
              }}
            />
          </FormGroup>
          <FormGroup
            label={
              accountType === 'domain'
                ? 'Domain'
                : 'Principal (e.g. e-mail address)'
            }
            isRequired
          >
            <ValidatedInput
              ariaLabel="google principal"
              dataTestId="principal"
              value={gcpEmail || ''}
              validator={isGcpEmailValid}
              onChange={(_event, value) => dispatch(changeGcpEmail(value))}
              helperText="Please enter a valid e-mail address."
            />
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Gcp;
