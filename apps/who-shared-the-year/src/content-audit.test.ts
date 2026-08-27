import { describe, expect, it } from 'vitest';
import { auditContent, contrastCards, getPreviewCard, goldCards } from './content-audit';

describe('V3 content audit', () => {
  it('has no structural errors while preserving provisional warnings', () => {
    const issues = auditContent();
    expect(issues.filter((issue) => issue.severity === 'error')).toEqual([]);
    expect(issues.filter((issue) => issue.code === 'PERSON_PROVISIONAL')).toHaveLength(33);
  });

  it('surfaces only the evidence-reviewed 1564 candidate in preview', () => {
    expect(getPreviewCard({ era: 'CE', year: 1564 })?.id).toBe('relay-1564-michelangelo-galileo');
    expect(getPreviewCard({ era: 'CE', year: 1845 })).toBeUndefined();
  });

  it('does not call a card gold before real blind-test results pass', () => {
    expect(goldCards()).toEqual([]);
    expect(contrastCards.find((card) => card.anchorYear.year === 1564)?.userTest.status).toBe('not-started');
  });

  it('keeps the three previously misleading cards withdrawn', () => {
    for (const year of [1510, 1610, 1930]) {
      const card = contrastCards.find((candidate) => candidate.anchorYear.year === year);
      expect(card?.evidenceStatus).toBe('blocked');
      expect(card?.releaseStatus).toBe('withdrawn');
    }
  });
});
