/* global React, window */
// Brand Presentation — ONE template, used identically for every brand.
// All content comes from window.FG_DATA.BRAND_PRESENTATION[brand.id].
// Sections always render in the same order with the same structure:
//   1. Hero · 2. Carousel · 3. Video · 4. Concept · 5. Investment summary
//   6. Documents · 7. Opportunities
// Only colors, type, copy and media change per brand.

const { useState: bpState, useEffect: bpEffect, useRef: bpRef } = React;

function BrandPresentation({ brand, goTo, fgData }) {
  const data = fgData.BRAND_PRESENTATION[brand.id];
  if (!data) return null;
  const brandOpps = fgData.FG_OPPORTUNITIES.filter(o => o.brand === brand.id);

  return (
    <div className="fg-content bp-page">
      <BPHero brand={brand} hero={data.hero} goTo={goTo} />
      <BPCarousel brand={brand} slides={data.carousel} />
      <BPVideos brand={brand} videos={data.videos} />
      <BPConcept brand={brand} concept={data.concept} />
      <BPTeam brand={brand} team={data.team || []} />
      <BPInvestment brand={brand} investment={data.investment} fgData={fgData} goTo={goTo} />
      <BPDocuments brand={brand} documents={data.documents} />
      <BPOpportunities brand={brand} opps={brandOpps} pitch={data.opportunitiesPitch} fgData={fgData} goTo={goTo} />
    </div>
  );
}

// ====================================================================
// Section header — uniform across all sections
// ====================================================================
function BPSectionHead({ idx, eyebrow, title, sub }) {
  return (
    <header className="bp-sec-head">
      <span className="bp-sec-head__num">{String(idx).padStart(2, '0')}</span>
      <div>
        <p className="bp-sec-head__eyebrow">{eyebrow}</p>
        <h2 className="bp-sec-head__title">{title}</h2>
        {sub && <p className="bp-sec-head__sub">{sub}</p>}
      </div>
    </header>
  );
}

// ====================================================================
// 1. HERO
// ====================================================================
function BPHero({ brand, hero, goTo }) {
  return (
    <section className="bp-hero">
      <div className="bp-hero__copy">
        <div className="bp-hero__logo">
          <BrandMark brand={brand} size={56} />
          <div>
            <p className="bp-hero__brand">{brand.name}</p>
            <p className="bp-hero__kind">{brand.kind} · {brand.headquarters}</p>
          </div>
        </div>
        <h1 className="bp-hero__baseline">{hero.baseline}</h1>
        <p className="bp-hero__concept">{hero.concept}</p>
        <div className="bp-hero__message">
          <span className="bp-hero__message-icon">✦</span>
          <span>{hero.message}</span>
        </div>
        <div className="bp-hero__ctas">
          <button className="bp-btn bp-btn--primary" onClick={() => goTo(brand.id, 'opportunites')}>
            {hero.cta} <FgIcon.arrow />
          </button>
          <button className="bp-btn bp-btn--ghost">{hero.secondaryCta}</button>
        </div>
      </div>
      <div className="bp-hero__media">
        {hero.media
          ? <img src={hero.media} alt="" />
          : <BPPlaceholder brand={brand} label={brand.name + ' — visuel principal'} fill />
        }
      </div>
    </section>
  );
}

// ====================================================================
// 2. CAROUSEL
// ====================================================================
function BPCarousel({ brand, slides }) {
  const [idx, setIdx] = bpState(0);
  const trackRef = bpRef(null);
  const go = (delta) => setIdx(i => Math.max(0, Math.min(slides.length - 1, i + delta)));

  bpEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const child = t.children[idx];
    if (child) t.scrollTo({ left: child.offsetLeft - t.offsetLeft, behavior: 'smooth' });
  }, [idx]);

  return (
    <section className="bp-sec">
      <BPSectionHead idx={2} eyebrow="Présentation" title="Découvrir la marque"
        sub={`${slides.length} cartes · images, KPI, concept, positionnement`} />
      <div className="bp-carousel">
        <div className="bp-carousel__track" ref={trackRef}>
          {slides.map((s, i) => (
            <BPSlide key={i} slide={s} brand={brand} active={i === idx} />
          ))}
        </div>
        <div className="bp-carousel__nav">
          <button className="bp-carousel__btn" onClick={() => go(-1)} disabled={idx === 0} aria-label="Précédent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="bp-carousel__dots">
            {slides.map((_, i) => (
              <button key={i} className={'bp-carousel__dot' + (i === idx ? ' is-active' : '')}
                onClick={() => setIdx(i)} aria-label={'Aller à la carte ' + (i + 1)} />
            ))}
          </div>
          <button className="bp-carousel__btn" onClick={() => go(1)} disabled={idx === slides.length - 1} aria-label="Suivant">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <span className="bp-carousel__count">{idx + 1} / {slides.length}</span>
        </div>
      </div>
    </section>
  );
}

