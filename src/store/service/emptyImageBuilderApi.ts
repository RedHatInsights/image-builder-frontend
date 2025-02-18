import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { IMAGE_BUILDER_API } from '../../constants';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptyImageBuilderApi = createApi({
  reducerPath: 'imageBuilderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: IMAGE_BUILDER_API.startsWith('http')
      ? IMAGE_BUILDER_API
      : window.location.origin + IMAGE_BUILDER_API,
    prepareHeaders: (headers) => {
      // help the backend distinguish between requests from the UI and the API
      headers.set('X-ImageBuilder-ui', 'true');
      if (process.env.FAKE_AUTH) {
        const fakeFullEntitlement = `{
    "entitlements": {
		"insights": {
			"is_entitled": true
		},
		"rhel": {
			"is_entitled": true
		},
		"smart_management": {
			"is_entitled": true
		},
		"openshift": {
			"is_entitled": true
		},
		"hybrid": {
			"is_entitled": true
		},
		"migrations": {
			"is_entitled": true
		},
		"ansible": {
			"is_entitled": true
		}
    },
    "identity": {
		"type": "User",
		"user": {
            "username": "user",
            "email": "user@user.user",
            "first_name": "user",
            "last_name": "user",
            "is_active": true,
            "is_org_admin": true,
            "is_internal": true,
            "locale": "en-US"
		},
		"internal": {"org_id": "000000"},
		"account_number": "000000"
    }
}`;
        headers.set(
          'X-Rh-Identity',
          Buffer.from(fakeFullEntitlement).toString('base64')
        );
      }
    },
    paramsSerializer: (params) => {
      /*
       * Image builder backend requires the arrays in get requests to be
       * exploded, see the default behavior for swagger in the documentation:
       * https://swagger.io/docs/specification/serialization/
       *
       * To accommodate to that, make sure that when the request is sent with
       * an array we do explode properly unlike the default behavior of
       * URLSearchParams.
       */
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) {
          // avoid sending undefined parameters
          continue;
        }
        if (Array.isArray(value)) {
          for (const v of value) {
            searchParams.append(key, v);
          }
        } else {
          searchParams.append(key, value);
        }
      }

      return searchParams.toString();
    },
  }),
  endpoints: () => ({}),
});
