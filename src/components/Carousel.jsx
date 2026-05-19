import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

export function Carousel() {
  const slides = siteText.home.slides
  const [activeIndex, setActiveIndex] = useState(0)

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <section className="py-8 bg-base-100" id="top" aria-label="Carrousel d'accueil CYNA">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-base-200 border border-base-300 shadow-xl">
          <div 
            className="flex transition-transform duration-700 ease-in-out" 
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <div className="w-full flex-shrink-0" key={slide.title}>
                <article className="hero min-h-[500px]">
                  <div className="hero-content flex-col lg:flex-row p-8 lg:p-16 gap-8 w-full justify-between items-center relative z-10">
                    <div className="max-w-xl text-left">
                      <span className="badge badge-secondary badge-outline mb-4 font-semibold tracking-wide uppercase shadow-sm">
                        {slide.eyebrow}
                      </span>
                      <h1 className="text-4xl md:text-5xl font-black mb-6 text-base-content leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-lg text-base-content/80 mb-8 leading-relaxed">
                        {slide.copy}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Link className="btn btn-primary shadow-lg shadow-primary/20" to={slide.to}>
                          {slide.cta}
                        </Link>
                      </div>
                    </div>

                    <div className="w-full lg:w-96 rounded-2xl bg-neutral text-neutral-content p-6 shadow-2xl border border-neutral-focus opacity-90 relative overflow-hidden" aria-hidden="true">
                      {/* Decorative elements for the visual card */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full blur-2xl"></div>
                      <div className="relative z-10">
                        <strong className="block text-xl mb-4 font-bold text-primary-content">{slide.visualTitle}</strong>
                        <ul className="space-y-3 mb-6">
                          {slide.visualItems.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-neutral-content/80">
                              <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2 h-1.5 w-full bg-base-100/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/80 w-1/3 rounded-full"></div>
                          <div className="h-full bg-secondary/80 w-1/4 rounded-full"></div>
                          <div className="h-full bg-accent/80 w-1/5 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
          
          {/* Controls overlay */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
            <button className="btn btn-circle btn-sm btn-ghost bg-base-100/30 backdrop-blur-sm hover:bg-base-100/50" type="button" onClick={goToPrevious} aria-label="Afficher la slide precedente">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <div className="flex gap-3" aria-label="Navigation du carrousel">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-primary' : 'w-2.5 bg-base-content/30 hover:bg-base-content/50'}`}
                  type="button"
                  aria-label={`Afficher la slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>

            <button className="btn btn-circle btn-sm btn-ghost bg-base-100/30 backdrop-blur-sm hover:bg-base-100/50" type="button" onClick={goToNext} aria-label="Afficher la slide suivante">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-base-content/60 mt-6 max-w-2xl mx-auto italic">
          CYNA vous aide à explorer des offres de cybersécurité plus lisibles, plus comparables et mieux adaptées à
          votre contexte d'entreprise.
        </p>
      </div>
    </section>
  )
}
