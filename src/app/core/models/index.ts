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

export interface NftWithID {
  nft_info: NftInfo;
  id:       string;
}

export interface NftInfo {
  token_uri: null;
  extension: Extension;
}

export interface Extension {
  image:                null;
  image_data:           null;
  external_url:         null;
  description:          string;
  xp:                   number;
  name:                 string;
  attributes:           Attribute[];
  background_color:     string;
  animation_url:        null;
  youtube_url:          null;
  media:                null;
  protected_attributes: null;
}

export interface Attribute {
  display_type: null;
  trait_type:   null;
  value:        string;
  max_value:    null;
}
