export const DAY_MINUTES = 1_440;
export const MAX_PLANS = 20;
export const MAX_BLOCKS = 48;

export type CategoryId =
  | 'sleep' | 'work-study' | 'care' | 'commute' | 'food'
  | 'exercise' | 'social' | 'play' | 'personal' | 'unallocated';

export type TimeBlock = {
  id: string;
  title: string;
  categoryId: CategoryId;
  startMin: number;
  endMin: number;
  confidence?: number;
};

export type Plan = {
  schemaVersion: 2;
  planId: string;
  title: string;
  locale: string;
  sourceText?: string;
  notes?: string;
  blocks: TimeBlock[];
  createdAt: string;
  updatedAt: string;
};

export type PublicPlan = {
  schemaVersion: 2;
  blocks: Array<{ categoryId: CategoryId; minutes: number; colorToken: string }>;
  comparisonIds: string[];
};

export const categories: Record<CategoryId, { label: string; color: string }> = {
  sleep: { label: '睡眠', color: '#7b7aa6' },
  'work-study': { label: '创作与学习', color: '#c17a56' },
  care: { label: '照料', color: '#c9a95c' },
  commute: { label: '通勤', color: '#8b9aa6' },
  food: { label: '饮食', color: '#c98a86' },
  exercise: { label: '运动', color: '#7fa383' },
  social: { label: '社交', color: '#6fa3b0' },
  play: { label: '玩乐', color: '#b7623f' },
  personal: { label: '独处', color: '#a79b86' },
  unallocated: { label: '空闲时间', color: '#cabfa9' },
};

