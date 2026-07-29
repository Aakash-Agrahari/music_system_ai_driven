# SoundVault — Personal Music Library

A full-stack music library web application built with **Spring Boot**, **React.js**, and **MongoDB**.

## 🎵 Entity Choice: Albums

**Why Albums?**
- Albums have the richest structured data from iTunes (trackCount, releaseDate, genre, artwork, price).
- Album-level analytics are more meaningful than per-song stats for a *personal library* use case.
- Genre and release-year trends are best expressed at the album level.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Security 6, Spring Data MongoDB |
| Auth | JWT (jjwt 0.12) |
| Frontend | React 18 + Vite 5, React Router v6, Recharts, Axios |
| Database | MongoDB (local via MongoDB Compass) |
| External API | iTunes Search API (free, no key required) |
| AI Feature | Rule-based insight engine (no external API needed) |

---

## 🗄 Database Schema

**Collection: `users`**
```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "email": "string (unique)",
  "passwordHash": "string (BCrypt)",
  "createdAt": "ISODate"
}
```

**Collection: `library_albums`**
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "appleCatalogId": "number",
  "title": "string",
  "artistName": "string",
  "genre": "string",
  "releaseDate": "ISODate",
  "trackCount": "number",
  "artworkUrl": "string",
  "price": "number",
  "userRating": "number (1-5)",
  "userNotes": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Why MongoDB?**
Flexible schema suits the variable iTunes response fields. Native document mapping, no ORM overhead, and easy horizontal scaling.

---

## 🤖 AI Feature: Library Insights Engine

Implements a **rule-based insight engine** (no external API key required) that:
- Builds a **taste profile** based on genre, artist frequency, and dominant decade
- Identifies **key observations** (oldest album, most-collected artist, highest-rated album)
- Generates **fun facts** (total tracks, listening span in years)
- Produces **recommendations** — searches to try based on favourite artists and genres
- Maps **listening eras** by decade

---

## 📊 Analytics Dashboard (6 Charts)

1. **Bar Chart** — Albums by genre
2. **Pie/Donut Chart** — Genre distribution %
3. **Line Chart** — Library growth (albums added per month)
4. **Histogram** — Track count distribution
5. **Bar Chart** — Releases by year
6. **Horizontal Bar** — Average rating by genre

---

## 🚀 Setup & Running Locally

### Prerequisites
- Java 17+ (Java 22 tested)
- Node.js 18+
- MongoDB running locally on port 27017 (MongoDB Compass)

### 1. Start MongoDB
Open MongoDB Compass → connect to `mongodb://localhost:27017`  
The `musiclibrary` database and collections will be created automatically.

### 2. Start the Backend
```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# Or if Maven is installed globally
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🌐 REST API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/search?query=&limit=` | Yes | Search iTunes |
| GET | `/api/library` | Yes | Get library (paginated) |
| POST | `/api/library` | Yes | Save album |
| PUT | `/api/library/{id}` | Yes | Update rating/notes |
| DELETE | `/api/library/{id}` | Yes | Remove album |
| GET | `/api/library/analytics` | Yes | Analytics data |
| GET | `/api/library/insights` | Yes | AI insights |
| GET | `/api/library/check/{catalogId}` | Yes | In library check |

---

## ✅ Features Implemented

- [x] JWT Authentication (register/login)
- [x] iTunes Search API integration (albums)
- [x] Personal library CRUD (save, update, delete)
- [x] User ratings (1–5 stars) and notes
- [x] 6-chart analytics dashboard (Recharts)
- [x] AI insights engine (taste profile, recommendations, fun facts)
- [x] Debounced search
- [x] Pagination
- [x] Responsive dark UI with glassmorphism
- [x] Centralized error handling
- [x] Bean validation
- [x] Unit tests (JUnit 5 + Mockito)

---

## ⚖️ Trade-offs

| Decision | Choice | Reason |
|----------|--------|--------|
| AI Feature | Rule-based engine | No API key required; works offline; instant |
| Database | MongoDB | Flexible schema; direct iTunes JSON mapping |
| Auth | JWT (stateless) | Suits REST APIs; easy frontend integration |
| Charts | Recharts | Lightweight; React-native; composable |
| Search | Debounced (450ms) | Reduces iTunes API calls; better UX |
