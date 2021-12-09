import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { ExecuteResult, SigningCosmWasmClient } from "secretjs";
import { Coin } from 'secretjs/types/types';
import { OfflineSigner } from 'secretjs/types/wallet';
import { environment } from 'src/environments/environment';

import { BlockchainAccount, Game, GameStatus, NftInfo, NftWithID } from '../models';

// TODO: move to another folder with app configuration
const SecretNetworkConfig = {
  chainId: environment.chainId,
  chainName: 'Secret Testnet',
  rpc: environment.rpc,
  rest: environment.rest,
  bip44: {
    coinType: 529,
  },
  coinType: 529,
  stakeCurrency: {
    coinDenom: 'SCRT',
    coinMinimalDenom: 'uscrt',
    coinDecimals: 6,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'secret',
    bech32PrefixAccPub: 'secretpub',
    bech32PrefixValAddr: 'secretvaloper',
    bech32PrefixValPub: 'secretvaloperpub',
    bech32PrefixConsAddr: 'secretvalcons',
    bech32PrefixConsPub: 'secretvalconspub',
  },
  currencies: [
    {
      coinDenom: 'SCRT',
      coinMinimalDenom: 'uscrt',
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'SCRT',
      coinMinimalDenom: 'uscrt',
      coinDecimals: 6,
    },
  ],
  gasPriceStep: {
    low: 0.1,
    average: 0.25,
    high: 0.4,
  },
  features: ['secretwasm'],
}

const customFees = {
  upload: {
    amount: [{ amount: "20000000", denom: "uscrt" }],
    gas: "20000000",
  },
  init: {
    amount: [{ amount: "5000000", denom: "uscrt" }],
    gas: "5000000",
  },
  exec: {
    amount: [{ amount: "500000", denom: "uscrt" }],
    gas: "500000",
  },
  send: {
    amount: [{ amount: "80000", denom: "uscrt" }],
    gas: "80000",
  },
};

