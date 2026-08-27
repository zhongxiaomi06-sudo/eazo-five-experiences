# Scroll to Space / 一路滚到太空

An Eazo-native, mobile-first scale story. Choose Beijing or Washington, D.C., then roll from the street to 408 km through five atmospheric chapters and 20 sourced discoveries.

This repository contains the production candidate for Product 2 in the Eazo Five Experiences program. It is in **D2-exit**: implementation and automated production checks are complete; physical-device performance runs and Eazo Creator import acceptance remain the external gates before D3.

## What ships

- Two distinct procedural city openings; no GPS or precise-location access.
- A fixed cinematic WebGL journey with keyboard, touch/button, reverse, and chapter navigation.
- A piecewise-logarithmic height model with real metres/kilometres always visible.
- 20 approved knowledge cards with source title, URL, review date, and rights entry.
- Audio and haptic controls that never block the core journey.
- Canvas 2D/static fallback, reduced-motion route, progress recovery, and offline Service Worker.
- Real `@eazo/sdk` integration for Eazo Mobile runtime detection and `share.compose`, with a safe browser fallback.
- A completed journey report with Eazo share, roll-again, and switch-city actions.

## Run

Requires Node 24.20.0 and pnpm 11.24.0.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm test:e2e
```

The app builds to `apps/scroll-to-space/dist`.

## Release truth

Automated Pixel 7/Chromium and iPhone 12/WebKit journeys pass. This is not a claim that physical iPhone, Pixel, or low-end Android GPU profiling has been completed. See [PRODUCTION-AUDIT.md](./PRODUCTION-AUDIT.md) for the exact evidence and remaining gates.

---

## 中文说明

这是 Eazo 五个标杆体验中的产品 2。用户选择北京或华盛顿，从城市地面一路上升到 408 km 近地轨道，经过五个大气层级并解锁 20 张有来源的科普卡。

当前进入 **D2-exit**：产品 2 的开发、自动化测试、双移动端模拟、内容和权利审计已完成；在进入 D3 前，仍需完成真机 GPU/音频/震动测试和 Eazo Creator 实际导入验收。
