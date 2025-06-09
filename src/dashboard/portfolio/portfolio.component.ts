import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { WalletDataDto } from '../../models/wallet-data-dto';
import { TokenData } from '../../models/token-data.model';
import { CommonModule } from '@angular/common';
import { PortfolioAnalyticsService } from '../../services/portfolio-analytics.service';
import { PriceFetcherService } from '../../services/price-fetcher.service';
import { Subscription, interval } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
} from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { TokenPerformanceSummary } from '../../models/token-performance-summary.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  imports: [CommonModule, NgApexchartsModule, FormsModule],
})
export class PortfolioComponent implements OnChanges, OnDestroy {
  @Input() walletDataDto: WalletDataDto[] = [];

  totalByChain: { chainId: string; totalBalance: number }[] = [];
  totalTokens: { symbol: string; logo: string; balance: number }[] = [];
  // Nuova variabile
  distributionByChain: { chainId: string; valueFiat: number }[] = [];
  distributionByToken: { symbol: string; logo: string; valueFiat: number }[] =
    [];
  tokenPerformanceSummary: any;

  totalBalance: number = 0;
  totalBalanceFiat: number = 0;
  supportedFiats: string[] = ['EUR', 'USD', 'GBP', 'JPY', 'CHF'];

  fiat: 'EUR' | 'USD' = 'EUR';
  tokenPrices: Record<string, number> = {};
  timeframeKeyMap: { [key: string]: string } = {
    '24h': 'percent_change_24h',
    '7d': 'percent_change_7d',
    '30d': 'percent_change_30d',
    '60d': 'percent_change_60d',
    '90d': 'percent_change_90d',
  };

  showAllTokens = false;

  private refreshSub?: Subscription;

  chartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'donut',
      width: 300, // 👈 METTI UN NUMERO, non '100%'
    },
    labels: [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 250,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    legend: {
      position: 'right',
      offsetY: 0,
    },
  };

  chartOptionsByToken: ChartOptions = {
    series: [],
    chart: {
      type: 'pie',
      width: 300,
    },
    labels: [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 250,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    legend: {
      position: 'right',
      offsetY: 0,
    },
  };

  constructor(
    private analyticsService: PortfolioAnalyticsService,
    private priceFetcher: PriceFetcherService
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['walletDataDto'] && this.walletDataDto.length > 0) {
      this.computePortfolio();

      await this.fetchTokenPricesAndUpdateFiat();
      await this.loadTopMovers();
      // ⏱️ Attiva aggiornamento automatico ogni 60s
      if (!this.refreshSub) {
        this.refreshSub = interval(60000).subscribe(() => {
          this.fetchTokenPricesAndUpdateFiat();
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  private async fetchTokenPricesAndUpdateFiat(): Promise<void> {
    await this.computePortfolio();
  }

  private async fetchTokenPrices() {
    let allTokens: TokenData[] = [];

    this.walletDataDto.forEach((wallet) => {
      wallet.chains.forEach((chain) => {
        allTokens = [...allTokens, ...chain.tokens];
      });
    });

    this.tokenPrices = await this.priceFetcher.fetchPrices(
      allTokens,
      this.fiat
    );
  }

  async computePortfolio(): Promise<void> {
    const chainTotals = new Map<string, number>();
    const tokenTotals = new Map<string, { balance: number; logo: string }>();

    let allTokens: TokenData[] = [];
    this.totalBalance = 0;

    this.walletDataDto.forEach((wallet) => {
      wallet.chains.forEach((chain) => {
        this.totalBalance += chain.balance;

        chainTotals.set(
          chain.chainId,
          (chainTotals.get(chain.chainId) || 0) + chain.balance
        );

        allTokens = [...allTokens, ...chain.tokens];

        chain.tokens.forEach((token) => {
          if (!tokenTotals.has(token.symbol)) {
            tokenTotals.set(token.symbol, { balance: 0, logo: token.logo });
          }
          tokenTotals.get(token.symbol)!.balance += token.balance;
        });
      });
    });

    this.totalByChain = Array.from(chainTotals.entries()).map(
      ([chainId, totalBalance]) => ({
        chainId,
        totalBalance,
      })
    );

    this.totalTokens = Array.from(tokenTotals.entries())
      .map(([symbol, data]) => ({
        symbol,
        logo: data.logo,
        balance: data.balance,
      }))
      .sort((a, b) => b.balance - a.balance);

    // 💸 Fetch dei prezzi
    this.tokenPrices = await this.analyticsService.fetchTokenPrices(
      allTokens,
      this.fiat
    );
    this.totalBalanceFiat = this.analyticsService.computeTotalFiatValue(
      allTokens,
      this.fiat,
      this.tokenPrices
    );

    console.log(`💰 Totale in ${this.fiat}:`, this.totalBalanceFiat);
    this.computeDistributionByChain();
    this.computeDistributionByToken();
    // this.loadTopMovers();
  }

  private computeDistributionByChain(): void {
    const result: { [chainId: string]: number } = {};

    this.walletDataDto.forEach((wallet) => {
      wallet.chains.forEach((chain) => {
        chain.tokens.forEach((token) => {
          const price = this.tokenPrices[token.symbol.toLowerCase()] ?? 0;
          const fiatValue = token.balance * price;

          if (!result[chain.chainId]) {
            result[chain.chainId] = 0;
          }
          result[chain.chainId] += fiatValue;
        });
      });
    });

    const distribution = Object.entries(result)
      .map(([chainId, valueFiat]) => ({ chainId, valueFiat }))
      .sort((a, b) => b.valueFiat - a.valueFiat);

    this.distributionByChain = distribution;

    // 🎯 Configura i dati per il grafico
    this.chartOptions.series = distribution.map((d) =>
      parseFloat(d.valueFiat.toFixed(2))
    );
    this.chartOptions.labels = distribution.map((d) => d.chainId.toUpperCase());
  }

  private computeDistributionByToken(): void {
    const tokenMap: Record<string, { logo: string; valueFiat: number }> = {};

    this.walletDataDto.forEach((wallet) => {
      wallet.chains.forEach((chain) => {
        chain.tokens.forEach((token) => {
          const symbol = token.symbol.toUpperCase();
          const price = this.tokenPrices[symbol.toLowerCase()] ?? 0;
          const fiatValue = token.balance * price;

          if (!tokenMap[symbol]) {
            tokenMap[symbol] = {
              logo: token.logo || 'assets/default-token.png',
              valueFiat: 0,
            };
          }
          tokenMap[symbol].valueFiat += fiatValue;
        });
      });
    });

    const distribution = Object.entries(tokenMap)
      .map(([symbol, data]) => ({
        symbol,
        logo: data.logo,
        valueFiat: data.valueFiat,
      }))
      .sort((a, b) => b.valueFiat - a.valueFiat);

    this.distributionByToken = distribution;

    this.chartOptionsByToken.series = distribution.map((d) =>
      parseFloat(d.valueFiat.toFixed(2))
    );
    this.chartOptionsByToken.labels = distribution.map((d) => d.symbol);
  }

  async onFiatChange(): Promise<void> {
    await this.fetchTokenPricesAndUpdateFiat();
    this.computeDistributionByChain();
    this.computeDistributionByToken(); // Se esiste o l'aggiungiamo
    this.loadTopMovers();
  }

  toggleShowAll() {
    this.showAllTokens = !this.showAllTokens;
  }

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectFiat(currency: string) {
    this.fiat = currency as any;
    this.dropdownOpen = false;
    this.onFiatChange();
  }

  async loadTopMovers() {
    const allTokens = this.walletDataDto.flatMap((w) =>
      w.chains.flatMap((c) => c.tokens.map((t) => t.symbol))
    );

    const uniqueSymbols = Array.from(new Set(allTokens));
    const tokenMarketDataArray = await this.priceFetcher.getPriceDataForTokens(
      uniqueSymbols,
      this.fiat
    );

    const summary =
      this.analyticsService.getPerformanceSummary(tokenMarketDataArray);
    this.tokenPerformanceSummary = summary
    console.log('summary tokens:', summary);

  }
}

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
};
