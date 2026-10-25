package com.linguatalk.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Language {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code; // EN, KO

    @Column(nullable = false)
    private String name; // English, Korean

    @Column(name = "native_name", nullable = false)
    private String nativeName; // English, 한국어

    @Column(name = "flag_emoji")
    private String flagEmoji;
}
