import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  query,
  collection,
  getDocs,
  where,
  deleteDoc,
} from '@angular/fire/firestore';
import { TokenData } from '../../models/token-data.model';
import { TokenDocsDto } from '../../models/wallet-data-dto';

export interface ChainBalance {
  chainId: string;
  balance: number;
  timestamp: Date;
}

export interface WalletData {
  address: string;
  chains: ChainBalance[];
  lastUpdated: Date;
  uid: string; // 👈 Aggiunto per sapere a chi appartiene il wallet
}

@Injectable({
  providedIn: 'root',
})
export class WalletStoreService {
  constructor(private firestore: Firestore) {}

  async saveOrUpdateWallet(
    uid: string, // 👈 aggiunto parametro
    address: string,
    chainData: ChainBalance
  ): Promise<void> {
    const walletRef = doc(this.firestore, `wallets/${address}`);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      const data = walletSnap.data() as WalletData;
      const existingIndex = data.chains.findIndex(
        (c) => c.chainId === chainData.chainId
      );

      if (existingIndex > -1) {
        data.chains[existingIndex] = chainData;
      } else {
        data.chains.push(chainData);
      }

      await updateDoc(walletRef, {
        chains: data.chains.map((c) => ({
          chainId: c.chainId,
          balance: c.balance,
          timestamp: this.toFirestoreTimestamp(c.timestamp),
        })),
        lastUpdated: Timestamp.fromDate(new Date()),
      });
    } else {
      const newWallet: WalletData = {
        uid,
        address,
        chains: [chainData],
        lastUpdated: new Date(),
      };

      await setDoc(walletRef, {
        ...newWallet,
        chains: newWallet.chains.map((c) => ({
          chainId: c.chainId,
          balance: c.balance,
          timestamp: this.toFirestoreTimestamp(c.timestamp),
        })),
        lastUpdated: this.toFirestoreTimestamp(newWallet.lastUpdated),
      });
    }
  }

  async getWallet(address: string): Promise<WalletData | undefined> {
    const walletRef = doc(this.firestore, `wallets/${address}`);
    const walletSnap = await getDoc(walletRef);
    if (walletSnap.exists()) {
      return walletSnap.data() as WalletData;
    }
    return undefined;
  }

  async getWallets(uid: string): Promise<any[]> {
    const walletsRef = collection(this.firestore, 'wallets');
    const q = query(walletsRef, where('uid', '==', uid));
    const walletsSnapshot = await getDocs(q);

    const walletsData: any[] = [];

    for (const walletDoc of walletsSnapshot.docs) {
      const wallet = walletDoc.data();
      wallet['address'] = walletDoc.id; // ← walletAddress

      // Cerca i tokens associati al walletAddress nella collection 'tokens'
      const tokensRef = collection(this.firestore, 'tokens');
      const tq = query(tokensRef, where('walletAddress', '==', walletDoc.id));
      const tokensSnapshot = await getDocs(tq);

      const tokens = tokensSnapshot.docs.map((t) => t.data());

      console.log(`Tokens per ${walletDoc.id}:`, tokens);

      wallet['tokens'] = tokens;

      walletsData.push(wallet);
    }

    return walletsData;
  }

  // 👇 Per ottenere tutti i wallet di uno user
  async getWalletsByUid(uid: string): Promise<WalletData[]> {
    const q = query(
      collection(this.firestore, 'wallets'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as WalletData);
  }

  async getTokensByUid(uid: string): Promise<TokenDocsDto[]> {
    const q = query(
      collection(this.firestore, 'tokens'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);

    const mappedDocs = snap.docs.map((doc) => doc.data() as TokenDocsDto);

    // console.log('mappedTokens', mappedDocs);
    return mappedDocs;
  }

  async deleteWalletByAddress(address: string): Promise<void> {
    try {
      const walletRef = doc(this.firestore, `wallets/${address}`);
      const tokenRef = doc(this.firestore, `tokens/${address}`);

      await deleteDoc(walletRef);
      await deleteDoc(tokenRef);

      console.log(`Wallet e token associati eliminati per: ${address}`);
    } catch (error) {
      console.error(
        `Errore durante l'eliminazione del wallet ${address}:`,
        error
      );
      throw error;
    }
  }

  toFirestoreTimestamp(value: any): Timestamp {
    if (value instanceof Date) return Timestamp.fromDate(value);
    if (value instanceof Timestamp) return value;
    if (typeof value === 'string') return Timestamp.fromDate(new Date(value));
    return Timestamp.fromDate(new Date());
  }

  async saveTokens(
    uid: string,
    walletAddress: string,
    tokens: TokenData[]
  ): Promise<void> {
    const tokenRef = doc(this.firestore, `tokens/${walletAddress}`);
    await setDoc(tokenRef, {
      uid,
      walletAddress,
      tokens,
      lastUpdated: Timestamp.fromDate(new Date()),
    });
  }
}
