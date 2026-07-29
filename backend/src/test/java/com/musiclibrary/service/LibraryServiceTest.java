package com.musiclibrary.service;

import com.musiclibrary.dto.AlbumSaveRequest;
import com.musiclibrary.dto.AlbumResponse;
import com.musiclibrary.exception.ConflictException;
import com.musiclibrary.model.LibraryAlbum;
import com.musiclibrary.model.User;
import com.musiclibrary.repository.LibraryAlbumRepository;
import com.musiclibrary.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LibraryService Unit Tests")
class LibraryServiceTest {

    @Mock private LibraryAlbumRepository albumRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private LibraryService libraryService;

    private User mockUser;
    private LibraryAlbum mockAlbum;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id("user123")
                .username("testuser")
                .email("test@example.com")
                .build();

        mockAlbum = LibraryAlbum.builder()
                .id("album123")
                .userId("user123")
                .appleCatalogId(1122782080L)
                .title("Parachutes")
                .artistName("Coldplay")
                .genre("Alternative")
                .releaseDate(LocalDate.of(2000, 7, 10))
                .trackCount(10)
                .build();
    }

    @Test
    @DisplayName("getLibrary returns paginated albums for authenticated user")
    void getLibrary_ReturnsPaginatedAlbums() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        Page<LibraryAlbum> page = new PageImpl<>(List.of(mockAlbum));
        when(albumRepository.findByUserId(eq("user123"), any())).thenReturn(page);

        Page<AlbumResponse> result = libraryService.getLibrary("testuser", PageRequest.of(0, 12));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Parachutes");
    }

    @Test
    @DisplayName("saveAlbum saves a new album successfully")
    void saveAlbum_SavesNewAlbum() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByUserIdAndAppleCatalogId("user123", 1122782080L)).thenReturn(false);
        when(albumRepository.save(any(LibraryAlbum.class))).thenReturn(mockAlbum);

        AlbumSaveRequest request = new AlbumSaveRequest();
        request.setAppleCatalogId(1122782080L);
        request.setTitle("Parachutes");
        request.setArtistName("Coldplay");
        request.setGenre("Alternative");

        AlbumResponse response = libraryService.saveAlbum("testuser", request);

        assertThat(response.getTitle()).isEqualTo("Parachutes");
        assertThat(response.getArtistName()).isEqualTo("Coldplay");
        verify(albumRepository, times(1)).save(any(LibraryAlbum.class));
    }

    @Test
    @DisplayName("saveAlbum throws ConflictException when album already exists")
    void saveAlbum_ThrowsConflict_WhenAlbumExists() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByUserIdAndAppleCatalogId("user123", 1122782080L)).thenReturn(true);

        AlbumSaveRequest request = new AlbumSaveRequest();
        request.setAppleCatalogId(1122782080L);
        request.setTitle("Parachutes");
        request.setArtistName("Coldplay");

        assertThatThrownBy(() -> libraryService.saveAlbum("testuser", request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("deleteAlbum deletes album for the correct user")
    void deleteAlbum_DeletesAlbum() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndUserId("album123", "user123")).thenReturn(Optional.of(mockAlbum));
        doNothing().when(albumRepository).delete(mockAlbum);

        libraryService.deleteAlbum("testuser", "album123");

        verify(albumRepository, times(1)).delete(mockAlbum);
    }

    @Test
    @DisplayName("isAlbumInLibrary returns true when album exists")
    void isAlbumInLibrary_ReturnsTrueWhenExists() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByUserIdAndAppleCatalogId("user123", 1122782080L)).thenReturn(true);

        boolean result = libraryService.isAlbumInLibrary("testuser", 1122782080L);

        assertThat(result).isTrue();
    }
}
