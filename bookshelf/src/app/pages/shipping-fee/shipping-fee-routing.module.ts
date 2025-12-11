import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShippingFeePage } from './shipping-fee.page';

const routes: Routes = [
  {
    path: '',
    component: ShippingFeePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShippingFeePageRoutingModule {}
