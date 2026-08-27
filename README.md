# Eazo Five Experiences

This repository is the controlled D2-entry engineering workspace for five mobile-first, standalone web experiences:

- Ideal Day Lab
- Scroll to Space
- Life Elsewhere Now
- Who Shared the Year
- Weird Matter Lab

It contains approved fixture content only. It is not a production content release and does not claim D2-exit, D3, or D4 approval.

## Start

Use Node 24.20.0 and pnpm 11.24.0.

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm dev:day
```

Each app builds to `apps/<app>/dist`. Run `pnpm export:apps` after a successful build to produce five standalone source bundles under `exports/`; generated exports are intentionally not committed.

## Scope

Included: fixed toolchain, five runnable shells, shared contracts/platform/UI packages, approved fixtures, manifest and rights validation, Fake/Web adapters, feature flags, atomic cache POC, space rendering POC, lab Worker POC, Vitest/Playwright configuration, and CI.

Excluded: production content, platform capability claims, production credentials, external publishing, advertising, authentication, and D3/D4 evidence.
