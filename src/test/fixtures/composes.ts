import { RHEL_8, RHEL_9 } from '../../constants';
import {
  AwsUploadStatus,
  ClonesResponse,
  ComposeStatus,
  ComposesResponse,
  ComposesResponseItem,
  UploadStatus,
} from '../../store/imageBuilderApi';

// CreateImageWizard mocks
export const mockComposesEmpty: ComposesResponse = {
  meta: {
    count: 0,
  },
  links: {
    first: '',
    last: '',
  },
  data: [],
};

// ImagesTable mocks
const currentDate = new Date();
const currentDateInString = currentDate.toISOString();

export const composesEndpoint = (url: URL) => {
  const params = new URLSearchParams(url.search);
  const limit = Number(params.get('limit')) || 100;
  const offset = Number(params.get('offset')) || 0;

  return {
    meta: {
      count: mockComposes.length,
    },
    links: {
      first: '',
      last: '',
    },
    data: mockComposes.slice(offset, offset + limit),
  } as ComposesResponse;
};

/**
 * Upon adding an entry in the mockComposes, add it at the very end of the array
 * and add a corresponding ComposeStatus object (at the same position in the
 * mockStatus call, for easier tracking).
 */
export const mockComposes: ComposesResponseItem[] = [
  {
    id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
    image_name: 'test-image-name',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {
              share_with_accounts: ['123123123123'],
            },
          },
        },
      ],
    },
  },
  {
    id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'gcp',
          upload_request: {
            type: 'gcp',
            options: {
              share_with_accounts: ['serviceAccount:test@email.com'],
            },
          },
        },
      ],
    },
  },
  {
    id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '42ad0826-30b5-4f64-a24e-957df26fd564',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '955944a2-e149-4058-8ac1-35b514cb5a16',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'f7a60094-b376-4b58-a102-5c8c82dfd18b',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '61b0effa-c901-4ee5-86b9-2010b47f1b22',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'ca03f120-9840-4959-871e-94a5cb49d1f2',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'gcp',
          upload_request: {
            type: 'gcp',
            options: {
              share_with_accounts: ['serviceAccount:test@email.com'],
            },
          },
        },
      ],
    },
  },
  {
    id: '551de6f6-1533-4b46-a69f-7924051f9bc6',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'azure',
          upload_request: {
            type: 'azure',
            options: {
              resource_group: 'my_resource_group',
              hyper_v_generation: 'V2',
            },
          },
        },
      ],
    },
  },
  {
    created_at: '2021-04-27T12:31:12Z',
    id: 'b7193673-8dcc-4a5f-ac30-e9f4940d8346',
    request: {
      customizations: {
        filesystem: [
          { min_size: 10737418240, mountpoint: '/' },
          { min_size: 1073741824, mountpoint: '/usr/test' },
        ],
      },
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vsphere',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    created_at: '2021-04-27T12:31:12Z',
    id: 'hyk93673-8dcc-4a61-ac30-e9f4940d8346',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vsphere-ova',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    created_at: '2021-04-27T12:31:12Z',
    id: '4873fd0f-1851-4b9f-b4fe-4639fce90794',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'image-installer',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    created_at: currentDateInString,
    id: '7b7d0d51-7106-42ab-98f2-f89872a9d599',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    id: '1679d95b-8f1d-4982-8c53-8c2afa4ab04c',
    image_name: 'test-oscap-image-name',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
      customizations: {
        filesystem: [
          { min_size: 10 * 1024 * 1024 * 1024, mountpoint: '/' },
          { min_size: 1073741824, mountpoint: '/tmp' },
        ],
        packages: [
          'aide',
          'sudo',
          'rsyslog',
          'firewalld',
          'nftables',
          'libselinux',
        ],
        openscap: {
          profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
          profile_name:
            'CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
          profile_description:
            'This  is a mocked profile description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere velit enim, tincidunt porttitor nisl elementum eu.',
        },
      },
    },
  },
  {
    id: '9e7d0d51-7106-42ab-98f2-f89872a9d599',
    created_at: currentDateInString,
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    id: '1c00daa5-1cfe-4765-8fdd-d1dccf841baf',
    created_at: currentDateInString,
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'azure',
          upload_request: {
            type: 'azure',
            options: {
              resource_group: 'my_resource_group',
              hyper_v_generation: 'V2',
            },
          },
        },
      ],
    },
  },
  {
    id: '0c1ec8d8-be39-47f2-9bd4-a3fff8244fce',
    created_at: '2023-10-17T00:01:02Z',
    image_name: 'oci-image',
    request: {
      distribution: RHEL_9,
      image_name: 'oci-image',
      customizations: {},
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'oci',
          upload_request: {
            type: 'oci.objectstorage',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'ea23cfd6-fd8b-43ed-adfc-9f76bb8487ef',
    created_at: currentDateInString,
    image_name: 'expiring-oci-image',
    request: {
      distribution: RHEL_9,
      image_name: 'oci-image',
      customizations: {},
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'oci',
          upload_request: {
            type: 'oci.objectstorage',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '63e42aaf-b543-41c6-899f-3de1e61838dc',
    image_name: 'dark-chocolate-v2',
    created_at: '2023-09-08T14:38:00.000Z',
    request: {
      distribution: RHEL_9,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {
              share_with_accounts: ['123123123123'],
            },
          },
        },
      ],
    },
  },
];

