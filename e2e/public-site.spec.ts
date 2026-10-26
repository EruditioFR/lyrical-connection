import { test, expect, type Page } from '@playwright/test';

// Ces tests ne dépendent pas des données Supabase : ils vérifient que le site
// s'affiche, protège les pages privées et valide les formulaires côté client.

const collectPageErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  return errors;
};

const publicPages: [string, RegExp][] = [
  ['/', /Le réseau mondial dédié au chant lyrique/],
  ['/qui-sommes-nous', /Qui sommes-nous/],
  ['/fonctionnalites', /Toutes les fonctionnalités/],
  ['/faq', /Foire Aux Questions/],
  ['/contact', /Contactez-nous/],
  ['/pricing', /Plans et Tarifs/],
  ['/castings', /Votre Carrière Lyrique/],
  ['/evenements', /Événements & Formations/],
  ['/artistes', /Nos Artistes/],
  ['/blog', /Blog Lyrisphere/],
  ['/installer', /Installez Lyrisphere/],
  ['/sumi-jo', /Concours Sumi Jo/],
  ['/cgu', /Conditions Générales d'Utilisation/],
  ['/mentions-legales', /Mentions Légales/],
  ['/politique-confidentialite', /Politique de Confidentialité/],
  ['/cookies', /Politique des Cookies/],
];

for (const [path, title] of publicPages) {
  test(`page publique ${path} s'affiche sans erreur`, async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(path);
    await expect(page.locator('h1').first()).toHaveText(title);
    expect(errors).toEqual([]);
  });
}

const privatePages = [
  '/dashboard', '/profil', '/profil-professionnel', '/messages', '/notifications',
  '/mes-candidatures', '/mes-evenements', '/recherche-artistes', '/casting-dashboard',
  '/castings/nouveau', '/evenements/nouveau', '/facturation', '/subscription', '/admin', '/comparer',
];

for (const path of privatePages) {
  test(`page privée ${path} redirige vers la connexion`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.locator('h1')).toHaveText(/Espace Connexion/);
  });
}

test('une route inconnue affiche la page 404', async ({ page }) => {
  await page.goto('/page-inexistante');
  await expect(page.locator('h1')).toHaveText('404');
});

test('le formulaire de connexion vide est bloqué', async ({ page }) => {
  await page.goto('/auth');
  await page.locator('form button[type=submit]').first().click();
  await expect(page).toHaveURL(/\/auth$/);
  expect(await page.locator('form :invalid').count()).toBeGreaterThan(0);
});

test('le formulaire de contact affiche les erreurs de validation', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('form button[type=submit]').first().click();
  await expect(page.getByText('Le nom doit contenir au moins 2 caractères')).toBeVisible();
  await expect(page.getByText('Veuillez entrer une adresse email valide')).toBeVisible();
  await expect(page.getByText('Le sujet doit contenir au moins 5 caractères')).toBeVisible();
  await expect(page.getByText('Le message doit contenir au moins 10 caractères')).toBeVisible();
});

test('les liens internes du pied de page ne sont pas cassés', async ({ page }) => {
  await page.goto('/');
  const links = await page.locator('footer a[href^="/"]').evaluateAll(as =>
    [...new Set(as.map(a => a.getAttribute('href') as string))]);
  expect(links.length).toBeGreaterThan(0);
  for (const href of links) {
    await page.goto(href);
    await expect(page.locator('h1').first(), href).not.toHaveText('404');
  }
});

test('le site est installable (manifest PWA)', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.name).toBe('Lyrisphere');
  expect((await request.get('/sw.js')).ok()).toBe(true);
});

test.describe('affichage mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of ['/', '/castings', '/evenements', '/pricing', '/auth']) {
    test(`${path} ne déborde pas horizontalement`, async ({ page }) => {
      await page.goto(path);
      await page.locator('h1').first().waitFor();
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});

test("un article du blog s'affiche sans boucle de requêtes", async ({ page }) => {
  let articleRequests = 0;
  page.on('request', r => { if (r.url().includes('/blog_posts?') && r.url().includes('slug=eq.')) articleRequests++; });
  await page.goto('/blog');
  const firstArticle = page.locator('a[href^="/blog/"]').first();
  const hasArticle = await firstArticle.waitFor({ timeout: 10_000 }).then(() => true, () => false);
  test.skip(!hasArticle, 'aucun article publié');
  await firstArticle.click();
  await expect(page.locator('h1').first()).not.toBeEmpty();
  await page.waitForTimeout(2000);
  expect(articleRequests).toBeLessThanOrEqual(2);
});

test('la liste des professionnels affiche un contenu ou un message', async ({ page }) => {
  await page.goto('/professionnels');
  await expect(page.locator('h1')).toHaveText('Liste des professionnels');
  await expect(
    page.getByText('Aucun professionnel à afficher pour le moment.').or(page.getByRole('button', { name: /Voir le profil/ }).first())
      .or(page.getByText('Aperçu limité').first())
  ).toBeVisible();
});

test("aucun contenu fictif présenté comme réel", async ({ page }) => {
  await page.goto('/');
  await page.locator('h1').first().waitFor();
  await expect(page.getByText('Sophie Martineau')).toHaveCount(0);
  await page.goto('/castings');
  await page.locator('h1').first().waitFor();
  await expect(page.getByText('Opéra National de Paris')).toHaveCount(0);
});
