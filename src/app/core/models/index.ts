export interface BlockchainAccount {
  address: string;
  balance?: string;
}

export type GameStatus = "pending" | "started" | "re_roll";

export interface Game {
  status: GameStatus;
  shielded: boolean;
  host_player_address: string;
  joined_player_address: string;
  host_player_nft_id: string;
  joined_player_nft_id: string;
  base_bet: BaseBet;
  host_player_rolls: Array<number[]>;
  joined_player_rolls: Array<number[]>;
  total_stake: BaseBet;
  game_pool: GamePool;
  host_player_pool: BaseBet;
  joined_player_pool: BaseBet;
  host_player_total_points: number;
  joined_player_total_points: number;
  roll_turn: 'host' | 'joined';
}

export interface BaseBet {
  denom: string;
  amount: string;
}

export interface GamePool {
  total_stake: BaseBet;
  host_player_pool: BaseBet;
  joined_player_pool: BaseBet;
}
