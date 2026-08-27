export type Era = 'BCE' | 'CE';
export type HistoricalYear = { era: Era; year: number };
export type DatePrecision = 'day' | 'month' | 'year' | 'decade' | 'century' | 'unknown';
export type DateCertainty = 'exact' | 'approximate' | 'uncertain' | 'both';
export type CalendarModel = 'gregorian' | 'julian' | 'other' | 'unspecified';

export type HistoricalDate = HistoricalYear & {
  displayOriginal: string;
  precision: DatePrecision;
  certainty: DateCertainty;
  calendar: CalendarModel;
  earliest?: HistoricalYear;
  latest?: HistoricalYear;
  sourceClaimIds: string[];
};

export type Person = {
  id: string;
  name: string;
  birth: HistoricalDate;
  death: HistoricalDate | null;
  livingStatusAsOf?: HistoricalYear;
  field: string;
  region: string;
  mark: string;
  summary: string;
  evidenceGrade: 'A' | 'B' | 'C';
  reviewStatus: 'provisional' | 'approved' | 'disputed' | 'blocked';
  sourceUrl: string;
  sourceLabel: string;
  profileClaimId: string;
  portraitLicense: 'fallback-original';
};

export const toSequenceYear = ({ era, year }: HistoricalYear) => (era === 'BCE' ? 1 - year : year);

export const fromSequenceYear = (value: number): HistoricalYear =>
  value <= 0 ? { era: 'BCE', year: Math.abs(value) + 1 } : { era: 'CE', year: value };

export const stepYear = (year: HistoricalYear, delta: number) =>
  fromSequenceYear(toSequenceYear(year) + delta);

export const formatYear = ({ era, year }: HistoricalYear) => (era === 'BCE' ? `${year} BCE` : `${year}`);

export const parseYear = (input: string): HistoricalYear | null => {
  const normalized = input
    .trim()
    .toUpperCase()
    .replace(/公元前\s*(\d+)\s*年?/g, '$1 BCE')
    .replace(/^前\s*(\d+)\s*年?$/g, '$1 BCE')
    .replace(/公元|年/g, '')
    .trim();
  const match = normalized.match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/);
  if (!match) return null;
  const raw = Number(match[1]);
  if (!Number.isInteger(raw)) return null;
  if (match[2] === 'BCE' || match[2] === 'BC' || raw < 0) {
    const year = Math.abs(raw);
    return year > 0 ? { era: 'BCE', year } : null;
  }
  return raw > 0 ? { era: 'CE', year: raw } : null;
};

export const isInRange = (year: HistoricalYear) => {
  const sequence = toSequenceYear(year);
  return sequence >= -499 && sequence <= 2026;
};

export const isAlive = (person: Person, year: HistoricalYear) => {
  if (person.evidenceGrade === 'C' || ['disputed', 'blocked'].includes(person.reviewStatus)) return false;
  const query = toSequenceYear(year);
  const birth = toSequenceYear(person.birth);
  const end = person.death
    ? toSequenceYear(person.death)
    : person.livingStatusAsOf
      ? toSequenceYear(person.livingStatusAsOf)
      : Number.NEGATIVE_INFINITY;
  return query >= birth && query <= end;
};

export const ageInYear = (person: Person, year: HistoricalYear) =>
  toSequenceYear(year) - toSequenceYear(person.birth);

export const ageLabelInYear = (person: Person, year: HistoricalYear) => {
  const maximum = ageInYear(person, year);
  if (maximum <= 0) return 'born this year';
  return `age ${maximum - 1}–${maximum} during this year`;
};

export type OverlapResult = {
  possible: { start: HistoricalYear; end: HistoricalYear } | null;
  definite: { start: HistoricalYear; end: HistoricalYear } | null;
};

const plainYear = ({ era, year }: HistoricalYear): HistoricalYear => ({ era, year });
const minYear = (a: HistoricalYear, b: HistoricalYear) =>
  plainYear(toSequenceYear(a) <= toSequenceYear(b) ? a : b);
const maxYear = (a: HistoricalYear, b: HistoricalYear) =>
  plainYear(toSequenceYear(a) >= toSequenceYear(b) ? a : b);

export const calculateOverlap = (left: Person, right: Person): OverlapResult => {
  if (!left.death || !right.death) return { possible: null, definite: null };
  const leftBirthMin = left.birth.earliest ?? left.birth;
  const leftBirthMax = left.birth.latest ?? left.birth;
  const rightBirthMin = right.birth.earliest ?? right.birth;
  const rightBirthMax = right.birth.latest ?? right.birth;
  const leftDeathMin = left.death.earliest ?? left.death;
  const leftDeathMax = left.death.latest ?? left.death;
  const rightDeathMin = right.death.earliest ?? right.death;
  const rightDeathMax = right.death.latest ?? right.death;

  const possibleStart = maxYear(leftBirthMin, rightBirthMin);
  const possibleEnd = minYear(leftDeathMax, rightDeathMax);
  const definiteStart = maxYear(leftBirthMax, rightBirthMax);
  const definiteEnd = minYear(leftDeathMin, rightDeathMin);

  return {
    possible:
      toSequenceYear(possibleStart) <= toSequenceYear(possibleEnd)
        ? { start: possibleStart, end: possibleEnd }
        : null,
    definite:
      toSequenceYear(definiteStart) <= toSequenceYear(definiteEnd)
        ? { start: definiteStart, end: definiteEnd }
        : null,
  };
};

export type PairResult = { people: Person[]; reasonCodes: string[]; score: number };

export const selectPair = (people: Person[], year: HistoricalYear, recentIds: string[] = []): PairResult => {
  const candidates = people.filter((person) => isAlive(person, year));
  let best: PairResult = { people: candidates.slice(0, 1), reasonCodes: [], score: 0 };
  for (let left = 0; left < candidates.length; left += 1) {
    for (let right = left + 1; right < candidates.length; right += 1) {
      const first = candidates[left]!;
      const second = candidates[right]!;
      const reasonCodes: string[] = [];
      let score = 0;
      if (first.field !== second.field) {
        score += 4;
        reasonCodes.push('DIFFERENT_FIELDS');
      }
      if (first.region !== second.region) {
        score += 3;
        reasonCodes.push('DISTANT_REGIONS');
      }
      const gap = Math.abs(toSequenceYear(first.birth) - toSequenceYear(second.birth));
      if (gap >= 10) {
        score += Math.min(3, Math.floor(gap / 15) + 1);
        reasonCodes.push('AGE_CONTRAST');
      }
      const repeats = recentIds.filter((id) => id === first.id || id === second.id).length;
      score -= repeats * 4;
      if (repeats) reasonCodes.push('RECENT_REPEAT_PENALTY');
      if (score > best.score || best.people.length < 2) best = { people: [first, second], reasonCodes, score };
    }
  }
  return best;
};
