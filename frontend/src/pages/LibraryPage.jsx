import { useState, useEffect, useCallback } from 'react'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { libraryApi } from '../services/api'
import AlbumCard from '../components/AlbumCard'
import RatingModal from '../components/RatingModal'
import './LibraryPage.css'

export default function LibraryPage() {
  const [albums, setAlbums] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [editingAlbum, setEditingAlbum] = useState(null)

  const fetchLibrary = useCallback(async (pg, sb, sd) => {
    setLoading(true)
    try {
      const res = await libraryApi.getLibrary(pg, 12, sb, sd)
      const data = res.data
      setAlbums(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch {
      toast.error('Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLibrary(page, sortBy, sortDir)
  }, [page, sortBy, sortDir, fetchLibrary])

  const handleDelete = async (album) => {
    if (!window.confirm(`Remove "${album.title}" from your library?`)) return
    try {
      await libraryApi.deleteAlbum(album.id)
      toast.success(`"${album.title}" removed from library`)
      fetchLibrary(page, sortBy, sortDir)
    } catch {
      toast.error('Failed to remove album')
    }
  }

  const handleSaveRating = async (data) => {
    try {
      await libraryApi.updateAlbum(editingAlbum.id, data)
      toast.success('Rating saved! ⭐')
      setEditingAlbum(null)
      fetchLibrary(page, sortBy, sortDir)
    } catch {
      toast.error('Failed to save rating')
    }
  }

  return (
    <main className="library-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="library-header">
          <div>
            <h1 className="page-title">
              <span className="gradient-text">My Library</span>
            </h1>
            <p className="page-subtitle">
              {totalElements > 0 ? `${totalElements} album${totalElements !== 1 ? 's' : ''} in your collection` : 'Your personal music collection'}
            </p>
          </div>

          {/* Sort controls */}
          {albums.length > 0 && (
            <div className="library-controls">
              <select
                id="sort-by"
                className="input"
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(0) }}
                style={{ width: 'auto' }}
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="artistName">Artist</option>
                <option value="releaseDate">Release Date</option>
                <option value="userRating">My Rating</option>
              </select>
              <select
                id="sort-dir"
                className="input"
                value={sortDir}
                onChange={e => { setSortDir(e.target.value); setPage(0) }}
                style={{ width: 'auto' }}
              >
                <option value="desc">↓ Descending</option>
                <option value="asc">↑ Ascending</option>
              </select>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p>Loading your library...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && albums.length === 0 && (
          <div className="empty-state">
            <BookOpen size={72} color="var(--text-muted)" />
            <h2>Your library is empty</h2>
            <p>Go to the Search page and start adding albums you love!</p>
          </div>
        )}

        {/* Grid */}
        {!loading && albums.length > 0 && (
          <>
            <div className="albums-grid">
              {albums.map(album => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  mode="library"
                  onEdit={setEditingAlbum}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  id="prev-page"
                  className="btn btn-secondary"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="page-indicator">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  id="next-page"
                  className="btn btn-secondary"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {editingAlbum && (
        <RatingModal
          album={editingAlbum}
          onSave={handleSaveRating}
          onClose={() => setEditingAlbum(null)}
        />
      )}
    </main>
  )
}
