import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import { BarChart3, TrendingUp, Disc, Music2 } from 'lucide-react'
import { libraryApi } from '../services/api'
import './AnalyticsPage.css'

// Color palette for charts
const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#818cf8', '#6366f1', '#4f46e5', '#8b5cf6', '#d946ef']
const CHART_THEME = {
  grid: 'rgba(255,255,255,0.06)',
  text: '#9999bb',
  tooltip: { background: '#1a1a26', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, color: '#f0f0ff' }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={CHART_THEME.tooltip}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.stroke || COLORS[i] }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card card">
      <div className="stat-icon" style={{ background: `${color}22`, color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    libraryApi.getAnalytics()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 44, height: 44 }} />
      <p style={{ color: 'var(--text-secondary)' }}>Crunching your data...</p>
    </div>
  )

  if (!data || data.totalAlbums === 0) return (
    <main className="analytics-page page-enter">
      <div className="container">
        <div className="empty-state" style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <BarChart3 size={72} color="var(--text-muted)" />
          <h2 style={{ fontSize: 22, color: 'var(--text-secondary)' }}>No analytics yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>Add at least 5 albums to your library to see beautiful analytics!</p>
        </div>
      </div>
    </main>
  )

  // Prepare chart data
  const genreBarData = Object.entries(data.albumsByGenre || {})
    .map(([name, count]) => ({ name, count }))

  const genrePieData = genreBarData.slice(0, 6)

  const releaseYearData = Object.entries(data.albumsByReleaseYear || {})
    .map(([year, count]) => ({ year, count }))

  const monthlyData = Object.entries(data.albumsByMonth || {})
    .map(([month, count]) => ({ month, count }))

  const histogramData = (data.trackCountHistogram || []).map(b => ({
    range: b.range, count: b.count
  }))

  const avgRatingData = Object.entries(data.avgRatingByGenre || {})
    .map(([genre, rating]) => ({ genre, rating: parseFloat(rating.toFixed(1)) }))
    .slice(0, 8)

  return (
    <main className="analytics-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="analytics-header">
          <h1 className="page-title">
            <span className="gradient-text">Analytics</span>
          </h1>
          <p className="page-subtitle">Visual insights from your music library</p>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          <StatCard icon={Disc} label="Total Albums" value={data.totalAlbums} color="#7c3aed" />
          <StatCard icon={Music2} label="Genres Covered" value={Object.keys(data.albumsByGenre || {}).length} color="#a855f7" />
          <StatCard icon={BarChart3} label="Avg Rating" value={data.averageRating > 0 ? `${data.averageRating} / 5` : 'N/A'} color="#6366f1" />
          <StatCard icon={TrendingUp} label="Avg Track Count" value={data.averageTrackCount > 0 ? Math.round(data.averageTrackCount) : 'N/A'} color="#8b5cf6" />
        </div>

        {/* Charts grid */}
        <div className="charts-grid">

          {/* 1. Bar Chart – Albums by Genre */}
          {genreBarData.length > 0 && (
            <ChartCard title="Albums by Genre" subtitle="Your genre distribution">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={genreBarData} margin={{ top: 5, right: 20, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART_THEME.text, fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill: CHART_THEME.text, fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Albums" radius={[6, 6, 0, 0]}>
                    {genreBarData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* 2. Pie/Donut Chart – Genre Distribution */}
          {genrePieData.length > 0 && (
            <ChartCard title="Genre Distribution" subtitle="Proportional breakdown">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={genrePieData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  >
                    {genrePieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* 3. Line Chart – Albums Added to Library Over Time */}
          {monthlyData.length > 0 && (
            <ChartCard title="Library Growth" subtitle="Albums added per month">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="month" tick={{ fill: CHART_THEME.text, fontSize: 11 }} />
                  <YAxis tick={{ fill: CHART_THEME.text, fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Albums Added"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={{ fill: '#7c3aed', r: 4 }}
                    activeDot={{ r: 6, fill: '#a855f7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* 4. Histogram – Track Count Distribution */}
          {histogramData.length > 0 && (
            <ChartCard title="Track Count Histogram" subtitle="Distribution of album lengths">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={histogramData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="range" tick={{ fill: CHART_THEME.text, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART_THEME.text, fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Albums" radius={[6, 6, 0, 0]} fill="#a855f7">
                    {histogramData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* 5. Releases by Year – Line/Bar */}
          {releaseYearData.length > 0 && (
            <ChartCard title="Releases by Year" subtitle="When your albums were released">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={releaseYearData} margin={{ top: 5, right: 20, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="year" tick={{ fill: CHART_THEME.text, fontSize: 11 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: CHART_THEME.text, fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Albums" radius={[6, 6, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* 6. Horizontal Bar – Avg Rating by Genre */}
          {avgRatingData.length > 0 && (
            <ChartCard title="Average Rating by Genre" subtitle="Your ratings across genres">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={avgRatingData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: CHART_THEME.text, fontSize: 12 }} />
                  <YAxis dataKey="genre" type="category" width={90} tick={{ fill: CHART_THEME.text, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rating" name="Avg Rating" radius={[0, 6, 6, 0]}>
                    {avgRatingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

        </div>
      </div>
    </main>
  )
}
