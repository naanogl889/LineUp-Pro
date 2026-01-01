
export enum GameMode {
  F5 = 5,
  F7 = 7,
  F11 = 11
}

export type Position = 'POR' | 'DEF' | 'MED' | 'DEL' | 'N/A';

export interface Player {
  id: string;
  name: string;
  rating: number;
  position: Position;
}

export type TeamID = 'team1' | 'team2';

export interface AppState {
  players: Player[];
  team1: Player[];
  team2: Player[];
  mode: GameMode;
  view: 'setup' | 'organize';
  team1Color?: string;
  team2Color?: string;
}
