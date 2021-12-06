import { Injectable } from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {BlockchainService} from "../services/blockchain.service";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private blockchainService: BlockchainService,
    private router: Router,
  ) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.blockchainService.isConnected$.pipe(
      tap((value) => {
        if (!value) {
          this.router.navigate(['/main']);
        }
      }),
    );
  }

}
