import { actions } from '../../../store/actions';
import types from '../../../store/types';

const compose = {
    '77e4c693-0497-4b85-936d-b2a3ad69571b': {
        id: '77e4c693-0497-4b85-936d-b2a3ad69571b',
        distribution: 'rhel-8',
        image_requests: [
            {
                architecture: 'x86_64',
                image_type: 'ami',
                upload_request: {
                    type: 'aws',
                    options: {}
                }
            }
        ],
        image_status: {
            status: 'uploading',
        },
    }
};

describe('composeUpdated', () => {
    test('returns dict', () => {
        const result = actions.composeUpdated(compose);

        // this function updates the type attribute and
        // returns everything else unchanged
        expect(result.type).toBe(types.COMPOSE_UPDATED);
        expect(result.payload.compose).toBe(compose);
    });
});
