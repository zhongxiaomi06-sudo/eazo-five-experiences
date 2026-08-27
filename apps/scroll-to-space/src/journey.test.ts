import { describe, expect, test } from 'vitest';
import { cardsForJourney, cities, knowledgeCards, progressToHeight, stageIndexForProgress, stages } from './story';
import { mergeInput, nextQualityState } from './journey';

describe('Scroll to Space production contracts', () => {
  test('caps every merged input frame at 0.03 and supports reverse travel', () => {
    let progress = 0;
    const values: number[] = [];
    for (let i = 0; i < 40; i += 1) {
      const next = mergeInput(progress, 5000);
      expect(next - progress).toBeLessThanOrEqual(0.03);
      values.push(next);
      progress = next;
    }
    expect(values.every((value, index) => index === 0 || value >= values[index - 1]!)).toBe(true);
    expect(mergeInput(progress, -5000)).toBeLessThan(progress);
  });

  test('maps progress logarithmically and preserves ordered stage boundaries', () => {
    expect(progressToHeight(0)).toBe(0);
    expect(progressToHeight(1)).toBe(408_000);
    expect([0, .2, .4, .6, .999].map(stageIndexForProgress)).toEqual([0, 1, 2, 3, 4]);
  });

  test('ships exactly 20 fully sourced, approved cards', () => {
    expect(knowledgeCards).toHaveLength(20);
    for (const card of knowledgeCards) {
      expect(card).toMatchObject({ reviewStatus: 'approved' });
      expect(card.sourceUrl).toBeTruthy();
      expect(card.sourceTitle).toBeTruthy();
      expect(card.sourceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(card.assetId).toBeTruthy();
    }
  });

  test('prioritizes unseen content with no within-journey duplicates', () => {
    const first = cardsForJourney('beijing');
    const second = cardsForJourney('beijing', first.map((card) => card.id));
    expect(first).toHaveLength(12);
    expect(new Set(second.map((card) => card.id)).size).toBe(second.length);
    expect(second.filter((card) => !first.some((seen) => seen.id === card.id)).length).toBeGreaterThanOrEqual(4);
  });

  test('keeps the two city openings distinct and upper-atmosphere claims shared', () => {
    expect(new Set(cities.beijing.assets)).not.toEqual(new Set(cities['washington-dc'].assets));
    expect(new Set(cities.beijing.copyIds)).not.toEqual(new Set(cities['washington-dc'].copyIds));
    expect(cities.beijing.assets).toHaveLength(3);
    expect(cities['washington-dc'].assets).toHaveLength(3);
    expect(stages.slice(2).map((stage) => stage.claimId)).toEqual(['CLAIM-S3-STRATOSPHERE', 'CLAIM-S4-KARMAN', 'CLAIM-S5-ORBIT']);
  });

  test('degrades deterministically without changing journey state', () => {
    expect(nextQualityState(20, 'full3d')).toBe('degraded3d');
    expect(nextQualityState(28, 'degraded3d')).toBe('static');
    expect(nextQualityState(40, 'degraded3d')).toBe('degraded3d');
  });
});
