import { TokenData } from "./token-data.model";
import { WalletData } from "../services/wallet/wallet-store.service";


export interface WalletDataDto {
  address: string;
  lastUpdated: Date;
  uid: string;
  chains: Chain[];
}


export interface Chain {
  chainId: string;
  balance: number;
  timestamp: Date;
  tokens: TokenData[];
}


export interface TokenDocsDto {
  walletAddress: string;
  lastUpdated: Date;
  uid: string;
  tokens: TokenData[];
}

