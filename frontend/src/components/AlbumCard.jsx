import { useState } from 'react'
import { Plus, Check, Star, ExternalLink } from 'lucide-react'
import './AlbumCard.css'

export default function AlbumCard({ album, inLibrary, onAdd, onEdit, onDelete, mode = 'search' }) {
  const [imgError, setImgError] = useState(false)

  const artwork = !imgError && album.artworkUrl
    ? album.artworkUrl.replace('100x100bb', '300x300bb')
    : null

  const year = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : null

  return (
    <div className="album-card card page-enter">
      {/* Artwork */}
      <div className="album-artwork-wrap">
        {artwork ? (
          <img
            src={artwork}
            alt={album.title}
            className="album-artwork"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="album-artwork-placeholder">
            <span>🎵</span>
          </div>
        )}
        {/* Overlay badges */}
        {album.genre && (
          <span className="badge badge-genre album-genre-badge">{album.genre}</span>
        )}
      </div>

      {/* Info */}
      <div className="album-info">
        <h3 className="album-title truncate" title={album.title}>{album.title}</h3>
        <p className="album-artist truncate">{album.artistName}</p>
        <div className="album-meta">
          {year && <span className="meta-item">{year}</span>}
          {album.trackCount && <span className="meta-item">{album.trackCount} tracks</span>}
          {album.price != null && album.price > 0 && (
            <span className="meta-item">${album.price.toFixed(2)}</span>
          )}
        </div>

        {/* User rating in library mode */}
        {mode === 'library' && (
          <div className="album-rating">
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                size={14}
                className={`star ${n <= (album.userRating || 0) ? 'filled' : 'empty'}`}
                fill={n <= (album.userRating || 0) ? '#f59e0b' : 'none'}
                color={n <= (album.userRating || 0) ? '#f59e0b' : '#55556a'}
              />
            ))}
          </div>
        )}

        {album.userNotes && (
          <p className="album-notes">"{album.userNotes}"</p>
        )}
      </div>

      {/* Actions */}
      <div className="album-actions">
        {mode === 'search' && (
          <button
            id={`add-album-${album.appleCatalogId || album.collectionId}`}
            className={`btn ${inLibrary ? 'btn-secondary' : 'btn-primary'} btn-sm w-full`}
            onClick={() => !inLibrary && onAdd(album)}
            disabled={inLibrary}
          >
            {inLibrary ? (
              <><Check size={14} /> In Library</>
            ) : (
              <><Plus size={14} /> Add to Library</>
            )}
          </button>
        )}

        {mode === 'library' && (
          <div className="library-actions">
            <button
              id={`edit-album-${album.id}`}
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(album)}
            >
              <Star size={13} /> Rate
            </button>
            <button
              id={`delete-album-${album.id}`}
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(album)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
