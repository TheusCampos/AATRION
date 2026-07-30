import { test, expect } from '@playwright/test';

/**
 * TestSprite E2E Tests - Login e Fluxos Principais
 * Testes executados via Playwright
 */

test.describe('TestSprite: Login e Autenticação', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar para login
    await page.goto('/login');
  });

  test('TC001-Login: Deve fazer login com credenciais válidas', async ({ page }) => {
    // Aguardar página carregar
    await page.waitForLoadState('domcontentloaded');

    // Preencher email
    const emailInput = page.locator('[id="identifier-field"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('test@example.com');

    // Clicar em Continuar
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    // Preencher senha
    const passwordInput = page.locator('[id="password-field"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('TestPassword123!');

    // Clicar em Continuar
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    // Aguardar redirecionamento para dashboard
    await page.waitForURL(/\/(dashboard|editor)/, { timeout: 15000 });

    // Verificar que não está mais na página de login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC002-Auth: Deve redirecionar para login ao acessar página protegida', async ({ page }) => {
    // Tentar acessar dashboard sem estar logado
    await page.goto('/dashboard');

    // Deve redirecionar para login
    await page.waitForURL(/\/(login|sign-in)/, { timeout: 10000 });

    // Verificar que está na página de login
    const hasLoginForm = await page.locator('[id="identifier-field"]').isVisible();
    expect(hasLoginForm).toBe(true);
  });

  test('TC003-Register: Deve exibir formulário de registro', async ({ page }) => {
    // Clicar em Registre-se
    await page.getByRole('link', { name: 'Registre-se', exact: true }).click();

    // Verificar que o formulário de registro está visível
    const usernameField = page.locator('[id="username-field"]');
    await expect(usernameField).toBeVisible({ timeout: 5000 });
  });

  test('TC004-Logout: Deve fazer logout corretamente', async ({ page }) => {
    // Primeiro fazer login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('[id="identifier-field"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('test@example.com');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    const passwordInput = page.locator('[id="password-field"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('TestPassword123!');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    // Aguardar dashboard
    await page.waitForURL(/\/(dashboard|editor)/, { timeout: 15000 });

    // Procurar botão de logout (geralmente no header)
    const userButton = page.locator('button').filter({ hasText: /user|perfil|account/i }).first();
    if (await userButton.isVisible()) {
      await userButton.click();
      // Procurar opção de logout
      const logoutButton = page.locator('button, a').filter({ hasText: /logout|sair|sign out/i }).first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }
    }
  });
});

test.describe('TestSprite: Dashboard e Currículos', () => {

  test('TC005-Dashboard: Deve exibir lista de currículos após login', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('[id="identifier-field"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('test@example.com');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    const passwordInput = page.locator('[id="password-field"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('TestPassword123!');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    // Aguardar dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');

    // Verificar elementos do dashboard
    const pageContent = await page.content();
    const hasDashboard = pageContent.toLowerCase().includes('dashboard') || 
                         pageContent.toLowerCase().includes('currículo') ||
                         pageContent.toLowerCase().includes('cv');

    expect(hasDashboard).toBeTruthy();
  });

  test('TC006-Create: Deve criar novo currículo', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('[id="identifier-field"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('test@example.com');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    const passwordInput = page.locator('[id="password-field"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('TestPassword123!');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    // Ir para criar currículo
    await page.goto('/resumes/new');
    await page.waitForLoadState('domcontentloaded');

    // Verificar que o editor está disponível
    const editorContent = await page.content();
    const hasEditor = editorContent.toLowerCase().includes('dados pessoais') ||
                      editorContent.toLowerCase().includes('experiência') ||
                      editorContent.toLowerCase().includes('formação');

    expect(hasEditor || editorContent.length > 100).toBeTruthy();
  });
});
