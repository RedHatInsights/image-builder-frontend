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
  Distributions,
} from './imageBuilderApi';

import { mapOnPremToHosted } from '../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { BLUEPRINTS_DIR } from '../constants';

const getBlueprintsPath = async () => {
  const user = await cockpit.user();

  // we will use the user's `.local` directory
  // to save blueprints used for on-prem
  return `${user.home}/${BLUEPRINTS_DIR}`;
};

// TODO: this is by no means complete (or completely correct).
// This is just an attempt to get some results. We will need to
// be able to translate these back again in the future when we
// are making image-requests. This may need to be extracted out
// of this file into a general helper
const translateImageTypes = (imageType: string) => {
  switch (imageType) {
    case 'ami':
      return 'aws';
    case 'azure-rhui':
      return 'azure';
    case 'azure-sap-rhui':
      return 'azure';
    case 'ec2':
      return 'aws';
    case 'gce':
      return 'gcp';
    case 'qcow2':
      return 'guest-image';
    default:
      return imageType;
  }
};

type ArchitecturesRawResponse = Partial<
  Record<
    keyof Distributions,
    Record<string, { name: string; baseurls: string[]; gpgkeys: string[] }>
  >
>;

export const cockpitApi = emptyCockpitApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        query: () => ({
          url: '/distributions',
          body: '',
          method: 'GET',
        }),
        transformResponse: (
          response: ArchitecturesRawResponse,
          _,
          { distribution }: { distribution: string }
        ) => {
          const distroArches = response[distribution as keyof Distributions];
          if (!distroArches) {
            return [];
          }

          return Object.keys(distroArches)
            .map((arch) => {
              const imageTypes = Object.keys(distroArches[arch]).map(
                translateImageTypes
              );
              return {
                arch,
                image_types: imageTypes,
                // TODO: we need to get a Set of repositories here
                // the endpoint returns repositories for each image
                // type
                repositories: [],
              };
            })
            .filter((result) => {
              return result.arch === 'aarch64' || result.arch === 'x86_64';
            });
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
