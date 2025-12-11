import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Book } from 'src/app/models/book.model';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class BookCardComponent implements OnInit {
  @Input() book!: Book;

  constructor() { }

  ngOnInit() {}

  // Função para formatar a condição do livro
  formatCondition(condition: string) {
    switch (condition) {
      case 'novo': return 'Novo';
      case 'excelente': return 'Excelente';
      case 'bom': return 'Bom';
      case 'usado': return 'Usado';
      default: return condition;
    }
  }
}
