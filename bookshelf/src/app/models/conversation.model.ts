import { Book } from './book.model';
import { MessageResponseDTO } from './message.model';
import { User } from './user.model';

export interface Conversation {
  id: number;
  book: Book;
  participants: User[];
  messages: MessageResponseDTO[];
  createdAt: string;
  otherUser?: User;
  lastMessage?: MessageResponseDTO;
  unreadCount?: number;
}