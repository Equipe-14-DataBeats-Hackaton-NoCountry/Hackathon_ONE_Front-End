export function MetricCard({ title, value }) {
  return (
    <div className="card" style={{ minWidth: 160 }}>
      <p style={{ color: '#b3b3b3' }}>{title}</p>
      <p className="metric-value">{value}</p>
    </div>
  )
}
