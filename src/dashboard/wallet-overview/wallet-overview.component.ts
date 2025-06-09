import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  WalletVerifierService,
  WalletVerificationResult,
} from '../../services/wallet/wallet-verifier.service';
import { WalletStoreService } from '../../services/wallet/wallet-store.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { TokenData } from '../../models/token-data.model';
import { TokenDocsDto, WalletDataDto } from '../../models/wallet-data-dto';

@Component({
  selector: 'app-wallet-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './wallet-overview.component.html',
  styleUrls: ['./wallet-overview.component.scss'],
})
export class WalletOverviewComponent {
  @Input() walletDataDto: WalletDataDto[] = [];
  walletAddress = '';
  expandedWallets = new Set<string>();

  constructor(
    private walletVerifier: WalletVerifierService,
    private walletStore: WalletStoreService,
    public authServices: AuthService,
    private tokenService: TokenService,
    private cdRef: ChangeDetectorRef
  ) {}

  async addWallet() {
    if (!this.walletAddress) {
      alert('Inserisci un indirizzo wallet valido');
      return;
    }

    this.walletVerifier.verifyWalletMultiChain(this.walletAddress).subscribe(
      async (results: Array<WalletVerificationResult | null>) => {
        if (results.length === 0) {
          alert('Wallet non trovato o senza saldo sulle chain supportate.');
          return;
        }

        const allParsedTokens: TokenData[] = [];

        for (const result of results) {
          if (result) {
            await this.walletStore.saveOrUpdateWallet(
              this.authServices.currentUser!.uid,
              this.walletAddress,
              {
                chainId: result.chainId,
                balance: result.balance,
                timestamp: new Date(),
              }
            );

            const erc20Tokens = await this.tokenService.getERC20Tokens(
              this.walletAddress,
              result.chainId
            );

            const parsedTokens: TokenData[] = erc20Tokens.map((t: any) => ({
              name: t.name,
              symbol: t.symbol,
              logo: t.logo || '',
              balance: parseFloat(t.balance) / Math.pow(10, t.decimals),
              decimals: t.decimals,
              address: t.token_address,
              chain: result.chainId,
            })) as TokenData[];

            allParsedTokens.push(...parsedTokens);

            await this.walletStore.saveTokens(
              this.authServices.currentUser!.uid,
              this.walletAddress,
              parsedTokens
            );
          }
        }

        // Ricarica pagina per ora
        window.location.reload();
      },
      (err) => {
        alert('Errore durante la verifica wallet');
        console.error(err);
      }
    );
  }

  async deleteWallet(address: string) {
    await this.walletStore
      .deleteWalletByAddress(address)
      .then(() => {
        alert(`wallet con address ${address} eliminato definitivamente!`);
        // Ricarica pagina per ora
        window.location.reload();
      })
      .catch((err) => {
        alert(
          `errore nell'eliminazione del wallet con address ${address}\nErrore:${err.message}`
        );
      });
  }

  toggleExpand(address: string) {
    this.expandedWallets.has(address)
      ? this.expandedWallets.delete(address)
      : this.expandedWallets.add(address);
  }
}
