import { describe, it, expect } from 'vitest';
import { startHand, finishHandAuto, scoreHand, HandState, playCard } from '../src/engine';
import type { Card, Seat } from '../src/types';

describe('full hand auto sim', () => {
  it('plays 13 tricks and resolves books', () => {
    const st = startHand('seed-2025', 'N');
    const res = finishHandAuto(st);
    expect(res.winnerByTrick.length).toBe(13);
    // all hands empty after 13 tricks
    expect(st.hands.N.length + st.hands.E.length + st.hands.S.length + st.hands.W.length).toBe(0);
  });
});

describe('must-follow-suit rule', () => {
  it('throws if player does not follow suit when possible', () => {
    // craft a tiny state for one trick
    const st = minimalState({
      N: ['H_A' as Card],
      E: ['H_2' as Card, 'C_3' as Card],
      S: ['H_3' as Card],
      W: ['H_4' as Card],
    }, 'N');

    // leader plays hearts, E must follow with hearts, not clubs
    playCard(st, 'N', 'H_A');
    expect(() => playCard(st, 'E', 'C_3' as Card)).toThrow();
  });
});

describe('spades-broken rule', () => {
  it('cannot lead spade before broken if player has non-spade', () => {
    const st = minimalState({
      N: ['S_A' as Card, 'H_2' as Card],
      E: ['H_3' as Card],
      S: ['H_4' as Card],
      W: ['H_5' as Card],
    }, 'N');

    expect(() => playCard(st, 'N', 'S_A' as Card)).toThrow();
  });
});

describe('scoring correctness basics', () => {
  it('made bid vs set, nil bonus/penalty, bag penalty', () => {
    const prev = { NS: 0, EW: 0 };
    const next = scoreHand(prev, {
      NSBooks: 6, EWBooks: 4,
      NSBid: 5, EWBid: 5,
      NSNil: false, EWNil: true,
      NSBags: 1, EWBags: 10 // EW hits 10 bags -> -100
    });
    expect(next.NS).toBe(51);   // 5*10 + 1 bag
    expect(next.EW).toBe(-150 - 100); // set -50, failed nil -100, bags -100 => -250
  });
});

/* ---------- helpers ---------- */
function minimalState(hands: Record<Seat, Card[]>, leader: Seat): HandState {
  return {
    hands: {
      N: hands.N.slice(), E: hands.E.slice(), S: hands.S.slice(), W: hands.W.slice()
    },
    bids: { N: 0, E: 0, S: 0, W: 0 },
    leader,
    ledSuit: null,
    plays: [],
    spadesBroken: false,
    books: { N: 0, E: 0, S: 0, W: 0 },
  };
}
