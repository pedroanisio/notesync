import { test, expect } from '@playwright/test';

test('complete note lifecycle', async ({ page }) => {
  // 1. Create a note
  await page.goto('/');
  await page.click('text=New Note');
  
  await page.fill('[aria-label="Title"]', 'E2E Test Note');
  await page.fill('[data-testid="editor"]', 'This is a test note created during E2E testing');
  await page.fill('[placeholder="Add tag"]', 'e2e');
  await page.press('[placeholder="Add tag"]', 'Enter');
  
  await page.click('text=Save');
  await expect(page).toHaveURL(/\/notes\/[a-zA-Z0-9-]+$/);
  
  // 2. Edit the note
  await page.click('text=Edit');
  await page.fill('[aria-label="Title"]', 'E2E Test Note (Edited)');
  await page.fill('[data-testid="editor"]', 'This note has been edited');
  await page.click('text=Save Changes');
  
  // 3. View revision history
  await page.click('text=Revisions');
  await expect(page.locator('text=Revision #1')).toBeVisible();
  await page.click('text=Back to note');
  
  // 4. Archive the note
  await page.click('text=Archive');
  await expect(page.locator('text=Note archived')).toBeVisible();
  
  // 5. View archived notes
  await page.click('text=Archived');
  await expect(page.locator('text=E2E Test Note (Edited)')).toBeVisible();
  
  // 6. Restore the note
  await page.click('text=Restore');
  await expect(page.locator('text=Note restored')).toBeVisible();
  
  // 7. Verify note is back in dashboard
  await page.goto('/');
  await expect(page.locator('text=E2E Test Note (Edited)')).toBeVisible();
}); 