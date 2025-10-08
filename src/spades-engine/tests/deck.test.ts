import { describe, it, expect } from 'vitest';
import { makeDeck, shuffle, deal } from '../src/deck';

describe('deck basics', () => {
  it('has 52 unique cards', () => {
    const d = makeDeck();
    const set = new Set(d);
    expect(d.length).toBe(52);
    expect(set.size).toBe(52);
  });

  it('deterministic shuffle per seed', () => {
    const a = shuffle('2025', makeDeck());
    const b = shuffle('2025', makeDeck());
    const c = shuffle('xyz', makeDeck());
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('deal gives 4 hands of 13', () => {
    const hands = deal('seed');
    expect(hands.N).toHaveLength(13);
    expect(hands.E).toHaveLength(13);
    expect(hands.S).toHaveLength(13);
    expect(hands.W).toHaveLength(13);
  });
});
  