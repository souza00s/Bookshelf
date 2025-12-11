import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
  HeaderComponent, // Agora está a importar um componente standalone
  ],
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}