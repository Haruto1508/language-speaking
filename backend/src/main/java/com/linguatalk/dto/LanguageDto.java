package com.linguatalk.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanguageDto {
    private Long id;
    private String code;
    private String name;
    private String nativeName;
    private String flagEmoji;
}
