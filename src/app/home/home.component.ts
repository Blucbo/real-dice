import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BlockchainAccount } from '../core/models';
import { BlockchainService } from "../core/services/blockchain.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public account$: Observable<BlockchainAccount> = this.blockchainService.account$;
  constructor(private blockchainService: BlockchainService) { }

  ngOnInit(): void {
  }

  async connectToWallet() {
    await this.blockchainService.connectToWallet();
  }
}
