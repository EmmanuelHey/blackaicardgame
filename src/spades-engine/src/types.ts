export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 'A'|'K'|'Q'|'J'|'10'|'9'|'8'|'7'|'6'|'5'|'4'|'3'|'2';
export type Card = `${Suit}_${Rank}`;
export type Seat = 'N' | 'E' | 'S' | 'W';

export const SUITS: Suit[] = ['S','H','D','C'];
export const RANKS: Rank[] = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
export const RANK_ORDER: Record<Rank, number> = {
  A:13, K:12, Q:11, J:10, '10':9, '9':8, '8':7, '7':6, '6':5, '5':4, '4':3, '3':2, '2':1
};
export const SEATS: Seat[] = ['N','E','S','W'];

export function suitOf(c: Card): Suit { return c.split('_')[0] as Suit; }
export function rankOf(c: Card): Rank { return c.split('_')[1] as Rank; }
