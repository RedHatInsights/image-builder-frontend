import React from 'react';

import { Provider } from 'react-redux';

import App from './App';
import { store } from './store';

if (process.env.NODE_ENV === 'development' && process.env.MSW === true) {
  // process.env.MSW is set in the webpack config using DefinePlugin
  const { worker } = require('./test/mocks/browser');
  worker.start({
    serviceWorker: {
      url: '/beta/apps/image-builder/mockServiceWorker.js',
      options: {
        /* 
        Service workers can only intercept requests made from within their scope.
        mockServiceWorker.js is served from /beta/apps/image-builder/, which becomes
        the worker's default scope. Set scope to '/' so that all requests are in scope 
        and can be intercepted. Note that the Service-Worker-Allowed header must
        be set to '/' for this to work, and is done in the webpack config. 
        */
        scope: '../../../',
      },
    },
  });
}

const ImageBuilder = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default ImageBuilder;