/**
 * MockStatus should have the same composeRequest as the one defined in the
 * composes, and the order should be identical.
 */
export const mockStatus = (composeId: string): ComposeStatus => {
  const mockComposes: { [key: string]: ComposeStatus } = {
    '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0217b81d9be50e44b',
            region: 'us-east-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    '63e42aaf-b543-41c6-899f-3de1e61838dc': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0217b81d9be50e44c',
            region: 'us-east-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'A dependency error occured',
          details: {
            reason: 'Error in depsolve job',
          },
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'gcp',
            upload_request: {
              type: 'gcp',
              options: {
                share_with_accounts: ['serviceAccount:test@email.com'],
              },
            },
          },
        ],
      },
    },
    'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
      image_status: {
        status: 'pending',
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {},
            },
          },
        ],
      },
    },
    '42ad0826-30b5-4f64-a24e-957df26fd564': {
      image_status: {
        status: 'building',
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {},
            },
          },
        ],
      },
    },
    '955944a2-e149-4058-8ac1-35b514cb5a16': {
      image_status: {
        status: 'uploading',
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {},
            },
          },
        ],
      },
    },
    'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
      image_status: {
        status: 'registering',
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {},
            },
          },
        ],
      },
    },
    '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'A dependency error occured',
          details: {
            reason: 'Error in depsolve job',
          },
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {},
            },
          },
        ],
      },
    },
    'ca03f120-9840-4959-871e-94a5cb49d1f2': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            image_name: 'composer-api-d446d8cb-7c16-4756-bf7d-706293785b05',
            project_id: 'red-hat-image-builder',
          },
          status: 'success',
          type: 'gcp',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'gcp',
            upload_request: {
              type: 'gcp',
              options: {
                share_with_accounts: ['serviceAccount:test@email.com'],
              },
            },
          },
        ],
      },
    },
    '551de6f6-1533-4b46-a69f-7924051f9bc6': {
      image_status: {
        status: 'building',
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'azure',
            upload_request: {
              type: 'azure',
              options: {
                resource_group: 'my_resource_group',
                hyper_v_generation: 'V2',
              },
            },
          },
        ],
      },
    },
    'b7193673-8dcc-4a5f-ac30-e9f4940d8346': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/b7193673-8dcc-4a5f-ac30-e9f4940d8346-disk.vmdk',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        customizations: {
          custom_repositories: [
            {
              baseurl: ['http://unreachable.link.to.repo.org/x86_64/'],
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              id: 'd4b6d3db-bd15-4750-98c0-667f42995566',
              name: '03-test-unavailable-repo',
            },
          ],
          payload_repositories: [
            {
              baseurl: 'http://unreachable.link.to.repo.org/x86_64/',
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey:
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              id: 'd4b6d3db-bd15-4750-98c0-667f42995566',
              rhsm: false,
            },
          ],
          filesystem: [
            { min_size: 10737418240, mountpoint: '/' },
            { min_size: 1073741824, mountpoint: '/usr/test' },
          ],
        },
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vsphere',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
    'hyk93673-8dcc-4a61-ac30-e9f4940d8346': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/hyk93673-8dcc-4a61-ac30-e9f4940d8346-disk.vmdk',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        customizations: {
          custom_repositories: [
            {
              baseurl: ['http://yum.theforeman.org/releases/3.4/el8/x86_64/'],
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
              name: '13lk3',
            },
            {
              baseurl: [
                'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
              ],
              check_gpg: false,
              check_repo_gpg: false,
              gpgkey: [''],
              id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
              name: '2lmdtj',
            },
          ],
          payload_repositories: [
            {
              baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey:
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
              rhsm: false,
            },
            {
              baseurl:
                'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
              check_gpg: false,
              check_repo_gpg: false,
              gpgkey: '',
              id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
              rhsm: false,
            },
          ],
        },
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vsphere-ova',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
    '4873fd0f-1851-4b9f-b4fe-4639fce90794': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/4873fd0f-1851-4b9f-b4fe-4639fce90794-installer.iso',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'image-installer',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
    '7b7d0d51-7106-42ab-98f2-f89872a9d599': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/7b7d0d51-7106-42ab-98f2-f89872a9d599-disk.qcow2',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
    '1679d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/1679d95b-8f1d-4982-8c53-8c2afa4ab04c-disk.qcow2',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: {
              type: 'aws.s3',
              options: {},
            },
          },
        ],
        customizations: {
          filesystem: [
            { min_size: 10 * 1024 * 1024 * 1024, mountpoint: '/' },
            { min_size: 1073741824, mountpoint: '/tmp' },
          ],
          packages: [
            'aide',
            'sudo',
            'rsyslog',
            'firewalld',
            'nftables',
            'libselinux',
          ],
          openscap: {
            profile_id:
              'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
            profile_name:
              ' CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
            profile_description:
              'This  is a mocked profile description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere velit enim, tincidunt porttitor nisl elementum eu.',
          },
        },
      },
    },
    '9e7d0d51-7106-42ab-98f2-f89872a9d599': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'Something went very wrong',
          details: {
            reason: 'There was an error',
          },
        },
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/9e7d0d51-7106-42ab-98f2-f89872a9d599-disk.qcow2',
          },
          status: 'failure',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
    '1c00daa5-1cfe-4765-8fdd-d1dccf841baf': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'Something went very wrong for Azure',
          details: {
            reason: 'There was an error',
          },
        },
        upload_status: {
          options: {
            image_name: 'name',
          },
          status: 'failure',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vhd',
            upload_request: {
              options: {},
              type: 'azure',
            },
          },
        ],
      },
    },
    '0c1ec8d8-be39-47f2-9bd4-a3fff8244fce': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://oci-link-to-the.objectstorage.in-a-region.oci.customer-oci.com/p/there-is-a-lot-of-characters/b/image-builder-crc-stage/o/osbuild-upload-1234567890123456789',
          },
          status: 'success',
          type: 'oci.objectstorage',
        },
      },
      request: {
        distribution: RHEL_9,
        image_name: 'oci-image',
        customizations: {},
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'oci',
            upload_request: {
              type: 'oci.objectstorage',
              options: {},
            },
          },
        ],
      },
    },
    'ea23cfd6-fd8b-43ed-adfc-9f76bb8487ef': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://oci-link-to-the.objectstorage.in-a-region.oci.customer-oci.com/p/there-is-a-lot-of-characters/b/image-builder-crc-stage/o/osbuild-upload-9876543210987654321',
          },
          status: 'success',
          type: 'oci.objectstorage',
        },
      },
      request: {
        distribution: RHEL_9,
        image_name: 'oci-image',
        customizations: {},
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'oci',
            upload_request: {
              type: 'oci.objectstorage',
              options: {},
            },
          },
        ],
      },
    },
  };
  return mockComposes[composeId];
};

