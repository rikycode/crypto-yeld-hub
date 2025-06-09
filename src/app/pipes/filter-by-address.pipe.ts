import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByAddress',
  standalone: true,
})
export class FilterByAddressPipe implements PipeTransform {
  transform(wallets: any[], address: string): any[] {
    if (!wallets || !address) {
      return wallets;
    }
    return wallets.filter(wallet => wallet.address === address);
  }
}
