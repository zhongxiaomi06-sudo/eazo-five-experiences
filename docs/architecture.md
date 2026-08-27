# Architecture

The source of truth is one pnpm workspace so contracts do not drift. Every app imports only versioned workspace packages and owns its business rules and fixture content.

```text
apps/*                    independently built static sites
packages/contracts       schemas, error codes, host and manifest contracts
packages/platform        Fake/Web adapters, flags, atomic cache
packages/ui              shared accessible shell and tokens
scripts                   manifest validation and standalone export
```

Domain code must not import a concrete Eazo API. It calls `EazoHostPort`; the browser selects `FakeEazoAdapter` in explicit fixture mode and `WebFallbackAdapter` otherwise.

The export pipeline replaces workspace dependencies with copied package source and creates one self-contained source bundle per app. GitHub publication remains a separate human-authorized action.