export const mockNoClones: ClonesResponse = {
  data: [],
  links: {
    first: '',
    last: '',
  },
  meta: {
    count: 2,
  },
};

export const mockClones = (composeId: string): ClonesResponse => {
  if (composeId === '1579d95b-8f1d-4982-8c53-8c2afa4ab04c') {
    return {
      data: [
        {
          compose_id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
          created_at: '2021-04-27T12:31:12Z',
          id: 'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
          request: {
            region: 'us-west-1',
            share_with_accounts: ['123123123123'],
          },
        },
        {
          compose_id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
          created_at: '2021-04-28T12:31:12Z',
          id: '48fce414-0cc0-4a16-8645-e3f0edec3212',
          request: {
            region: 'us-west-1',
            share_with_accounts: ['123123123123'],
          },
        },
        {
          compose_id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
          created_at: '2021-04-27T12:31:12Z',
          id: '0169538e-515c-477e-b934-f12783939313',
          request: {
            region: 'us-west-2',
            share_with_accounts: ['123123123123'],
          },
        },
        {
          compose_id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
          created_at: '2021-04-27T12:31:12Z',
          id: '4a851db1-919f-43ca-a7ef-dd209877a77e',
          request: {
            region: 'eu-central-1',
            share_with_accounts: ['000000000000'],
          },
        },
      ],
      meta: {
        count: 4,
      },
      links: {
        first: '',
        last: '',
      },
    };
  } else {
    return {
      data: [],
      meta: {
        count: 0,
      },
      links: {
        first: '',
        last: '',
      },
    };
  }
};

