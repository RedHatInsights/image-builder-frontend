import { createApi } from '@reduxjs/toolkit/query/react';

import { cockpitBaseQuery } from './cockpitBasequery';

export const emptyCockpitApi = createApi({
  reducerPath: 'cockpitApi',
  baseQuery: cockpitBaseQuery({
    baseUrl: '/api/image-builder-composer/v2',
  }),
  endpoints: () => ({}),
});
