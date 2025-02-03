import {
  darkChocolateBlueprintResponse,
  mockBlueprintDescriptions,
  mockBlueprintIds,
  mockBlueprintNames,
  multipleTargetsBlueprintResponse,
} from './blueprints';

import {
  AARCH64,
  CENTOS_9,
  FIRST_BOOT_SERVICE,
  FIRST_BOOT_SERVICE_DATA,
  RHEL_8,
  RHEL_9,
  UNIT_GIB,
  UNIT_KIB,
  UNIT_MIB,
  X86_64,
} from '../../constants';
import {
  BlueprintResponse,
  CreateBlueprintRequest,
  CustomRepository,
  File,
  ImageRequest,
  Repository,
} from '../../store/imageBuilderApi';

// Registration
export const expectedSubscription = {
  'activation-key': 'name0',
  insights: true,
  rhc: true,
  organization: 5,
  'server-url': 'subscription.rhsm.redhat.com',
  'base-url': 'https://cdn.redhat.com/',
};

// OpenSCAP
export const expectedOpenscapCisL1 = {
  profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
};

export const expectedPackagesCisL1 = ['aide', 'neovim'];

export const expectedServicesCisL1 = {
  enabled: ['crond', 'neovim-service'],
  disabled: ['rpcbind', 'autofs', 'nftables'],
  masked: ['nfs-server', 'emacs-service'],
};

export const expectedKernelCisL1 = {
  append: 'audit_backlog_limit=8192 audit=1',
};

export const expectedFilesystemCisL1 = [
  { min_size: 10737418240, mountpoint: '/' },
  { min_size: 1073741824, mountpoint: '/tmp' },
  { min_size: 1073741824, mountpoint: '/home' },
];

export const expectedOpenscapCisL2 = {
  profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l2',
};

export const expectedPackagesCisL2 = ['aide', 'emacs'];

export const expectedServicesCisL2 = {
  enabled: ['crond', 'emacs-service'],
  masked: ['nfs-server', 'neovim-service'],
};

export const expectedKernelCisL2 = {
  append: 'audit_backlog_limit=8192 audit=2',
};

export const expectedFilesystemCisL2 = [
  { min_size: 10737418240, mountpoint: '/' },
  { min_size: 1073741824, mountpoint: '/tmp' },
  { min_size: 1073741824, mountpoint: '/app' },
];

// FSC
export const expectedFsc = [
  { min_size: 10 * UNIT_GIB, mountpoint: '/' },
  { min_size: 10 * UNIT_MIB, mountpoint: '/home' },
  { min_size: 10 * UNIT_KIB, mountpoint: '/app' },
];

// Repositories
export const expectedPayloadRepositories: Repository[] = [
  {
    baseurl: 'http://valid.link.to.repo.org/x86_64/',
    check_gpg: true,
    check_repo_gpg: false,
    gpgkey:
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
    id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
    rhsm: false,
  },
];

export const expectedCustomRepositories: CustomRepository[] = [
  {
    baseurl: ['http://valid.link.to.repo.org/x86_64/'],
    check_gpg: true,
    check_repo_gpg: false,
    gpgkey: [
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
    ],
    id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
    name: '01-test-valid-repo',
  },
];

// First Boot
export const SCRIPT_DOS = `#!/bin/bash\r\nsystemctl enable cockpit.socket`;
export const SCRIPT = `#!/bin/bash
systemctl enable cockpit.socket`;
export const BASE64_SCRIPT = btoa(SCRIPT);
export const SCRIPT_WITHOUT_SHEBANG = `echo "Hello, world!"`;

export const firstBootData: File[] = [
  {
    path: '/etc/systemd/system/custom-first-boot.service',
    data: FIRST_BOOT_SERVICE_DATA,
    data_encoding: 'base64',
    ensure_parents: true,
  },
  {
    path: '/usr/local/sbin/custom-first-boot',
    data: BASE64_SCRIPT,
    data_encoding: 'base64',
    mode: '0774',
    ensure_parents: true,
  },
];

// Packages
export const expectedPackages: string[] = ['test'];

export const expectedSinglePackageRecommendation: string[] = [
  'test', // recommendations are generated only when some packages have been selected
  'recommendedPackage1',
];

