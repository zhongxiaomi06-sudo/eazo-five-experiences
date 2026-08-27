import { CHALLENGES, MATERIALS, type Challenge } from './content';

export const GRID_WIDTH = 256;
export const GRID_HEIGHT = 144;
export const ENGINE_VERSION = 'matter-ts-1.0.0';
export const CONTENT_VERSION = 'content-1.0.0';
export const SAVE_VERSION = 1;

export type LabCommand = { type: 'paint' | 'erase'; materialId?: string; x: number; y: number; radius?: number };
export type ReactionEvent = { reactionId: string; x: number; y: number };
export type WorldSummary = {
  tick: number; activeCellCount: number; worldChecksum: string; renderBufferChecksum: string;
  counts: Record<string, number>; reactions: ReactionEvent[]; pixels: Uint8Array;
};

const ids = new Map(MATERIALS.map((entry, index) => [entry.id, index + 1]));
const names = ['empty', ...MATERIALS.map((entry) => entry.id)];
const stateByIndex = ['empty', ...MATERIALS.map((entry) => entry.state)];
const densityByIndex = [0, ...MATERIALS.map((entry) => entry.density)];
const idOf = (materialId: string) => ids.get(materialId) ?? 0;
const hashBytes = (values: ArrayLike<number>) => {
  let hash = 2166136261;
  for (let index = 0; index < values.length; index += 1) hash = Math.imul(hash ^ (values[index] ?? 0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export class SeededRandom {
  #state: number;
  constructor(seed: number) { this.#state = seed >>> 0 || 1; }
  next() { let value = this.#state; value ^= value << 13; value ^= value >>> 17; value ^= value << 5; this.#state = value >>> 0; return this.#state / 4294967296; }
}

const prioritizedReactions = [
  { priority: 100, a: 'food-gel', b: 'microbe', product: 'game-stink', id: 'reaction-friendly-ferment' },
  { priority: 90, a: 'bubble-liquid', b: 'dye-pink', product: 'rainbow-foam', id: 'reaction-rainbow-foam' },
  { priority: 80, a: 'wire', b: 'sound-pulse', product: 'music-particle', id: 'reaction-wire-song' },
  { priority: 70, a: 'portal-dust', b: 'sound-pulse', product: 'music-particle', id: 'reaction-portal-song' },
  { priority: 60, a: 'seed', b: 'water', product: 'hair-fiber', id: 'reaction-fiber-grow' },
] as const;

export class DeterministicWorld {
  readonly width: number;
  readonly height: number;
  readonly cells: Uint8Array;
  tick = 0;
  #random: SeededRandom;
  #reactions: ReactionEvent[] = [];

  constructor(width = GRID_WIDTH, height = GRID_HEIGHT, seed = 7062026) {
    this.width = width; this.height = height; this.cells = new Uint8Array(width * height); this.#random = new SeededRandom(seed);
  }

  apply(command: LabCommand) {
    const radius = Math.max(1, Math.min(command.radius ?? 2, 8));
    const value = command.type === 'erase' ? 0 : idOf(command.materialId ?? 'sand');
    for (let oy = -radius; oy <= radius; oy += 1) for (let ox = -radius; ox <= radius; ox += 1) {
      if (ox * ox + oy * oy > radius * radius) continue;
      const x = Math.max(0, Math.min(this.width - 1, command.x + ox));
      const y = Math.max(0, Math.min(this.height - 1, command.y + oy));
      this.cells[y * this.width + x] = value;
    }
  }

  step(commands: LabCommand[] = []) {
    for (const command of commands) this.apply(command);
    this.#reactions = [];
    const next = this.cells.slice();
    const lateralFirst = this.#random.next() > .5 ? 1 : -1;
    for (let y = this.height - 2; y >= 0; y -= 1) {
      for (let x = 0; x < this.width; x += 1) {
        const index = y * this.width + x;
        const value = this.cells[index] ?? 0;
        if (!value) continue;
        const below = index + this.width;
        const state = stateByIndex[value];
        if ((state === 'powder' || state === 'liquid') && this.cells[below] === 0) { next[below] = value; next[index] = 0; continue; }
        if (state === 'gas' && y > 0 && this.cells[index - this.width] === 0) { next[index - this.width] = value; next[index] = 0; continue; }
        if (state === 'fictional' && names[value] === 'antigravity-gel' && y > 0 && this.cells[index - this.width] === 0) { next[index - this.width] = value; next[index] = 0; continue; }
        if (state === 'liquid') {
          for (const direction of [lateralFirst, -lateralFirst]) {
            const targetX = x + direction;
            if (targetX >= 0 && targetX < this.width && this.cells[index + direction] === 0) { next[index + direction] = value; next[index] = 0; break; }
          }
        }
        const neighborIndex = x + 1 < this.width ? index + 1 : index;
        const neighbor = this.cells[neighborIndex] ?? 0;
        for (const reaction of prioritizedReactions) {
          const a = idOf(reaction.a); const b = idOf(reaction.b);
          if ((value === a && neighbor === b) || (value === b && neighbor === a)) {
            next[index] = idOf(reaction.product); next[neighborIndex] = 0;
            this.#reactions.push({ reactionId: reaction.id, x, y }); break;
          }
        }
        if (this.cells[below] && densityByIndex[value]! > densityByIndex[this.cells[below] ?? 0]! && state === 'liquid') {
          next[below] = value; next[index] = this.cells[below] ?? 0;
        }
      }
    }
    this.cells.set(next); this.tick += 1;
    return this.summary();
  }

  summary(): WorldSummary {
    const counts: Record<string, number> = {};
    let activeCellCount = 0;
    for (const value of this.cells) if (value) { activeCellCount += 1; const name = names[value] ?? 'unknown'; counts[name] = (counts[name] ?? 0) + 1; }
    const worldChecksum = hashBytes(this.cells);
    return { tick: this.tick, activeCellCount, worldChecksum, renderBufferChecksum: worldChecksum, counts, reactions: [...this.#reactions], pixels: this.cells.slice() };
  }

  restore(snapshot: Uint8Array, tick: number) { if (snapshot.length !== this.cells.length) throw new Error('INVALID_GRID'); this.cells.set(snapshot); this.tick = tick; }
}

export const resolveReactionConflict = (a: string, b: string) => prioritizedReactions.find((rule) => (rule.a === a && rule.b === b) || (rule.a === b && rule.b === a));
export const evaluateGoal = (challenge: Challenge, summary: Pick<WorldSummary, 'counts' | 'reactions'>) => ({
  completed: (summary.counts[challenge.goal.materialId] ?? 0) >= challenge.goal.count,
  reactionIds: summary.reactions.map((reaction) => reaction.reactionId),
});

export type SaveEnvelope = {
  schemaVersion: 1; engineVersion: string; contentVersion: string; seed: number; tick: number;
  grid: number[]; challengeId: string; commandLog: LabCommand[]; checksum: string;
};
export const checksumSave = (save: Omit<SaveEnvelope, 'checksum'>) => hashBytes(new TextEncoder().encode(JSON.stringify(save)));
export const makeSave = (world: DeterministicWorld, challengeId: string, commandLog: LabCommand[]): SaveEnvelope => {
  const body = { schemaVersion: 1 as const, engineVersion: ENGINE_VERSION, contentVersion: CONTENT_VERSION, seed: 7062026, tick: world.tick, grid: Array.from(world.cells), challengeId, commandLog };
  return { ...body, checksum: checksumSave(body) };
};
export const validateSave = (value: unknown): value is SaveEnvelope => {
  if (!value || typeof value !== 'object') return false;
  const save = value as SaveEnvelope; const { checksum, ...body } = save;
  return save.schemaVersion === 1 && save.engineVersion === ENGINE_VERSION && Array.isArray(save.grid) && save.grid.length <= GRID_WIDTH * GRID_HEIGHT && checksum === checksumSave(body);
};

export type RemixPackage = { schemaVersion: 1; appId: 'weird-matter-lab'; challengeId: string; seed: number; grid: number[]; checksum: string };
export const sanitizeRemix = (value: unknown): RemixPackage | null => {
  if (!value || typeof value !== 'object') return null;
  const keys = Object.keys(value); const allowed = ['schemaVersion','appId','challengeId','seed','grid','checksum'];
  if (keys.some((key) => !allowed.includes(key))) return null;
  const remix = value as RemixPackage;
  if (remix.schemaVersion !== 1 || remix.appId !== 'weird-matter-lab' || !CHALLENGES.some((item) => item.id === remix.challengeId) || !Array.isArray(remix.grid) || remix.grid.length > GRID_WIDTH * GRID_HEIGHT || remix.grid.some((cell) => !Number.isInteger(cell) || cell < 0 || cell > MATERIALS.length)) return null;
  const body = { schemaVersion: remix.schemaVersion, appId: remix.appId, challengeId: remix.challengeId, seed: remix.seed, grid: remix.grid };
  return remix.checksum === hashBytes(new TextEncoder().encode(JSON.stringify(body))) ? remix : null;
};

export class QualityGovernor {
  state: 'full' | 'degraded' | 'reduced' = 'full';
  gridMode: '320x180' | '256x144' = '320x180';
  sample(fps: number, stepMs: number, sustainedSeconds: number) {
    if (sustainedSeconds < 3 || (fps >= 24 && stepMs <= 33)) return this.state;
    if (this.state === 'full') this.state = 'degraded'; else { this.state = 'reduced'; this.gridMode = '256x144'; }
    return this.state;
  }
}

export class AtomicMemoryStore {
  current: SaveEnvelope | null = null; previous: SaveEnvelope | null = null; temporary: SaveEnvelope | null = null;
  writeTemporary(save: SaveEnvelope) { this.temporary = save; }
  commit() { if (!this.temporary || !validateSave(this.temporary)) throw new Error('INVALID_SAVE'); this.previous = this.current; this.current = this.temporary; this.temporary = null; }
  recover() { if (this.current && validateSave(this.current)) return this.current; if (this.previous && validateSave(this.previous)) return this.previous; return null; }
}
