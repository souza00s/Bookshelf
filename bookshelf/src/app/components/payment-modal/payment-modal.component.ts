import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent {
  @Input() pixKey: string | null | undefined; // legacy single
  @Input() pixKeys: string[] | null | undefined; // new list
  @Input() amount: number | null = null;

  selectedKey: string | null = null;
  copied = false;

  constructor(private modalCtrl: ModalController) {}

  cancel() { this.modalCtrl.dismiss(null, 'cancel'); }
  confirm() {
    if (!this.selectedKey && !this.pixKey) return;
    this.modalCtrl.dismiss({ confirmed: true, pixKey: this.selectedKey || this.pixKey }, 'confirm');
  }

  chooseKey(key: string) {
    this.selectedKey = key;
  }

  copyKey(key: string) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(key).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    });
  }

  // Lista única de chaves para exibição (remove duplicadas e valores falsy)
  get uniqueKeys(): string[] {
    const base = (this.pixKeys && this.pixKeys.length ? this.pixKeys : (this.pixKey ? [this.pixKey] : []));
    return [...new Set(base.filter(k => !!k))];
  }
}
