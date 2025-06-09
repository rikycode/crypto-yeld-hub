import { TestBed } from '@angular/core/testing';

import { PriceFetcherService } from './price-fetcher.service';

describe('PriceFetcherService', () => {
  let service: PriceFetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceFetcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
