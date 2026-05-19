import { Link } from 'react-router-dom'
import cynaLogo from '../../assets/logo-icon-transparent.png'

export function AuthPageLayout({
  eyebrow,
  title,
  copy,
  benefits,
  cardTitle,
  cardCopy,
  footerPrompt,
  footerActionLabel,
  footerActionTo,
  children,
}) {
  return (
    <section className="min-h-[calc(100vh-100px)] py-12 lg:py-20 flex items-center justify-center bg-base-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
          
          <aside className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
            <Link className="flex items-center justify-center lg:justify-start gap-3 mb-8 w-full" to="/">
              <img src={cynaLogo} alt="CYNA Logo" className="w-12 h-12" />
              <span className="font-extrabold text-3xl tracking-widest text-primary">CYNA</span>
            </Link>

            <div className="mb-6">
              <span className="badge badge-accent badge-lg font-bold shadow-sm">{eyebrow}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-base-content">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-base-content/70 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {copy}
            </p>

            <div className="flex flex-col gap-5 max-w-md mx-auto lg:mx-0">
              {benefits.map((benefit, index) => (
                <div className="flex items-start gap-4 text-left" key={index}>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-primary/10">
                    <span className="material-symbols-outlined text-primary text-[16px] font-bold">check</span>
                  </div>
                  <p className="text-base-content/80 text-lg font-medium leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="lg:w-[45%] w-full max-w-lg lg:max-w-none">
            <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl border border-base-200/60 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl pointer-events-none"></div>
              
              <div className="card-body p-8 sm:p-10 relative z-10">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold mb-2">{cardTitle}</h2>
                  <p className="text-base-content/60">{cardCopy}</p>
                </div>

                {children}

                <div className="mt-8 text-center text-sm text-base-content/70 border-t border-base-200/50 pt-6">
                  {footerPrompt}{' '}
                  <Link to={footerActionTo} className="link link-primary font-bold hover:text-primary-focus transition-colors">
                    {footerActionLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