export const expectedAllPackageRecommendations: string[] = [
  'test', // recommendations are generated only when some packages have been selected
  'recommendedPackage1',
  'recommendedPackage2',
  'recommendedPackage3',
  'recommendedPackage4',
  'recommendedPackage5',
];

export const expectedPackagesWithoutRecommendations: string[] = ['test'];

// Requests and responses
export const baseImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: {
    options: {},
    type: 'aws.s3',
  },
};

export const baseCreateBlueprintRequest: CreateBlueprintRequest = {
  name: 'Red Velvet',
  description: '',
  distribution: RHEL_9,
  image_requests: [baseImageRequest],
  customizations: {},
};

export const rhel9CreateBlueprintRequest: CreateBlueprintRequest = {
  distribution: RHEL_9,
  image_requests: [baseImageRequest],
  name: mockBlueprintNames['rhel9'],
  description: mockBlueprintDescriptions['rhel9'],
  customizations: {},
};

export const rhel9BlueprintResponse: BlueprintResponse = {
  ...rhel9CreateBlueprintRequest,
  id: mockBlueprintIds['rhel9'],
  description: mockBlueprintDescriptions['rhel9'],
};

export const rhel8CreateBlueprintRequest: CreateBlueprintRequest = {
  distribution: RHEL_8,
  image_requests: [baseImageRequest],
  name: mockBlueprintNames['rhel8'],
  description: mockBlueprintDescriptions['rhel8'],
  customizations: {},
};

export const rhel8BlueprintResponse: BlueprintResponse = {
  ...rhel8CreateBlueprintRequest,
  id: mockBlueprintIds['rhel8'],
  description: mockBlueprintDescriptions['rhel8'],
};

export const centos9CreateBlueprintRequest: CreateBlueprintRequest = {
  distribution: CENTOS_9,
  image_requests: [baseImageRequest],
  name: mockBlueprintNames['centos9'],
  description: mockBlueprintDescriptions['centos9'],
  customizations: {},
};

export const centos9BlueprintResponse: BlueprintResponse = {
  ...centos9CreateBlueprintRequest,
  id: mockBlueprintIds['centos9'],
  description: mockBlueprintDescriptions['centos9'],
};

export const x86_64ImageRequest: ImageRequest = {
  ...baseImageRequest,
  architecture: X86_64,
};

export const x86_64CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['x86_64'],
  description: mockBlueprintDescriptions['x86_64'],
  image_requests: [x86_64ImageRequest],
};

export const x86_64BlueprintResponse: BlueprintResponse = {
  ...x86_64CreateBlueprintRequest,
  id: mockBlueprintIds['x86_64'],
  description: mockBlueprintDescriptions['x86_64'],
};

export const aarch64ImageRequest: ImageRequest = {
  ...baseImageRequest,
  architecture: AARCH64,
};

export const aarch64CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['aarch64'],
  description: mockBlueprintDescriptions['aarch64'],
  image_requests: [x86_64ImageRequest],
};

export const aarch64BlueprintResponse: BlueprintResponse = {
  ...aarch64CreateBlueprintRequest,
  id: mockBlueprintIds['aarch64'],
  description: mockBlueprintDescriptions['aarch64'],
};

export const awsImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'aws',
  upload_request: {
    options: {
      share_with_accounts: ['123123123123'],
    },
    type: 'aws',
  },
};

export const awsCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['aws'],
  description: mockBlueprintDescriptions['aws'],
  image_requests: [awsImageRequest],
};

export const awsBlueprintResponse: BlueprintResponse = {
  ...awsCreateBlueprintRequest,
  id: mockBlueprintIds['aws'],
  description: mockBlueprintDescriptions['aws'],
};

export const gcpImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'gcp',
  upload_request: {
    type: 'gcp',
    options: {
      share_with_accounts: ['serviceAccount:test@email.com'],
    },
  },
};

export const gcpCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['gcp'],
  description: mockBlueprintDescriptions['gcp'],
  image_requests: [gcpImageRequest],
};

export const gcpBlueprintResponse: BlueprintResponse = {
  ...gcpCreateBlueprintRequest,
  id: mockBlueprintIds['gcp'],
  description: mockBlueprintDescriptions['gcp'],
};

export const azureImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'azure',
  upload_request: {
    options: {
      source_id: '666',
      resource_group: 'myResourceGroup1',
      hyper_v_generation: 'V2',
    },
    type: 'azure',
  },
};

