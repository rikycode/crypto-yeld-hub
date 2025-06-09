import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TokenData } from '../models/token-data.model';
import { firstValueFrom } from 'rxjs';
import { TokenMarketData } from '../models/market-data-map.model';

@Injectable({
  providedIn: 'root',
})
export class PriceFetcherService {
  // 👇 URL della tua Firebase Function (modifica con il tuo endpoint reale)
  private readonly cloudFunctionUrl =
    'https://crypto-price-api-h8vd.onrender.com/getCryptoPrices';

  constructor(private http: HttpClient) {}

  async fetchPrices(
    tokens: TokenData[],
    fiat: 'USD' | 'EUR' = 'USD'
  ): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    const uniqueSymbols = this.getUniqueSymbols(tokens);

    const params = new HttpParams()
      .set('symbols', uniqueSymbols.join(','))
      .set('fiat', fiat);

    try {
      const response: any = await firstValueFrom(
        this.http.get(this.cloudFunctionUrl, { params })
      );

      const data = response.data;

      for (const symbol of uniqueSymbols) {
        const upperSymbol = symbol.toUpperCase();
        const price = data?.[upperSymbol]?.quote?.[fiat]?.price ?? 0;
        prices[symbol.toLowerCase()] = price;
      }

      return prices;
    } catch (err) {
      console.error('❌ Errore durante il fetch prezzi:', err);
      return {};
    }
  }

  private getUniqueSymbols(
    tokens: TokenData[] = [],
    tokensString: string[] = []
  ): string[] {
    const symbolSet = new Set<string>();
    var tokensMapEmpty = [] as string[];
    if (tokens.length > 0) {
      for (const token of tokens) {
        if (
          token.symbol &&
          /^[a-zA-Z0-9]{2,10}$/.test(token.symbol) // solo simboli validi
        ) {
          symbolSet.add(token.symbol.toUpperCase());
        }
      }
      return Array.from(symbolSet);
    } else if (tokensString.length > 0) {
      for (const token of tokensString) {
        if (
          token &&
          /^[a-zA-Z0-9]{2,10}$/.test(token) // solo simboli validi
        ) {
          symbolSet.add(token.toUpperCase());
        }
      }
      return Array.from(symbolSet);
    } else {
      return tokensMapEmpty;
    }
  }

  async getPriceDataForTokens(
    symbols: string[],
    fiat: string = 'USD'
  ): Promise<TokenMarketData[]> {
    if (!symbols || symbols.length === 0) return [];

    const uniqueSymbols = this.getUniqueSymbols([], symbols);
    const symbolQuery = uniqueSymbols.join(',');

    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.cloudFunctionUrl}`, {
          params: {
            symbols: symbolQuery,
            fiat: fiat.toUpperCase(),
          },
        })
      );

      var marketDataMap: TokenMarketData[] = [];

      for (const symbol of uniqueSymbols) {
        const upperSymbol = symbol.toUpperCase();
        const data = response.data?.[upperSymbol];
        const quote = data?.quote?.[fiat.toUpperCase()];

        if (quote?.price != null) {
          marketDataMap.push({
            symbol: upperSymbol,
            price: quote.price,
            volume_24h: quote.volume_24h,
            volume_change_24h: quote.volume_change_24h,
            percent_change_1h: quote.percent_change_1h,
            percent_change_24h: quote.percent_change_24h,
            percent_change_7d: quote.percent_change_7d,
            percent_change_30d: quote.percent_change_30d,
            percent_change_60d: quote.percent_change_60d,
            percent_change_90d: quote.percent_change_90d,
            market_cap: quote.market_cap,
            market_cap_dominance: quote.market_cap_dominance,
            fully_diluted_market_cap: quote.fully_diluted_market_cap,
            tvl: quote.tvl ?? null,
            last_updated: quote.last_updated,
          } as TokenMarketData);
        }
      }

      console.log("market-data-cap", marketDataMap);

      return marketDataMap;
    } catch (err) {
      console.error('Errore nel recupero dei prezzi:', err);
      return [];
    }
  }
}
