package com.bookshelf.api.repositories;

import com.bookshelf.api.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Encontra uma conversa que envolve um livro específico e um conjunto de participantes.
     * Esta query customizada garante que não criamos conversas duplicadas.
     * @param bookId O ID do livro.
     * @param participantIds A lista de IDs dos participantes.
     * @param participantCount O número de participantes na lista.
     * @return Um Optional contendo a Conversation, se encontrada.
     */
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE c.book.id = :bookId AND p.id IN :participantIds GROUP BY c.id HAVING COUNT(DISTINCT p.id) = :participantCount")
    Optional<Conversation> findByBookAndParticipants(
        @Param("bookId") Long bookId,
        @Param("participantIds") List<Long> participantIds,
        @Param("participantCount") long participantCount
    );

    /**
     * Encontra todas as conversas em que um determinado utilizador participa.
     * @param userId O ID do utilizador.
     * @return Uma lista de conversas.
     */
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findByParticipantId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId")
    List<Conversation> findAllByParticipant(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.book.owner.id = :ownerId")
    List<Conversation> findAllByBookOwnerId(@Param("ownerId") Long ownerId);

    List<Conversation> findByBook_Id(Long bookId);
}