import { useState, useEffect } from 'react'
import { Sparkles, Lightbulb, Music2, TrendingUp, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { libraryApi } from '../services/api'
import './InsightsPage.css'

export default function InsightsPage() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchInsights = () => {
    setLoading(true)
    setError(null)
    libraryApi.getInsights()
      .then(res => setInsights(res.data))
      .catch(() => setError('Failed to load insights'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchInsights() }, [])

  if (loading) return (
    <div className="insights-loading">
      <div className="loading-orb">
        <Sparkles size={32} />
      </div>
      <h2>Analyzing your library...</h2>
      <p>Generating personalized insights just for you</p>
    </div>
  )

  if (error) return (
    <div className="insights-loading">
      <p style={{ color: 'var(--danger)' }}>{error}</p>
      <button className="btn btn-primary" onClick={fetchInsights}>Retry</button>
    </div>
  )

  const isEmpty = !insights?.topInsights?.length && !insights?.funFacts?.length

  return (
    <main className="insights-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="insights-header">
          <div className="insights-title-wrap">
            <div className="insights-icon-wrap">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="page-title">
                <span className="gradient-text">AI Insights</span>
              </h1>
              <p className="page-subtitle">Smart analysis of your music library</p>
            </div>
          </div>
          <button id="refresh-insights" className="btn btn-secondary" onClick={fetchInsights}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {isEmpty ? (
          <div className="insights-empty">
            <Music2 size={72} color="var(--text-muted)" />
            <h2>Not enough data yet</h2>
            <p>Add at least 5 albums and rate some of them to unlock personalized AI insights.</p>
            <button className="btn btn-primary" onClick={() => navigate('/search')}>
              <Search size={16} /> Discover Albums
            </button>
          </div>
        ) : (
          <div className="insights-grid">

            {/* Taste Profile */}
            {insights.tasteProfile && (
              <div className="insight-card card taste-card">
                <div className="insight-card-header">
                  <div className="insight-icon" style={{ background: 'rgba(124,58,237,0.15)', color: '#c084fc' }}>
                    <Music2 size={20} />
                  </div>
                  <h2 className="insight-card-title">Your Taste Profile</h2>
                </div>
                <p className="taste-text">{insights.tasteProfile}</p>
              </div>
            )}

            {/* Top Insights */}
            {insights.topInsights?.length > 0 && (
              <div className="insight-card card">
                <div className="insight-card-header">
                  <div className="insight-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    <Lightbulb size={20} />
                  </div>
                  <h2 className="insight-card-title">Key Observations</h2>
                </div>
                <ul className="insights-list">
                  {insights.topInsights.map((insight, i) => (
                    <li key={i} className="insight-item">
                      <span className="insight-text">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fun Facts */}
            {insights.funFacts?.length > 0 && (
              <div className="insight-card card">
                <div className="insight-card-header">
                  <div className="insight-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h2 className="insight-card-title">Fun Facts</h2>
                </div>
                <ul className="insights-list">
                  {insights.funFacts.map((fact, i) => (
                    <li key={i} className="insight-item">
                      <span className="insight-text">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Listening Eras */}
            {insights.listeningEras && Object.keys(insights.listeningEras).length > 0 && (
              <div className="insight-card card">
                <div className="insight-card-header">
                  <div className="insight-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h2 className="insight-card-title">Your Listening Eras</h2>
                </div>
                <div className="eras-grid">
                  {Object.entries(insights.listeningEras).map(([era, count]) => (
                    <div key={era} className="era-chip">
                      <span className="era-name">{era}</span>
                      <span className="era-count">{count} album{count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && (
              <div className="insight-card card recommendations-card">
                <div className="insight-card-header">
                  <div className="insight-icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}>
                    <Sparkles size={20} />
                  </div>
                  <h2 className="insight-card-title">Explore More</h2>
                </div>
                <div className="recommendations-list">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="recommendation-item">
                      <div className="rec-info">
                        <span className="rec-badge">{rec.type}</span>
                        <h3 className="rec-query">{rec.query}</h3>
                        <p className="rec-reason">{rec.reason}</p>
                      </div>
                      <button
                        id={`search-rec-${i}`}
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/search?q=${encodeURIComponent(rec.query)}`)}
                      >
                        <Search size={13} /> Search
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  )
}
