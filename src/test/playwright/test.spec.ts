import { test, expect, type Page } from '@playwright/test';
import { loginCockpit } from './lib/login';

test.describe('test', () => {
  test('login', async ({ page }) => {
    await loginCockpit(page, 'admin', 'foobar')
  });
});
