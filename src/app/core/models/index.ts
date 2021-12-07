export interface BlockchainAccount {
    address: string;
    balance?: string;
}

export type GameStatus = "pending" | "started" | "re_roll";