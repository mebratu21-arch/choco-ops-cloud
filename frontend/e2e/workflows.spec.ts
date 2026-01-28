import { test, expect } from '@playwright/test';

test.describe('ChocoOps E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'warehouse_worker');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/');
  });

  test.describe('Warehouse Worker - Inventory Management', () => {
    test('should navigate to inventory page and view items', async ({ page }) => {
      await page.goto('http://localhost:5173/inventory');
      
      // Verify page loaded
      await expect(page.locator('h1')).toContainText('Inventory Management');
      
      // Verify table has items
      await expect(page.locator('table tbody tr')).toHaveCount(6); // 6 demo ingredients
    });

    test('should filter low stock items', async ({ page }) => {
      await page.goto('http://localhost:5173/inventory');
      
      // Click low stock filter
      await page.click('button:has-text("Low Stock")');
      
      // Verify filtered results
      await expect(page.locator('table tbody tr')).toHaveCount(2); // 2 low stock items in demo data
    });

    test('should search for specific ingredient', async ({ page }) => {
      await page.goto('http://localhost:5173/inventory');
      
      // Search for "Cocoa"
      await page.fill('input[placeholder*="Search"]', 'Cocoa');
      
      // Verify search results
      await expect(page.locator('table tbody tr')).toHaveCountLessThanOrEqual(2);
      await expect(page.locator('text=Premium Cocoa Butter')).toBeVisible();
    });

    test('should edit stock inline', async ({ page }) => {
      await page.goto('http://localhost:5173/inventory');
      
      // Find first row and click edit
      const firstRow = page.locator('table tbody tr').first();
      await firstRow.locator('button:has-text("Edit"), button[aria-label="Edit"]').first().click();
      
      // Edit stock value
      const stockInput = firstRow.locator('input[type="number"]');
      await stockInput.fill('500');
      
      // Save changes
      await firstRow.locator('button:has-text("Save"), button[aria-label="Save"]').first().click();
      
      // Verify success (check for updated value or success message)
      await expect(stockInput).not.toBeVisible(); // Edit mode closed
    });
  });

  test.describe('Production Worker - Batch Creation', () => {
    test('should create a new production batch', async ({ page }) => {
      // Login as production worker
      await page.goto('http://localhost:5173/login');
      await page.fill('input[name="username"]', 'production_lead');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.goto('http://localhost:5173/production/batch');
      
      // Select a recipe
      const recipeCard = page.locator('text=Classic Dark Chocolate Bar').first();
      await recipeCard.click();
      
      // Verify navigation to step 2
      await expect(page.locator('text=Configure batch parameters')).toBeVisible();
      
      // Set quantity
      await page.click('button:has-text("+")');
      
      // Continue to ingredient check
      await page.click('button:has-text("Continue to Ingredient Check")');
      
      // Verify ingredient availability page
      await expect(page.locator('text=Confirm Ingredient Availability')).toBeVisible();
      
      // Start production
      await page.click('button:has-text("Start Production")');
      
      // Verify success (should redirect or show success message)
      await expect(page.locator('text=Batch created successfully')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('QC Inspector - Quality Checks', () => {
    test('should approve a batch', async ({ page }) => {
      // Login as QC
      await page.goto('http://localhost:5173/login');
      await page.fill('input[name="username"]', 'qc_inspector');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.goto('http://localhost:5173/qc/dashboard');
      
      // Click pending filter
      await page.click('button:has-text("Pending")');
      
      // Find first pending check and approve
      const firstCheck = page.locator('button:has-text("Approve")').first();
      if (await firstCheck.isVisible()) {
        await firstCheck.click();
        
        // Verify approval
        await expect(page.locator('text=Approved')).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Mechanic - SOS Alerts', () => {
    test('should log a machine fix', async ({ page }) => {
      // Login as mechanic
      await page.goto('http://localhost:5173/login');
      await page.fill('input[name="username"]', 'mechanic');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.goto('http://localhost:5173/mechanic/dashboard');
      
      // Click report issue
      await page.click('button:has-text("Report Issue")');
      
      // Fill out form
      await page.fill('input[placeholder="e.g., Mixer Unit 3"]', 'Test Machine');
      await page.selectOption('select', 'HIGH');
      await page.fill('textarea', 'Test issue description');
      
      // Submit
      await page.click('button:has-text("Log Issue")');
      
      // Verify issue logged
      await expect(page.locator('text=Test Machine')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Manager - Dashboard Overview', () => {
    test('should view aggregated metrics', async ({ page }) => {
      // Login as manager
      await page.goto('http://localhost:5173/login');
      await page.fill('input[name="username"]', 'factory_manager');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.goto('http://localhost:5173/manager/dashboard');
      
      // Verify all metric cards are visible
      await expect(page.locator('text=Inventory Status')).toBeVisible();
      await expect(page.locator('text=Production')).toBeVisible();
      await expect(page.locator('text=Quality Control')).toBeVisible();
      await expect(page.locator('text=Maintenance')).toBeVisible();
      
      // Verify quick actions
      await expect(page.locator('text=Quick Actions')).toBeVisible();
    });
  });

  test.describe('AI Chat', () => {
    test('should send and receive AI messages', async ({ page }) => {
      await page.goto('http://localhost:5173/ai-chat');
      
      // Type message
      await page.fill('input[placeholder*="Ask me anything"]', 'Where is cocoa butter stored?');
      
      // Send message
      await page.click('button[aria-label="Send"], button:has-text("Send")');
      
      // Verify message appears in chat
      await expect(page.locator('text=Where is cocoa butter stored?')).toBeVisible();
      
      // Wait for AI response (with timeout)
      await expect(page.locator('.chat-message, .message-content').last()).toBeVisible({ timeout: 10000 });
    });
  });
});
