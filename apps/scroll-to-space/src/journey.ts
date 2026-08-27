import { stageIndexForProgress } from './story';

export const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export const mergeInput = (progress: number, delta: number) => {
  const direction = Math.sign(delta);
  const magnitude = Math.min(0.0299, Math.max(0.004, Math.abs(delta) / 1600));
  return clampProgress(Math.round((progress + direction * magnitude) * 1_000_000) / 1_000_000);
};

export type QualityState = 'full3d' | 'degraded3d' | 'static';

export const nextQualityState = (p95Fps: number, current: QualityState): QualityState => {
  if (current === 'static') return 'static';
  if (p95Fps < 24 && current === 'full3d') return 'degraded3d';
  if (p95Fps < 30 && current === 'degraded3d') return 'static';
  return current;
};

export const stageChanged = (before: number, after: number) => stageIndexForProgress(before) !== stageIndexForProgress(after);
