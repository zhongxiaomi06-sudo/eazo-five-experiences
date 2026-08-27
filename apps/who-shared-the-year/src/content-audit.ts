import { people } from './people';
import type { HistoricalYear } from './domain';

export type SourceTier = 'A1' | 'A2' | 'B' | 'C';
export type SourceRecord = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  tier: SourceTier;
  independenceGroup: string;
  accessedAt: string;
  rightsBasis: 'link-only' | 'CC0' | 'original';
};

export type ClaimStatus = 'provisional' | 'reviewed' | 'contested' | 'rejected';
export type ClaimRecord = {
  id: string;
  personId: string;
  type: 'profile' | 'birth' | 'death' | 'year-event';
  text: string;
  anchorYear?: HistoricalYear;
  status: ClaimStatus;
  evidenceGrade: 'A' | 'B' | 'C';
  sourceIds: string[];
  reviewer?: string;
  reviewedAt?: string;
};

export type HistoricalRelation =
  | 'same-year'
  | 'overlapped'
  | 'plausible-contact'
  | 'documented-contact'
  | 'documented-influence';

export type BlindTestSummary = {
  status: 'not-started' | 'recruiting' | 'complete';
  sampleSize: number;
  surpriseMedian?: number;
  clarityPassRate?: number;
  confidenceMedian?: number;
  immediateRecallRate?: number;
  relationMisreadCount?: number;
};

export type ContrastCard = {
  id: string;
  anchorYear: HistoricalYear;
  personIds: [string, string] | [string, string, string];
  relation: HistoricalRelation;
  bigIdea: string;
  claimIds: string[];
  evidenceStatus: 'draft' | 'reviewed' | 'blocked';
  releaseStatus: 'candidate' | 'approved' | 'withdrawn';
  misleadingRisks: string[];
  reviewers: string[];
  blockers: string[];
  userTest: BlindTestSummary;
};

const accessedAt = '2026-08-27';

const britannicaSources: SourceRecord[] = people.map((person) => ({
  id: `britannica-${person.id}`,
  title: `${person.name} biography`,
  publisher: 'Encyclopaedia Britannica',
  url: person.sourceUrl,
  tier: 'B',
  independenceGroup: `britannica-${person.id}`,
  accessedAt,
  rightsBasis: 'link-only',
}));

export const sources: SourceRecord[] = [
  ...britannicaSources,
  {
    id: 'met-michelangelo-1564',
    title: 'Michelangelo: Divine Draftsman and Designer — Exhibition Galleries',
    publisher: 'The Metropolitan Museum of Art',
    url: 'https://www.metmuseum.org/exhibitions/listings/2017/michelangelo/exhibition-galleries',
    tier: 'A2',
    independenceGroup: 'met-michelangelo-catalogue',
    accessedAt,
    rightsBasis: 'link-only',
  },
  {
    id: 'museo-galileo-life-1564',
    title: "Chronology of the main events of Galileo's biography",
    publisher: 'Museo Galileo',
    url: 'https://www.museogalileo.it/en/galileo/life.html',
    tier: 'A2',
    independenceGroup: 'museo-galileo-chronology',
    accessedAt,
    rightsBasis: 'link-only',
  },
];

const provisionalClaims: ClaimRecord[] = people.flatMap((person) => {
  const sourceIds = [`britannica-${person.id}`];
  return [
    {
      id: person.profileClaimId,
      personId: person.id,
      type: 'profile',
      text: person.summary,
      status: 'provisional',
      evidenceGrade: 'B',
      sourceIds,
    },
    {
      id: person.birth.sourceClaimIds[0]!,
      personId: person.id,
      type: 'birth',
      text: `${person.name} was born in ${person.birth.displayOriginal}.`,
      status: 'provisional',
      evidenceGrade: 'B',
      sourceIds,
    },
    ...(person.death
      ? [
          {
            id: person.death.sourceClaimIds[0]!,
            personId: person.id,
            type: 'death' as const,
            text: `${person.name} died in ${person.death.displayOriginal}.`,
            status: 'provisional' as const,
            evidenceGrade: 'B' as const,
            sourceIds,
          },
        ]
      : []),
  ];
});