type mockClonesType = {
  [key: string]: {
    status: UploadStatus['status'];
    type: UploadStatus['type'];
    options: AwsUploadStatus;
  };
};

export const mockCloneStatus: mockClonesType = {
  'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d': {
    options: {
      ami: 'ami-0e778053cd490ad21',
      region: 'us-west-1',
    },
    status: 'success',
    type: 'aws',
  },
  '48fce414-0cc0-4a16-8645-e3f0edec3212': {
    options: {
      ami: 'ami-9f0asd1tlk2142124',
      region: 'us-west-1',
    },
    status: 'success',
    type: 'aws',
  },
  '0169538e-515c-477e-b934-f12783939313': {
    options: {
      ami: 'ami-9fdskj12fdsak1211',
      region: 'us-west-2',
    },
    status: 'failure',
    type: 'aws',
  },
  '4a851db1-919f-43ca-a7ef-dd209877a77e': {
    options: {
      ami: 'ami-9fdskj12fdsak1211',
      region: 'eu-central-1',
    },
    status: 'success',
    type: 'aws',
  },
};

// ShareImageModal mocks
export const mockComposesShareImageModal = {
  count: 1,
  allIds: ['1579d95b-8f1d-4982-8c53-8c2afa4ab04c'],
  byId: {
    '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4abc',
      image_name: 'test-image-name',
      created_at: '2021-04-27T12:31:12Z',
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
      clones: [
        'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
        '48fce414-0cc0-4a16-8645-e3f0edec3212',
        '0169538e-515c-477e-b934-f12783939313',
        '4a851db1-919f-43ca-a7ef-dd209877a77e',
      ],
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0217b81d9be50e44b',
            region: 'us-east-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
  },
  error: null,
};

