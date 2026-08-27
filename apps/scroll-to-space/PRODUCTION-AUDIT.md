# Scroll to Space — Production Test & Audit

**Audit date:** 2026-08-27  
**Release:** 1.0.0-rc.1  
**Stage:** D2-exit  
**Decision:** CONDITIONAL PASS; D3 is not yet authorized.

## Executive result

The Product 2 production candidate is functionally complete against `SPACE-REQ-001`–`008`. Six domain/contract tests and twelve mobile browser journeys pass. Production build, TypeScript, lint, content-manifest integrity, mobile overflow, source completeness, non-visual navigation, static fallback, audio denial, and Eazo share entry are verified.

The program-level matrix contains 46 requirements across five separate products. This audit does not mislabel the other 38 products' requirements as Product 2 work; Product 2 owns eight requirements, all eight are implemented and tested here.

## Requirement evidence

| Requirement | Implemented evidence | Automated evidence | Result |
|---|---|---|---|
| SPACE-REQ-001 | Beijing/DC selector, local preference, zero geolocation calls, immediate CTA | Pixel + iPhone location-call assertion | PASS |
| SPACE-REQ-002 | User-gesture audio start; sound/haptic toggles; blocked state and persistent explanation | Forced `AudioContext` denial on Pixel + iPhone; progress remains non-zero | PASS |
| SPACE-REQ-003 | Wheel batching, keyboard, reverse input, fixed chapter track, per-step cap `0.0299` | Domain monotonicity/reverse/cap test; five-stage browser journey | PASS |
| SPACE-REQ-004 | Metres internally; m/km formatting; piecewise logarithmic mapping; scale disclosure | Unit mapping test; S4 dialog asserts `heightM`, mapping, source, date | PASS |
| SPACE-REQ-005 | Exactly 20 approved cards; 12 per journey; unseen-first scheduler; no duplicates | Schema/source/date completeness and second-journey scheduler tests | PASS |
| SPACE-REQ-006 | Three unique city assets and three copy IDs per city; shared upper-atmosphere claim IDs | Machine comparison test plus both selectable city openings | PASS |
| SPACE-REQ-007 | WebGL1, lower-pixel mode, Canvas2D/static route, reduced-motion default, progress preserved | Static-switch test on Pixel + iPhone; deterministic governor test | PASS WITH DEVICE GATE |
| SPACE-REQ-008 | Local progress/content history, Service Worker cache, offline-safe static route, Eazo/browser share fallback | Five-stage completion and share CTA on Pixel + iPhone; manifest integrity | PASS WITH HOST GATE |

## Production test record

| Suite | Environment | Result |
|---|---|---|
| Domain and content contracts | Vitest / Node 24.20.0 | 6/6 PASS |
| Product mobile journey | Playwright Pixel 7 / Chromium | 6/6 PASS |
| Product mobile journey | Playwright iPhone 12 / WebKit | 6/6 PASS |
| Type safety | TypeScript 6.0.3 strict | PASS |
| Static analysis | Oxlint, warnings denied | PASS |
| Content integrity | DataManifest SHA-256 / rights / total bytes | PASS; 4 files, 1,845,173 bytes |
| Production build | Vite 8.2.2 | PASS |
| JavaScript budget | Production gzip | 313.23 KB / 700 KB limit, PASS |
| Mandatory cache budget | Manifest total | 1.85 MB / 25 MB limit, PASS |
| Visual QA | Chrome desktop 1440×756 | PASS; no clipping/overlap observed |
| Visual QA | Chrome responsive 390×844 | PASS; CTA in first viewport; no horizontal overflow |

The monorepo-wide `pnpm verify` was also attempted. Product 2 passed its portion; the aggregate command stopped in concurrently modified Product 5 code at `Navigator.deviceMemory`. That unrelated error is not counted as a Product 2 failure and is intentionally not edited in this repository.

## Content and science audit

- All 20 cards contain the required schema fields and an approval state.
- Atmosphere, layer, meteor, aurora, Kármán-line, and ISS claims point to NASA; jet-stream altitude points to NOAA.
- The UI explicitly states that 100 km is a convention rather than a natural wall.
- The UI labels the visual scale as logarithmic and objects as illustrative.
- Beijing/DC artwork is procedural CSS/WebGL authored for this product; no street-view imagery or third-party city models ship.
- The social image is a single project-generated asset with its generation ID recorded in the rights ledger.
- Runtime Google Fonts were removed. The core offline journey has zero third-party runtime asset requests; source links open only after user action.

## Eazo integration audit

- `@eazo/sdk@0.22.8` is pinned in the lockfile.
- `<EazoProvider>` mounts with app ID `scroll-to-space` and platform base `https://eazo.ai`.
- Runtime presentation distinguishes Eazo Mobile from Web preview through the official device capability.
- Completion calls `share.compose` with a privacy-limited summary, `sourceAppId`, and relative `targetPath`.
- Plain Web receives the SDK fallback, then copies a local summary; Eazo failure never loses progress.
- No Eazo secret, private key, access key, user ID, precise location, or device fingerprint is bundled.

This verifies a real SDK integration, not a completed Eazo Creator import. Creator-side import, app registration, and in-host acceptance remain an external release gate.

## Eazo aesthetic review

| Criterion | Evidence | Result |
|---|---|---|
| Three-second comprehension | One statement, two city choices, one acid-green CTA; CTA visible at 390×844 | PASS |
| Mobile-first hierarchy | 58 px compact header, first-viewport launch action, 44 px journey controls, safe responsive rails | PASS |
| Distinctive visual language | Near-black scientific editorial field, chartreuse instrumentation, ember typography, procedural Earth limb | PASS |
| Core delight | City lights fall away into a curved Earth; motion materially communicates scale | PASS |
| Useful result | 408 km completion summary, discoveries count, sources, switch-city comparison | PASS |
| Remix stimulus | City choice changes opening assets/copy and prompts a second journey | PASS |
| Platform highlight | Real Eazo compose entry plus Web fallback; WebGL has a complete static route | PASS |
| Non-template quality | Custom launch composition, shader, stage rail, altimeter, result panel, and social card | PASS |

Automated and browser review support an **S candidate**. Formal S/S+ certification still requires the named human design Reviewer and share-intent/user-study evidence; this audit does not fabricate either.

## Remaining gates before D3

1. Run three complete two-minute journeys on physical iPhone 12, Pixel 6, and one low-end Android; record FPS P95, touch latency P95, memory, thermals, context loss, audio, vibration, and recovery.
2. Import the exact release artifact into Eazo Creator, bind/confirm the final platform app ID, run share compose in Eazo Mobile, and archive the acceptance evidence.
3. Obtain human science/content and design Reviewer sign-off; run the 8-person comprehension test and share-intent test.
4. Only after all three gates pass may the workflow advance from D2-exit to D3.
