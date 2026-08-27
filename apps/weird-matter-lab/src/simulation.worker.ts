/// <reference lib="webworker" />
import { DeterministicWorld, type LabCommand } from './lab-core';

type WorkerRequest = { type: 'reset' | 'step' | 'restore'; commands?: LabCommand[]; grid?: number[]; tick?: number };
let world = new DeterministicWorld();
const send = () => {
  const summary = world.summary();
  self.postMessage(summary, { transfer: [summary.pixels.buffer] });
};
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type === 'reset') world = new DeterministicWorld();
  if (event.data.type === 'restore' && event.data.grid) world.restore(Uint8Array.from(event.data.grid), event.data.tick ?? 0);
  if (event.data.type === 'step') world.step(event.data.commands ?? []);
  send();
};