export const azureCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['azure'],
  description: mockBlueprintDescriptions['azure'],
  image_requests: [azureImageRequest],
};

export const azureBlueprintResponse: BlueprintResponse = {
  ...azureCreateBlueprintRequest,
  id: mockBlueprintIds['azure'],
  description: mockBlueprintDescriptions['azure'],
};

export const registrationCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['registration'],
  description: mockBlueprintDescriptions['registration'],
  customizations: {
    subscription: expectedSubscription,
  },
};

export const registrationBlueprintResponse: BlueprintResponse = {
  ...registrationCreateBlueprintRequest,
  id: mockBlueprintIds['registration'],
  description: mockBlueprintDescriptions['registration'],
};

export const oscapCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['oscap'],
  description: mockBlueprintDescriptions['oscap'],
  customizations: {
    packages: expectedPackagesCisL1,
    openscap: expectedOpenscapCisL1,
    services: expectedServicesCisL1,
    kernel: expectedKernelCisL1,
    filesystem: expectedFilesystemCisL1,
  },
};

export const oscapBlueprintResponse: BlueprintResponse = {
  ...oscapCreateBlueprintRequest,
  id: mockBlueprintIds['oscap'],
  description: mockBlueprintDescriptions['oscap'],
};

export const fscCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['fsc'],
  description: mockBlueprintDescriptions['fsc'],
  customizations: {
    filesystem: expectedFsc,
  },
};

export const fscBlueprintResponse: BlueprintResponse = {
  ...fscCreateBlueprintRequest,
  id: mockBlueprintIds['fsc'],
  description: mockBlueprintDescriptions['fsc'],
};

export const snapshotCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['snapshot'],
  description: mockBlueprintDescriptions['snapshot'],
  customizations: {
    custom_repositories: expectedCustomRepositories,
    payload_repositories: expectedPayloadRepositories,
  },
};

export const snapshotBlueprintResponse: BlueprintResponse = {
  ...snapshotCreateBlueprintRequest,
  id: mockBlueprintIds['snapshot'],
  description: mockBlueprintDescriptions['snapshot'],
};

export const repositoriesCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['repositories'],
  description: mockBlueprintDescriptions['repositories'],
  customizations: {
    custom_repositories: expectedCustomRepositories,
    payload_repositories: expectedPayloadRepositories,
  },
};

export const repositoriesBlueprintResponse: BlueprintResponse = {
  ...repositoriesCreateBlueprintRequest,
  id: mockBlueprintIds['repositories'],
  description: mockBlueprintDescriptions['repositories'],
};

export const packagesCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['packages'],
  description: mockBlueprintDescriptions['packages'],
  customizations: {
    packages: expectedPackages,
  },
};

export const packagesBlueprintResponse: BlueprintResponse = {
  ...packagesCreateBlueprintRequest,
  id: mockBlueprintIds['packages'],
  description: mockBlueprintDescriptions['packages'],
};

export const timezoneCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['timezone'],
  description: mockBlueprintDescriptions['timezone'],
  customizations: {
    timezone: {
      timezone: 'Asia/Tokyo',
      ntpservers: ['0.jp.pool.ntp.org', '1.jp.pool.ntp.org'],
    },
  },
};

export const timezoneBlueprintResponse: BlueprintResponse = {
  ...timezoneCreateBlueprintRequest,
  id: mockBlueprintIds['timezone'],
  description: mockBlueprintDescriptions['timezone'],
};

export const usersCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['users'],
  description: mockBlueprintDescriptions['users'],
  customizations: {
    users: [
      {
        name: 'best',
        ssh_key: 'ssh-rsa d',
        groups: ['wheel'],
      },
    ],
  },
};

export const usersBlueprintResponse: BlueprintResponse = {
  ...usersCreateBlueprintRequest,
  id: mockBlueprintIds['users'],
  description: mockBlueprintDescriptions['users'],
};

export const localeCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['locale'],
  description: mockBlueprintDescriptions['locale'],
  customizations: {
    locale: {
      languages: ['en_US.UTF-8'],
      keyboard: 'us',
    },
  },
};

export const localeBlueprintResponse: BlueprintResponse = {
  ...localeCreateBlueprintRequest,
  id: mockBlueprintIds['locale'],
  description: mockBlueprintDescriptions['locale'],
};

