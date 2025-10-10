import { Card, Seat, Suit } from './types';
import { deal } from './deck';
import { mustFollowSuit, spadeLeadAllowed, trickWinner } from './rules';

export type Bids = Record<Seat, number>;
export type Books = Record<Seat, number>;

export interface HandState {
  hands: Record<Seat, Card[]>;
  bids: Bids;
  leader: Seat;            // who leads the current trick
  ledSuit: Suit | null;    // suit led this trick
  plays: { seat: Seat; card: Card }[];
  spadesBroken: boolean;
  books: Books;            // books per seat
}

export interface HandResult {
  winnerByTrick: Seat[];                         // length 13
  booksBySeat: Books;                            // per seat
  booksByTeam: { NS: number; EW: number };       // team totals
}

const ORDER: Seat[] = ['N', 'E', 'S', 'W'];

export function startHand(seed: string, leader: Seat = 'N'): HandState {
  const hands = deal(seed) as any;
  return {
    hands, bids: { N: 0, E: 0, S: 0, W: 0 },
    leader, ledSuit: null, plays: [],
    spadesBroken: false, books: { N:0, E:0, S:0, W:0 }
  };
}

export function placeBid(state: HandState, seat: Seat, bid: number) {
  if (bid < 0 || bid > 13) throw new Error('invalid bid');
  state.bids[seat] = bid;
}

export function playCard(state: HandState, seat: Seat, card: Card) {
  const hand = state.hands[seat];
  if (!hand.includes(card)) throw new Error('card not in hand');

  // if leading trick, guard spade leading rule
  if (state.plays.length === 0) {
    if (card.startsWith('S_') && !spadeLeadAllowed(hand, state.spadesBroken)) {
      throw new Error('cannot lead spade before broken');
    }
    state.ledSuit = (card.split('_')[0]) as Suit;
  } else {
    if (!mustFollowSuit(hand, state.ledSuit, card)) throw new Error('must follow suit');
    if (card.startsWith('S_') && state.ledSuit !== 'S') state.spadesBroken = true;
  }

  // remove from hand
  state.hands[seat] = hand.filter(c => c !== card);
  state.plays.push({ seat, card });

  // resolve on 4th play
  if (state.plays.length === 4) {
    const winner = trickWinner(state.ledSuit!, state.plays) as Seat;
    state.books[winner] += 1;
    state.leader = winner;
    state.ledSuit = null;
    state.plays = [];
  }
}

/* ---------- helpers for full-hand sim ---------- */

export function nextSeat(seat: Seat): Seat {
  return ORDER[(ORDER.indexOf(seat) + 1) % 4];
}

export function legalPlays(
  hand: Card[], ledSuit: Suit | null, spadesBroken: boolean, isLeader: boolean
): Card[] {
  if (isLeader) {
    if (spadesBroken) return hand.slice();
    const hasNonSpade = hand.some(c => !c.startsWith('S_'));
    return hasNonSpade ? hand.filter(c => !c.startsWith('S_')) : hand.slice();
  } else {
    if (!ledSuit) return hand.slice(); // should not happen for followers
    const mustFollow = hand.filter(c => c.startsWith(`${ledSuit}_`));
    return mustFollow.length ? mustFollow : hand.slice();
  }
}

export function isHandComplete(state: HandState): boolean {
  return state.hands.N.length === 0 &&
         state.hands.E.length === 0 &&
         state.hands.S.length === 0 &&
         state.hands.W.length === 0 &&
         state.plays.length === 0; // all tricks resolved
}

export function teamBooks(books: Books): { NS: number; EW: number } {
  return { NS: books.N + books.S, EW: books.E + books.W };
}

/** play one trick automatically with a naive legal policy */
export function playTrickAuto(state: HandState): Seat {
  let turn: Seat = state.leader;
  for (let k = 0; k < 4; k++) {
    const isLeader = k === 0;
    const legals = legalPlays(state.hands[turn], state.ledSuit, state.spadesBroken, isLeader);
    if (legals.length === 0) throw new Error('no legal moves (engine state broken)');
    // naive policy: pick the first legal card
    playCard(state, turn, legals[0]);
    turn = nextSeat(turn);
  }
  // after 4 plays, engine sets new leader to winner
  return state.leader;
}

/** finish all 13 tricks automatically; returns books and winners */
export function finishHandAuto(state: HandState): HandResult {
  const winners: Seat[] = [];
  for (let t = 0; t < 13; t++) {
    const w = playTrickAuto(state);
    winners.push(w);
  }
  const byTeam = teamBooks(state.books);
  return { winnerByTrick: winners, booksBySeat: state.books, booksByTeam: byTeam };
}

/* ---------- scoring stays the same ---------- */
export function scoreHand(
  prevTeamScore: { NS: number; EW: number },
  params: { NSBooks: number; EWBooks: number; NSBid: number; EWBid: number; NSNil?: boolean; EWNil?: boolean; NSBags: number; EWBags: number }
) {
  let { NS, EW } = prevTeamScore;
  const { NSBooks, EWBooks, NSBid, EWBid, NSNil, EWNil, NSBags, EWBags } = params;

  const nsMade = NSBooks >= NSBid;
  const ewMade = EWBooks >= EWBid;

  NS += nsMade ? NSBid * 10 + Math.max(0, NSBooks - NSBid) : -NSBid * 10;
  EW += ewMade ? EWBid * 10 + Math.max(0, EWBooks - EWBid) : -EWBid * 10;

  if (NSNil) NS += NSBooks === 0 ? 100 : -100;
  if (EWNil) EW += EWBooks === 0 ? 100 : -100;

  const nsBagPenalty = Math.floor(NSBags / 10) * 100;
  const ewBagPenalty = Math.floor(EWBags / 10) * 100;
  NS -= nsBagPenalty; EW -= ewBagPenalty;

  return { NS, EW };
}
