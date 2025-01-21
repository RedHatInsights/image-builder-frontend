import {
  BlueprintExportResponse,
  Container,
  Directory,
  Distributions,
  Fdo,
  File,
  FirewallCustomization,
  Ignition,
  Installer,
  Kernel,
  Locale,
  OpenScap,
  Services,
  Timezone,
} from '../../../store/imageBuilderApi';

export type BlueprintOnPrem = {
  name: string;
  description?: string;
  packages?: PackagesOnPrem[];
  groups?: GroupsPackagesOnPrem[];
  distro: Distributions;
  customizations?: CustomizationsOnPrem;
  containers?: Container[];
};

export type PackagesOnPrem = {
  name: string;
  version?: string;
};

export type GroupsPackagesOnPrem = {
  name: string;
};

export type FileSystemOnPrem = {
  mountpoint: string;
  minsize: number | undefined;
};

export type CustomRepositoryOnPrem = {
  id: string;
  name?: string;
  filename?: string;
  baseurls?: string[];
  mirrorlist?: string;
  metalink?: string;
  gpgkey?: string[];
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  enabled?: boolean;
  priority?: number;
  ssl_verify?: boolean;
  module_hotfixes?: boolean;
};

export type CustomizationsOnPrem = {
  directories?: Directory[];
  files?: File[];
  repositories?: CustomRepositoryOnPrem[];
  openscap?: OpenScap;
  filesystem?: FileSystemOnPrem[];
  services?: Services;
  ssh_key?: SshKeyOnPrem[];
  hostname?: string;
  kernel?: Kernel;
  user?: UserOnPrem[];
  groups?: GroupOnPrem[];
  timezone?: Timezone;
  locale?: Locale;
  firewall?: FirewallCustomization;
  installation_device?: string;
  fdo?: Fdo;
  ignition?: Ignition;
  partitioning_mode?: 'raw' | 'lvm' | 'auto-lvm';
  fips?: boolean;
  installer?: Installer;
};

export type UserOnPrem = {
  name: string;
  key: string;
};

export type GroupOnPrem = {
  name: string;
  gid: number;
};

export type SshKeyOnPrem = {
  user: string;
  key: string;
};

export const mapOnPremToHosted = (
  blueprint: BlueprintOnPrem
): BlueprintExportResponse => {
  const users = blueprint.customizations?.user?.map((u) => ({
    name: u.name,
    ssh_key: u.key,
  }));
  const user_keys = blueprint.customizations?.ssh_key?.map((k) => ({
    name: k.user,
    ssh_key: k.key,
  }));
  const packages =
    blueprint.packages !== undefined
      ? blueprint.packages.map((p) => p.name)
      : undefined;
  const groups =
    blueprint.customizations?.groups !== undefined
      ? blueprint.customizations.groups.map((p) => `@${p.name}`)
      : undefined;
  return {
    name: blueprint.name,
    description: blueprint.description || '',
    distribution: blueprint.distro,
    customizations: {
      ...blueprint.customizations,
      containers: blueprint.containers,
      custom_repositories: blueprint.customizations?.repositories?.map(
        ({ baseurls, ...fs }) => ({
          baseurl: baseurls,
          ...fs,
        })
      ),
      packages:
        packages !== undefined || groups !== undefined
          ? [...(packages ? packages : []), ...(groups ? groups : [])]
          : undefined,
      users:
        users !== undefined || user_keys !== undefined
          ? [...(users ? users : []), ...(user_keys ? user_keys : [])]
          : undefined,
      groups: blueprint.customizations?.groups,
      filesystem: blueprint.customizations?.filesystem?.map(
        ({ minsize, ...fs }) => ({
          min_size: minsize,
          ...fs,
        })
      ),
      fips:
        blueprint.customizations?.fips !== undefined
          ? {
              enabled: blueprint.customizations.fips,
            }
          : undefined,
      timezone:
        blueprint.customizations?.timezone !== undefined
          ? {
              timezone: blueprint.customizations.timezone.timezone,
              ntpservers: blueprint.customizations.timezone.ntpservers,
            }
          : undefined,
      locale:
        blueprint.customizations?.locale !== undefined
          ? {
              languages: blueprint.customizations.locale.languages,
              keyboard: blueprint.customizations.locale.keyboard,
            }
          : undefined,
      hostname: blueprint.customizations?.hostname || undefined,
    },
    metadata: {
      parent_id: null,
      exported_at: '',
      is_on_prem: true,
    },
  };
};
