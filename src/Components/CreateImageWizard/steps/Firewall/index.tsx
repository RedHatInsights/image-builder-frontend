import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import PortsInput from './components/PortsInput';
import Services from './components/Services';

const FirewallStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Firewall
      </Title>
      <Text>Customize firewall settings for your image.</Text>
      <PortsInput />
      <Services />
    </Form>
  );
};

export default FirewallStep;
