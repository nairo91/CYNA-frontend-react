/* eslint-disable react/prop-types */
import { AlertCircle } from 'lucide-react'

export function ResourceState({
  isLoading,
  error,
  skeletonCount = 4,
  loadingClassName,
  errorMessage,
  children,
}) {
  if (isLoading) {
    return (
      <div
        className={
          loadingClassName ??
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
        }
        role="status"
        aria-live="polite"
        aria-label="Chargement en cours"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="h-60 overflow-hidden rounded-2xl border border-border bg-card motion-safe:animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-foreground"
      >
        <AlertCircle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive"
          aria-hidden="true"
        />
        <span>{errorMessage}</span>
      </div>
    )
  }

  return children
}
