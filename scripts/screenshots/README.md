# Homepage screenshots

The previews on the homepage (`src/assets/screens/*`) are screenshots of a real
bermooda shop running locally with a demo catalog. These scripts recreate that
shop and re-capture every image.

## 1. Set up the demo shop

From a bermooda checkout (Node ≥ 24):

```sh
npm install --legacy-peer-deps
npm run setup
npm run seed
bermooda plugin add @bermooda/plugin-meilisearch --enable
bermooda plugin add @bermooda/plugin-resend --enable
bermooda plugin add @bermooda/plugin-sendgrid
```

## 2. Apply the demo catalog

Renames the seed products into a homewares shop, downloads product photos from
Unsplash into the shop's `public/demo/`, and sets prices. Run it before starting
the dev server, since settings are cached.

```sh
cd scripts/screenshots
npm install
BERMOODA_DIR=/path/to/bermooda npm run demo-data
```

## 3. Capture

Start the shop (`npx react-router dev --host` in the bermooda checkout), then:

```sh
npm run capture
```

This writes the images straight into `src/assets/screens/`. Set
`CHROMIUM_PATH` if Playwright can't find a Chromium build, and `BERMOODA_URL`
if the shop isn't on `http://localhost:3000`. The admin login uses the seed
defaults (`admin@bermooda.dev` / `changeme123!`).
