# Oraculihub

A Next.js learning platform with a firelit, Greek-inspired 3D shrine, four interactive pathways, AI courses, and career coaching. English first; Sinhala and Tamil are planned, not currently translated.

## Run locally

Requires **Node.js 22.13+** (the database uses Node's built-in SQLite driver).

```powershell
npm install
npm run setup
npm run dev
```

Open **http://localhost:3000**. Setup creates a unique authentication secret in the ignored `.env.local`, migrates Better Auth's tables, and seeds four sample courses with sixteen sample lessons. It does not create a default account or password.

If port 3000 is already occupied, use the existing server for this project or align `BETTER_AUTH_URL` and `APP_URL` with the chosen port. Keep one development server per checkout.

## What works

- Scroll-controlled 3D doors, camera travel, architectural geometry, animated firelight, embers, optional synthesized ambience, and four clickable pathway exhibits.
- Original shrine and god artwork, optimized to WebP, with locally bundled typography.
- Responsive public pages, a skip-animation route, keyboard navigation, a WebGL fallback, and reduced-motion support. Small screens use the direct pathway experience.
- Searchable/filterable catalog and dedicated pathway/course pages.
- Better Auth registration, sign-in, sign-out, sessions, profile updates, password changes, and configurable emailed recovery.
- Free enrollment, protected paid lessons, reading/video/resource support, server-graded quizzes, and persistent progress.
- Student dashboard, purchase history, and coaching request tracking.
- Administrator course/lesson editing, lesson ordering, quizzes, draft/publish controls, order review, and coaching status changes.
- PayHere checkout integration with server-calculated LKR prices, signature verification, idempotent enrollment, failed/pending/cancelled states, and chargeback access revocation.

Sample courses and prices are explicitly marked. Free sample courses can be explored after registration; paid sample courses cannot be purchased. All course material can be replaced through administration.

## Administrator access

1. Register your own account through the website.
2. From the project directory, run:

```powershell
npm run setup -- --admin=your-registered-email@example.com
```

3. Sign in and visit `/admin`. An administrator link also appears in your student dashboard.

Only the local setup command grants administrator access. Registration cannot assign itself an admin role.

To release a course, save its details, add and order its lessons, replace all sample material, turn off **Sample course**, and publish it. Enter prices in LKR; the database stores integer minor units.

## Payments and email

Copy the relevant names from `.env.example` into `.env.local`. Do not commit credentials or paste them into chat.

For PayHere, configure `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, and a public HTTPS `APP_URL`. Leave `PAYHERE_SANDBOX=true` while testing. Set `BETTER_AUTH_URL` to the same deployed origin. The callback endpoint is `/api/payments/notify`.

PayHere cannot call localhost. Use a deployed public test environment to verify provider-to-server notifications. Returning to an order page never marks an order paid: only a matching signed notification can grant enrollment. Signature and access behavior are covered by automated tests; an actual provider sandbox transaction still requires merchant credentials and a public callback URL.

For password recovery, configure `RESEND_API_KEY` and `EMAIL_FROM` with an authorized sender. Without these settings, the recovery screen explains that email is not yet connected. Sign-in and registration work locally without email delivery.

Coaching requests are persisted for administrator review. They do not send emails or create calendar appointments automatically.

## Artwork and 3D implementation

All five bitmap assets were created using the built-in image generation tool. Their original PNGs and optimized WebP files live in `public/images/`; prompts and art direction are in [docs/art-direction.md](docs/art-direction.md).

The doors, columns, braziers, plinths, camera movement, lighting, and particles are actual Three.js geometry. The gods are high-detail original artwork mapped to subdivided relief surfaces inside 3D niches, rather than fully volumetric character models. `src/components/temple-scene.tsx` isolates each exhibit so commissioned GLB statues can replace the reliefs without changing routes or the platform. This keeps the first build small and visually coherent.

## Checks

```powershell
npm run typecheck
npm test
npm run build
# With the development server running:
npm run smoke
```

Payment tests cover invalid signatures, mismatched prices/currency, duplicate callbacks, out-of-order states, and chargebacks. The smoke test creates and removes disposable accounts and records to verify authentication, origin checks, protected access, enrollment, progress, coaching, and administrator editing.

## Deployment

This is a **Node.js Next.js application**, not a static export. Deploy it to a Node host with a persistent writable volume for `DATABASE_PATH`. Run `npm run setup` against the deployed database before starting `npm run start`. Back up the SQLite database using an SQLite-aware backup process. The default SQLite setup is intended for one application instance; use a shared production database before scaling across instances or using an ephemeral/serverless filesystem.

Before opening real sales, supply the real curriculum and instructors, configure payment/email services, test a provider sandbox purchase, and finalize the business identity, contact details, delivery/refund terms, and privacy information currently marked as preview copy. The site is currently marked `noindex`; update the metadata in `src/app/layout.tsx` when ready for public indexing.

## Reference documentation

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Better Auth: Next.js integration](https://better-auth.com/docs/integrations/next)
- [Better Auth: SQLite](https://better-auth.com/docs/adapters/sqlite)
- [PayHere Checkout API](https://support.payhere.lk/api-%26-mobile-sdk/checkout-api)
