# Product 4 — Alpha V3 development audit

Date: 2026-08-27  
Stage: `D3 BUILDING / PASS WITH CONDITIONS`  
Release gates: `D3 SELF_TEST = FAIL`, `D4 READY = FAIL`

## Delivered in this increment

- Added executable historical-date metadata: precision, certainty, calendar model, possible range, and claim edges.
- Added separate possible/definite overlap calculation without a historical year zero.
- Replaced false single-year age precision with a range (for example, 88–89 during 1564) or “born this year.”
- Added source, claim, relationship, contrast-card, review, withdrawal, and blind-test contracts.
- Migrated all 33 existing people from the unsupported `A/approved` label to honest `B/provisional` status.
- Withdrew the previous 1510, 1610, and 1930 copy because each referred to an absent third person or group.
- Blocked the 1845 Lovelace/Douglass card because its Lovelace premise depended on the 1843 Notes rather than a reviewed 1845 claim.
- Added one evidence-reviewed **candidate**, not a gold/release card: Michelangelo died on 18 February 1564 and Galileo was born on 15 February 1564.
- Added claim-level institutional links to The Metropolitan Museum of Art and Museo Galileo.
- Added a 24-slot, three-arm blind-test protocol. Results remain empty; no synthetic participant data was created.
- Removed the Google Fonts runtime request. The app now uses local/system font fallbacks.

## Visual and material increment

- Replaced the text-only opening with an original 4:5 museum-editorial collage: marble hand, chisel, red thread, early telescope, and lunar diagram.
- Reused deliberate left/right crops of that asset in the two 1564 person cards; these are object metaphors, not fake historical portraits.
- Rebuilt 320–700px layout: compact sticky navigation, 52svh art panel, mobile display scale, horizontal person cards, left-aligned evidence panel, 48px+ actions, and scroll-snap discovery cards.
- Added a rights-ledger entry for the generated project asset and kept the 3 MB source PNG out of the shipping directory; the optimized JPEG is approximately 675 KB.
- Added a 24-item contrast discovery pool with at least two source leads per candidate. Only BLIND-01 is evidence-reviewed; two trauma-sensitive candidates are explicitly blocked behind ethical review.

## Automated verification

| Check | Result | Evidence |
|---|---:|---|
| Domain + V3 content audit | **11/11 PASS** | BCE/CE, no year zero, living bound, overlap, deterministic pairing, content edges, withdrawal and blind-test gates |
| TypeScript | **PASS** | No type errors |
| Production build | **PASS** | JS 218.10 kB / 70.05 kB gzip; CSS 17.91 kB / 5.01 kB gzip; hero JPEG ≈675 KB |
| Diff whitespace audit | **PASS** | `git diff --check` returned no error |

## Browser audit

Environment: Chrome, local Vite build, viewport override 390×844.

| Task | Result | Observation |
|---|---:|---|
| 1564 candidate | PASS | Exactly Michelangelo + Galileo, evidence-reviewed candidate and user-testing-pending labels |
| Claim sources | PASS | The Met and Museo Galileo links visible on the card |
| Mobile reflow | PASS | `scrollWidth = clientWidth = 375`; no horizontal overflow |
| Withdrawn 1845 card | PASS | Falls back to exploratory overlap; zero evidence links; explicitly not a gold pairing |
| BCE → CE | PASS | 1 BCE + next year becomes 1 CE; no visible year zero |
| Detail disclosure | PASS | Grade B, provisional status, year precision, unspecified calendar and typographic fallback visible |
| Console | PASS | No page console errors |

Additional visual checks: 390, 360 and 320px viewport overrides; no page-level horizontal overflow, 320px person cards remain readable, and primary actions measure 49–53px high.

The connected Chrome instance automatically translated visible English into Chinese during screenshot review. DOM assertions were performed against the application state; translation-extension assets were excluded from app network conclusions.

## Remaining blockers

1. Only 1/50–80 evidence-reviewed candidate cards exists; 0 cards have passed real blind testing, so gold cards remain 0.
2. All 33 profiles still need claim-level independent-source migration before production approval.
3. The remaining 23 blind-test candidates need content and the 12–20 target participants must be recruited externally.
4. Real Eazo container acceptance, first-install offline, update rollback, iOS/Android, VoiceOver/TalkBack, performance/SBOM and human history/rights approval remain open.

No production or D4 claim is authorized by this audit.
