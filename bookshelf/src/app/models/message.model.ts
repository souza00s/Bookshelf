export interface MessageResponseDTO {
  id: number;
  content: string;
  timestamp: string; 
  conversationId: number;
  sender: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
}