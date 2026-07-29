package com.musiclibrary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private long totalAlbums;
    private long ratedAlbums;
    private double averageRating;
    private double averageTrackCount;

    // Chart data
    private Map<String, Long> albumsByGenre;           // Bar/Pie chart
    private Map<String, Long> albumsByReleaseYear;     // Line/Bar chart
    private Map<String, Long> albumsByMonth;           // Line chart (added to library)
    private List<TrackCountBucket> trackCountHistogram; // Histogram
    private Map<String, Double> avgRatingByGenre;      // Horizontal bar

    // Top items
    private List<String> topGenres;
    private List<String> topArtists;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackCountBucket {
        private String range;
        private long count;
    }
}
