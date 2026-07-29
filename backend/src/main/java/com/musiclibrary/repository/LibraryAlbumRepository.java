package com.musiclibrary.repository;

import com.musiclibrary.model.LibraryAlbum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryAlbumRepository extends MongoRepository<LibraryAlbum, String> {
    Page<LibraryAlbum> findByUserId(String userId, Pageable pageable);
    List<LibraryAlbum> findByUserId(String userId);
    Optional<LibraryAlbum> findByIdAndUserId(String id, String userId);
    boolean existsByUserIdAndAppleCatalogId(String userId, Long appleCatalogId);
    Optional<LibraryAlbum> findByUserIdAndAppleCatalogId(String userId, Long appleCatalogId);
    void deleteByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
}
