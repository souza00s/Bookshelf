import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShippingFeePage } from './shipping-fee.page';

describe('ShippingFeePage', () => {
  let component: ShippingFeePage;
  let fixture: ComponentFixture<ShippingFeePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingFeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
