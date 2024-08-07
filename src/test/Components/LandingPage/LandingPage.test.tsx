import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { IMAGE_BUILDER_API } from '../../../constants';
import { mockComposesEmpty } from '../../fixtures/composes';
import { server } from '../../mocks/server';
import { renderWithReduxRouter } from '../../testUtils';

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page heading', async () => {
    renderWithReduxRouter('', {});

    // check heading
    const heading = await screen.findByText('Images');
    expect(heading).toHaveRole('heading');
  });

  test('renders EmptyState child component', async () => {
    server.use(
      http.get(`${IMAGE_BUILDER_API}/composes`, () => {
        return HttpResponse.json(mockComposesEmpty);
      })
    );

    renderWithReduxRouter('', {});
    // check table loads
    await screen.findByTestId('empty-state');
  });
});
