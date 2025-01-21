import React from 'react';

import { Alert, Text, Form, Title } from '@patternfly/react-core';

import PackageRecommendations from './PackageRecommendations';
import Packages from './Packages';

import { RHEL_8, RHEL_9 } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import { useFlag } from '../../../../Utilities/useGetEnvironment';

const PackagesStep = () => {
  const packageRecommendationsFlag = useFlag('image-builder.pkgrecs.enabled');
  const distribution = useAppSelector(selectDistribution);
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Additional packages
      </Title>
      <Text>Blueprints created with Images include all required packages.</Text>
      <Alert variant="info" isInline title="Search for package groups">
        Search for package groups by starting your search with the &apos;@&apos;
        character. A single &apos;@&apos; as search input lists all available
        package groups.
      </Alert>
      <Packages />
      {packageRecommendationsFlag &&
        (distribution === RHEL_8 || distribution === RHEL_9) && (
          <PackageRecommendations />
        )}
    </Form>
  );
};

export default PackagesStep;
