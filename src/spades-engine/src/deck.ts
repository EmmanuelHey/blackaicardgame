import { Card, SUITS, RANKS } from './types';
import { xorshift32 } from './rng';

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(`${s}_${r}` as Card);
  return deck;
}

export function shuffle(seed: string, deck: Card[]): Card[] {
  const rnd = xorshift32(seed);
  const arr = deck.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function deal(seed: string) {
  const arr = shuffle(seed, makeDeck());
  return {
    N: arr.slice(0, 13),
    E: arr.slice(13, 26),
    S: arr.slice(26, 39),
    W: arr.slice(39, 52),
  };
}
