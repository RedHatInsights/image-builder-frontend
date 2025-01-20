import { BaseQueryFn } from '@reduxjs/toolkit/query';
import cockpit from 'cockpit';

import type { Method, Params, Headers } from './cockpitTypes.ts';

const cockpitApi = cockpit.http('/run/cloudapi/api.socket', {
  superuser: 'try',
});

export const cockpitBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string;
      method?: Method;
      body?: unknown;
      params?: Params;
      headers?: Headers;
    },
    unknown,
    unknown
  > =>
  async ({ url, method, body, params, headers }) => {
    try {
      const result = await cockpitApi.request({
        path: baseUrl + url,
        body: body ?? '',
        method: method ?? 'GET',
        params,
        headers,
      });
      return { data: JSON.parse(result) };
    } catch (error) {
      return {
        error: {
          status: error.status,
          message: error.message,
        },
      };
    }
  };
