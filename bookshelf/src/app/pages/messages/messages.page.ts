import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent, ActionSheetController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Conversation } from 'src/app/models/conversation.model';
import { MessageResponseDTO } from 'src/app/models/message.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth';
import { MessageService } from 'src/app/services/message';
import { SocketService } from 'src/app/services/socket';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: false
})
export class MessagesPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  public conversations: Conversation[] = [];
  public selectedConversation: Conversation | null = null;
  public isLoading = true;
  public newMessage = '';
  public loggedInUser: User | null = null;

  private conversationSub!: Subscription;
  private newMessagesSub!: Subscription;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private socketService: SocketService,
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loggedInUser = this.authService.currentUserValue;

    // A página agora "ouve" o serviço para receber a lista de conversas em tempo real
    this.conversationSub = this.messageService.conversations$.subscribe(convos => {
  this.conversations = convos;
      this.isLoading = false;

  // Entra em todas as salas das conversas para receber eventos mesmo quando não estiver selecionada
  convos.forEach(c => this.socketService.joinRoom(c.id));

      // Lógica para manter ou limpar a conversa selecionada
      if (this.selectedConversation && !convos.find(c => c.id === this.selectedConversation!.id)) {
        this.selectedConversation = null;
      }
      if (!this.selectedConversation && this.conversations.length > 0) {
        this.selectConversation(this.conversations[0]);
      }
    });

    // Pede ao serviço para buscar a lista de conversas mais recente ao entrar na página
    this.messageService.getConversations().subscribe();

    this.listenForNewMessages();
  }

  ngOnDestroy() {
    this.conversationSub?.unsubscribe();
    this.newMessagesSub?.unsubscribe();
    if (this.selectedConversation) {
      this.socketService.leaveRoom(this.selectedConversation.id);
    }
  }

  listenForNewMessages() {
    this.newMessagesSub = this.messageService.getNewMessages().subscribe((newMessage: MessageResponseDTO) => {
      const idx = this.conversations.findIndex(c => c.id === newMessage.conversationId);
      if (idx > -1) {
        const current = this.conversations[idx];
        // Remove otimista se existir
        let msgs = current.messages.filter(m => !(m.id === -1 && m.content === newMessage.content));
        // Adiciona se ainda não existe
        if (!msgs.some(m => m.id === newMessage.id)) {
          msgs = [...msgs, newMessage];
        }
        const updated = { ...current, messages: msgs, lastMessage: newMessage };
        this.conversations = [
          ...this.conversations.slice(0, idx),
          updated,
          ...this.conversations.slice(idx + 1)
        ];
        if (this.selectedConversation?.id === updated.id) {
          this.selectedConversation = updated;
          this.scrollToBottom(100);
        }
      }
    });
  }

  isSent(msg: MessageResponseDTO): boolean {
    const uid = this.loggedInUser?.id;
    const sid = msg?.sender?.id;
    if (uid == null || sid == null) return false;
    return Number(sid) === Number(uid);
  }

  async presentConversationOptions(event: Event, conversation: Conversation) {
    event.stopPropagation();

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Opções para a conversa com ${conversation.otherUser?.name}`,
      buttons: [
        {
          text: 'Excluir Conversa',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.messageService.deleteConversation(conversation.id).subscribe({
              next: () => {
                // A UI será atualizada automaticamente pelo `conversations$`
                this.presentToast('Conversa excluída com sucesso.', 'success');
              },
              error: (err) => {
                //console.error('Erro ao excluir a conversa:', err);
                this.presentToast('Não foi possível excluir a conversa.', 'danger');
              }
            });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline',
        }
      ]
    });
    await actionSheet.present();
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.socketService.joinRoom(conversation.id);
    setTimeout(() => this.scrollToBottom(0), 0);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation || !this.loggedInUser) return;

    const optimisticMessage: MessageResponseDTO = {
      id: -1,
      content: this.newMessage.trim(),
      timestamp: new Date().toISOString(),
      conversationId: this.selectedConversation.id,
      sender: {
        id: this.loggedInUser.id,
        name: this.loggedInUser.name,
        avatarUrl: this.loggedInUser.avatarUrl
      }
    };

    this.selectedConversation.messages.push(optimisticMessage);
    this.scrollToBottom(100);

    this.messageService.sendMessage(this.selectedConversation.id, this.newMessage);
    this.newMessage = '';
  }

  scrollToBottom(duration = 300) {
    this.content?.scrollToBottom(duration);
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}