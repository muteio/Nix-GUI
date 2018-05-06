import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../../../core/core.module';

import { Amount } from '../../shared/util/utils';


@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnDestroy {

  @Input() type: string; // "total_balance", "anon_balance", "balance", "staked_balance", "blind_balance"
  @Input() color: string = '';

  private log: any = Log.create(`balance.component ${this.type}`);
  private destroyed: boolean = false;

  private _balance: Amount = new Amount(0);

  get balance() {
    return this._balance;
  }

  constructor(private _rpcState: RpcStateService) { }

  ngOnInit() {
    this._rpcState.observe('getwalletinfo', this.type)
    .takeWhile(() => !this.destroyed)
    .subscribe(
      balance => this._balance = new Amount(balance || 0, 4),
      error => this.log.error('Failed to get balance, ', error));
  }

  /* UI */
  getTypeOfBalance(): string {

    switch (this.type) {
      case 'total_balance':
        return 'Total balance';
      case 'balance':
        return 'Pending (unconfirmed)';
      case 'anon_balance':
        return 'Zerocoin';
      case 'blind_balance':
        return 'BLIND BALANCE';
      case 'staked_balance':
        return 'STAKE';
    }

    return this.type;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
