export enum GameState {
  SELECTION = 'SELECTION',
  BATTLE = 'BATTLE',
  GAMEOVER = 'GAMEOVER'
}

export interface Move {
  name: string;
  damage: number;
  type: 'physical' | 'special' | 'heal' | 'ultimate';
  description: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  image: string;
  color: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  moves: Move[];
  ultimate: Move;
  hasUsedUltimate?: boolean;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'attack' | 'special' | 'heal' | 'system' | 'ultimate';
}
