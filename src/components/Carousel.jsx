import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../i18n/useLocale'
import { cn } from '../lib/utils'

const AUTOPLAY_INTERVAL_MS = 6000

export function Carousel() {
  const { t } = useTranslation('home')
  const { dir } = useLocale()
  const slides = t('slides', { returnObjects: true })
  const totalSlides = slides.length
  const translateSign = dir === 'rtl' ? '' : '-'

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef(null)

  const goToPrevious = () =>
    setActiveIndex((current) => (current - 1 + totalSlides) % totalSlides)
  const goToNext = () =>
    setActiveIndex((current) => (current + 1) % totalSlides)

  useEffect(() => {
    if (isPaused || isFocused || isHovering) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides)
    }, AUTOPLAY_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [isPaused, isFocused, isHovering, totalSlides])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToPrevious()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToNext()
    }
  }

  const handleBlur = (event) => {
    if (!containerRef.current?.contains(event.relatedTarget)) {
      setIsFocused(false)
    }
  }

  return (
    <section
      className="bg-background py-10 lg:py-14"
      aria-label={t('carousel.ariaLabel')}
    >
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 lg:px-6">
        <div
          ref={containerRef}
          role="region"
          aria-roledescription="carrousel"
          aria-label={t('carousel.regionLabel')}
          tabIndex={0}
          className="relative overflow-hidden rounded-3xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          <div
            className="flex motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
            style={{ transform: `translateX(${translateSign}${activeIndex * 100}%)` }}
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex
              return (
                <article
                  key={slide.title}
                  className="w-full flex-shrink-0"
                  aria-roledescription="slide"
                  aria-label={t('carousel.slideAriaLabel', {
                    current: index + 1,
                    total: totalSlides,
                  })}
                  aria-hidden={!isActive}
                >
                  <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 lg:p-12 lg:py-16">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {slide.eyebrow}
                      </span>
                      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {slide.title}
                      </h2>
                      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                        {slide.copy}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          to={slide.to}
                          tabIndex={isActive ? 0 : -1}
                          aria-hidden={!isActive}
                          className="group inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          {slide.cta}
                          <ArrowRight
                            className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>

                    <div
                      className="relative overflow-hidden rounded-2xl border border-border bg-background/60 p-6"
                      aria-hidden="true"
                    >
                      <strong className="block text-xs font-semibold uppercase tracking-wider text-primary">
                        {slide.visualTitle}
                      </strong>
                      <ul className="mt-4 space-y-3">
                        {slide.visualItems.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                          >
                            <Check
                              className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex gap-1.5">
                        <div className="h-1 flex-1 rounded-full bg-primary/60" />
                        <div className="h-1 flex-1 rounded-full bg-primary/30" />
                        <div className="h-1 flex-1 rounded-full bg-primary/15" />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="relative flex items-center justify-center gap-3 border-t border-border bg-background/40 px-14 py-3 lg:px-16">
            <button
              type="button"
              onClick={goToPrevious}
              aria-label={t('carousel.previousSlide')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label={t('carousel.indicatorsAriaLabel')}
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={t('carousel.goToSlide', { n: index + 1 })}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    index === activeIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goToNext}
              aria-label={t('carousel.nextSlide')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setIsPaused((value) => !value)}
              aria-label={isPaused ? t('carousel.play') : t('carousel.pause')}
              aria-pressed={isPaused}
              className="absolute end-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isPaused ? (
                <Play className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pause className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
