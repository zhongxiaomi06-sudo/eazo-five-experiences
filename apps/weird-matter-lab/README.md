# Weird Matter Lab

Ridiculous goals. Real ideas. A mobile-first, deterministic matter sandbox for Eazo and the open web.

## Product scope

- 72 stable materials across seven content families.
- 12 touch-accessible tools and instruments.
- 30 teaching challenges with three hint levels and explicit `FACT`, `SIMPLIFIED`, and `FICTIONAL` boundaries.
- 12 free-play scenes.
- 256×144 TypedArray simulation in a dedicated Worker, fixed 30 TPS scheduling, seeded replay checksums, pause/step, undo/redo, adaptive quality, atomic local saves, safe Remix validation, and an offline service worker.
- Real `@eazo/sdk@0.22.8` integration for Eazo device detection and `share.compose`; local Remix export is the web/offline fallback.

## Run

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
```

For an Eazo production build, copy `.env.example` to `.env` and set the App ID issued by Eazo:

```text
VITE_EAZO_APP_ID=i_your_real_app_id
VITE_EAZO_PLATFORM_API_BASE=https://eazo.ai
```

No App ID is committed. A public repository must never contain a private Eazo key.

## Release state

`D2-exit / SELF_TEST candidate`. The engineering, content-shape, build, and emulated mobile gates pass. D3 remains blocked on an Eazo-issued production App ID and mobile-host acceptance run, four-tier physical-device performance evidence, named science/safety reviewer approval, and human comprehension/share-intent tests. See [AUDIT.md](./AUDIT.md).
