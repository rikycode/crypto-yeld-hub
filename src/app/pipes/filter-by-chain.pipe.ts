import { Pipe, PipeTransform } from '@angular/core';
import { TokenData } from '../../models/token-data.model';

@Pipe({
  name: 'filterTokensByAddressAndChain',
  standalone: true,
})
export class FilterTokensByAddressAndChainPipe implements PipeTransform {
  transform(tokensMap: { [key: string]: any[] }, address: string, chain: string): any[] {
    if (!tokensMap || !tokensMap[address]) return [];
    return tokensMap[address].filter(token => token.chain === chain);
  }
}
