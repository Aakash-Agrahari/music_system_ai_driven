package com.musiclibrary.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AlbumSaveRequest {

    @NotNull(message = "Apple Catalog ID is required")
    private Long appleCatalogId;

    @NotNull(message = "Title is required")
    private String title;

    @NotNull(message = "Artist name is required")
    private String artistName;

    private String genre;
    private LocalDate releaseDate;
    private Integer trackCount;
    private String artworkUrl;
    private Double price;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer userRating;

    private String userNotes;
}
