import { Component } from '@angular/core';
import {BlockchainService} from "./core/services/blockchain.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly isConnected$ = this.blockchainService.isConnected$;
  constructor(private blockchainService: BlockchainService, private router: Router) { }

  title = 'real-dice';
}
