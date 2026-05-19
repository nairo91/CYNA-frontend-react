export function SectionHeading({ eyebrow, title, copy, meta, align = 'default' }) {
  const className = align === 'compact' 
    ? 'flex flex-col items-center text-center gap-4 mb-10' 
    : 'flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10'

  return (
    <div className={className}>
      <div className="max-w-2xl">
        {eyebrow && <span className="badge badge-primary badge-outline font-semibold mb-3">{eyebrow}</span>}
        <h2 className="text-3xl md:text-4xl font-bold text-base-content tracking-tight">{title}</h2>
        {copy && <p className="text-base-content/70 mt-3 text-lg">{copy}</p>}
      </div>
      {meta && (
        <div className="text-primary hover:text-primary-focus font-medium transition-colors">
          {meta}
        </div>
      )}
    </div>
  )
}
