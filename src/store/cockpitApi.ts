import path from 'path';

// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import toml from 'toml';

import { emptyCockpitApi } from './emptyCockpitApi';
import {
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  DeleteBlueprintApiResponse,
  DeleteBlueprintApiArg,
  BlueprintItem,
  GetOscapProfilesApiArg,
  GetOscapProfilesApiResponse,
  GetBlueprintApiResponse,
  GetBlueprintApiArg,
} from './imageBuilderApi';

import { mapOnPremToHosted } from '../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { BLUEPRINTS_DIR } from '../constants';

const getBlueprintsPath = async () => {
  const user = await cockpit.user();

  // we will use the user's `.local` directory
  // to save blueprints used for on-prem
  return `${user.home}/${BLUEPRINTS_DIR}`;
};

export const cockpitApi = emptyCockpitApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        queryFn: () => {
          // TODO: this is hardcoded for now, but we may need to query
          // the cloudapi endpoint on the composer socket to get the
          // available information
          return {
            data: [
              {
                arch: 'aarch64',
                image_types: ['aws', 'guest-image', 'image-installer'],
                repositories: [
                  {
                    baseurl:
                      'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/baseos/os',
                    rhsm: true,
                  },
                  {
                    baseurl:
                      'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/appstream/os',
                    rhsm: true,
                  },
                ],
              },
              {
                arch: 'x86_64',
                image_types: [
                  'aws',
                  'gcp',
                  'azure',
                  'rhel-edge-commit',
                  'rhel-edge-installer',
                  'edge-commit',
                  'edge-installer',
                  'guest-image',
                  'image-installer',
                  'vsphere',
                ],
                repositories: [
                  {
                    baseurl:
                      'https://cdn.redhat.com/content/dist/rhel9/9.0/x86_64/baseos/os',
                    rhsm: true,
                  },
                  {
                    baseurl:
                      'https://cdn.redhat.com/content/dist/rhel9/9.0/x86_64/appstream/os',
                    rhsm: true,
                  },
                ],
              },
            ],
          };
        },
      }),
      getBlueprint: builder.query<GetBlueprintApiResponse, GetBlueprintApiArg>({
        queryFn: async ({ id, version }) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const file = cockpit.file(path.join(blueprintsDir, id));

            const contents = await file.read();
            const parsed = toml.parse(contents);
            file.close();

            const blueprint = mapOnPremToHosted(parsed);

            return {
              data: {
                ...blueprint,
                id,
                version,
                last_modified_at: Date.now().toString(),
                // TODO: get image requests. Will probably need
                // to query cloudapi on composer socket.
                image_requests: [],
              },
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      getBlueprints: builder.query<
        GetBlueprintsApiResponse,
        GetBlueprintsApiArg
      >({
        queryFn: async (queryArgs) => {
          try {
            const { name, search, offset, limit } = queryArgs;

            const blueprintsDir = await getBlueprintsPath();

            // we probably don't need any more information other
            // than the entries from the directory
            const info = await fsinfo(blueprintsDir, ['entries'], {
              superuser: 'try',
            });

            const entries = Object.entries(info?.entries || {});
            let blueprints: BlueprintItem[] = await Promise.all(
              entries.map(async ([filename]) => {
                const file = cockpit.file(path.join(blueprintsDir, filename));

                const contents = await file.read();
                const parsed = toml.parse(contents);
                file.close();

                const blueprint = mapOnPremToHosted(parsed);
                const version = (parsed.version as number) ?? 1;
                return {
                  ...blueprint,
                  id: filename as string,
                  version: version,
                  last_modified_at: Date.now().toString(),
                };
              })
            );

            blueprints = blueprints.filter((blueprint) => {
              if (name) {
                return blueprint.name === name;
              }

              if (search) {
                // TODO: maybe add other params to the search filter
                return blueprint.name.includes(search);
              }

              return true;
            });

            let paginatedBlueprints = blueprints;
            if (offset !== undefined && limit !== undefined) {
              paginatedBlueprints = blueprints.slice(offset, offset + limit);
            }

            let first = '';
            let last = '';

            if (blueprints.length > 0) {
              first = blueprints[0].id;
              last = blueprints[blueprints.length - 1].id;
            }

            return {
              data: {
                meta: { count: blueprints.length },
                links: {
                  // These are kind of meaningless for the on-prem
                  // version
                  first: first,
                  last: last,
                },
                data: paginatedBlueprints,
              },
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      deleteBlueprint: builder.mutation<
        DeleteBlueprintApiResponse,
        DeleteBlueprintApiArg
      >({
        queryFn: async ({ id: filename }) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const filepath = path.join(blueprintsDir, filename);

            await cockpit.spawn(['rm', filepath], {
              superuser: 'try',
            });

            return {
              data: {},
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      getOscapProfiles: builder.query<
        GetOscapProfilesApiResponse,
        GetOscapProfilesApiArg
      >({
        queryFn: async () => {
          // TODO: make a call to get the openscap profiles
          // For now, just return an empty list so we can
          // step through the wizard.
          return {
            data: [],
          };
        },
      }),
    };
  },
});

export const {
  useGetArchitecturesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useDeleteBlueprintMutation,
  useGetOscapProfilesQuery,
} = cockpitApi;
