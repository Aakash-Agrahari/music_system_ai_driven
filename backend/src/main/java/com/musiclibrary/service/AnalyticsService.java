package com.musiclibrary.service;

import com.musiclibrary.dto.AnalyticsResponse;
import com.musiclibrary.model.LibraryAlbum;
import com.musiclibrary.repository.LibraryAlbumRepository;
import com.musiclibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final LibraryAlbumRepository albumRepository;
    private final UserRepository userRepository;

    public AnalyticsResponse getAnalytics(String username) {
        String userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        List<LibraryAlbum> albums = albumRepository.findByUserId(userId);

        if (albums.isEmpty()) {
            return AnalyticsResponse.builder()
                    .totalAlbums(0)
                    .ratedAlbums(0)
                    .averageRating(0)
                    .averageTrackCount(0)
                    .albumsByGenre(new LinkedHashMap<>())
                    .albumsByReleaseYear(new LinkedHashMap<>())
                    .albumsByMonth(new LinkedHashMap<>())
                    .trackCountHistogram(new ArrayList<>())
                    .avgRatingByGenre(new LinkedHashMap<>())
                    .topGenres(new ArrayList<>())
                    .topArtists(new ArrayList<>())
                    .build();
        }

        // Albums by genre (sorted by count desc)
        Map<String, Long> albumsByGenre = albums.stream()
                .filter(a -> a.getGenre() != null && !a.getGenre().isBlank())
                .collect(Collectors.groupingBy(LibraryAlbum::getGenre, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));

        // Albums by release year (sorted by year)
        Map<String, Long> albumsByReleaseYear = albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        a -> String.valueOf(a.getReleaseDate().getYear()),
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));

        // Albums added to library by month
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> albumsByMonth = albums.stream()
                .filter(a -> a.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().format(monthFmt),
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));

        // Track count histogram
        List<AnalyticsResponse.TrackCountBucket> histogram = buildTrackCountHistogram(albums);

        // Average rating by genre
        Map<String, Double> avgRatingByGenre = albums.stream()
                .filter(a -> a.getGenre() != null && a.getUserRating() != null)
                .collect(Collectors.groupingBy(
                        LibraryAlbum::getGenre,
                        Collectors.averagingInt(LibraryAlbum::getUserRating)))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Math.round(e.getValue() * 10.0) / 10.0,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));

        // Rated albums
        List<LibraryAlbum> ratedAlbums = albums.stream()
                .filter(a -> a.getUserRating() != null)
                .collect(Collectors.toList());

        double avgRating = ratedAlbums.stream()
                .mapToInt(LibraryAlbum::getUserRating)
                .average()
                .orElse(0.0);

        double avgTrackCount = albums.stream()
                .filter(a -> a.getTrackCount() != null)
                .mapToInt(LibraryAlbum::getTrackCount)
                .average()
                .orElse(0.0);

        // Top genres (top 5)
        List<String> topGenres = new ArrayList<>(albumsByGenre.keySet())
                .subList(0, Math.min(5, albumsByGenre.size()));

        // Top artists
        List<String> topArtists = albums.stream()
                .filter(a -> a.getArtistName() != null)
                .collect(Collectors.groupingBy(LibraryAlbum::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .totalAlbums(albums.size())
                .ratedAlbums(ratedAlbums.size())
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .averageTrackCount(Math.round(avgTrackCount * 10.0) / 10.0)
                .albumsByGenre(albumsByGenre)
                .albumsByReleaseYear(albumsByReleaseYear)
                .albumsByMonth(albumsByMonth)
                .trackCountHistogram(histogram)
                .avgRatingByGenre(avgRatingByGenre)
                .topGenres(topGenres)
                .topArtists(topArtists)
                .build();
    }

    private List<AnalyticsResponse.TrackCountBucket> buildTrackCountHistogram(List<LibraryAlbum> albums) {
        int[][] buckets = {{1, 5}, {6, 10}, {11, 15}, {16, 20}, {21, Integer.MAX_VALUE}};
        String[] labels = {"1-5", "6-10", "11-15", "16-20", "20+"};

        List<AnalyticsResponse.TrackCountBucket> histogram = new ArrayList<>();
        for (int i = 0; i < buckets.length; i++) {
            final int min = buckets[i][0];
            final int max = buckets[i][1];
            final String label = labels[i];
            long count = albums.stream()
                    .filter(a -> a.getTrackCount() != null)
                    .filter(a -> a.getTrackCount() >= min && a.getTrackCount() <= max)
                    .count();
            histogram.add(new AnalyticsResponse.TrackCountBucket(label, count));
        }
        return histogram;
    }
}
