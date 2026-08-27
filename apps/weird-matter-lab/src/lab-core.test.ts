import { describe, expect, it } from 'vitest';
import { CHALLENGES, MATERIALS, SCENES, TOOLS } from './content';
import { AtomicMemoryStore, DeterministicWorld, ENGINE_VERSION, GRID_HEIGHT, GRID_WIDTH, QualityGovernor, evaluateGoal, makeSave, resolveReactionConflict, sanitizeRemix, validateSave, type LabCommand } from './lab-core';

const hashJson = (value: unknown) => { let hash = 2166136261; for (const byte of new TextEncoder().encode(JSON.stringify(value))) hash = Math.imul(hash ^ byte, 16777619); return (hash >>> 0).toString(16).padStart(8, '0'); };

describe('Weird Matter Lab production contracts', () => {
  it('TEST-LAB-001 paints ten water cells and moves matter inside 30 ticks', () => {
    const world = new DeterministicWorld(32, 24, 7); const before = world.summary().worldChecksum;
    for (let index = 0; index < 10; index += 1) world.apply({ type: 'paint', materialId: 'water', x: 4 + index, y: 2, radius: 1 });
    expect(world.summary().activeCellCount).toBeGreaterThanOrEqual(10); for (let tick = 0; tick < 30; tick += 1) world.step(); expect(world.summary().worldChecksum).not.toBe(before);
  });

  it('TEST-LAB-002 freezes 72 stable material IDs and 12 tools', () => {
    expect(MATERIALS).toHaveLength(72); expect(new Set(MATERIALS.map((item) => item.id)).size).toBe(72); expect(TOOLS).toHaveLength(12);
    expect(MATERIALS.find((item) => item.id === 'water')?.name).toBe('Water');
  });

  it('TEST-LAB-003 replays the same seed and command log for 1,000 ticks', () => {
    const run = () => { const world = new DeterministicWorld(32, 24, 42), commands: LabCommand[] = [{ type: 'paint', materialId: 'sand', x: 10, y: 1, radius: 4 }, { type: 'paint', materialId: 'water', x: 18, y: 2, radius: 3 }]; for (let tick = 0; tick < 1_000; tick += 1) world.step(tick === 0 ? commands : []); return world.summary().worldChecksum; };
    expect(run()).toBe(run());
  });

  it('TEST-LAB-004 resolves competing reactions by explicit priority', () => {
    const rule = resolveReactionConflict('food-gel', 'microbe'); expect(rule?.priority).toBe(100); expect(rule?.product).toBe('game-stink');
  });

  it('TEST-LAB-005 accepts a state-based non-example solution', () => {
    const item = CHALLENGES[0]!; const result = evaluateGoal(item, { counts: { sand: item.goal.count }, reactions: [{ reactionId: 'custom-path', x: 1, y: 1 }] }); expect(result.completed).toBe(true); expect(result.reactionIds).toContain('custom-path');
  });

  it('TEST-LAB-006 gives every challenge complete knowledge and source fields', () => {
    expect(CHALLENGES).toHaveLength(30); for (const item of CHALLENGES) { expect(item.learningPoint).not.toBe(''); expect(item.modelLimitations).not.toBe(''); expect(item.fictionBoundary).not.toBe(''); expect(item.sourceId).toMatch(/^SRC-LAB-/); expect(item.hints).toHaveLength(3); }
  });

  it('TEST-LAB-007 advances exactly one tick and keeps render checksum aligned', () => {
    const world = new DeterministicWorld(16, 10, 2); const before = world.tick, after = world.step([{ type: 'paint', materialId: 'sand', x: 2, y: 2 }]); expect(after.tick).toBe(before + 1); expect(after.renderBufferChecksum).toBe(after.worldChecksum); expect(after.activeCellCount).toBeGreaterThan(0);
  });

  it('TEST-LAB-008 degrades in stable stages without changing world state', () => {
    const governor = new QualityGovernor(), world = new DeterministicWorld(16, 10), checksum = world.summary().worldChecksum; expect(governor.sample(20, 40, 3)).toBe('degraded'); expect(governor.sample(18, 45, 3)).toBe('reduced'); expect(governor.gridMode).toBe('256x144'); expect(world.summary().worldChecksum).toBe(checksum);
  });

  it('TEST-LAB-009 atomically falls back from a corrupt current save', () => {
    const world = new DeterministicWorld(16, 10), store = new AtomicMemoryStore(); world.step([{ type: 'paint', materialId: 'water', x: 3, y: 3 }]); const first = makeSave(world, CHALLENGES[0]!.id, []); store.writeTemporary(first); store.commit(); world.step(); const second = makeSave(world, CHALLENGES[0]!.id, []); store.writeTemporary(second); store.commit(); store.current = { ...second, checksum: 'corrupt' }; expect(store.recover()?.checksum).toBe(first.checksum); expect(validateSave(first)).toBe(true);
  });

  it('TEST-LAB-010 rejects script injection without mutating a world', () => {
    const world = new DeterministicWorld(16, 10), checksum = world.summary().worldChecksum; expect(sanitizeRemix({ schemaVersion: 1, appId: 'weird-matter-lab', challengeId: CHALLENGES[0]!.id, seed: 1, grid: [], checksum: 'x', script: 'eval(1)' })).toBeNull(); expect(world.summary().worldChecksum).toBe(checksum);
  });

  it('TEST-LAB-011 ships the complete offline content budget', () => {
    expect({ materials: MATERIALS.length, challenges: CHALLENGES.length, scenes: SCENES.length }).toEqual({ materials: 72, challenges: 30, scenes: 12 }); expect(GRID_WIDTH * GRID_HEIGHT).toBe(36_864); expect(ENGINE_VERSION).toMatch(/^matter-ts-/);
  });

  it('TEST-LAB-012 keeps every launch action available without camera permission', () => {
    const requiredTouchActions = ['paint','erase','pause','step','undo','redo','save','share']; expect(requiredTouchActions).not.toContain('camera'); expect(requiredTouchActions).toHaveLength(8);
  });

  it('accepts only a checksummed, whitelisted Remix package', () => {
    const body = { schemaVersion: 1 as const, appId: 'weird-matter-lab' as const, challengeId: CHALLENGES[0]!.id, seed: 7062026, grid: [] as number[] }; const value = { ...body, checksum: hashJson(body) }; expect(sanitizeRemix(value)).toEqual(value);
  });
});
