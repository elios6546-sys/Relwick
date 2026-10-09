import { expect, test } from "@playwright/test";

test("clic hero Réserver un appel expose data-track CTA", async ({ page }) => {
  await page.goto("/");
  const cta = page.locator('[data-track-cta][data-track="hero_cta_appel"]').first();
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page.locator("#contact")).toBeInViewport();
});
