import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private _value = new BehaviorSubject('test');
  public readonly value$: Observable<string> = this._value.asObservable();

  constructor() { }

  get value(): string {
    return this._value.getValue();
  }

  setValue(v: string) {
    this._value.next(v);
  }
}
