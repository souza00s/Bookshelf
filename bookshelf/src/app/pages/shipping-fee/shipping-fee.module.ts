import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShippingFeePageRoutingModule } from './shipping-fee-routing.module';

import { ShippingFeePage } from './shipping-fee.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShippingFeePageRoutingModule
  ],
  declarations: [ShippingFeePage]
})
export class ShippingFeePageModule {}
