import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import type { ApiRepositoryResponseRead } from './contentSourcesApi';
import type {
  CustomRepository,
  Distributions,
  ImageRequest,
  ImageTypes,
  Locale,
  Repository,
  Timezone,
  User,
} from './imageBuilderApi';
import type { ActivationKeys } from './rhsmApi';

import type { FileSystemConfigurationType } from '../Components/CreateImageWizard/steps/FileSystem';
import type {
  Partition,
  Units,
} from '../Components/CreateImageWizard/steps/FileSystem/FileSystemTable';
import type {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../Components/CreateImageWizard/steps/Packages/Packages';
import type { AwsShareMethod } from '../Components/CreateImageWizard/steps/TargetEnvironment/Aws';
import type { AzureShareMethod } from '../Components/CreateImageWizard/steps/TargetEnvironment/Azure';
import type {
  GcpAccountType,
  GcpShareMethod,
} from '../Components/CreateImageWizard/steps/TargetEnvironment/Gcp';
import type { V1ListSourceResponseItem } from '../Components/CreateImageWizard/types';
import { RHEL_9, X86_64 } from '../constants';

import type { RootState } from '.';

type WizardModeOptions = 'create' | 'edit';

export type RegistrationType =
  | 'register-later'
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc';

export type ComplianceType = 'openscap' | 'compliance';

export type UserWithAdditionalInfo = {
  [K in keyof User]-?: NonNullable<User[K]>;
} & {
  isAdministrator: boolean;
};

type UserPayload = {
  index: number;
  name: string;
};

type UserPasswordPayload = {
  index: number;
  password: string;
};

type UserSshKeyPayload = {
  index: number;
  sshKey: string;
};

type UserAdministratorPayload = {
  index: number;
  isAdministrator: boolean;
};

export type wizardState = {
  env: {
    serverUrl: string;
    baseUrl: string;
  };
  blueprintId?: string;
  wizardMode: WizardModeOptions;
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: ImageTypes[];
  aws: {
    accountId: string;
    shareMethod: AwsShareMethod;
    source: V1ListSourceResponseItem | undefined;
    sourceId?: string | undefined;
  };
  azure: {
    shareMethod: AzureShareMethod;
    tenantId: string;
    subscriptionId: string;
    source: string;
    resourceGroup: string;
    hyperVGeneration: 'V1' | 'V2';
  };
  gcp: {
    shareMethod: GcpShareMethod;
    accountType: GcpAccountType;
    email: string;
  };
  registration: {
    registrationType: RegistrationType;
    activationKey: ActivationKeys['name'];
  };
  compliance: {
    complianceType: ComplianceType;
    policyID: string | undefined;
    profileID: string | undefined;
    policyTitle: string | undefined;
  };
  fileSystem: {
    mode: FileSystemConfigurationType;
    partitions: Partition[];
  };
  snapshotting: {
    useLatest: boolean;
    snapshotDate: string;
  };
  users: UserWithAdditionalInfo[];
  firstBoot: {
    script: string;
  };
  repositories: {
    customRepositories: CustomRepository[];
    payloadRepositories: Repository[];
    recommendedRepositories: ApiRepositoryResponseRead[];
  };
  packages: IBPackageWithRepositoryInfo[];
  groups: GroupWithRepositoryInfo[];
  services: {
    enabled: string[];
    masked: string[];
    disabled: string[];
  };
  kernel: {
    name: string;
    append: string[];
  };
  locale: Locale;
  details: {
    blueprintName: string;
    blueprintDescription: string;
  };
  timezone: Timezone;
  hostname: string;
  firewall: {
    ports: string[];
    services: {
      enabled: string[];
      disabled: string[];
    };
  };
  metadata?: {
    parent_id: string | null;
    exported_at: string;
    is_on_prem: boolean;
  };
};

export const initialState: wizardState = {
  env: {
    serverUrl: '',
    baseUrl: '',
  },
  wizardMode: 'create',
  architecture: X86_64,
  distribution: RHEL_9,
  imageTypes: [],
  aws: {
    accountId: '',
    shareMethod: 'sources',
    source: undefined,
  },
  azure: {
    shareMethod: 'sources',
    tenantId: '',
    subscriptionId: '',
    source: '',
    resourceGroup: '',
    hyperVGeneration: 'V2',
  },
  gcp: {
    shareMethod: 'withGoogle',
    accountType: 'user',
    email: '',
  },
  registration: {
    registrationType: 'register-later',
    activationKey: undefined,
  },
  compliance: {
    complianceType: 'openscap',
    policyID: undefined,
    profileID: undefined,
    policyTitle: undefined,
  },
  fileSystem: {
    mode: 'automatic',
    partitions: [],
  },
  snapshotting: {
    useLatest: true,
    snapshotDate: '',
  },
  repositories: {
    customRepositories: [],
    payloadRepositories: [],
    recommendedRepositories: [],
  },
  packages: [],
  groups: [],
  services: {
    enabled: [],
    masked: [],
    disabled: [],
  },
  kernel: {
    name: '',
    append: [],
  },
  locale: {
    languages: [],
    keyboard: '',
  },
  details: {
    blueprintName: '',
    blueprintDescription: '',
  },
  timezone: {
    timezone: '',
    ntpservers: [],
  },
  hostname: '',
  firewall: {
    ports: [],
    services: {
      enabled: [],
      disabled: [],
    },
  },
  firstBoot: { script: '' },
  users: [],
};

export const selectServerUrl = (state: RootState) => {
  return state.wizard.env.serverUrl;
};

export const selectWizardMode = (state: RootState) => {
  return state.wizard.wizardMode;
};

export const selectBlueprintId = (state: RootState) => {
  return state.wizard.blueprintId;
};

export const selectBaseUrl = (state: RootState) => {
  return state.wizard.env.baseUrl;
};

export const selectArchitecture = (state: RootState) => {
  return state.wizard.architecture;
};

export const selectDistribution = (state: RootState) => {
  return state.wizard.distribution;
};

export const selectImageTypes = (state: RootState) => {
  return state.wizard.imageTypes;
};

export const selectAwsAccountId = (state: RootState): string => {
  return state.wizard.aws.accountId;
};

export const selectAwsSourceId = (state: RootState): string | undefined => {
  return state.wizard.aws.sourceId;
};

export const selectAwsShareMethod = (state: RootState) => {
  return state.wizard.aws.shareMethod;
};

export const selectAzureTenantId = (state: RootState) => {
  return state.wizard.azure.tenantId;
};

export const selectAzureShareMethod = (state: RootState) => {
  return state.wizard.azure.shareMethod;
};

export const selectAzureSubscriptionId = (state: RootState) => {
  return state.wizard.azure.subscriptionId;
};

export const selectAzureSource = (state: RootState) => {
  return state.wizard.azure.source;
};

export const selectAzureResourceGroup = (state: RootState) => {
  return state.wizard.azure.resourceGroup;
};

export const selectAzureHyperVGeneration = (state: RootState) => {
  return state.wizard.azure.hyperVGeneration;
};

export const selectGcpShareMethod = (state: RootState) => {
  return state.wizard.gcp.shareMethod;
};

export const selectGcpAccountType = (state: RootState) => {
  return state.wizard.gcp.accountType;
};

export const selectGcpEmail = (state: RootState) => {
  return state.wizard.gcp.email;
};

export const selectRegistrationType = (state: RootState) => {
  return state.wizard.registration.registrationType;
};

export const selectActivationKey = (state: RootState) => {
  return state.wizard.registration.activationKey;
};

export const selectComplianceProfileID = (state: RootState) => {
  return state.wizard.compliance.profileID;
};

export const selectCompliancePolicyID = (state: RootState) => {
  return state.wizard.compliance.policyID;
};

export const selectCompliancePolicyTitle = (state: RootState) => {
  return state.wizard.compliance.policyTitle;
};

export const selectComplianceType = (state: RootState) => {
  return state.wizard.compliance.complianceType;
};

export const selectFileSystemConfigurationType = (state: RootState) => {
  return state.wizard.fileSystem.mode;
};

export const selectPartitions = (state: RootState) => {
  return state.wizard.fileSystem.partitions;
};

export const selectUseLatest = (state: RootState) => {
  return state.wizard.snapshotting.useLatest;
};
export const selectSnapshotDate = (state: RootState) => {
  return state.wizard.snapshotting.snapshotDate;
};

export const selectCustomRepositories = (state: RootState) => {
  return state.wizard.repositories.customRepositories;
};

export const selectPayloadRepositories = (state: RootState) => {
  return state.wizard.repositories.payloadRepositories;
};

export const selectRecommendedRepositories = (state: RootState) => {
  return state.wizard.repositories.recommendedRepositories;
};

export const selectPackages = (state: RootState) => {
  return state.wizard.packages;
};

export const selectGroups = (state: RootState) => {
  return state.wizard.groups;
};

export const selectServices = (state: RootState) => {
  return state.wizard.services;
};

export const selectUsers = (state: RootState) => {
  return state.wizard.users;
};

export const selectUserNameByIndex =
  (userIndex: number) => (state: RootState) => {
    return state.wizard.users[userIndex]?.name;
  };

export const selectUserPasswordByIndex =
  (userIndex: number) => (state: RootState) => {
    return state.wizard.users[userIndex]?.password;
  };

export const selectUserSshKeyByIndex =
  (userIndex: number) => (state: RootState) => {
    return state.wizard.users[userIndex]?.ssh_key;
  };

export const selectUserAdministrator =
  (userIndex: number) => (state: RootState) => {
    return state.wizard.users[userIndex]?.isAdministrator;
  };

export const selectKernel = (state: RootState) => {
  return state.wizard.kernel;
};

export const selectLanguages = (state: RootState) => {
  return state.wizard.locale.languages;
};

export const selectKeyboard = (state: RootState) => {
  return state.wizard.locale.keyboard;
};

export const selectBlueprintName = (state: RootState) => {
  return state.wizard.details.blueprintName;
};

export const selectMetadata = (state: RootState) => {
  return state.wizard.metadata;
};

export const selectBlueprintDescription = (state: RootState) => {
  return state.wizard.details.blueprintDescription;
};

export const selectFirstBootScript = (state: RootState) => {
  return state.wizard.firstBoot?.script;
};

export const selectTimezone = (state: RootState) => {
  return state.wizard.timezone.timezone;
};

export const selectNtpServers = (state: RootState) => {
  return state.wizard.timezone.ntpservers;
};

export const selectHostname = (state: RootState) => {
  return state.wizard.hostname;
};

export const selectFirewall = (state: RootState) => {
  return state.wizard.firewall;
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    loadWizardState: (state, action: PayloadAction<wizardState>) =>
      action.payload,
    changeServerUrl: (state, action: PayloadAction<string>) => {
      state.env.serverUrl = action.payload;
    },
    changeBaseUrl: (state, action: PayloadAction<string>) => {
      state.env.baseUrl = action.payload;
    },
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>
    ) => {
      state.architecture = action.payload;
    },
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.distribution = action.payload;
    },
    addImageType: (state, action: PayloadAction<ImageTypes>) => {
      // Remove (if present) before adding to avoid duplicates
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload
      );
      state.imageTypes.push(action.payload);
    },
    removeImageType: (state, action: PayloadAction<ImageTypes>) => {
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload
      );
    },
    changeImageTypes: (state, action: PayloadAction<ImageTypes[]>) => {
      state.imageTypes = action.payload;
    },
    changeAwsAccountId: (state, action: PayloadAction<string>) => {
      state.aws.accountId = action.payload;
    },
    changeAwsShareMethod: (state, action: PayloadAction<AwsShareMethod>) => {
      state.aws.shareMethod = action.payload;
    },
    changeAwsSourceId: (state, action: PayloadAction<string | undefined>) => {
      state.aws.sourceId = action.payload;
    },
    reinitializeAws: (state) => {
      state.aws.accountId = '';
      state.aws.shareMethod = 'sources';
      state.aws.source = undefined;
    },
    changeAzureTenantId: (state, action: PayloadAction<string>) => {
      state.azure.tenantId = action.payload;
    },
    changeAzureShareMethod: (
      state,
      action: PayloadAction<AzureShareMethod>
    ) => {
      state.azure.shareMethod = action.payload;
    },
    changeAzureSubscriptionId: (state, action: PayloadAction<string>) => {
      state.azure.subscriptionId = action.payload;
    },
    changeAzureSource: (state, action: PayloadAction<string>) => {
      state.azure.source = action.payload;
    },
    changeAzureResourceGroup: (state, action: PayloadAction<string>) => {
      state.azure.resourceGroup = action.payload;
    },
    changeAzureHyperVGeneration: (
      state,
      action: PayloadAction<'V1' | 'V2'>
    ) => {
      state.azure.hyperVGeneration = action.payload;
    },
    reinitializeAzure: (state) => {
      state.azure.shareMethod = 'sources';
      state.azure.tenantId = '';
      state.azure.subscriptionId = '';
      state.azure.source = '';
      state.azure.resourceGroup = '';
    },
    changeGcpShareMethod: (state, action: PayloadAction<GcpShareMethod>) => {
      switch (action.payload) {
        case 'withInsights':
          state.gcp.accountType = undefined;
          state.gcp.email = '';
          break;
        case 'withGoogle':
          state.gcp.accountType = 'user';
      }
      state.gcp.shareMethod = action.payload;
    },
    changeGcpAccountType: (state, action: PayloadAction<GcpAccountType>) => {
      state.gcp.accountType = action.payload;
    },
    changeGcpEmail: (state, action: PayloadAction<string>) => {
      state.gcp.email = action.payload;
    },
    reinitializeGcp: (state) => {
      state.gcp.shareMethod = 'withGoogle';
      state.gcp.accountType = 'user';
      state.gcp.email = '';
    },
    changeRegistrationType: (
      state,
      action: PayloadAction<RegistrationType>
    ) => {
      state.registration.registrationType = action.payload;
    },
    changeActivationKey: (
      state,
      action: PayloadAction<ActivationKeys['name']>
    ) => {
      state.registration.activationKey = action.payload;
    },
    changeComplianceType: (state, action: PayloadAction<ComplianceType>) => {
      state.compliance.complianceType = action.payload;
    },
    changeCompliance: (
      state,
      action: PayloadAction<{
        policyID: string | undefined;
        profileID: string | undefined;
        policyTitle: string | undefined;
      }>
    ) => {
      state.compliance.policyID = action.payload.policyID;
      state.compliance.profileID = action.payload.profileID;
      state.compliance.policyTitle = action.payload.policyTitle;
    },

    changeFileSystemConfiguration: (
      state,
      action: PayloadAction<Partition[]>
    ) => {
      state.fileSystem.partitions = action.payload;
    },
    changeFileSystemConfigurationType: (
      state,
      action: PayloadAction<FileSystemConfigurationType>
    ) => {
      const currentMode = state.fileSystem.mode;

      // Only trigger if mode is being *changed*
      if (currentMode !== action.payload) {
        state.fileSystem.mode = action.payload;
        switch (action.payload) {
          case 'automatic':
            state.fileSystem.partitions = [];
            break;
          case 'manual':
            state.fileSystem.partitions = [
              {
                id: uuidv4(),
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ];
        }
      }
    },
    clearPartitions: (state) => {
      const currentMode = state.fileSystem.mode;

      if (currentMode === 'manual') {
        state.fileSystem.partitions = [
          {
            id: uuidv4(),
            mountpoint: '/',
            min_size: '10',
            unit: 'GiB',
          },
        ];
      }
    },
    addPartition: (state, action: PayloadAction<Partition>) => {
      // Duplicate partitions are allowed temporarily, the wizard is responsible for final validation
      state.fileSystem.partitions.push(action.payload);
    },
    removePartition: (state, action: PayloadAction<Partition['id']>) => {
      state.fileSystem.partitions.splice(
        state.fileSystem.partitions.findIndex(
          (partition) => partition.id === action.payload
        ),
        1
      );
    },
    removePartitionByMountpoint: (
      state,
      action: PayloadAction<Partition['mountpoint']>
    ) => {
      state.fileSystem.partitions.splice(
        state.fileSystem.partitions.findIndex(
          (partition) => partition.mountpoint === action.payload
        ),
        1
      );
    },
    changePartitionOrder: (state, action: PayloadAction<string[]>) => {
      state.fileSystem.partitions = state.fileSystem.partitions.sort(
        (a, b) => action.payload.indexOf(a.id) - action.payload.indexOf(b.id)
      );
    },
    changePartitionMountpoint: (
      state,
      action: PayloadAction<{ id: string; mountpoint: string }>
    ) => {
      const { id, mountpoint } = action.payload;
      const partitionIndex = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === id
      );
      if (partitionIndex !== -1) {
        state.fileSystem.partitions[partitionIndex].mountpoint = mountpoint;
      }
    },
    changePartitionUnit: (
      state,
      action: PayloadAction<{ id: string; unit: Units }>
    ) => {
      const { id, unit } = action.payload;
      const partitionIndex = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === id
      );
      if (partitionIndex !== -1) {
        state.fileSystem.partitions[partitionIndex].unit = unit;
      }
    },
    changePartitionMinSize: (
      state,
      action: PayloadAction<{ id: string; min_size: string }>
    ) => {
      const { id, min_size } = action.payload;
      const partitionIndex = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === id
      );
      if (partitionIndex !== -1) {
        state.fileSystem.partitions[partitionIndex].min_size = min_size;
      }
    },
    changeUseLatest: (state, action: PayloadAction<boolean>) => {
      state.snapshotting.useLatest = action.payload;
    },
    changeSnapshotDate: (state, action: PayloadAction<string>) => {
      const yyyyMMDDRegex = /^\d{4}-\d{2}-\d{2}$/;
      const date = new Date(action.payload);
      if (action.payload === '') {
        state.snapshotting.snapshotDate = action.payload;
      } else if (yyyyMMDDRegex.test(action.payload) && !isNaN(date.getTime())) {
        state.snapshotting.snapshotDate = date.toISOString();
      }
    },
    importCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>
    ) => {
      state.repositories.customRepositories = [
        ...state.repositories.customRepositories,
        ...action.payload,
      ];
    },
    changeCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>
    ) => {
      state.repositories.customRepositories = action.payload;
    },
    changePayloadRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories.payloadRepositories = action.payload;
    },
    addRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>
    ) => {
      if (
        !state.repositories.recommendedRepositories.some(
          (repo) => repo.url === action.payload.url
        )
      ) {
        state.repositories.recommendedRepositories.push(action.payload);
      }
    },
    removeRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>
    ) => {
      state.repositories.recommendedRepositories =
        state.repositories.recommendedRepositories.filter(
          (repo) => repo.url !== action.payload.url
        );
    },
    addPackage: (state, action: PayloadAction<IBPackageWithRepositoryInfo>) => {
      const existingPackageIndex = state.packages.findIndex(
        (pkg) => pkg.name === action.payload.name
      );

      if (existingPackageIndex !== -1) {
        state.packages[existingPackageIndex] = action.payload;
      } else {
        state.packages.push(action.payload);
      }
    },
    removePackage: (
      state,
      action: PayloadAction<IBPackageWithRepositoryInfo['name']>
    ) => {
      state.packages.splice(
        state.packages.findIndex((pkg) => pkg.name === action.payload),
        1
      );
    },
    addGroup: (state, action: PayloadAction<GroupWithRepositoryInfo>) => {
      const existingGrpIndex = state.groups.findIndex(
        (grp) => grp.name === action.payload.name
      );

      if (existingGrpIndex !== -1) {
        state.groups[existingGrpIndex] = action.payload;
      } else {
        state.groups.push(action.payload);
      }
    },
    removeGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo['name']>
    ) => {
      state.groups.splice(
        state.groups.findIndex((grp) => grp.name === action.payload),
        1
      );
    },
    addLanguage: (state, action: PayloadAction<string>) => {
      if (
        state.locale.languages &&
        !state.locale.languages.some((lang) => lang === action.payload)
      ) {
        state.locale.languages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      if (state.locale.languages) {
        state.locale.languages.splice(
          state.locale.languages.findIndex((lang) => lang === action.payload),
          1
        );
      }
    },
    clearLanguages: (state) => {
      state.locale.languages = [];
    },
    changeKeyboard: (state, action: PayloadAction<string>) => {
      state.locale.keyboard = action.payload;
    },
    changeBlueprintName: (state, action: PayloadAction<string>) => {
      state.details.blueprintName = action.payload;
    },
    changeBlueprintDescription: (state, action: PayloadAction<string>) => {
      state.details.blueprintDescription = action.payload;
    },
    setFirstBootScript: (state, action: PayloadAction<string>) => {
      state.firstBoot.script = action.payload;
    },
    changeEnabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.enabled = action.payload;
    },
    addEnabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.enabled.some((service) => service === action.payload)
      ) {
        state.services.enabled.push(action.payload);
      }
    },
    removeEnabledService: (state, action: PayloadAction<string>) => {
      state.services.enabled.splice(
        state.services.enabled.findIndex(
          (service) => service === action.payload
        ),
        1
      );
    },
    changeMaskedServices: (state, action: PayloadAction<string[]>) => {
      state.services.masked = action.payload;
    },
    addMaskedService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.masked.some((service) => service === action.payload)
      ) {
        state.services.masked.push(action.payload);
      }
    },
    removeMaskedService: (state, action: PayloadAction<string>) => {
      state.services.masked.splice(
        state.services.masked.findIndex(
          (service) => service === action.payload
        ),
        1
      );
    },
    changeDisabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.disabled = action.payload;
    },
    addDisabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.disabled.some((service) => service === action.payload)
      ) {
        state.services.disabled.push(action.payload);
      }
    },
    removeDisabledService: (state, action: PayloadAction<string>) => {
      state.services.disabled.splice(
        state.services.disabled.findIndex(
          (service) => service === action.payload
        ),
        1
      );
    },
    changeKernelName: (state, action: PayloadAction<string>) => {
      state.kernel.name = action.payload;
    },
    addKernelArg: (state, action: PayloadAction<string>) => {
      const existingArgIndex = state.kernel.append.findIndex(
        (arg) => arg === action.payload
      );

      if (existingArgIndex !== -1) {
        state.kernel.append[existingArgIndex] = action.payload;
      } else {
        state.kernel.append.push(action.payload);
      }
    },
    removeKernelArg: (state, action: PayloadAction<string>) => {
      if (state.kernel.append.length > 0) {
        state.kernel.append.splice(
          state.kernel.append.findIndex((arg) => arg === action.payload),
          1
        );
      }
    },
    clearKernelAppend: (state) => {
      state.kernel.append = [];
    },
    addEnabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.enabled.some(
          (service) => service === action.payload
        )
      ) {
        state.firewall.services.enabled.push(action.payload);
      }
    },
    removeEnabledFirewallService: (state, action: PayloadAction<string>) => {
      state.firewall.services.enabled.splice(
        state.firewall.services.enabled.findIndex(
          (service) => service === action.payload
        ),
        1
      );
    },
    addDisabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.disabled.some(
          (service) => service === action.payload
        )
      ) {
        state.firewall.services.disabled.push(action.payload);
      }
    },
    removeDisabledFirewallService: (state, action: PayloadAction<string>) => {
      state.firewall.services.disabled.splice(
        state.firewall.services.disabled.findIndex(
          (service) => service === action.payload
        ),
        1
      );
    },
    changeTimezone: (state, action: PayloadAction<string>) => {
      state.timezone.timezone = action.payload;
    },
    addNtpServer: (state, action: PayloadAction<string>) => {
      if (
        !state.timezone.ntpservers?.some((server) => server === action.payload)
      ) {
        state.timezone.ntpservers?.push(action.payload);
      }
    },
    removeNtpServer: (state, action: PayloadAction<string>) => {
      state.timezone.ntpservers?.splice(
        state.timezone.ntpservers.findIndex(
          (server) => server === action.payload
        ),
        1
      );
    },
    changeHostname: (state, action: PayloadAction<string>) => {
      state.hostname = action.payload;
    },
    addUser: (state) => {
      const newUser = {
        name: '',
        password: '',
        ssh_key: '',
        groups: [],
        isAdministrator: false,
      };

      state.users.push(newUser);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((_, index) => index !== action.payload);
    },
    setUserNameByIndex: (state, action: PayloadAction<UserPayload>) => {
      state.users[action.payload.index].name = action.payload.name;
    },
    setUserPasswordByIndex: (
      state,
      action: PayloadAction<UserPasswordPayload>
    ) => {
      state.users[action.payload.index].password = action.payload.password;
    },
    setUserSshKeyByIndex: (state, action: PayloadAction<UserSshKeyPayload>) => {
      state.users[action.payload.index].ssh_key = action.payload.sshKey;
    },
    addPort: (state, action: PayloadAction<string>) => {
      if (!state.firewall.ports.some((port) => port === action.payload)) {
        state.firewall.ports.push(action.payload);
      }
    },
    removePort: (state, action: PayloadAction<string>) => {
      state.firewall.ports.splice(
        state.firewall.ports.findIndex((port) => port === action.payload),
        1
      );
    },
    setUserAdministratorByIndex: (
      state,
      action: PayloadAction<UserAdministratorPayload>
    ) => {
      const { index, isAdministrator } = action.payload;
      const user = state.users[index];

      user.isAdministrator = isAdministrator;
      if (isAdministrator) {
        user.groups.push('wheel');
      } else {
        user.groups = user.groups.filter((group) => group !== 'wheel');
      }
    },
  },
});

