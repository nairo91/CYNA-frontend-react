/* eslint-disable react/prop-types */
import { cn } from '../lib/utils'

export function SectionHeading({ eyebrow, title, copy, meta, align = 'default' }) {
  const isCompact = align === 'compact'

  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-4',
        isCompact
          ? 'items-center text-center'
          : 'md:flex-row md:items-end md:justify-between'
      )}
    >
      <div className={cn(isCompact ? 'max-w-2xl' : 'max-w-2xl')}>
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          {title}
        </h2>
        {copy ? (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground lg:text-lg">
            {copy}
          </p>
        ) : null}
      </div>
      {meta ? (
        <div className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          {meta}
        </div>
      ) : null}
    </div>
  )
}
