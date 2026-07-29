package com.musiclibrary.controller;

import com.musiclibrary.dto.AlbumResponse;
import com.musiclibrary.dto.AlbumSaveRequest;
import com.musiclibrary.dto.AlbumUpdateRequest;
import com.musiclibrary.dto.AnalyticsResponse;
import com.musiclibrary.service.AnalyticsService;
import com.musiclibrary.service.InsightsService;
import com.musiclibrary.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;
    private final AnalyticsService analyticsService;
    private final InsightsService insightsService;

    /**
     * GET /api/library?page=0&size=12&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<AlbumResponse>> getLibrary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AlbumResponse> albums = libraryService.getLibrary(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(albums);
    }

    /**
     * POST /api/library
     */
    @PostMapping
    public ResponseEntity<AlbumResponse> saveAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AlbumSaveRequest request) {

        AlbumResponse album = libraryService.saveAlbum(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(album);
    }

    /**
     * PUT /api/library/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<AlbumResponse> updateAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody AlbumUpdateRequest request) {

        AlbumResponse album = libraryService.updateAlbum(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(album);
    }

    /**
     * DELETE /api/library/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {

        libraryService.deleteAlbum(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/library/analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {

        AnalyticsResponse analytics = analyticsService.getAnalytics(userDetails.getUsername());
        return ResponseEntity.ok(analytics);
    }

    /**
     * GET /api/library/insights
     */
    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> insights = insightsService.getInsights(userDetails.getUsername());
        return ResponseEntity.ok(insights);
    }

    /**
     * GET /api/library/check/{catalogId} — check if an album is already in library
     */
    @GetMapping("/check/{catalogId}")
    public ResponseEntity<Map<String, Boolean>> checkInLibrary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long catalogId) {

        boolean exists = libraryService.isAlbumInLibrary(userDetails.getUsername(), catalogId);
        return ResponseEntity.ok(Map.of("inLibrary", exists));
    }
}