export const mockClonesShareImageModal = {
  allIds: [
    'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
    '48fce414-0cc0-4a16-8645-e3f0edec3212',
    '0169538e-515c-477e-b934-f12783939313',
    '4a851db1-919f-43ca-a7ef-dd209877a77e',
  ],
  byId: {
    'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d': {
      created_at: '2021-04-27T12:31:12Z',
      id: 'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0e778053cd490ad21',
            region: 'us-west-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
    // Duplicate us-west-1 clone with different ami created one day later
    '48fce414-0cc0-4a16-8645-e3f0edec3212': {
      created_at: '2021-04-28T12:31:12Z',
      id: '48fce414-0cc0-4a16-8645-e3f0edec3212',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-9f0asd1tlk2142124',
            region: 'us-west-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
    '0169538e-515c-477e-b934-f12783939313': {
      created_at: '2021-04-27T12:31:12Z',
      id: '0169538e-515c-477e-b934-f12783939313',
      request: {
        region: 'us-west-2',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'failure',
        upload_status: {
          options: {
            ami: 'ami-9fdskj12fdsak1211',
            region: 'us-west-2',
          },
          status: 'failure',
          type: 'aws',
        },
      },
    },
    '4a851db1-919f-43ca-a7ef-dd209877a77e': {
      created_at: '2021-04-27T12:31:12Z',
      id: '4a851db1-919f-43ca-a7ef-dd209877a77e',
      request: {
        region: 'eu-central-1',
        share_with_accounts: ['000000000000'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-9fdskj12fdsak1211',
            region: 'eu-central-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
  },
  error: null,
};

export const mockState = {
  clones: { ...mockClonesShareImageModal },
  composes: { ...mockComposesShareImageModal },
  notifications: [],
};

// ShareImageModal mocks
export const mockComposesRecreateImage = {
  count: 2,
  allIds: [
    'b7193673-8dcc-4a5f-ac30-e9f4940d8346',
    'hyk93673-8dcc-4a61-ac30-e9f4940d8346',
  ],
  byId: {
    'b7193673-8dcc-4a5f-ac30-e9f4940d8346': {
      id: 'b7193673-8dcc-4a5f-ac30-e9f4940d8346',
      created_at: '2021-04-27T12:31:12Z',
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vsphere',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
        customizations: {
          custom_repositories: [
            {
              baseurl: ['http://unreachable.link.to.repo.org/x86_64/'],
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              id: 'd4b6d3db-bd15-4750-98c0-667f42995566',
              name: '03-test-unavailable-repo',
            },
            {
              baseurl: ['http://yum.theforeman.org/releases/3.4/el8/x86_64/'],
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
              name: '13lk3',
            },
          ],
          payload_repositories: [
            {
              baseurl: 'http://unreachable.link.to.repo.org/x86_64/',
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey:
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              id: 'd4b6d3db-bd15-4750-98c0-667f42995566',
              rhsm: false,
            },
            {
              baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey:
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
              rhsm: false,
            },
          ],
        },
      },
    },
    'hyk93673-8dcc-4a61-ac30-e9f4940d8346': {
      created_at: '2021-04-27T12:31:12Z',
      id: 'hyk93673-8dcc-4a61-ac30-e9f4940d8346',
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vsphere-ova',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
        customizations: {
          custom_repositories: [
            {
              baseurl: ['http://yum.theforeman.org/releases/3.4/el8/x86_64/'],
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
              name: '13lk3',
            },
            {
              baseurl: [
                'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
              ],
              check_gpg: false,
              check_repo_gpg: false,
              gpgkey: [''],
              id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
              name: '2lmdtj',
            },
            {
              id: 'f087f9ad-dfe6-4627-9d53-447d1a997de5',
              name: 'nginx stable repo',
              baseurl: ['http://nginx.org/packages/centos/9/x86_64/'],
              check_gpg: true,
              check_repo_gpg: false,
              gpg_key: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v2.0.22 (GNU/Linux)\n\nmQENBE5OMmIBCAD+FPYKGriGGf7NqwKfWC83cBV01gabgVWQmZbMcFzeW+hMsgxH\nW6iimD0RsfZ9oEbfJCPG0CRSZ7ppq5pKamYs2+EJ8Q2ysOFHHwpGrA2C8zyNAs4I\nQxnZZIbETgcSwFtDun0XiqPwPZgyuXVm9PAbLZRbfBzm8wR/3SWygqZBBLdQk5TE\nfDR+Eny/M1RVR4xClECONF9UBB2ejFdI1LD45APbP2hsN/piFByU1t7yK2gpFyRt\n97WzGHn9MV5/TL7AmRPM4pcr3JacmtCnxXeCZ8nLqedoSuHFuhwyDnlAbu8I16O5\nXRrfzhrHRJFM1JnIiGmzZi6zBvH0ItfyX6ttABEBAAG0KW5naW54IHNpZ25pbmcg\na2V5IDxzaWduaW5nLWtleUBuZ2lueC5jb20+iQE+BBMBAgAoAhsDBgsJCAcDAgYV\nCAIJCgsEFgIDAQIeAQIXgAUCV2K1+AUJGB4fQQAKCRCr9b2Ce9m/YloaB/9XGrol\nkocm7l/tsVjaBQCteXKuwsm4XhCuAQ6YAwA1L1UheGOG/aa2xJvrXE8X32tgcTjr\nKoYoXWcdxaFjlXGTt6jV85qRguUzvMOxxSEM2Dn115etN9piPl0Zz+4rkx8+2vJG\nF+eMlruPXg/zd88NvyLq5gGHEsFRBMVufYmHtNfcp4okC1klWiRIRSdp4QY1wdrN\n1O+/oCTl8Bzy6hcHjLIq3aoumcLxMjtBoclc/5OTioLDwSDfVx7rWyfRhcBzVbwD\noe/PD08AoAA6fxXvWjSxy+dGhEaXoTHjkCbz/l6NxrK3JFyauDgU4K4MytsZ1HDi\nMgMW8hZXxszoICTTiQEcBBABAgAGBQJOTkelAAoJEKZP1bF62zmo79oH/1XDb29S\nYtWp+MTJTPFEwlWRiyRuDXy3wBd/BpwBRIWfWzMs1gnCjNjk0EVBVGa2grvy9Jtx\nJKMd6l/PWXVucSt+U/+GO8rBkw14SdhqxaS2l14v6gyMeUrSbY3XfToGfwHC4sa/\nThn8X4jFaQ2XN5dAIzJGU1s5JA0tjEzUwCnmrKmyMlXZaoQVrmORGjCuH0I0aAFk\nRS0UtnB9HPpxhGVbs24xXZQnZDNbUQeulFxS4uP3OLDBAeCHl+v4t/uotIad8v6J\nSO93vc1evIje6lguE81HHmJn9noxPItvOvSMb2yPsE8mH4cJHRTFNSEhPW6ghmlf\nWa9ZwiVX5igxcvaIRgQQEQIABgUCTk5b0gAKCRDs8OkLLBcgg1G+AKCnacLb/+W6\ncflirUIExgZdUJqoogCeNPVwXiHEIVqithAM1pdY/gcaQZmIRgQQEQIABgUCTk5f\nYQAKCRCpN2E5pSTFPnNWAJ9gUozyiS+9jf2rJvqmJSeWuCgVRwCcCUFhXRCpQO2Y\nVa3l3WuB+rgKjsQ=\n=EWWI\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              module_hotfixes: true,
            },
          ],
          payload_repositories: [
            {
              baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
              check_gpg: true,
              check_repo_gpg: false,
              gpgkey:
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
              id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
              rhsm: false,
            },
            {
              baseurl:
                'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
              check_gpg: false,
              check_repo_gpg: false,
              gpgkey: '',
              id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
              rhsm: false,
            },

            {
              baseurl: 'http://nginx.org/packages/centos/9/x86_64/',
              check_gpg: true,
              check_repo_gpg: false,
              gpg_key: [
                '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v2.0.22 (GNU/Linux)\n\nmQENBE5OMmIBCAD+FPYKGriGGf7NqwKfWC83cBV01gabgVWQmZbMcFzeW+hMsgxH\nW6iimD0RsfZ9oEbfJCPG0CRSZ7ppq5pKamYs2+EJ8Q2ysOFHHwpGrA2C8zyNAs4I\nQxnZZIbETgcSwFtDun0XiqPwPZgyuXVm9PAbLZRbfBzm8wR/3SWygqZBBLdQk5TE\nfDR+Eny/M1RVR4xClECONF9UBB2ejFdI1LD45APbP2hsN/piFByU1t7yK2gpFyRt\n97WzGHn9MV5/TL7AmRPM4pcr3JacmtCnxXeCZ8nLqedoSuHFuhwyDnlAbu8I16O5\nXRrfzhrHRJFM1JnIiGmzZi6zBvH0ItfyX6ttABEBAAG0KW5naW54IHNpZ25pbmcg\na2V5IDxzaWduaW5nLWtleUBuZ2lueC5jb20+iQE+BBMBAgAoAhsDBgsJCAcDAgYV\nCAIJCgsEFgIDAQIeAQIXgAUCV2K1+AUJGB4fQQAKCRCr9b2Ce9m/YloaB/9XGrol\nkocm7l/tsVjaBQCteXKuwsm4XhCuAQ6YAwA1L1UheGOG/aa2xJvrXE8X32tgcTjr\nKoYoXWcdxaFjlXGTt6jV85qRguUzvMOxxSEM2Dn115etN9piPl0Zz+4rkx8+2vJG\nF+eMlruPXg/zd88NvyLq5gGHEsFRBMVufYmHtNfcp4okC1klWiRIRSdp4QY1wdrN\n1O+/oCTl8Bzy6hcHjLIq3aoumcLxMjtBoclc/5OTioLDwSDfVx7rWyfRhcBzVbwD\noe/PD08AoAA6fxXvWjSxy+dGhEaXoTHjkCbz/l6NxrK3JFyauDgU4K4MytsZ1HDi\nMgMW8hZXxszoICTTiQEcBBABAgAGBQJOTkelAAoJEKZP1bF62zmo79oH/1XDb29S\nYtWp+MTJTPFEwlWRiyRuDXy3wBd/BpwBRIWfWzMs1gnCjNjk0EVBVGa2grvy9Jtx\nJKMd6l/PWXVucSt+U/+GO8rBkw14SdhqxaS2l14v6gyMeUrSbY3XfToGfwHC4sa/\nThn8X4jFaQ2XN5dAIzJGU1s5JA0tjEzUwCnmrKmyMlXZaoQVrmORGjCuH0I0aAFk\nRS0UtnB9HPpxhGVbs24xXZQnZDNbUQeulFxS4uP3OLDBAeCHl+v4t/uotIad8v6J\nSO93vc1evIje6lguE81HHmJn9noxPItvOvSMb2yPsE8mH4cJHRTFNSEhPW6ghmlf\nWa9ZwiVX5igxcvaIRgQQEQIABgUCTk5b0gAKCRDs8OkLLBcgg1G+AKCnacLb/+W6\ncflirUIExgZdUJqoogCeNPVwXiHEIVqithAM1pdY/gcaQZmIRgQQEQIABgUCTk5f\nYQAKCRCpN2E5pSTFPnNWAJ9gUozyiS+9jf2rJvqmJSeWuCgVRwCcCUFhXRCpQO2Y\nVa3l3WuB+rgKjsQ=\n=EWWI\n-----END PGP PUBLIC KEY BLOCK-----',
              ],
              id: 'f087f9ad-dfe6-4627-9d53-447d1a997de5',
              rhsm: false,
              module_hotfixes: true,
            },
          ],
        },
      },
    },
  },
  error: null,
};

export const mockStateRecreateImage = {
  composes: { ...mockComposesRecreateImage },
  notifications: [],
};
