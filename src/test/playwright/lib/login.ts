import { expect, type Page } from '@playwright/test';
import path from 'path';

// This file can only contain functions that are referenced by authentication.

export const logout = async (page: Page) => {
  const button = await page.locator(
    'div.pf-v5-c-toolbar__item.pf-m-hidden.pf-m-visible-on-lg.pf-v5-u-mr-0 > button',
  );

  await button.click();

  await expect(async () => page.getByRole('menuitem', { name: 'Log out' }).isVisible()).toPass();

  await page.getByRole('menuitem', { name: 'Log out' }).click();

  await expect(async () => {
    expect(page.url()).not.toBe('/insights/content/repositories');
  }).toPass();
  await expect(async () =>
    expect(page.getByText('Log in to your Red Hat account')).toBeVisible(),
  ).toPass();
};

export const loginCockpit = async (
  page: Page,
  username?: string,
  password?: string,
) => {
  if (!username || !password) {
    throw new Error('Username or password not found');
  }

  await page.goto('/cockpit-image-builder');

  await page.getByRole('textbox', { name: 'User name' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.locator('iframe[name="cockpit1\\:localhost\\/cockpit-image-builder"]').contentFrame().getByText('All images');
  await page.locator('iframe[name="cockpit1\\:localhost\\/cockpit-image-builder"]').contentFrame().getByTestId('blueprints-create-button').click();
};
