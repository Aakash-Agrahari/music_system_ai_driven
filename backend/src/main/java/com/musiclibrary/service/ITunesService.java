package com.musiclibrary.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ITunesService {

    private final WebClient itunesWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // iTunes returns "text/javascript" content type — we accept anything and parse manually
    private static final MediaType TEXT_JAVASCRIPT = new MediaType("text", "javascript");

    /**
     * Search the iTunes catalog for albums.
     * iTunes API returns content-type: text/javascript, so we read as String and parse JSON.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchAlbums(String query, int limit) {
        log.debug("Searching iTunes for albums: query={}, limit={}", query, limit);
        String raw = itunesWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("term", query)
                        .queryParam("entity", "album")
                        .queryParam("limit", Math.min(limit, 200))
                        .queryParam("country", "US")
                        .build())
                .accept(MediaType.ALL)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return parseJson(raw);
    }

    /**
     * Look up a specific album by its Apple catalog ID.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> lookupById(Long catalogId) {
        log.debug("Looking up iTunes catalog ID: {}", catalogId);
        String raw = itunesWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/lookup")
                        .queryParam("id", catalogId)
                        .build())
                .accept(MediaType.ALL)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return parseJson(raw);
    }

    private Map<String, Object> parseJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to parse iTunes response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse iTunes API response", e);
        }
    }
}