export const claims: ClaimRecord[] = [
  ...provisionalClaims,
  {
    id: 'event-michelangelo-death-1564-02-18',
    personId: 'michelangelo',
    type: 'year-event',
    text: 'Michelangelo died in Rome on 18 February 1564.',
    anchorYear: { era: 'CE', year: 1564 },
    status: 'reviewed',
    evidenceGrade: 'B',
    sourceIds: ['met-michelangelo-1564'],
    reviewer: 'content-audit-v3',
    reviewedAt: accessedAt,
  },
  {
    id: 'event-galileo-birth-1564-02-15',
    personId: 'galileo',
    type: 'year-event',
    text: 'Galileo Galilei was born in Pisa on 15 February 1564.',
    anchorYear: { era: 'CE', year: 1564 },
    status: 'reviewed',
    evidenceGrade: 'B',
    sourceIds: ['museo-galileo-life-1564'],
    reviewer: 'content-audit-v3',
    reviewedAt: accessedAt,
  },
];

export const contrastCards: ContrastCard[] = [
  {
    id: 'relay-1564-michelangelo-galileo',
    anchorYear: { era: 'CE', year: 1564 },
    personIds: ['michelangelo', 'galileo'],
    relation: 'same-year',
    bigIdea:
      'Galileo was born on 15 February 1564. Michelangelo died three days later—a precise handoff between two lives we usually place in different chapters.',
    claimIds: ['event-michelangelo-death-1564-02-18', 'event-galileo-birth-1564-02-15'],
    evidenceStatus: 'reviewed',
    releaseStatus: 'candidate',
    misleadingRisks: ['Same-year does not imply contact or influence.'],
    reviewers: ['content-audit-v3'],
    blockers: ['Target-user blind test has not been completed.'],
    userTest: { status: 'not-started', sampleSize: 0 },
  },
  {
    id: 'draft-1510-leonardo-copernicus',
    anchorYear: { era: 'CE', year: 1510 },
    personIds: ['leonardo', 'copernicus'],
    relation: 'overlapped',
    bigIdea: 'Leonardo da Vinci and Nicolaus Copernicus were both alive in 1510.',
    claimIds: [],
    evidenceStatus: 'blocked',
    releaseStatus: 'withdrawn',
    misleadingRisks: ['The previous copy referred to an absent third person.'],
    reviewers: [],
    blockers: ['No reviewed year-specific claim for either person.'],
    userTest: { status: 'not-started', sampleSize: 0 },
  },
  {
    id: 'draft-1610-shakespeare-galileo',
    anchorYear: { era: 'CE', year: 1610 },
    personIds: ['shakespeare', 'galileo'],
    relation: 'same-year',
    bigIdea: 'Shakespeare and Galileo were both working in 1610.',
    claimIds: [],
    evidenceStatus: 'blocked',
    releaseStatus: 'withdrawn',
    misleadingRisks: ['The previous copy referred to an absent Japanese political event.'],
    reviewers: [],
    blockers: ['Both 1610 activity claims need independent review.'],
    userTest: { status: 'not-started', sampleSize: 0 },
  },
  {
    id: 'draft-1790-mozart-hokusai',
    anchorYear: { era: 'CE', year: 1790 },
    personIds: ['mozart', 'hokusai'],
    relation: 'same-year',
    bigIdea: 'Mozart and Hokusai were both creating in 1790.',
    claimIds: [],
    evidenceStatus: 'draft',
    releaseStatus: 'candidate',
    misleadingRisks: ['Generic creative-language claims can create false precision.'],
    reviewers: [],
    blockers: ['Add one reviewed 1790 claim per person.'],
    userTest: { status: 'not-started', sampleSize: 0 },
  },
  {
    id: 'draft-1845-lovelace-douglass',
    anchorYear: { era: 'CE', year: 1845 },
    personIds: ['lovelace', 'douglass'],
    relation: 'same-year',
    bigIdea: 'Ada Lovelace and Frederick Douglass were both alive in 1845.',
    claimIds: [],
    evidenceStatus: 'blocked',
    releaseStatus: 'withdrawn',
    misleadingRisks: ["Lovelace's Notes were published in 1843, not 1845."],
    reviewers: [],
    blockers: ['Move to a supportable anchor year or find a genuine 1845 claim.'],
    userTest: { status: 'not-started', sampleSize: 0 },
  },
  {
    id: 'draft-1930-einstein-woolf',
    anchorYear: { era: 'CE', year: 1930 },
    personIds: ['einstein', 'woolf'],
    relation: 'same-year',
    bigIdea: 'Albert Einstein and Virginia Woolf were both alive in 1930.',
    claimIds: [],
    evidenceStatus: 'blocked',
    releaseStatus: 'withdrawn',
    misleadingRisks: ['The previous copy referred to absent artists.'],
    reviewers: [],
    blockers: ['No reviewed 1930 event claim for either person.'],
    userTest: { status: 'not-started', sampleSize: 0 },
  },
];

