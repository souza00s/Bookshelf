package com.bookshelf.api.dtos;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationScrollDTO {
    private List<NotificationDTO> items;
    private Long nextCursor; // menor id retornado
    private boolean hasMore;
}
