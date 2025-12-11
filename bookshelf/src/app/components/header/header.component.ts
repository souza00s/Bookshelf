import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth';
import { NotificationService } from 'src/app/services/notification';
import { MessageService } from 'src/app/services/message';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true, // 1. Adicione standalone: true
  imports: [
    CommonModule,    // 2. Importe CommonModule para *ngIf e o pipe async
    RouterModule,    // 3. Importe RouterModule para routerLink
    IonicModule      // 4. Importe IonicModule para ion-header, ion-toolbar, ion-icon
  ]
})
export class HeaderComponent {
  public currentUser$: Observable<User | null>;

  constructor(private authService: AuthService, public notif: NotificationService, public msg: MessageService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  onLogout() {
    this.authService.logout();
  }
}