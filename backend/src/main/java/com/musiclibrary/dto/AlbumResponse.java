package com.musiclibrary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumResponse {
    private String id;
    private Long appleCatalogId;
    private String title;
    private String artistName;
    private String genre;
    private LocalDate releaseDate;
    private Integer trackCount;
    private String artworkUrl;
    private Double price;
    private Integer userRating;
    private String userNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