const keywordMap: Array<[CategoryId, RegExp]> = [
  ['sleep', /sleep|nap|bed|rest|睡|午休/i],
  ['exercise', /walk|run|gym|yoga|swim|cycle|运动|散步|跑步|健身/i],
  ['food', /eat|breakfast|lunch|dinner|cook|coffee|吃|饭|咖啡|做饭/i],
  ['social', /friend|family|people|date|party|朋友|家人|社交/i],
  ['work-study', /work|make|create|write|study|learn|read|工作|创作|学习|阅读/i],
  ['care', /care|child|baby|parent|照顾|陪伴/i],
  ['commute', /commute|drive|train|bus|通勤|开车|地铁/i],
  ['play', /play|game|music|movie|wander|游戏|电影|音乐/i],
];

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const minutesOf = (block: TimeBlock) => block.endMin - block.startMin;
export const formatTime = (minute: number) => `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
export const parseTime = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 24 && minute >= 0 && minute < 60 && !(hour === 24 && minute > 0) ? hour * 60 + minute : null;
};

export function validateBlocks(blocks: TimeBlock[]): string[] {
  const errors: string[] = [];
  if (blocks.length > MAX_BLOCKS) errors.push('TOO_MANY_BLOCKS');
  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin);
  sorted.forEach((block, index) => {
    if (!Number.isInteger(block.startMin) || !Number.isInteger(block.endMin)) errors.push('NON_INTEGER_TIME');
    if (block.startMin < 0 || block.endMin > DAY_MINUTES || block.endMin <= block.startMin) errors.push('INVALID_RANGE');
    if (index > 0 && sorted[index - 1]!.endMin > block.startMin) errors.push('TIME_OVERLAP');
  });
  return [...new Set(errors)];
}

export function classifyLocally(text: string, locale = 'en-US'): Plan {
  const raw = text.split(/[,，;；\n]+/).map((part) => part.trim()).filter(Boolean).slice(0, MAX_BLOCKS);
  const titles = raw.length ? raw : ['好好睡一觉', '做点东西', '出门走走', '慢慢吃饭', '和人相处'];
  const minimumSleep = titles.some((title) => keywordMap[0]![1].test(title)) ? 0 : 480;
  const available = DAY_MINUTES - minimumSleep;
  const base = Math.floor(available / titles.length);
  let cursor = 0;
  const blocks: TimeBlock[] = [];
  if (minimumSleep) {
    blocks.push({ id: uid(), title: '好好睡一觉', categoryId: 'sleep', startMin: 0, endMin: minimumSleep, confidence: 1 });
    cursor = minimumSleep;
  }
  titles.forEach((title, index) => {
    const categoryId = keywordMap.find(([, pattern]) => pattern.test(title))?.[0] ?? 'personal';
    const duration = index === titles.length - 1 ? DAY_MINUTES - cursor : base;
    blocks.push({ id: uid(), title: title.slice(0, 80), categoryId, startMin: cursor, endMin: cursor + duration, confidence: .72 });
    cursor += duration;
  });
  const now = new Date().toISOString();
  return { schemaVersion: 2, planId: uid(), title: '一个值得偷来过的一天', locale, sourceText: text, blocks, createdAt: now, updatedAt: now };
}

export function planFromDraft(draft: unknown, sourceText: string, locale = 'en-US'): Plan | null {
  if (!draft || typeof draft !== 'object') return null;
  const value = draft as { schemaVersion?: unknown; blocks?: unknown };
  if (value.schemaVersion !== 1 || !Array.isArray(value.blocks) || !value.blocks.length || value.blocks.length > MAX_BLOCKS) return null;
  let cursor = 0;
  const blocks: TimeBlock[] = [];
  for (const raw of value.blocks) {
    if (!raw || typeof raw !== 'object') return null;
    const record = raw as Record<string, unknown>;
    const allowed = ['title', 'categoryId', 'startMin', 'endMin', 'durationMin', 'confidence'];
    if (Object.keys(record).some((key) => !allowed.includes(key))) return null;
    if (typeof record.title !== 'string' || record.title.length < 1 || record.title.length > 80 || !(record.categoryId as string in categories)) return null;
    const startMin = typeof record.startMin === 'number' ? record.startMin : cursor;
    const endMin = typeof record.endMin === 'number' ? record.endMin : typeof record.durationMin === 'number' ? startMin + record.durationMin : NaN;
    if (!Number.isInteger(startMin) || !Number.isInteger(endMin) || startMin !== cursor) return null;
    blocks.push({
      id: uid(), title: record.title, categoryId: record.categoryId as CategoryId, startMin, endMin,
      ...(typeof record.confidence === 'number' ? { confidence: record.confidence } : {}),
    });
    cursor = endMin;
  }
  if (cursor !== DAY_MINUTES || validateBlocks(blocks).length) return null;
  const now = new Date().toISOString();
  return { schemaVersion: 2, planId: uid(), title: '一个值得偷来过的一天', locale, sourceText, blocks, createdAt: now, updatedAt: now };
}

export function resizeSharedBoundary(blocks: TimeBlock[], index: number, nextBoundary: number, snap = 5) {
  const rounded = Math.round(nextBoundary / snap) * snap;
  const current = blocks[index];
  const next = blocks[index + 1];
  if (!current || !next || current.endMin !== next.startMin || rounded <= current.startMin || rounded >= next.endMin) {
    return { ok: false as const, code: 'TIME_OVERLAP', blocks };
  }
  const updated = blocks.map((block) => ({ ...block }));
  updated[index]!.endMin = rounded;
  updated[index + 1]!.startMin = rounded;
  return { ok: true as const, blocks: updated };
}

export function resizeSingleBoundary(blocks: TimeBlock[], index: number, endMin: number) {
  const block = blocks[index];
  if (!block || endMin <= block.startMin || endMin > DAY_MINUTES || (blocks[index + 1] && endMin > blocks[index + 1]!.startMin)) {
    return { ok: false as const, code: 'TIME_OVERLAP', blocks };
  }
  const updated = blocks.map((item) => ({ ...item }));
  updated[index]!.endMin = endMin;
  return { ok: true as const, blocks: updated };
}

export function mergeOpenTime(blocks: TimeBlock[]): TimeBlock[] {
  const merged: TimeBlock[] = [];
  for (const block of blocks) {
    const previous = merged[merged.length - 1];
    if (
      previous && previous.categoryId === 'unallocated' && block.categoryId === 'unallocated'
      && previous.endMin === block.startMin
    ) {
      previous.endMin = block.endMin;
      continue;
    }
    merged.push({ ...block });
  }
  return merged;
}

export function deleteAsOpenTime(blocks: TimeBlock[], id: string): TimeBlock[] {
  const opened = blocks.map((block) => block.id === id
    ? { ...block, title: '空闲时间', categoryId: 'unallocated' as CategoryId, confidence: 1 }
    : block);
  return mergeOpenTime(opened);
}

export function splitBlock(blocks: TimeBlock[], id: string, snap = 5): { ok: true; blocks: TimeBlock[] } | { ok: false; code: 'TOO_SHORT' | 'TOO_MANY_BLOCKS' } {
  const index = blocks.findIndex((block) => block.id === id);
  const block = blocks[index];
  if (!block) return { ok: false, code: 'TOO_SHORT' };
  if (blocks.length >= MAX_BLOCKS) return { ok: false, code: 'TOO_MANY_BLOCKS' };
  const span = block.endMin - block.startMin;
  const step = Math.max(1, snap);
  // Split near the middle, snapped, keeping both halves at least one integer minute.
  let midpoint = block.startMin + Math.round(span / 2 / step) * step;
  if (midpoint <= block.startMin) midpoint = block.startMin + 1;
  if (midpoint >= block.endMin) midpoint = block.endMin - 1;
  if (midpoint <= block.startMin || midpoint >= block.endMin) return { ok: false, code: 'TOO_SHORT' };
  const first: TimeBlock = { ...block, endMin: midpoint };
  const second: TimeBlock = { ...block, id: uid(), title: block.title, startMin: midpoint, endMin: block.endMin };
  return { ok: true, blocks: [...blocks.slice(0, index), first, second, ...blocks.slice(index + 1)] };
}

export function sanitizeForShare(plan: Plan): PublicPlan {
  return {
    schemaVersion: 2,
    blocks: plan.blocks.map((block) => ({
      categoryId: block.categoryId,
      minutes: minutesOf(block),
      colorToken: categories[block.categoryId].color,
    })),
    comparisonIds: comparisons(plan).slice(0, 5).map((item) => item.id),
  };
}

export type Comparison = { id: string; text: string; detail: string; raw: number };
const comparisonLedger = [
  { id: 'books', category: 'work-study' as CategoryId, unit: 360, noun: '次六小时的沉浸创作', source: '内部编辑常量，2026-08-27' },
  { id: 'walks', category: 'exercise' as CategoryId, unit: 30, noun: '次半小时散步', source: '内部编辑常量，2026-08-27' },
  { id: 'dinners', category: 'food' as CategoryId, unit: 90, noun: '顿慢慢享用的晚餐', source: '内部编辑常量，2026-08-27' },
  { id: 'calls', category: 'social' as CategoryId, unit: 20, noun: '通二十分钟的电话', source: '内部编辑常量，2026-08-27' },
  { id: 'naps', category: 'sleep' as CategoryId, unit: 20, noun: '次二十分钟小睡', source: '内部编辑常量，2026-08-27' },
  { id: 'albums', category: 'play' as CategoryId, unit: 45, noun: '次完整听完一张专辑', source: '内部编辑常量，2026-08-27' },
  { id: 'tea', category: 'personal' as CategoryId, unit: 15, noun: '杯从容喝完的茶', source: '内部编辑常量，2026-08-27' },
  { id: 'commutes', category: 'commute' as CategoryId, unit: 40, noun: '次城市通勤', source: '内部编辑常量，2026-08-27' },
  { id: 'bedtimes', category: 'care' as CategoryId, unit: 30, noun: '次睡前故事', source: '内部编辑常量，2026-08-27' },
  { id: 'blank', category: 'unallocated' as CategoryId, unit: 60, noun: '个完整留白的小时', source: '内部编辑常量，2026-08-27' },
  { id: 'sunsets', category: 'personal' as CategoryId, unit: 20, noun: '次慢慢看完日落', source: '内部编辑常量，2026-08-27' },
  { id: 'chapters', category: 'work-study' as CategoryId, unit: 25, noun: '章专注阅读', source: '内部编辑常量，2026-08-27' },
  { id: 'songs', category: 'play' as CategoryId, unit: 4, noun: '首四分钟的歌', source: '内部编辑常量，2026-08-27' },
  { id: 'picnics', category: 'social' as CategoryId, unit: 120, noun: '次两小时野餐', source: '内部编辑常量，2026-08-27' },
  { id: 'recipes', category: 'food' as CategoryId, unit: 60, noun: '次一小时料理', source: '内部编辑常量，2026-08-27' },
  { id: 'stretches', category: 'exercise' as CategoryId, unit: 10, noun: '次十分钟拉伸', source: '内部编辑常量，2026-08-27' },
  { id: 'trainrides', category: 'commute' as CategoryId, unit: 25, noun: '段短途火车旅程', source: '内部编辑常量，2026-08-27' },
  { id: 'checkins', category: 'care' as CategoryId, unit: 15, noun: '次认真问候', source: '内部编辑常量，2026-08-27' },
  { id: 'dreams', category: 'sleep' as CategoryId, unit: 90, noun: '个九十分钟睡眠周期', source: '内部编辑常量，2026-08-27' },
  { id: 'nothing', category: 'unallocated' as CategoryId, unit: 15, noun: '段不欠任何人的十五分钟', source: '内部编辑常量，2026-08-27' },
];

export function comparisons(plan: Plan): Comparison[] {
  const totals = plan.blocks.reduce<Record<string, number>>((acc, block) => {
    acc[block.categoryId] = (acc[block.categoryId] ?? 0) + minutesOf(block);
    return acc;
  }, {});
  return comparisonLedger
    .map((item) => {
      const daily = totals[item.category] ?? 0;
      const raw = daily * 365 / item.unit;
      const rounded = Math.round(raw);
      return {
        id: item.id,
        raw,
        text: `这一年可以装下 ${rounded.toLocaleString('zh-CN')} ${item.noun}。`,
        detail: `${daily} 分钟/天 × 365 天 ÷ ${item.unit} 分钟/次 = ${raw}。按最接近的整数四舍五入。${item.source}。`,
      };
    })
    .filter((item) => item.raw > 0)
    .sort((a, b) => b.raw - a.raw);
}
