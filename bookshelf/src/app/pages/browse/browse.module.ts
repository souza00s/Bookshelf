import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; 

import { BrowsePageRoutingModule } from './browse-routing.module';
import { BrowsePage } from './browse.page';
import { BookCardComponent } from 'src/app/components/book-card/book-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BrowsePageRoutingModule,
    ReactiveFormsModule, 
    BookCardComponent    
  ],
  declarations: [BrowsePage]
})
export class BrowsePageModule {}
