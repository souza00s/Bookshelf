package com.bookshelf.api.socket;

import com.bookshelf.api.dtos.MessageDTO;
import com.bookshelf.api.dtos.MessageResponseDTO;
import com.bookshelf.api.services.MessageService;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SocketModule {

    private final SocketIOServer server;
    private final MessageService messageService;

    public SocketModule(SocketIOServer server, MessageService messageService) {
        this.server = server;
        this.messageService = messageService;

        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
    server.addEventListener("joinRoom", String.class, onJoinRoom());
    server.addEventListener("leaveRoom", String.class, onLeaveRoom());
        server.addEventListener("sendMessage", MessageDTO.class, onSendMessage());
    }

    private DataListener<String> onJoinRoom() {
        return (client, room, ackSender) -> {
            log.info("SOCKET FLOW: onJoinRoom -> client={} entrando na sala='{}'", client.getSessionId(), room);
            client.joinRoom(room);
            log.info("SOCKET FLOW: onJoinRoom -> client={} entrou na sala='{}'", client.getSessionId(), room);
        };
    }

    private DataListener<String> onLeaveRoom() {
        return (client, room, ackSender) -> {
            log.info("SOCKET FLOW: onLeaveRoom -> client={} saindo da sala='{}'", client.getSessionId(), room);
            client.leaveRoom(room);
        };
    }

    private DataListener<MessageDTO> onSendMessage() {
        return (senderClient, data, ackSender) -> {
        log.info("SOCKET FLOW: onSendMessage -> recebido de client={} | conversationId={} | senderId={}",
            senderClient.getSessionId(), data.getConversationId(), data.getSenderId());
            try {
                MessageResponseDTO responseDto = messageService.processAndSaveMessage(data);
        log.info("SOCKET FLOW: onSendMessage -> mensagem salva id={} convId={} senderId={}",
            responseDto.getId(), responseDto.getConversationId(),
            responseDto.getSender() != null ? responseDto.getSender().getId() : null);

                String room = data.getConversationId().toString();
                server.getRoomOperations(room).sendEvent("newMessage", responseDto);
        log.info("SOCKET FLOW: onSendMessage -> 'newMessage' enviado para sala='{}'", room);

            } catch (Exception e) {
        log.error("SOCKET ERROR: onSendMessage falhou. Causa: {}", e.getMessage(), e);
            }
        };
    }

    private ConnectListener onConnected() {
    return client -> log.info("SOCKET FLOW: onConnected -> client conectado id={}", client.getSessionId());
    }

    private DisconnectListener onDisconnected() {
    return client -> log.info("SOCKET FLOW: onDisconnected -> client desconectado id={}", client.getSessionId());
    }
}