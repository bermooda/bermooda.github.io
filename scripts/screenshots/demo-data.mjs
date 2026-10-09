// Turns the stock bermooda seed into a cohesive homewares demo shop with photos.
// Run after `npm run seed` and before starting the dev server (settings are cached).
// Usage: BERMOODA_DIR=../bermooda node demo-data.mjs
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import Database from 'better-sqlite3';

const SHOP = resolve(process.env.BERMOODA_DIR ?? '../../../bermooda');
const db = new Database(`${SHOP}/prisma/dev.db`);
const now = new Date().toISOString();

const products = [
  ['seed-prod-bamboo-speaker', 'glazed-bud-vase', 'Glazed bud vase', 6800, '1612196808214-b8e1d6145a8c', 'Hand-thrown stoneware with a soft satin glaze. Holds a single stem or stands on its own.'],
  ['seed-prod-organic-tee', 'stoneware-mug', 'Stoneware mug', 2800, '1514228742587-6b1558fcca3d', 'A weighty 12 oz mug with a rounded handle, glazed in matte chalk white.'],
  ['seed-prod-stoneware-mugs', 'speckled-cup-set', 'Speckled cup set (set of 4)', 5400, '1610701596007-11502861dcfa', 'Four handle-less cups in speckled clay, sized for espresso, tea, or a short pour.'],
  ['seed-prod-led-desk-lamp', 'arc-floor-lamp', 'Arc floor lamp', 18900, '1507473885765-e6ed057f782c', 'Powder-coated steel with an adjustable shade and a warm, dimmable bulb.'],
  ['seed-prod-yoga-mat', 'amber-soy-candle', 'Amber soy candle', 3400, '1603006905003-be475563bc59', 'Hand-poured soy wax in amber glass. Notes of cedar, fig leaf, and smoke. 50-hour burn.'],
  ['seed-prod-hydration-pack', 'leather-crossbody', 'Leather crossbody bag', 14500, '1600857062241-98e5dba7f214', 'Vegetable-tanned leather with a magnetic flap and an adjustable strap.'],
  ['seed-prod-herbal-tea', 'botanical-face-oil', 'Botanical face oil', 3800, '1608571423902-eed4a5ad8108', 'Cold-pressed rosehip and jojoba in a 30 ml dropper bottle.'],
  ['seed-prod-dog-leash-set', 'molded-side-chair', 'Molded side chair', 12000, '1592078615290-033ee584e267', 'A molded shell seat on solid beech legs. Stackable two high.'],
  ['seed-prod-ceramic-pots', 'ceramic-plant-pot', 'Ceramic plant pot', 3600, '1485955900006-10f4d324d411', 'Glazed ceramic planter with a drainage hole and matching saucer.'],
  ['seed-demo-product', 'stoneware-dinner-plates', 'Stoneware dinner plates (set of 4)', 7200, '1578749556568-bc2c40e68b61', 'Reactive-glaze plates; every one comes out of the kiln a little different.'],
];

const categories = {
  'seed-cat-audio-electronics': ['ceramics', 'Ceramics'],
  'seed-cat-apparel': ['coffee-and-tea', 'Coffee & tea'],
  'seed-cat-home-decor': ['tableware', 'Tableware'],
  'seed-cat-kitchenware': ['home-decor', 'Home décor'],
  'seed-cat-outdoor-living': ['lighting', 'Lighting'],
  'seed-cat-wellness': ['self-care', 'Self-care'],
  'seed-cat-sports': ['furniture', 'Furniture'],
  'seed-cat-pets': ['bags', 'Bags'],
  'seed-cat-gifts': ['gifts', 'Gifts'],
};

const imgDir = `${SHOP}/public/demo`;
mkdirSync(imgDir, { recursive: true });

const setTranslation = db.prepare(
  `INSERT INTO Translation (id, entityType, entityId, locale, field, value, createdAt, updatedAt)
   VALUES (?, ?, ?, 'en', ?, ?, ?, ?)
   ON CONFLICT(entityType, entityId, locale, field) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`
);
const setSlug = db.prepare(`UPDATE Slug SET slug = ? WHERE entityType = ? AND entityId = ? AND locale = 'en'`);
const setPrice = db.prepare(`UPDATE VariantPrice SET priceCents = ? WHERE variantId = ? AND currency = ?`);

const tx = db.transaction(() => {
  // Free up slugs first so re-runs can swap them between categories.
  for (const id of Object.keys(categories)) setSlug.run(`tmp-${id}`, 'category', id);
  for (const [id, [slug, title]] of Object.entries(categories)) {
    setTranslation.run(randomUUID(), 'category', id, 'title', title, now, now);
    setSlug.run(slug, 'category', id);
  }

  for (const [id, slug, title, usd, photo, description] of products) {
    const file = `${imgDir}/${slug}.jpg`;
    if (!existsSync(file)) {
      execFileSync('curl', ['-sSf', '-o', file, `https://images.unsplash.com/photo-${photo}?w=1280&h=1280&fit=crop&q=80&fm=jpg`]);
    }
    setTranslation.run(randomUUID(), 'product', id, 'title', title, now, now);
    setTranslation.run(randomUUID(), 'product', id, 'description', description, now, now);
    setSlug.run(slug, 'product', id);

    const variant = db.prepare('SELECT id FROM ProductVariant WHERE productId = ? ORDER BY position LIMIT 1').get(id);
    setPrice.run(usd, variant.id, 'USD');
    setPrice.run(Math.round((usd * 0.92) / 100) * 100, variant.id, 'EUR');
    setPrice.run(Math.round((usd * 1.5) / 100) * 100, variant.id, 'AUD');
    db.prepare('UPDATE OrderLine SET title = ? WHERE variantId = ?').run(title, variant.id);
    // Cart lines snapshot the variant title (falls back to the raw variant id).
    setTranslation.run(randomUUID(), 'variant', variant.id, 'title', title, now, now);
    db.prepare('UPDATE CartLine SET titleSnapshot = ? WHERE variantId = ?').run(title, variant.id);

    db.prepare(
      'DELETE FROM Media WHERE id IN (SELECT mediaId FROM ProductMedia WHERE productId = ?)'
    ).run(id);
    const mediaId = `demo-media-${slug}`;
    db.prepare(
      `INSERT INTO Media (id, storageKey, url, mimeType, width, height, altText, createdAt, updatedAt)
       VALUES (?, ?, ?, 'image/jpeg', 1280, 1280, ?, ?, ?)`
    ).run(mediaId, `demo/${slug}.jpg`, `/demo/${slug}.jpg`, title, now, now);
    db.prepare(
      `INSERT INTO ProductMedia (id, productId, mediaId, position, createdAt) VALUES (?, ?, ?, 0, ?)`
    ).run(`demo-pm-${slug}`, id, mediaId, now);
  }

  db.prepare(`UPDATE Setting SET value = '"Cove"' WHERE key = 'shopName'`).run();
  // Only one email provider may be active; keep SendGrid installed but off.
  db.prepare(`UPDATE Setting SET value = ? WHERE key = 'enabledPlugins'`).run(
    JSON.stringify(['@bermooda/plugin-meilisearch', '@bermooda/plugin-resend'])
  );
});
tx();
console.log('demo data applied');
