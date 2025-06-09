import { TestBed } from '@angular/core/testing';

import { WalletVerifierService } from './wallet-verifier.service';

describe('WalletVerifierService', () => {
  let service: WalletVerifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletVerifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
