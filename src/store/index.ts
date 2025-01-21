import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import { blueprintsSlice } from './BlueprintSlice';
import { cockpitApi } from './cockpitApi';
import { complianceApi } from './complianceApi';
import { contentSourcesApi } from './contentSourcesApi';
import { edgeApi } from './edgeApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import { listenerMiddleware, startAppListening } from './listenerMiddleware';
import { provisioningApi } from './provisioningApi';
import { rhsmApi } from './rhsmApi';
import wizardSlice, {
  changeArchitecture,
  changeDistribution,
  changeImageTypes,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from './wizardSlice';

export const serviceReducer = combineReducers({
  [contentSourcesApi.reducerPath]: contentSourcesApi.reducer,
  [edgeApi.reducerPath]: edgeApi.reducer,
  [imageBuilderApi.reducerPath]: imageBuilderApi.reducer,
  [rhsmApi.reducerPath]: rhsmApi.reducer,
  [provisioningApi.reducerPath]: provisioningApi.reducer,
  [complianceApi.reducerPath]: complianceApi.reducer,
  notifications: notificationsReducer,
  wizard: wizardSlice,
  blueprints: blueprintsSlice.reducer,
});

export const onPremReducer = combineReducers({
  [contentSourcesApi.reducerPath]: contentSourcesApi.reducer,
  [rhsmApi.reducerPath]: rhsmApi.reducer,
  [provisioningApi.reducerPath]: provisioningApi.reducer,
  [complianceApi.reducerPath]: complianceApi.reducer,
  [cockpitApi.reducerPath]: cockpitApi.reducer,
  // TODO: add other endpoints so we can remove this.
  // It's still needed to get things to work.
  [imageBuilderApi.reducerPath]: imageBuilderApi.reducer,
  notifications: notificationsReducer,
  wizard: wizardSlice,
  blueprints: blueprintsSlice.reducer,
});

startAppListening({
  actionCreator: changeArchitecture,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();

    const distribution = selectDistribution(state);
    const imageTypes = selectImageTypes(state);
    const architecture = action.payload;

    // The response from the RTKQ getArchitectures hook
    const architecturesResponse = process.env.IS_ON_PREMISE
      ? cockpitApi.endpoints.getArchitectures.select({
          distribution: distribution,
        })(state as onPremState)
      : imageBuilderApi.endpoints.getArchitectures.select({
          distribution: distribution,
        })(state as serviceState);

    const allowedImageTypes = architecturesResponse?.data?.find(
      (elem) => elem.arch === architecture
    )?.image_types;

    const filteredImageTypes = imageTypes.filter((imageType: string) =>
      allowedImageTypes?.includes(imageType)
    );

    listenerApi.dispatch(changeImageTypes(filteredImageTypes));
  },
});

startAppListening({
  actionCreator: changeDistribution,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();

    const distribution = action.payload;
    const imageTypes = selectImageTypes(state);
    const architecture = selectArchitecture(state);

    // The response from the RTKQ getArchitectures hook
    const architecturesResponse = process.env.IS_ON_PREMISE
      ? cockpitApi.endpoints.getArchitectures.select({
          distribution: distribution,
        })(state as onPremState)
      : imageBuilderApi.endpoints.getArchitectures.select({
          distribution: distribution,
        })(state as serviceState);

    const allowedImageTypes = architecturesResponse?.data?.find(
      (elem) => elem.arch === architecture
    )?.image_types;

    const filteredImageTypes = imageTypes.filter((imageType) =>
      allowedImageTypes?.includes(imageType)
    );

    listenerApi.dispatch(changeImageTypes(filteredImageTypes));
  },
});

// Listener middleware must be prepended according to RTK docs:
// https://redux-toolkit.js.org/api/createListenerMiddleware#basic-usage
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const serviceMiddleware = (getDefaultMiddleware: Function) =>
  getDefaultMiddleware()
    .prepend(listenerMiddleware.middleware)
    .concat(
      promiseMiddleware,
      contentSourcesApi.middleware,
      imageBuilderApi.middleware,
      rhsmApi.middleware,
      provisioningApi.middleware,
      complianceApi.middleware
    );

// Listener middleware must be prepended according to RTK docs:
// https://redux-toolkit.js.org/api/createListenerMiddleware#basic-usage
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const onPremMiddleware = (getDefaultMiddleware: Function) =>
  getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(
    promiseMiddleware,
    // TODO: add other endpoints so we can remove this.
    // It's still needed to get things to work.
    contentSourcesApi.middleware,
    rhsmApi.middleware,
    provisioningApi.middleware,
    complianceApi.middleware,
    imageBuilderApi.middleware,
    cockpitApi.middleware
  );

export const onPremStore = configureStore({
  reducer: onPremReducer,
  middleware: onPremMiddleware,
});

export const serviceStore = configureStore({
  reducer: serviceReducer,
  middleware: serviceMiddleware,
});

// we don't need to export these for now, they are just helpers
// for some of the functions in this file
type onPremState = ReturnType<typeof onPremStore.getState>;
type serviceState = ReturnType<typeof serviceStore.getState>;

export const store = process.env.IS_ON_PREMISE ? onPremStore : serviceStore;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = onPremState | serviceState;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch =
  | typeof onPremStore.dispatch
  | typeof serviceStore.dispatch;
