import { describe, expect, it } from 'vitest';
import {
  ageInYear,
  ageLabelInYear,
  calculateOverlap,
  fromSequenceYear,
  isAlive,
  parseYear,
  selectPair,
  stepYear,
  toSequenceYear,
  type HistoricalDate,
  type Person,
} from './domain';

const date = (era: 'BCE' | 'CE', year: number, claimId: string): HistoricalDate => ({
  era,
  year,
  displayOriginal: String(year),
  precision: 'year',
  certainty: 'exact',
  calendar: 'unspecified',
  sourceClaimIds: [claimId],
});

const base: Person = {
  id: 'x',
  name: 'X',
  birth: date('BCE', 2, 'birth-x'),
  death: date('CE', 2, 'death-x'),
  field: 'Art',
  region: 'A',
  mark: 'X',
  summary: 'x',
  evidenceGrade: 'B',
  reviewStatus: 'provisional',
  sourceUrl: 'https://example.com',
  sourceLabel: 'Source',
  profileClaimId: 'profile-x',
  portraitLicense: 'fallback-original',
};

describe('historical year', () => {
  it('crosses BCE to CE without year zero', () => {
    expect(stepYear({ era: 'BCE', year: 1 }, 1)).toEqual({ era: 'CE', year: 1 });
  });

  it('round trips sequence years', () => {
    [-500, -1, 1, 2026].forEach((year) => expect(toSequenceYear(fromSequenceYear(year))).toBe(year));
  });

  it('parses all supported formats', () => {
    expect(parseYear('500 BCE')).toEqual({ era: 'BCE', year: 500 });
    expect(parseYear('公元前500年')).toEqual({ era: 'BCE', year: 500 });
    expect(parseYear('-500')).toEqual({ era: 'BCE', year: 500 });
    expect(parseYear('2026')).toEqual({ era: 'CE', year: 2026 });
  });

  it('calculates cross-era age', () => {
    expect(ageInYear(base, { era: 'CE', year: 1 })).toBe(2);
    expect(ageLabelInYear(base, { era: 'CE', year: 1 })).toBe('age 1–2 during this year');
  });
});

describe('filter, overlap, and pairing', () => {
  it('bounds a living-status claim', () => {
    expect(isAlive(base, { era: 'CE', year: 1 })).toBe(true);
    const living: Person = {
      ...base,
      id: 'living',
      birth: date('CE', 1980, 'birth-living'),
      death: null,
      livingStatusAsOf: { era: 'CE', year: 2026 },
    };
    expect(isAlive(living, { era: 'CE', year: 2026 })).toBe(true);
    expect(isAlive(living, { era: 'CE', year: 2027 })).toBe(false);
  });

  it('keeps possible and definite overlap separate', () => {
    const uncertain: Person = {
      ...base,
      id: 'uncertain',
      birth: {
        ...date('BCE', 4, 'birth-uncertain'),
        certainty: 'approximate',
        earliest: { era: 'BCE', year: 6 },
        latest: { era: 'BCE', year: 2 },
      },
      death: date('CE', 3, 'death-uncertain'),
    };
    const overlap = calculateOverlap(base, uncertain);
    expect(overlap.possible).toEqual({ start: { era: 'BCE', year: 2 }, end: { era: 'CE', year: 2 } });
    expect(overlap.definite).toEqual({ start: { era: 'BCE', year: 2 }, end: { era: 'CE', year: 2 } });
  });

  it('excludes disputed evidence and scores deterministically', () => {
    const people = [
      base,
      { ...base, id: 'b', field: 'Science', region: 'B', birth: date('BCE', 20, 'birth-b') },
      { ...base, id: 'c', evidenceGrade: 'C' as const, reviewStatus: 'disputed' as const },
    ];
    const first = selectPair(people, { era: 'CE', year: 1 });
    const second = selectPair(people, { era: 'CE', year: 1 });
    expect(first.people.map((person) => person.id)).toEqual(['x', 'b']);
    expect(first).toEqual(second);
    expect(first.reasonCodes).toContain('DIFFERENT_FIELDS');
  });
});
