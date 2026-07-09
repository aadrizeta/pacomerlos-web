export default function AboutUsHero() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center py-32 px-8 min-h-screen overflow-hidden">
      <div className="flex flex-col items-center text-center gap-5">
        <h1 className="paco-outline text-title-hero font-chunko leading-none">
          ABOUT PACO
        </h1>
        <span className="abt-intro-pill">¿Quieres saber cómo los hacemos?</span>
      </div>
      <div className="abt-intro-scroll" aria-hidden="true">
        <span className="font-now text-paco-cream uppercase text-base font-semibold tracking-wider">Baja y te lo contamos</span>
        <svg className="abt-intro-scroll-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4v16M5 13l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
