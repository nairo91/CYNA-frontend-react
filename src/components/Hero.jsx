import { siteText } from '../content/siteText'

export function Hero() {
  const intro = siteText.home.intro

  return (
    <section className="bg-base-200 py-16 lg:py-24" aria-labelledby="intro-title">
      <div className="container mx-auto px-4">
        <div className="hero bg-base-100 rounded-3xl shadow-xl overflow-hidden relative isolate">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 -z-10" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 opacity-50" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10 opacity-50" />

          <div className="hero-content flex-col lg:flex-row p-8 lg:p-16 gap-12 w-full justify-between items-start">
            <div className="max-w-2xl">
              <span className="badge badge-primary badge-outline badge-lg mb-6 shadow-sm shadow-primary/20">
                {intro.eyebrow}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary leading-tight" id="intro-title">
                {intro.title}
              </h1>
              <p className="text-lg md:text-xl text-base-content/80 mb-8 leading-relaxed">
                {intro.copy}
              </p>
              
              <div className="flex gap-4">
                <button className="btn btn-primary btn-lg shadow-lg shadow-primary/30">
                  Découvrir nos solutions
                </button>
                <button className="btn btn-ghost btn-lg">
                  En savoir plus
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-1/2" aria-label="Points cles CYNA">
              {intro.points.map((point, index) => (
                <article 
                  className="card bg-base-200/50 backdrop-blur-sm border border-base-300 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30" 
                  key={point.title}
                >
                  <div className="card-body p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      <span className="material-symbols-outlined text-2xl">
                        {index === 0 ? 'shield_lock' : index === 1 ? 'security' : index === 2 ? 'speed' : 'verified_user'}
                      </span>
                    </div>
                    <h3 className="card-title text-base font-bold">{point.title}</h3>
                    <p className="text-sm text-base-content/70">{point.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
