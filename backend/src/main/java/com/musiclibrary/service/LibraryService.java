package com.musiclibrary.service;

import com.musiclibrary.dto.AlbumResponse;
import com.musiclibrary.dto.AlbumSaveRequest;
import com.musiclibrary.dto.AlbumUpdateRequest;
import com.musiclibrary.exception.ConflictException;
import com.musiclibrary.exception.ResourceNotFoundException;
import com.musiclibrary.model.LibraryAlbum;
import com.musiclibrary.repository.LibraryAlbumRepository;
import com.musiclibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibraryService {

    private final LibraryAlbumRepository albumRepository;
    private final UserRepository userRepository;

    public Page<AlbumResponse> getLibrary(String username, Pageable pageable) {
        String userId = getUserId(username);
        return albumRepository.findByUserId(userId, pageable)
                .map(this::toResponse);
    }

    public AlbumResponse saveAlbum(String username, AlbumSaveRequest request) {
        String userId = getUserId(username);

        if (albumRepository.existsByUserIdAndAppleCatalogId(userId, request.getAppleCatalogId())) {
            throw new ConflictException("Album with catalog ID " + request.getAppleCatalogId() + " already exists in your library");
        }

        LibraryAlbum album = LibraryAlbum.builder()
                .userId(userId)
                .appleCatalogId(request.getAppleCatalogId())
                .title(request.getTitle())
                .artistName(request.getArtistName())
                .genre(request.getGenre())
                .releaseDate(request.getReleaseDate())
                .trackCount(request.getTrackCount())
                .artworkUrl(request.getArtworkUrl())
                .price(request.getPrice())
                .userRating(request.getUserRating())
                .userNotes(request.getUserNotes())
                .build();

        album = albumRepository.save(album);
        log.info("Saved album '{}' for user '{}'", album.getTitle(), username);
        return toResponse(album);
    }

    public AlbumResponse updateAlbum(String username, String albumId, AlbumUpdateRequest request) {
        String userId = getUserId(username);

        LibraryAlbum album = albumRepository.findByIdAndUserId(albumId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found with id: " + albumId));

        if (request.getUserRating() != null) {
            album.setUserRating(request.getUserRating());
        }
        if (request.getUserNotes() != null) {
            album.setUserNotes(request.getUserNotes());
        }

        album = albumRepository.save(album);
        log.info("Updated album '{}' for user '{}'", album.getTitle(), username);
        return toResponse(album);
    }

    public void deleteAlbum(String username, String albumId) {
        String userId = getUserId(username);

        LibraryAlbum album = albumRepository.findByIdAndUserId(albumId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Album not found with id: " + albumId));

        albumRepository.delete(album);
        log.info("Deleted album '{}' for user '{}'", album.getTitle(), username);
    }

    public boolean isAlbumInLibrary(String username, Long catalogId) {
        String userId = getUserId(username);
        return albumRepository.existsByUserIdAndAppleCatalogId(userId, catalogId);
    }

    private String getUserId(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username))
                .getId();
    }

    private AlbumResponse toResponse(LibraryAlbum album) {
        return AlbumResponse.builder()
                .id(album.getId())
                .appleCatalogId(album.getAppleCatalogId())
                .title(album.getTitle())
                .artistName(album.getArtistName())
                .genre(album.getGenre())
                .releaseDate(album.getReleaseDate())
                .trackCount(album.getTrackCount())
                .artworkUrl(album.getArtworkUrl())
                .price(album.getPrice())
                .userRating(album.getUserRating())
                .userNotes(album.getUserNotes())
                .createdAt(album.getCreatedAt())
                .updatedAt(album.getUpdatedAt())
                .build();
    }
}