export const {
  initializeWizard,
  changeServerUrl,
  changeBaseUrl,
  changeArchitecture,
  changeDistribution,
  addImageType,
  removeImageType,
  changeImageTypes,
  changeAwsAccountId,
  changeAwsShareMethod,
  changeAwsSourceId,
  reinitializeAws,
  changeAzureTenantId,
  changeAzureShareMethod,
  changeAzureSubscriptionId,
  changeAzureSource,
  changeAzureResourceGroup,
  changeAzureHyperVGeneration,
  reinitializeAzure,
  changeGcpShareMethod,
  changeGcpAccountType,
  changeGcpEmail,
  reinitializeGcp,
  changeRegistrationType,
  changeActivationKey,
  changeCompliance,
  changeComplianceType,
  changeFileSystemConfiguration,
  changeFileSystemConfigurationType,
  clearPartitions,
  addPartition,
  removePartition,
  removePartitionByMountpoint,
  changePartitionMountpoint,
  changePartitionUnit,
  changePartitionMinSize,
  changePartitionOrder,
  changeUseLatest,
  changeSnapshotDate,
  changeCustomRepositories,
  importCustomRepositories,
  changePayloadRepositories,
  addRecommendedRepository,
  removeRecommendedRepository,
  addPackage,
  removePackage,
  addGroup,
  removeGroup,
  addLanguage,
  removeLanguage,
  clearLanguages,
  changeKeyboard,
  changeBlueprintName,
  changeBlueprintDescription,
  loadWizardState,
  setFirstBootScript,
  changeEnabledServices,
  addEnabledService,
  removeEnabledService,
  changeMaskedServices,
  addMaskedService,
  removeMaskedService,
  changeDisabledServices,
  addDisabledService,
  removeDisabledService,
  changeKernelName,
  addKernelArg,
  removeKernelArg,
  clearKernelAppend,
  addDisabledFirewallService,
  removeDisabledFirewallService,
  addEnabledFirewallService,
  removeEnabledFirewallService,
  changeTimezone,
  addNtpServer,
  removeNtpServer,
  changeHostname,
  addPort,
  removePort,
  addUser,
  removeUser,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
} = wizardSlice.actions;
export default wizardSlice.reducer;
