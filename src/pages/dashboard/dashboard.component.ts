// 📁 dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletOverviewComponent } from '../../dashboard/wallet-overview/wallet-overview.component';
import { SuggestionsComponent } from '../../dashboard/suggestions/suggestions.component';
import { PerformanceChartComponent } from '../../dashboard/performance-chart/performance-chart.component';
import { PortfolioComponent } from '../../dashboard/portfolio/portfolio.component';
import { WalletStoreService } from '../../services/wallet/wallet-store.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { TokenDocsDto, WalletDataDto, Chain } from '../../models/wallet-data-dto';
import { WalletData } from '../../services/wallet/wallet-store.service';
import { TokenData } from '../../models/token-data.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WalletOverviewComponent,
    PerformanceChartComponent,
    PortfolioComponent,
    SuggestionsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  activeSection: string = 'wallet';
  menuClosed: boolean = false;

  walletsData: WalletData[] = [];
  tokenDocsDto: TokenDocsDto[] = [];
  walletDataDto: WalletDataDto[] = [];

  constructor(
    private authService: AuthService,
    private walletStore: WalletStoreService,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    const user = this.authService.currentUser;
    if (!user) return;
    await this.loadWalletsAndTokens(user.uid);
  }

  async loadWalletsAndTokens(uid: string) {
    this.walletsData = await this.walletStore.getWalletsByUid(uid);
    this.tokenDocsDto = await this.walletStore.getTokensByUid(uid);
    this.walletDataDto = [];

    for (const wallet of this.walletsData) {
      const walletDto: WalletDataDto = {
        address: wallet.address,
        lastUpdated: wallet.lastUpdated,
        uid: wallet.address,
        chains: [],
      };

      for (const chain of wallet.chains) {
        const tokens = this.tokenDocsDto
          .find(doc => doc.walletAddress === wallet.address)?.tokens
          .filter(token => token.chain === chain.chainId) || [];

        walletDto.chains.push({
          chainId: chain.chainId,
          balance: chain.balance,
          timestamp: chain.timestamp,
          tokens: tokens,
        });
      }

      this.walletDataDto.push(walletDto);
    }
  }

  selectSection(section: string) {
    this.activeSection = section;
  }

  toggleMenu() {
    this.menuClosed = !this.menuClosed;
  }
}