export const hostnameCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['hostname'],
  description: mockBlueprintDescriptions['hostname'],
  customizations: {
    hostname: 'base-image',
  },
};

export const hostnameBlueprintResponse: BlueprintResponse = {
  ...hostnameCreateBlueprintRequest,
  id: mockBlueprintIds['hostname'],
  description: mockBlueprintDescriptions['hostname'],
};

export const kernelCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['kernel'],
  description: mockBlueprintDescriptions['kernel'],
  customizations: {
    kernel: {
      name: 'kernel-debug',
      append: 'nosmt=force',
    },
  },
};

export const kernelBlueprintResponse: BlueprintResponse = {
  ...kernelCreateBlueprintRequest,
  id: mockBlueprintIds['kernel'],
  description: mockBlueprintDescriptions['kernel'],
};

export const firstBootCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['firstBoot'],
  description: mockBlueprintDescriptions['firstBoot'],
  customizations: {
    files: firstBootData,
    services: { enabled: [FIRST_BOOT_SERVICE] },
  },
};

export const firstBootBlueprintResponse: BlueprintResponse = {
  ...firstBootCreateBlueprintRequest,
  id: mockBlueprintIds['firstBoot'],
  description: mockBlueprintDescriptions['firstBoot'],
};

export const detailsCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['details'],
  description: mockBlueprintDescriptions['details'],
  customizations: {},
};

export const detailsBlueprintResponse: BlueprintResponse = {
  ...detailsCreateBlueprintRequest,
  id: mockBlueprintIds['details'],
  description: mockBlueprintDescriptions['details'],
};

export const complianceCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['compliance'],
  description: mockBlueprintDescriptions['compliance'],
  customizations: {
    packages: expectedPackagesCisL2,
    openscap: {
      policy_id: '0ee9a781-b53f-4d9e-91e1-d75aed088c44',
    },
    services: expectedServicesCisL2,
    kernel: expectedKernelCisL2,
    filesystem: expectedFilesystemCisL2,
  },
};

export const complianceBlueprintResponse: BlueprintResponse = {
  ...complianceCreateBlueprintRequest,
  id: mockBlueprintIds['compliance'],
  description: mockBlueprintDescriptions['compliance'],
};

export const getMockBlueprintResponse = (id: string) => {
  switch (id) {
    case mockBlueprintIds['darkChocolate']:
      return darkChocolateBlueprintResponse;
    case mockBlueprintIds['multipleTargets']:
      return multipleTargetsBlueprintResponse;
    case mockBlueprintIds['rhel9']:
      return rhel9BlueprintResponse;
    case mockBlueprintIds['rhel8']:
      return rhel8BlueprintResponse;
    case mockBlueprintIds['centos9']:
      return centos9BlueprintResponse;
    case mockBlueprintIds['x86_64']:
      return x86_64BlueprintResponse;
    case mockBlueprintIds['aarch64']:
      return aarch64BlueprintResponse;
    case mockBlueprintIds['aws']:
      return awsBlueprintResponse;
    case mockBlueprintIds['gcp']:
      return gcpBlueprintResponse;
    case mockBlueprintIds['azure']:
      return azureBlueprintResponse;
    case mockBlueprintIds['registration']:
      return registrationBlueprintResponse;
    case mockBlueprintIds['fsc']:
      return fscBlueprintResponse;
    case mockBlueprintIds['oscap']:
      return oscapBlueprintResponse;
    case mockBlueprintIds['snapshot']:
      return snapshotBlueprintResponse;
    case mockBlueprintIds['repositories']:
      return repositoriesBlueprintResponse;
    case mockBlueprintIds['packages']:
      return packagesBlueprintResponse;
    case mockBlueprintIds['users']:
      return usersBlueprintResponse;
    case mockBlueprintIds['timezone']:
      return timezoneBlueprintResponse;
    case mockBlueprintIds['locale']:
      return localeBlueprintResponse;
    case mockBlueprintIds['hostname']:
      return hostnameBlueprintResponse;
    case mockBlueprintIds['kernel']:
      return kernelBlueprintResponse;
    case mockBlueprintIds['firstBoot']:
      return firstBootBlueprintResponse;
    case mockBlueprintIds['details']:
      return detailsBlueprintResponse;
    case mockBlueprintIds['compliance']:
      return complianceBlueprintResponse;
    default:
      return;
  }
};
