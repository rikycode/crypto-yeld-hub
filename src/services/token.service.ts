import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly API_BASE_URL = 'https://crypto-price-api-h8vd.onrender.com';

  constructor(private http: HttpClient) {}

  async getERC20Tokens(address: string, chain: string): Promise<any[]> {
    const url = `${this.API_BASE_URL}/wallet/erc20?address=${address}&chain=${chain}`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async getNFTs(address: string, chain: string): Promise<any[]> {
    const url = `${this.API_BASE_URL}/wallet/nfts?address=${address}&chain=${chain}`;
    const response = await firstValueFrom(this.http.get<any>(url));
    return response || [];
  }

  async getNativeBalance(address: string, chain: string): Promise<number> {
    const url = `${this.API_BASE_URL}/wallet/native?address=${address}&chain=${chain}`;
    const response = await firstValueFrom(this.http.get<any>(url));
    return parseFloat(response.balance) / Math.pow(10, 18);
  }
}
