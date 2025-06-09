import { Injectable } from '@angular/core';
import { TokenData } from '../models/token-data.model';
import { WalletDataDto } from '../models/wallet-data-dto';
import { PriceFetcherService } from './price-fetcher.service';
import { TokenPerformanceSummary } from '../models/token-performance-summary.model';
import { TokenMarketData } from '../models/market-data-map.model';

@Injectable({
  providedIn: 'root',
})
export class PortfolioAnalyticsService {
  constructor(public priceFetcherService: PriceFetcherService) {}
  /**
   * Converte un saldo token in valore fiat
   * @param token TokenData contenente simbolo e balance
   * @param fiat 'EUR' o 'USD'
   * @param prices Oggetto con chiavi lowercase dei simboli e valore del prezzo fiat
   * @returns Valore in valuta fiat
   */
  convertTokenToFiat(
    token: TokenData,
    fiat: 'EUR' | 'USD',
    prices: Record<string, number>
  ): number {
    const price = prices[token.symbol.toLowerCase()] ?? 0;
    return token.balance * price;
  }

  /**
   * Calcola il totale fiat per ogni token
   */
  computeFiatByToken(
    tokens: TokenData[],
    fiat: 'EUR' | 'USD',
    prices: Record<string, number>
  ) {
    const result: { symbol: string; fiatValue: number; logo: string }[] = [];
    const seen = new Map<string, { balance: number; logo: string }>();

    tokens.forEach((token) => {
      const key = token.symbol;
      if (!seen.has(key)) {
        seen.set(key, { balance: 0, logo: token.logo });
      }
      seen.get(key)!.balance += token.balance;
    });

    for (const [symbol, data] of seen.entries()) {
      result.push({
        symbol,
        fiatValue: this.convertTokenToFiat(
          {
            symbol,
            balance: data.balance,
            logo: data.logo,
            address: '',
            chain: '',
            decimals: 18,
            name: symbol,
            wallet: 'n/a',
          },
          fiat,
          prices
        ),
        logo: data.logo,
      });
    }

    return result.sort((a, b) => b.fiatValue - a.fiatValue);
  }

  /**
   * Calcola il valore totale in fiat a partire da WalletDataDto
   */
  computeTotalFiatFromWalletDataDto(
    walletData: WalletDataDto[],
    fiat: 'EUR' | 'USD',
    prices: Record<string, number>
  ): number {
    const allTokens: TokenData[] = [];

    walletData.forEach((wallet) => {
      wallet.chains.forEach((chain) => {
        chain.tokens.forEach((token) => {
          allTokens.push(token);
        });
      });
    });

    return this.computeTotalFiatValue(allTokens, fiat, prices);
  }

  async fetchTokenPrices(
    tokens: TokenData[],
    fiat: 'EUR' | 'USD'
  ): Promise<Record<string, number>> {
    return this.priceFetcherService.fetchPrices(tokens, fiat);
  }

  /**
   * Calcola il valore totale in fiat di tutti i token
   */

  computeTotalFiatValue(
    tokens: TokenData[],
    fiat: 'EUR' | 'USD',
    prices: Record<string, number>
  ): number {
    return tokens.reduce((total, token) => {
      const price = prices[token.symbol.toLowerCase()] || 0;
      return total + token.balance * price;
    }, 0);
  }

  getPerformanceSummary(tokens: TokenMarketData[]): TokenPerformanceSummary {
    const periods = ['24h', '7d', '30d', '60d', '90d'] as const;

    const bestPerformers: Record<string, TokenMarketData | null> = {};
    const worstPerformers: Record<string, TokenMarketData | null> = {};

    for (const period of periods) {
      const key = `percent_change_${period}` as keyof TokenMarketData;
      const sorted = [...tokens]
        .filter((t) => t[key] != null)
        .sort((a, b) => (b[key] as number) - (a[key] as number));
      bestPerformers[period] = sorted[0] || null;
      worstPerformers[period] = sorted[sorted.length - 1] || null;
    }

    const volumes: Record<string, number> = {};
    for (const token of tokens) {
      volumes[token.symbol.toUpperCase()] = token.volume_24h;
    }

    return {
      bestPerformers:
        bestPerformers as TokenPerformanceSummary['bestPerformers'],
      worstPerformers:
        worstPerformers as TokenPerformanceSummary['worstPerformers'],
      volumes,
    };
  }
}
