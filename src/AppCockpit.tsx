import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React from 'react';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { Router } from './Router';
import { onPremStore as store } from './store';

const Application = () => {
  return (
    <React.Fragment>
      <NotificationsPortal />
      <HashRouter>
        <Router />
      </HashRouter>
    </React.Fragment>
  );
};
const ImageBuilder = () => (
  <Provider store={store}>
    <Application />
  </Provider>
);

const main = async () => {
  const root = document.getElementById('main');
  if (root) {
    const reactRoot = createRoot(root);
    reactRoot.render(<ImageBuilder />);
  }
};

main();
