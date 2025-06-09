import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface WalletVerificationResult {
  chain: string;
  chainId: string;
  balance: number;
}

@Injectable({
  providedIn: 'root',
})
export class WalletVerifierService {
  private readonly API_BASE_URL = 'https://crypto-price-api-h8vd.onrender.com'; // Tuo endpoint Render

  constructor(private http: HttpClient) {}

  verifyWalletMultiChain(address: string) {
    const chains = [
      { name: 'Ethereum', id: 'eth' },
      { name: 'BSC', id: 'bsc' },
      { name: 'Polygon', id: 'polygon' },
      { name: 'Arbitrum', id: 'arbitrum' },
      { name: 'Optimism', id: 'optimism' },
      { name: 'Base', id: 'base' },
    ];

    const requests = chains.map((chain) =>
      this.http
        .get<{ balance: string }>(
          `${this.API_BASE_URL}/wallet/native?address=${address}&chain=${chain.id}`
        )
        .pipe(
          map((res) => ({
            chain: chain.name,
            chainId: chain.id,
            balance: parseFloat(res.balance) / 1e18,
          })),
          catchError((err) => {
            console.warn(`Errore su ${chain.name}:`, err.message);
            return of(null);
          })
        )
    );

    return forkJoin(requests).pipe(
      map((results) =>
        results
          .filter(
            (r): r is WalletVerificationResult =>
              !!r && r.balance > 0 // solo chain con saldo
          )
      )
    );
  }
}
