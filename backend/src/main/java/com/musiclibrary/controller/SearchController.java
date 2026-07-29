package com.musiclibrary.controller;

import com.musiclibrary.service.ITunesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ITunesService iTunesService;

    /**
     * GET /api/search?query=coldplay&limit=20
     * Proxies iTunes Search API for albums.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit) {

        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Map<String, Object> result = iTunesService.searchAlbums(query.trim(), limit);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/search/lookup/{id}
     * Looks up an album by Apple catalog ID.
     */
    @GetMapping("/lookup/{id}")
    public ResponseEntity<Map<String, Object>> lookup(@PathVariable Long id) {
        Map<String, Object> result = iTunesService.lookupById(id);
        return ResponseEntity.ok(result);
    }
}
