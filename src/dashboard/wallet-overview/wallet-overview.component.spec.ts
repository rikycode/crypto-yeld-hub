import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletOverviewComponent } from './wallet-overview.component';

describe('WalletOverviewComponent', () => {
  let component: WalletOverviewComponent;
  let fixture: ComponentFixture<WalletOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
