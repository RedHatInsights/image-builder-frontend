import {
  useGetArchitecturesQuery as useCockpitGetArchitecturesQuery,
  useGetBlueprintQuery as useCockpitGetBlueprintQuery,
  useGetBlueprintsQuery as useCockpitGetBlueprintsQuery,
  useLazyGetBlueprintsQuery as useCockpitLazyGetBlueprintsQuery,
  useDeleteBlueprintMutation as useCockpitDeleteMutation,
  useGetOscapProfilesQuery as useCockpitGetOscapProfilesQuery,
} from './cockpitApi';
import { cockpitApi } from './enhancedCockpitApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import {
  useGetArchitecturesQuery as useImageBuilderGetArchitecturesQuery,
  useGetBlueprintQuery as useImageBuilderGetBlueprintQuery,
  useGetBlueprintsQuery as useImageBuilderGetBlueprintsQuery,
  useLazyGetBlueprintsQuery as useImageBuilderLazyGetBlueprintsQuery,
  useDeleteBlueprintMutation as useImageBuilderDeleteMutation,
  useGetOscapProfilesQuery as useImageBuilderGetOscapProfilesQuery,
} from './imageBuilderApi';

export const useGetArchitecturesQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetArchitecturesQuery
  : useImageBuilderGetArchitecturesQuery;

export const useGetBlueprintQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintQuery
  : useImageBuilderGetBlueprintQuery;

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintsQuery
  : useImageBuilderGetBlueprintsQuery;

export const useLazyGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? useCockpitLazyGetBlueprintsQuery
  : useImageBuilderLazyGetBlueprintsQuery;

export const useDeleteBlueprintMutation = process.env.IS_ON_PREMISE
  ? useCockpitDeleteMutation
  : useImageBuilderDeleteMutation;

export const useGetOscapProfilesQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetOscapProfilesQuery
  : useImageBuilderGetOscapProfilesQuery;

export const useBackendPrefetch = process.env.IS_ON_PREMISE
  ? cockpitApi.usePrefetch
  : imageBuilderApi.usePrefetch;

export const backendApi = process.env.IS_ON_PREMISE
  ? cockpitApi
  : imageBuilderApi;
