import { useState } from 'react'
import { X, Star } from 'lucide-react'
import './RatingModal.css'

export default function RatingModal({ album, onSave, onClose }) {
  const [rating, setRating] = useState(album.userRating || 0)
  const [hovered, setHovered] = useState(0)
  const [notes, setNotes] = useState(album.userNotes || '')

  const handleSave = () => {
    onSave({ userRating: rating || null, userNotes: notes.trim() || null })
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Rate album">
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Rate Album</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-rating-modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-album-info">
          {album.artworkUrl && (
            <img
              src={album.artworkUrl.replace('100x100bb', '150x150bb')}
              alt={album.title}
              className="modal-artwork"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
          <div>
            <h3 className="modal-album-title">{album.title}</h3>
            <p className="modal-album-artist">{album.artistName}</p>
          </div>
        </div>

        {/* Star rating */}
        <div className="modal-section">
          <label className="modal-label">Your Rating</label>
          <div className="star-selector">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                id={`star-${n}`}
                className="star-btn"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(rating === n ? 0 : n)}
              >
                <Star
                  size={32}
                  fill={(hovered || rating) >= n ? '#f59e0b' : 'none'}
                  color={(hovered || rating) >= n ? '#f59e0b' : '#55556a'}
                  style={{ transition: 'all 0.15s' }}
                />
              </button>
            ))}
          </div>
          <p className="rating-label">
            {rating === 0 && 'No rating'}
            {rating === 1 && '⭐ Not for me'}
            {rating === 2 && '⭐⭐ It\'s okay'}
            {rating === 3 && '⭐⭐⭐ Pretty good'}
            {rating === 4 && '⭐⭐⭐⭐ Really love it'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Absolute classic!'}
          </p>
        </div>

        {/* Notes */}
        <div className="modal-section">
          <label className="modal-label" htmlFor="album-notes">Notes (optional)</label>
          <textarea
            id="album-notes"
            className="input modal-textarea"
            placeholder="What do you love about this album? Any memories?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <span className="char-count">{notes.length}/300</span>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} id="cancel-rating">Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-rating">Save</button>
        </div>
      </div>
    </div>
  )
}
