import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { SigningCosmWasmClient } from "secretjs";
import { OfflineSigner } from 'secretjs/types/wallet';
import { environment } from 'src/environments/environment';

import { BlockchainAccount } from '../models';

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

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private _consmJsClient!: SigningCosmWasmClient;
  private _account = new BehaviorSubject<BlockchainAccount>({
    address: "",
    balance: 0,
  });

  public readonly account$: Observable<BlockchainAccount> = this._account.asObservable();

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
      {
        init: {
          amount: [{ amount: '300000', denom: 'uscrt' }],
          gas: '300000',
        },
        exec: {
          amount: [{ amount: '300000', denom: 'uscrt' }],
          gas: '300000',
        },
      },
    );

    const account = await this._consmJsClient.getAccount(address);
    if (account != null) {
      this._account.next({
        address: account.address,
        balance: +(account.balance.find(b => b.denom === 'uscrt')?.amount || 0),
      });
    }
  }
}
