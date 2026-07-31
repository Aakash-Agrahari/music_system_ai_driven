import { useState, useEffect, useCallback } from 'react'
import { Search, Music2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { searchApi, libraryApi } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import AlbumCard from '../components/AlbumCard'
import './SearchPage.css'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [libraryIds, setLibraryIds] = useState(new Set()) // Set of appleCatalogIds in library
  const [limit, setLimit] = useState(20)
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, 450)

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }
    doSearch(debouncedQuery.trim(), limit)
  }, [debouncedQuery, limit])

  // Load user's library catalog IDs for "in library" badges
  useEffect(() => {
    libraryApi.getLibrary(0, 200)
      .then(res => {
        const ids = new Set(res.data.content.map(a => a.appleCatalogId))
        setLibraryIds(ids)
      })
      .catch(() => {})
  }, [])

  const doSearch = useCallback(async (q, lim) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await searchApi.searchAlbums(q, lim)
      const items = res.data?.results || []
      setResults(items.filter(r => r.wrapperType === 'collection'))
    } catch {
      toast.error('Search failed. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAdd = async (album) => {
    try {
      await libraryApi.saveAlbum({
        appleCatalogId: album.collectionId,
        title: album.collectionName,
        artistName: album.artistName,
        genre: album.primaryGenreName,
        releaseDate: album.releaseDate?.split('T')[0],
        trackCount: album.trackCount,
        artworkUrl: album.artworkUrl100,
        price: album.collectionPrice,
      })
      setLibraryIds(prev => new Set([...prev, album.collectionId]))
      toast.success(`"${album.collectionName}" added to library! 🎵`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add album'
      toast.error(msg)
    }
  }

  // Normalize album shape from iTunes
  const normalizeAlbum = (a) => ({
    appleCatalogId: a.collectionId,
    title: a.collectionName,
    artistName: a.artistName,
    genre: a.primaryGenreName,
    releaseDate: a.releaseDate,
    trackCount: a.trackCount,
    artworkUrl: a.artworkUrl100,
    price: a.collectionPrice,
  })

  return (
    <main className="search-page page-enter">
      <div className="container">
        {/* Hero search area */}
        <div className="search-hero">
          <h1 className="search-headline">
            Discover <span className="gradient-text">Music</span>
          </h1>
          <p className="search-subline">Search for variety of songs and build your personal library</p>

          <div className="search-bar-wrap">
            <div className="search-bar">
              {loading
                ? <Loader2 size={20} className="search-icon spin-icon" />
                : <Search size={20} className="search-icon" />
              }
              <input
                id="search-input"
                type="search"
                className="search-input"
                placeholder="Search albums, artists, genres..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  className="btn btn-ghost btn-sm"
                  id="clear-search"
                  onClick={() => { setQuery(''); setResults([]); setHasSearched(false) }}
                >
                  Clear
                </button>
              )}
            </div>

            <select
              id="result-limit"
              className="input limit-select"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {!hasSearched && (
          <div className="search-empty">
            <Music2 size={64} color="var(--text-muted)" />
            <p>Start typing to search the variety of songs</p>
            <span>Try "Coldplay", "Taylor Swift", "Dark Side of the Moon"</span>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <div className="search-empty">
            <Search size={64} color="var(--text-muted)" />
            <p>No albums found for "{query}"</p>
            <span>Try a different search term</span>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="results-header">
              <span className="results-count">{results.length} albums found</span>
            </div>
            <div className="albums-grid">
              {results.map(album => (
                <AlbumCard
                  key={album.collectionId}
                  album={normalizeAlbum(album)}
                  inLibrary={libraryIds.has(album.collectionId)}
                  onAdd={() => handleAdd(album)}
                  mode="search"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