function BPSlide({ slide, brand, active }) {
  if (slide.kind === 'image') {
    return (
      <article className={'bp-slide bp-slide--image' + (active ? ' is-active' : '')}>
        {slide.src
          ? <img src={slide.src} alt={slide.caption || ''} />
          : <BPPlaceholder brand={brand} label={slide.placeholder} fill />
        }
        {(slide.caption || slide.label) && (
          <div className="bp-slide__caption">{slide.caption || slide.label}</div>
        )}
      </article>
    );
  }
  if (slide.kind === 'kpi') {
    return (
      <article className={'bp-slide bp-slide--kpi' + (active ? ' is-active' : '')}>
        <div className="bp-slide__inner">
          <p className="bp-slide__eyebrow">{slide.sub}</p>
          <h3 className="bp-slide__title">{slide.title}</h3>
          <div className="bp-slide__kpi-grid">
            {slide.metrics.map((m, i) => (
              <div key={i} className="bp-slide__kpi">
                <p className="bp-slide__kpi-val">{m.value}</p>
                <p className="bp-slide__kpi-l">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  }
  if (slide.kind === 'concept') {
    return (
      <article className={'bp-slide bp-slide--concept' + (active ? ' is-active' : '')}>
        <div className="bp-slide__inner">
          <p className="bp-slide__eyebrow">Concept</p>
          <h3 className="bp-slide__title bp-slide__title--lg">{slide.title}</h3>
          <p className="bp-slide__body">{slide.body}</p>
        </div>
      </article>
    );
  }
  if (slide.kind === 'highlight') {
    return (
      <article className={'bp-slide bp-slide--highlight' + (active ? ' is-active' : '')}>
        <div className="bp-slide__inner">
          <p className="bp-slide__eyebrow">★ {slide.title}</p>
          <p className="bp-slide__body bp-slide__body--lg">{slide.body}</p>
        </div>
      </article>
    );
  }
  // Default: text
  return (
    <article className={'bp-slide bp-slide--text' + (active ? ' is-active' : '')}>
      <div className="bp-slide__inner">
        <p className="bp-slide__eyebrow">{slide.title}</p>
        <p className="bp-slide__body">{slide.body}</p>
      </div>
    </article>
  );
}

// ====================================================================
// 3. VIDEOS
// ====================================================================
function BPVideos({ brand, videos }) {
  const kindLabels = { main: 'Vidéo principale', founder: 'Mot du fondateur', tour: 'Visite de magasin', investor: 'Pour l\'investisseur' };
  return (
    <section className="bp-sec">
      <BPSectionHead idx={3} eyebrow="Vidéos" title="La marque en mouvement"
        sub={`${videos.length} vidéos · présentation, fondateur, visite`} />
      <div className="bp-videos">
        {videos.map((v, i) => (
          <article key={i} className={'bp-video' + (i === 0 ? ' bp-video--main' : '')}>
            <div className="bp-video__media">
              {v.thumb
                ? <img src={v.thumb} alt={v.title} />
                : <BPPlaceholder brand={brand} label={v.placeholder || v.title} fill />
              }
              <div className="bp-video__play">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span className="bp-video__duration">{v.duration}</span>
            </div>
            <div className="bp-video__copy">
              <p className="bp-video__kind">{kindLabels[v.kind] || v.kind}</p>
              <h3 className="bp-video__title">{v.title}</h3>
              <p className="bp-video__desc">{v.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ====================================================================
// 4. CONCEPT
// ====================================================================
function BPConcept({ brand, concept }) {
  return (
    <section className="bp-sec">
      <BPSectionHead idx={4} eyebrow="Concept" title="L'idée, en détail"
        sub="Cible, positionnement, forces, modèle franchise, vision." />
      <div className="bp-concept">
        <div className="bp-concept__intro">
          <p className="bp-concept__lead">{concept.explanation}</p>
        </div>

        <div className="bp-concept__grid">
          <div className="bp-concept__col">
            <h4 className="bp-concept__h">Cible client</h4>
            <ul className="bp-concept__list">
              {concept.targetCustomers.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div className="bp-concept__col">
            <h4 className="bp-concept__h">Positionnement</h4>
            <p>{concept.positioning}</p>
          </div>
          <div className="bp-concept__col">
            <h4 className="bp-concept__h">Modèle franchise</h4>
            <p>{concept.franchiseModel}</p>
          </div>
          <div className="bp-concept__col">
            <h4 className="bp-concept__h">Vision de développement</h4>
            <p>{concept.vision}</p>
          </div>
        </div>

        <div className="bp-strengths">
          <h4 className="bp-concept__h">Les forces du modèle</h4>
          <div className="bp-strengths__grid">
            {concept.strengths.map((s, i) => (
              <div key={i} className="bp-strength">
                <span className="bp-strength__num">{String(i + 1).padStart(2, '0')}</span>
                <h5 className="bp-strength__title">{s.title}</h5>
                <p className="bp-strength__body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ====================================================================
// 4b. TEAM & RESPONSIBILITIES  (carousel, identical for every brand)
// ====================================================================
function BPTeam({ brand, team }) {
  if (!team || team.length === 0) return null;
  const trackRef = bpRef(null);
  const [canPrev, setCanPrev] = bpState(false);
  const [canNext, setCanNext] = bpState(true);

  const update = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  bpEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, team]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const tile = el.querySelector('.bp-team-tile');
    const step = tile ? tile.getBoundingClientRect().width + 14 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className="bp-sec">
      <BPSectionHead idx={5} eyebrow="Équipe" title="Équipe & responsabilités"
        sub={`${team.length} rôles actifs sur ${brand.name} · contact direct disponible où indiqué`} />
      <div className="fg-car bp-team">
        <button className="fg-car__arrow fg-car__arrow--prev" disabled={!canPrev}
          onClick={() => scroll(-1)} aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="fg-car__track bp-team__track" ref={trackRef} onScroll={update}>
          {team.map((entry, i) => {
            const p = entry.person;
            const initials = (p.name || '').split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
            return (
              <article key={i} className="bp-team-tile">
                <div className="bp-team-tile__head">
                  <div className="bp-team-tile__avatar"
                    style={{ background: brand.tokens.primary, color: '#fff' }}>
                    {p.photo
                      ? <img src={p.photo} alt={p.name} />
                      : <span>{initials}</span>}
                  </div>
                  <div className="bp-team-tile__id">
                    <p className="bp-team-tile__role">{entry.role}</p>
                    <p className="bp-team-tile__name">{p.name}</p>
                  </div>
                </div>
                {p.desc && <p className="bp-team-tile__desc">{p.desc}</p>}
                {p.contact && (
                  <button className="fg-btn fg-btn--ghost fg-btn--sm bp-team-tile__cta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
                    Contacter
                  </button>
                )}
              </article>
            );
          })}
        </div>
        <button className="fg-car__arrow fg-car__arrow--next" disabled={!canNext}
          onClick={() => scroll(1)} aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
}

// ====================================================================
// 5. INVESTMENT SUMMARY
// ====================================================================
function BPInvestment({ brand, investment, fgData, goTo }) {
  const items = [
    { label: 'Investissement minimum', value: fgData.fmtEur(investment.minTicket), foot: 'Par ticket' },
    { label: 'TRI cible', value: investment.roiTarget.toFixed(1) + ' %', foot: 'Réseau ' + brand.name },
    { label: 'Période de retour', value: investment.payback, foot: 'Maturité 5 ans' },
    { label: 'Opportunités ouvertes', value: investment.openOpps, foot: investment.openOpps > 0 ? 'En levée actuellement' : 'À venir' },
    { label: 'Magasins en réseau', value: investment.networkSize, foot: brand.copy.ecoNounPlural },
    { label: 'Performance réseau', value: investment.networkPerfLabel, foot: 'Données consolidées', wide: true }
  ];
  return (
    <section className="bp-sec">
      <BPSectionHead idx={6} eyebrow="Investissement" title="Le résumé chiffré"
        sub="Conditions, retour estimé, état du réseau." />
      <div className="bp-invest-grid">
        {items.map((it, i) => (
          <div key={i} className={'bp-invest-cell' + (it.wide ? ' bp-invest-cell--wide' : '')}>
            <p className="bp-invest-cell__l">{it.label}</p>
            <p className="bp-invest-cell__v">{it.value}</p>
            <p className="bp-invest-cell__f">{it.foot}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ====================================================================
// 6. DOCUMENTS
// ====================================================================
function BPDocuments({ brand, documents }) {
  return (
    <section className="bp-sec">
      <BPSectionHead idx={7} eyebrow="Documentation" title="Documents de la marque"
        sub={`${documents.length} documents · deck, dossier franchise, projections, contrat type`} />
      <div className="bp-docs">
        {documents.map((d, i) => (
          <div key={i} className="bp-doc">
            <div className="bp-doc__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M8 13h8M8 17h6"/>
              </svg>
            </div>
            <div className="bp-doc__copy">
              <p className="bp-doc__kind">{d.kind}</p>
              <p className="bp-doc__title">{d.title}</p>
            </div>
            <span className="bp-doc__size">{d.size}</span>
            <button className="bp-btn bp-btn--ghost bp-btn--sm">Télécharger</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ====================================================================
// 7. OPPORTUNITIES
// ====================================================================
function BPOpportunities({ brand, opps, pitch, fgData, goTo }) {
  return (
    <section className="bp-sec">
      <BPSectionHead idx={8} eyebrow="Opportunités" title="Projets en recherche de financement"
        sub={pitch} />
      {opps.length === 0 ? (
        <div className="bp-empty">Aucune levée ouverte pour {brand.name} actuellement.</div>
      ) : (
        <div className="bp-opps">
          {opps.map(o => {
            const progress = (o.raised / o.target) * 100;
            return (
              <div key={o.id} className="bp-opp">
                <div className="bp-opp__head">
                  <div>
                    <p className="bp-opp__kind">{o.kind} · {o.city}</p>
                    <h3 className="bp-opp__name">{o.name.replace(brand.name + ' ', '')}</h3>
                  </div>
                  <span className="bp-opp__pill">Closing dans {o.closingDays} j</span>
                </div>
                <p className="bp-opp__concept">{o.concept}</p>
                <div className="bp-opp__metrics">
                  <div><p className="bp-invest-cell__l">Objectif</p><p className="bp-opp__metric-v">{fgData.fmtEur(o.target)}</p></div>
                  <div><p className="bp-invest-cell__l">TRI cible</p><p className="bp-opp__metric-v">{o.roiTarget.toFixed(1)} %</p></div>
                  <div><p className="bp-invest-cell__l">Ticket min</p><p className="bp-opp__metric-v">{fgData.fmtEur(o.ticketMin)}</p></div>
                  <div><p className="bp-invest-cell__l">Payback</p><p className="bp-opp__metric-v">{o.payback}</p></div>
                </div>
                <div className="bp-opp__progress">
                  <div className="bp-opp__progress-track">
                    <div className="bp-opp__progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="bp-opp__progress-legend">
                    <span>{fgData.fmtEur(o.raised)} / {fgData.fmtEur(o.target)}</span>
                    <span>{progress.toFixed(0)} % collectés</span>
                  </div>
                </div>
                <div className="bp-opp__ctas">
                  <button className="bp-btn bp-btn--primary">Manifester un intérêt</button>
                  <button className="bp-btn bp-btn--ghost">Business plan</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ====================================================================
// Brand placeholder — used when no image is provided. Renders a tinted
// editorial-style block using the brand palette, so the layout shape
// stays identical between brands with/without imagery.
// ====================================================================
function BPPlaceholder({ brand, label, fill }) {
  const t = brand.tokens;
  return (
    <div className={'bp-placeholder' + (fill ? ' bp-placeholder--fill' : '')}
      style={{ background: t.bg, color: t.ink, borderColor: t.primary + '33' }}>
      <div className="bp-placeholder__mark" style={{ background: t.primary, color: '#fff', fontFamily: t.fontDisplay }}>
        {brand.logoMark}
      </div>
      <div className="bp-placeholder__corners">
        <span style={{ background: t.primary }}></span>
        <span style={{ background: t.primary }}></span>
        <span style={{ background: t.primary }}></span>
        <span style={{ background: t.primary }}></span>
      </div>
      <div className="bp-placeholder__label" style={{ fontFamily: t.fontUi }}>
        <span className="bp-placeholder__sub">Visuel — {brand.name}</span>
        <span className="bp-placeholder__main">{label}</span>
      </div>
    </div>
  );
}

Object.assign(window, { BrandPresentation });
