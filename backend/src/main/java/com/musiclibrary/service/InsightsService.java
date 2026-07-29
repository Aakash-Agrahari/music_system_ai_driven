package com.musiclibrary.service;

import com.musiclibrary.model.LibraryAlbum;
import com.musiclibrary.repository.LibraryAlbumRepository;
import com.musiclibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Insights Service — generates rule-based music library insights without any external AI API.
 * Analyzes the user's library to produce personalized recommendations, taste profile summaries,
 * and trend observations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InsightsService {

    private final LibraryAlbumRepository albumRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getInsights(String username) {
        String userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        List<LibraryAlbum> albums = albumRepository.findByUserId(userId);
        Map<String, Object> insights = new LinkedHashMap<>();

        if (albums.isEmpty()) {
            insights.put("tasteProfile", "Your library is empty! Start by searching and adding albums you love.");
            insights.put("recommendations", List.of());
            insights.put("topInsights", List.of("Add at least 5 albums to get personalized insights."));
            insights.put("funFacts", List.of());
            return insights;
        }

        // Taste Profile
        insights.put("tasteProfile", buildTasteProfile(albums));

        // Key observations
        insights.put("topInsights", buildTopInsights(albums));

        // Fun facts
        insights.put("funFacts", buildFunFacts(albums));

        // Genre-based recommendations
        insights.put("recommendations", buildRecommendations(albums));

        // Listening eras
        insights.put("listeningEras", buildListeningEras(albums));

        return insights;
    }

    private String buildTasteProfile(List<LibraryAlbum> albums) {
        // Top genre
        Optional<Map.Entry<String, Long>> topGenreEntry = albums.stream()
                .filter(a -> a.getGenre() != null)
                .collect(Collectors.groupingBy(LibraryAlbum::getGenre, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue());

        // Top artist
        Optional<Map.Entry<String, Long>> topArtistEntry = albums.stream()
                .filter(a -> a.getArtistName() != null)
                .collect(Collectors.groupingBy(LibraryAlbum::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue());

        // Dominant decade
        Optional<Map.Entry<String, Long>> topDecadeEntry = albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        a -> (a.getReleaseDate().getYear() / 10 * 10) + "s",
                        Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue());

        StringBuilder profile = new StringBuilder();
        profile.append("You have ").append(albums.size()).append(" albums in your library. ");

        topGenreEntry.ifPresent(e ->
            profile.append("You're predominantly a ").append(e.getKey()).append(" fan")
                   .append(e.getValue() > 1 ? " with " + e.getValue() + " albums in that genre. " : ". "));

        topArtistEntry.ifPresent(e -> {
            if (e.getValue() > 1) {
                profile.append("Your favourite artist seems to be ").append(e.getKey())
                       .append(" (").append(e.getValue()).append(" albums). ");
            }
        });

        topDecadeEntry.ifPresent(e ->
            profile.append("Most of your music is from the ").append(e.getKey()).append(". "));

        // Avg rating personality
        OptionalDouble avgRating = albums.stream()
                .filter(a -> a.getUserRating() != null)
                .mapToInt(LibraryAlbum::getUserRating)
                .average();

        if (avgRating.isPresent()) {
            double avg = avgRating.getAsDouble();
            if (avg >= 4.5) profile.append("You're a generous rater — you love almost everything you listen to! ");
            else if (avg >= 3.5) profile.append("You're a balanced critic with high but fair standards. ");
            else if (avg >= 2.5) profile.append("You're a selective listener with discerning taste. ");
            else profile.append("You're a tough critic — only the very best earns your approval. ");
        }

        return profile.toString().trim();
    }

    private List<String> buildTopInsights(List<LibraryAlbum> albums) {
        List<String> insights = new ArrayList<>();

        // Most albums from a single artist
        albums.stream()
                .filter(a -> a.getArtistName() != null)
                .collect(Collectors.groupingBy(LibraryAlbum::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .filter(e -> e.getValue() > 1)
                .ifPresent(e -> insights.add("📀 You have " + e.getValue() + " albums from " + e.getKey() + " — your most-collected artist."));

        // Oldest album
        albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .min(Comparator.comparing(LibraryAlbum::getReleaseDate))
                .ifPresent(a -> insights.add("🕰️ Your oldest album is \"" + a.getTitle() + "\" by " + a.getArtistName() + " (" + a.getReleaseDate().getYear() + ")."));

        // Newest album
        albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .max(Comparator.comparing(LibraryAlbum::getReleaseDate))
                .ifPresent(a -> insights.add("✨ Your newest album is \"" + a.getTitle() + "\" by " + a.getArtistName() + " (" + a.getReleaseDate().getYear() + ")."));

        // Most tracks
        albums.stream()
                .filter(a -> a.getTrackCount() != null)
                .max(Comparator.comparing(LibraryAlbum::getTrackCount))
                .ifPresent(a -> insights.add("🎵 Your album with the most tracks is \"" + a.getTitle() + "\" with " + a.getTrackCount() + " tracks."));

        // Highest rated
        albums.stream()
                .filter(a -> a.getUserRating() != null)
                .max(Comparator.comparing(LibraryAlbum::getUserRating))
                .ifPresent(a -> insights.add("⭐ Your top-rated album is \"" + a.getTitle() + "\" by " + a.getArtistName() + " (" + a.getUserRating() + "/5)."));

        // Genre diversity
        long genreCount = albums.stream()
                .filter(a -> a.getGenre() != null)
                .map(LibraryAlbum::getGenre)
                .distinct()
                .count();
        if (genreCount > 3) {
            insights.add("🎸 Your library spans " + genreCount + " different genres — you're a diverse listener!");
        }

        if (insights.isEmpty()) {
            insights.add("Add more albums and rate them to unlock deeper insights!");
        }

        return insights;
    }

    private List<String> buildFunFacts(List<LibraryAlbum> albums) {
        List<String> facts = new ArrayList<>();

        // Total tracks estimate
        int totalTracks = albums.stream()
                .filter(a -> a.getTrackCount() != null)
                .mapToInt(LibraryAlbum::getTrackCount)
                .sum();
        if (totalTracks > 0) {
            int approxMinutes = totalTracks * 4; // avg 4 min per track
            facts.add("🎶 Your library has approximately " + totalTracks + " tracks — about " + approxMinutes + " minutes of music!");
        }

        // Average tracks per album
        OptionalDouble avgTracks = albums.stream()
                .filter(a -> a.getTrackCount() != null)
                .mapToInt(LibraryAlbum::getTrackCount)
                .average();
        avgTracks.ifPresent(avg -> facts.add("📊 Your albums average " + Math.round(avg) + " tracks each."));

        // Year span
        OptionalInt minYear = albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .mapToInt(a -> a.getReleaseDate().getYear())
                .min();
        OptionalInt maxYear = albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .mapToInt(a -> a.getReleaseDate().getYear())
                .max();
        if (minYear.isPresent() && maxYear.isPresent() && minYear.getAsInt() != maxYear.getAsInt()) {
            facts.add("📅 Your collection spans " + (maxYear.getAsInt() - minYear.getAsInt()) + " years of music history (" + minYear.getAsInt() + "–" + maxYear.getAsInt() + ").");
        }

        return facts;
    }

    private List<Map<String, String>> buildRecommendations(List<LibraryAlbum> albums) {
        // Based on top genres + artists, suggest search terms the user can explore
        List<Map<String, String>> recs = new ArrayList<>();

        // Top artists to explore further
        List<String> topArtists = albums.stream()
                .filter(a -> a.getArtistName() != null)
                .collect(Collectors.groupingBy(LibraryAlbum::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        for (String artist : topArtists) {
            long count = albums.stream().filter(a -> artist.equals(a.getArtistName())).count();
            Map<String, String> rec = new LinkedHashMap<>();
            rec.put("type", "artist");
            rec.put("query", artist);
            rec.put("reason", "You already have " + count + " album(s) from " + artist + ". Discover more of their discography!");
            recs.add(rec);
        }

        // Genre-based search suggestions for top genres not fully explored
        List<String> topGenres = albums.stream()
                .filter(a -> a.getGenre() != null)
                .collect(Collectors.groupingBy(LibraryAlbum::getGenre, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        for (String genre : topGenres) {
            Map<String, String> rec = new LinkedHashMap<>();
            rec.put("type", "genre");
            rec.put("query", genre);
            rec.put("reason", "Explore more " + genre + " albums to grow your collection!");
            recs.add(rec);
        }

        return recs;
    }

    private Map<String, Long> buildListeningEras(List<LibraryAlbum> albums) {
        return albums.stream()
                .filter(a -> a.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        a -> (a.getReleaseDate().getYear() / 10 * 10) + "s",
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));
    }
}
