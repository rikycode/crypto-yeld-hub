import { TestBed } from '@angular/core/testing';

import { WalletStoreService } from './wallet-store.service';

describe('WalletStoreService', () => {
  let service: WalletStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
