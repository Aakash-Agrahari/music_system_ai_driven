package com.musiclibrary.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "library_albums")
@CompoundIndexes({
    @CompoundIndex(name = "user_catalog_unique", def = "{'userId': 1, 'appleCatalogId': 1}", unique = true)
})
public class LibraryAlbum {

    @Id
    private String id;

    private String userId;

    // iTunes catalog data
    private Long appleCatalogId;
    private String title;
    private String artistName;
    private String genre;
    private LocalDate releaseDate;
    private Integer trackCount;
    private String artworkUrl;
    private Double price;

    // User-specific data
    private Integer userRating;     // 1-5
    private String userNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
