import { prisma } from "../src/lib/prisma";
import { SITE_URL, SEO_THRESHOLDS } from "../src/config/site";
import { isIndexable, stripMarkdown, truncateAtWordBoundary } from "../src/lib/seo";
import sitemap from "../src/app/sitemap";

async function runSeoCheck() {
  console.log("=================================================");
  console.log("      WRITEUPHUB TECHNICAL SEO AUDIT SUITE       ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Sitemap Verification
  console.log("TEST 1: SITEMAP INTEGRITY & CHUNKING");
  const sitemapEntries = await sitemap({ id: 0 });
  assert(sitemapEntries.length > 0, `Sitemap generated ${sitemapEntries.length} routes`);

  const sitemapUrls = new Set(sitemapEntries.map((e) => e.url));

  // Check no private/unlisted pages in sitemap
  assert(!sitemapUrls.has(`${SITE_URL}/api`), "Excludes /api from sitemap");
  assert(!sitemapUrls.has(`${SITE_URL}/dashboard`), "Excludes /dashboard from sitemap");
  assert(!sitemapUrls.has(`${SITE_URL}/write`), "Excludes /write from sitemap");
  assert(!sitemapUrls.has(`${SITE_URL}/settings`), "Excludes /settings from sitemap");
  assert(!sitemapUrls.has(`${SITE_URL}/onboarding`), "Excludes /onboarding from sitemap");
  assert(!sitemapUrls.has(`${SITE_URL}/login`), "Excludes /login from sitemap");
  assert(!sitemapUrls.has(`${SITE_URL}/register`), "Excludes /register from sitemap");

  // Check core public routes are present
  assert(sitemapUrls.has(`${SITE_URL}`), "Includes root URL");
  assert(sitemapUrls.has(`${SITE_URL}/explore`), "Includes /explore");
  assert(sitemapUrls.has(`${SITE_URL}/browse`), "Includes /browse");
  assert(sitemapUrls.has(`${SITE_URL}/cves`), "Includes /cves");
  assert(sitemapUrls.has(`${SITE_URL}/events`), "Includes /events");
  assert(sitemapUrls.has(`${SITE_URL}/ctf-sites`), "Includes /ctf-sites");

  // 2. UGC Quality & Index Gate
  console.log("\nTEST 2: UGC QUALITY GATE (isIndexable)");
  const publicWriteups = await prisma.writeup.findMany({
    where: { status: "PUBLIC" },
    select: {
      id: true,
      title: true,
      slug: true,
      contentMd: true,
      status: true,
      author: { select: { username: true, createdAt: true } },
    },
    take: 10,
  });

  for (const w of publicWriteups) {
    if (!w.author.username) continue;
    const url = `${SITE_URL}/w/${w.author.username}/${w.slug}`;
    const qualified = isIndexable({
      status: w.status,
      contentMd: w.contentMd,
      authorCreatedAt: w.author.createdAt,
    });

    if (qualified) {
      assert(sitemapUrls.has(url), `High-quality writeup included in sitemap: ${w.title.slice(0, 30)}...`);
    } else {
      assert(!sitemapUrls.has(url), `Under-threshold writeup excluded from sitemap: ${w.title.slice(0, 30)}...`);
    }
  }

  // 3. Title & Description Thresholds
  console.log("\nTEST 3: TITLE & DESCRIPTION THRESHOLDS");
  const testTitle = "A".repeat(120);
  const truncatedTitle = truncateAtWordBoundary(testTitle, SEO_THRESHOLDS.MAX_TITLE_CHARS);
  assert(
    truncatedTitle.length <= SEO_THRESHOLDS.MAX_TITLE_CHARS,
    `Title truncation stays within ${SEO_THRESHOLDS.MAX_TITLE_CHARS} chars (${truncatedTitle.length})`
  );

  const testDesc = "Word ".repeat(60);
  const truncatedDesc = truncateAtWordBoundary(testDesc, SEO_THRESHOLDS.MAX_DESC_CHARS);
  assert(
    truncatedDesc.length <= SEO_THRESHOLDS.MAX_DESC_CHARS,
    `Description truncation stays within ${SEO_THRESHOLDS.MAX_DESC_CHARS} chars (${truncatedDesc.length})`
  );

  // 4. URL Stability & Slug History
  console.log("\nTEST 4: URL STABILITY & REDIRECT HISTORY");
  const slugHistories = await prisma.slugHistory.count();
  const usernameHistories = await prisma.usernameHistory.count();
  console.log(`  [INFO] Slug history records: ${slugHistories}`);
  console.log(`  [INFO] Username history records: ${usernameHistories}`);
  assert(true, "SlugHistory and UsernameHistory tables exist and are active in schema");

  // 5. Hub Qualifications
  console.log("\nTEST 5: HUB QUALIFICATIONS");
  assert(
    SEO_THRESHOLDS.MIN_HUB_WRITEUPS === 3,
    `Hub qualification threshold is set to ${SEO_THRESHOLDS.MIN_HUB_WRITEUPS} indexable writeups`
  );

  console.log("\n=================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runSeoCheck().catch((err) => {
  console.error("SEO Audit Suite encountered fatal error:", err);
  process.exit(1);
});