const sequence = (year: HistoricalYear) => (year.era === 'BCE' ? 1 - year.year : year.year);

export type AuditIssue = { severity: 'error' | 'warning'; code: string; entityId: string; message: string };

export const auditContent = (): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));
  const personIds = new Set(people.map((person) => person.id));

  for (const person of people) {
    const requiredClaims = [person.profileClaimId, ...person.birth.sourceClaimIds, ...(person.death?.sourceClaimIds ?? [])];
    for (const claimId of requiredClaims) {
      if (!claimById.has(claimId)) {
        issues.push({ severity: 'error', code: 'PERSON_CLAIM_MISSING', entityId: person.id, message: claimId });
      }
    }
    if (person.reviewStatus === 'provisional') {
      issues.push({ severity: 'warning', code: 'PERSON_PROVISIONAL', entityId: person.id, message: 'Not production-approved.' });
    }
  }

  for (const claim of claims) {
    if (!personIds.has(claim.personId)) {
      issues.push({ severity: 'error', code: 'CLAIM_PERSON_MISSING', entityId: claim.id, message: claim.personId });
    }
    for (const sourceId of claim.sourceIds) {
      if (!sourceById.has(sourceId)) {
        issues.push({ severity: 'error', code: 'CLAIM_SOURCE_MISSING', entityId: claim.id, message: sourceId });
      }
    }
    if (claim.status === 'reviewed') {
      const hasAuthoritySource = claim.sourceIds.some((id) => ['A1', 'A2'].includes(sourceById.get(id)?.tier ?? ''));
      if (!hasAuthoritySource) {
        issues.push({ severity: 'error', code: 'REVIEWED_CLAIM_AUTHORITY_MISSING', entityId: claim.id, message: 'Requires A1/A2 source.' });
      }
    }
  }

  for (const card of contrastCards) {
    for (const personId of card.personIds) {
      if (!personIds.has(personId)) {
        issues.push({ severity: 'error', code: 'CARD_PERSON_MISSING', entityId: card.id, message: personId });
      }
    }
    if (card.evidenceStatus === 'reviewed') {
      const cardClaims = card.claimIds.map((id) => claimById.get(id));
      if (cardClaims.some((claim) => !claim || claim.status !== 'reviewed')) {
        issues.push({ severity: 'error', code: 'CARD_CLAIM_NOT_REVIEWED', entityId: card.id, message: 'Every card claim must be reviewed.' });
      }
      for (const personId of card.personIds) {
        if (!cardClaims.some((claim) => claim?.personId === personId)) {
          issues.push({ severity: 'error', code: 'CARD_PERSON_YEAR_CLAIM_MISSING', entityId: card.id, message: personId });
        }
      }
      if (cardClaims.some((claim) => !claim?.anchorYear || sequence(claim.anchorYear) !== sequence(card.anchorYear))) {
        issues.push({ severity: 'error', code: 'CARD_CLAIM_YEAR_MISMATCH', entityId: card.id, message: 'Claim must match anchor year.' });
      }
    }
    if (card.releaseStatus === 'approved') {
      const test = card.userTest;
      const passedBlindTest =
        test.status === 'complete' &&
        test.sampleSize >= 12 &&
        (test.surpriseMedian ?? 0) >= 4 &&
        (test.clarityPassRate ?? 0) >= 0.85 &&
        (test.relationMisreadCount ?? 1) === 0;
      if (!passedBlindTest) {
        issues.push({ severity: 'error', code: 'CARD_BLIND_TEST_GATE_FAILED', entityId: card.id, message: 'Release approval requires real target-user results.' });
      }
    }
  }
  return issues;
};

export const getPreviewCard = (year: HistoricalYear) =>
  contrastCards.find(
    (card) =>
      sequence(card.anchorYear) === sequence(year) &&
      card.evidenceStatus === 'reviewed' &&
      card.releaseStatus !== 'withdrawn',
  );

export const goldCards = () => contrastCards.filter((card) => card.releaseStatus === 'approved');