const PermitName = "A cool Secret NFT game";
const Permissions = ["owner"];

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private _consmJsClient!: SigningCosmWasmClient;
  private _account = new BehaviorSubject<BlockchainAccount>({
    address: "",
    balance: '0',
  });
  private _permit: any;

  isConnected$ = new BehaviorSubject(false);
  public readonly account$: Observable<BlockchainAccount> = this._account.asObservable();
  public readonly getAddess = () => this._account.value.address;

  async connectToWallet() {
    const currentWindow = window as any;
    if (!currentWindow.getOfflineSigner || !currentWindow.keplr) {
      alert("Please install keplr extension");
      return;
    }

    await currentWindow.keplr.experimentalSuggestChain(SecretNetworkConfig);
    await currentWindow.keplr.enable(SecretNetworkConfig.chainId);

    const keplrOfflineSigner = currentWindow.getOfflineSigner(SecretNetworkConfig.chainId) as OfflineSigner;
    const accounts = await keplrOfflineSigner.getAccounts();
    const address = accounts[0].address;

    this._consmJsClient = new SigningCosmWasmClient(
      SecretNetworkConfig.rest,
      address,
      keplrOfflineSigner,
      currentWindow.getEnigmaUtils(SecretNetworkConfig.chainId),
      customFees,
    );

    const account = await this._consmJsClient.getAccount(address);
    if (account != null) {
      const signature = await this._consmJsClient.signAdapter(
        [
          {
            type: "query_permit",
            value: {
              permit_name: PermitName,
              allowed_tokens: [environment.nftContractAddress],
              permissions: Permissions,
            },
          },
        ],
        {
          amount: [
            {
              denom: "uscrt",
              amount: "0",
            },
          ],
          gas: "1",
        },
        SecretNetworkConfig.chainId,
        "",
        0,
        0
      );
      this._permit = {
        params: {
          permit_name: PermitName,
          allowed_tokens: [environment.nftContractAddress],
          chain_id: SecretNetworkConfig.chainId,
          permissions: Permissions,
        },
        signature: {
          pub_key: account?.pubkey,
          signature: signature.signatures[0].signature,
        },
      };
      this._account.next({
        address: account.address,
        balance: (+(account.balance.find(b => b.denom === 'uscrt')?.amount || 0) / 1000000).toString(),
      });
      this.isConnected$.next(true);
    }
  }

  private async getPermitConfig(queryConfig: any) {
    return {
      with_permit: {
        query: queryConfig,
        permit: this._permit,
      },
    };
  }

  private async queryWithPermit(contractAddress: string, queryConfig: any) {
    const queryResult = await this._consmJsClient.queryContractSmart(contractAddress, this.getPermitConfig(queryConfig));
    return queryResult;
  }

  private async executeWithPermit(contractAddress: string, queryConfig: any, moneyTransferConfig: Coin[] = []) {
    const executeResult = await this._consmJsClient.execute(contractAddress, this.getPermitConfig(queryConfig), undefined, moneyTransferConfig);
    return executeResult;
  }

  async getNftTokens(): Promise<NftWithID[]> {
    const nftIdTokens = await this.queryWithPermit(environment.daoContractAddress, {
      "player_nfts": {
        "player": this._account.getValue().address,
        "viewer": environment.daoContractAddress,
      }
    });

    const nftTokenInfos: NftInfo[] = await Promise.all(nftIdTokens.map((id: string) => this.queryWithPermit(environment.nftContractAddress, {
      "nft_info": {
        "token_id": id,
      }
    })));
    const nftWithIds = nftIdTokens.map((id: string, i: number) => ({
      ...nftTokenInfos[i],
      id,
    }));
    return nftWithIds;
  }

  async joinDao() {
    const joinDaoResult = await this._consmJsClient.execute(environment.daoContractAddress, {
      "join_dao": {}
    });
    return joinDaoResult;
  }

  async finishGame(gameId: number) {
    const finishResult = await this.executeWithPermit(environment.daoContractAddress, {
      "end_game": {
        "game_id": gameId
      }
    });
    return finishResult;
  }

  async createNewGameRoom(nftId: string, baseBet: number) {
    const createNewGameResult = await this.executeWithPermit(environment.daoContractAddress, {
      "create_new_game_room": {
        "nft_id": nftId,
        "base_bet": {
          amount: baseBet.toString(),
          denom: "uscrt",
        },
        "secret": Math.floor(Math.random() * 10000),
      }
    }, [{
      amount: (baseBet * 10).toString(),
      denom: "uscrt",
    }]);
    return createNewGameResult;
  }

  async joinGame(gameId: number, nftId: string, bet: number) {
    const joinGameResult = await this.executeWithPermit(environment.daoContractAddress, {
      "join_game": {
        "nft_id": nftId,
        "game_id": gameId,
        "secret": Math.floor(Math.random() * 10000),
      }
    }, [{
      amount: (bet * 10).toString(),
      denom: "uscrt",
    }]);
    return joinGameResult;
  }

  async getGamesByStatus(status: GameStatus) {
    const gamesResult = await this.queryWithPermit(environment.daoContractAddress, {
      "games_by_status": {
        "status": status
      },
    });
    return (gamesResult as any[]).map(([gameId, value]) => ({
      game_id: gameId,
      ...value,
    }));
  }

  async getGameById(gameId: number) {
    const gameResult = await this.queryWithPermit(environment.daoContractAddress, {
      "game": {
        "game_id": gameId,
      },
    });
    return gameResult as Game;
  }

  async rollDices(gameId: number) {
    const rolledResult = await this.executeWithPermit(environment.daoContractAddress, {
      "roll": {
        "game_id": gameId,
      }
    });
    const game = parseGameFromBlockchainResult(rolledResult);

    if (game.status === 're_roll' && game.roll_turn === 'host') {
      return {
        rolls: game.joined_player_rolls[0],
        game,
      };
    }
    if (game.status === 'started' && game.roll_turn === 'joined') {
      return {
        rolls: game.host_player_rolls[0],
        game,
      };
    }
    return null;
  }

  async reRollDices(gameId: number, dices: boolean[]) {
    const reRolledResult = await this.executeWithPermit(environment.daoContractAddress, {
      "re_roll": {
        "game_id": gameId,
        "dices": dices,
      }
    });
    const game = parseGameFromBlockchainResult(reRolledResult);
    if (game.roll_turn === 'host') {
      return {
        rolls: game.joined_player_rolls[1],
        game,
      };
    }
    if (game.roll_turn === 'joined') {
      return {
        rolls: game.host_player_rolls[1],
        game,
      };
    }
    return null;
  }
}
function parseGameFromBlockchainResult(rolledResult: ExecuteResult) {
  const gameResultResponse = rolledResult.logs[0].events[1].attributes[1].value.split('\n')[1] || rolledResult.logs[0].events[4].attributes[1].value.split('\n')[1];
  const rolledDataByteArray = JSON.parse(gameResultResponse);
  const game = JSON.parse(String.fromCharCode(...rolledDataByteArray)) as Game;
  return game;
}
