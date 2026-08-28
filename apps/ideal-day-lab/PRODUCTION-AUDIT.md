# Ideal Day Lab — production audit

Audit date: 2026-08-28
Target: D2-exit candidate; D3/D4 not claimed
Product requirements in scope: DAY-REQ-001 through DAY-REQ-008

## Outcome

The implementation is complete enough to enter `D2-exit-candidate`. It is not authorized for D3 or D4 because those gates require evidence that cannot be produced by code alone: two physical-device runs, North American English review, human `aestheticLevel=enjoy` signature, target-user share-intent testing, Eazo Mobile AI/speech acceptance, and release approval.

## Requirement audit

| Requirement | Implementation evidence | Automated evidence | Result |
|---|---|---|---|
| DAY-REQ-001 | Chinese-first input shell; enhancements load after first interaction | Playwright on Pixel 7, iPhone 12, iPad Pro and desktop profiles | PASS (emulated) |
| DAY-REQ-002 | Text up to 2,000 characters; one speech request per session; text remains after denial; IndexedDB repository | Mobile E2E build/edit/save path | PASS WITH CONDITION: Eazo-native transcription needs host acceptance |
| DAY-REQ-003 | Five-second host budget; strict key/category/time validation; inert rendering; deterministic local fallback | Vitest rejects unknown/HTML-like fields and accepts strict 1,440-minute draft | PASS |
| DAY-REQ-004 | Integer-minute contiguous blocks, shared-boundary equal exchange, split, adjacent-open merge, 1/5/15/30 snap, 50 undo states, keyboard buttons | Vitest boundary, split, merge and `TIME_OVERLAP`; multi-viewport E2E | PASS |
| DAY-REQ-005 | Twenty-record approved editorial ledger; unit/formula/source/rounding disclosure; five live comparisons | Vitest exact `60×365÷120=182.5` | PASS |
| DAY-REQ-006 | IndexedDB plan limit 20; no automatic eviction; duplicate, rename, reversible delete | Library E2E and repository guard | PASS |
| DAY-REQ-007 | Share sanitizer only emits category/minutes/color/comparison IDs; official `@eazo/sdk@0.22.8` compose; JSON fallback | Privacy snapshot excludes source text/title/notes/plan/block IDs | PASS WITH CONDITION: Eazo Mobile acceptance pending |
| DAY-REQ-008 | Local classifier/editor/comparisons/IndexedDB have no network dependency; production service worker uses versioned cache | Production build and offline architecture inspection | PASS WITH CONDITION: physical-device offline reopen pending |

## Design and accessibility audit

- Automated viewport audit covers 320×568, 360×800, 390×667, 430×932, 768×1024, 844×390, 1024×768 and 1440×1000; horizontal overflow = 0 px.
- First viewport answers what it is, what to do, and what the user gets; primary action is visible without scrolling.
- Visual system: warm paper ground, deep hazy-blue task accent, warm-orange emotional phrase, mono evidence labels, soft-film day reel and thin-grid time structure.
- Existing layout and element hierarchy are preserved; the day reel now works as a three-scene photo diary with collection progress and a completion state, while the existing inspiration area works as a six-card, two-deck “生活签” interaction.
- Primary, muted and metadata text meet WCAG AA; paper-card text meets AAA; component boundaries meet 3:1. Touch controls have a 44 px minimum and every duration adjustment has non-drag buttons.
- Mobile composition includes safe-area-aware top and bottom spacing, fixed navigation clearance, 16 px form controls to prevent iOS focus zoom, short-screen compression, touch scroll snapping and a dedicated phone-landscape layout. The landscape layout prioritizes input and generation above the fixed navigation while the photo diary remains available in portrait.
- Mobile playtesting inside the Eazo handoff shell verified the collection, generation, boundary adjustment, undo, split, save, reversible delete and restore loop. The sticky editor toolbar honors the live `--eazo-handoff-top` offset, and split blocks expose unique segment/time-based accessible names even when their titles match.
- Timeline has a full text alternative. State changes are announced through a polite live region. Reduced-motion disables transitions.
- Default source content, categories and comparison narratives are Chinese. Business rules remain language-independent; voice input follows the browser locale with `zh-CN` fallback.

## Engineering and privacy audit

- Production Eazo share integration uses the official SDK and loads its large compose surface only on demand; initial application JavaScript is about 71 KB gzip.
- No account, identity, raw audio, source text, title, notes, or device ID enters the default share payload.
- IndexedDB schema version is 2. Invalid stored plans are excluded rather than silently mutated.
- The service worker is cache-first after a successful response and falls back to the application shell offline.
- The social preview is a project-authored 1200×630 asset and is recorded in the rights ledger.

## Test run summary

- Ideal Day domain tests: 12 passed; full workspace unit/contract suite: 61 passed.
- Ideal Day end-to-end: 44 passed across Pixel 7, iPhone 12, iPad Pro and desktop profiles, including the photo-diary collection loop, inspiration deck, reduced-motion fallback, compact portrait, phone-landscape and Eazo sticky-handoff safety checks.
- TypeScript: passed.
- Lint: passed.
- Production build: passed.
- Responsive matrix: 320–1440 px compose, editor and scale screens plus 844×390 phone landscape; no horizontal overflow. Three video loops load ready, remain muted and play inline in portrait, with a static reduced-motion fallback.

## Gate decision

- D2-entry: PASS.
- D2-exit: CANDIDATE / PASS WITH CONDITIONS. Remaining conditions are listed above and are not safely inferable.
- D3: BLOCKED by human/device/Eazo acceptance evidence.
- D4: BLOCKED by D3 plus release authorization, immutable production URL, monitoring and post-release review.
