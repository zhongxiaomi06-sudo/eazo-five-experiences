# D2-entry evidence status

| Input | Status | Evidence |
|---|---|---|
| Repository and fixed toolchain | implemented | package manager, tool versions, lockfile, CI |
| Shared host contract and fallbacks | implemented | contracts/platform packages and tests |
| Minimum fixture packs | implemented | each app `content/fixture.json` |
| DataManifestV1 | implemented | generated and validated per app |
| Fixture rights scope | implemented | each app `content/rights-ledger.tsv` |
| Test environments | configured | Vitest, Playwright mobile projects, CI |
| Feature flags and kill switch | implemented as fixture POC | platform package and tests |
| Atomic cache/rollback | implemented as deterministic POC | platform package and tests |
| Space rendering POC | implemented | app renderer with static fallback |
| Lab Worker POC | implemented | deterministic worker protocol |
| Production content and rights | blocked | fixture scope only |
| Real Eazo adapter | excluded from truth audit | interface and fakes only |
| Real-device performance | not run | requires target devices |
| D2-exit/D3/D4 | no-go | tests, content and human approvals absent |
