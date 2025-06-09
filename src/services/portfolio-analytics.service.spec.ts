import { TestBed } from '@angular/core/testing';

import { PortfolioAnalyticsService } from './portfolio-analytics.service';

describe('PortfolioAnalyticsService', () => {
  let service: PortfolioAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
