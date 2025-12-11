import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DonatePageRoutingModule } from './donate-routing.module';
import { DonatePage } from './donate.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DonatePageRoutingModule,
    ReactiveFormsModule 
  ],
  declarations: [DonatePage]
})
export class DonatePageModule {}