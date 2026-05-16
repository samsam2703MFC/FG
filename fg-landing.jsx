/* global React, window */
// Franchise Generation — public landing page (logged-out state).
// Hero → trust pillars → brand showcase → Join section → final CTA.
// All copy/data come from window.FG_DATA.LANDING — API/CMS-driven.

const { useState: lState, useEffect: lEffect } = React;

function FgLanding({ onLogin, fgData }) {
  const D = fgData;
  const L = D.LANDING;
  const [formOpen, setFormOpen] = lState(null);
  const [selectedOpp, setSelectedOpp] = lState(null);
  const [oppDetailOpen, setOppDetailOpen] = lState(false);

  // Listen to portal-button actions
  lEffect(() => {
    const handler = (e) => setFormOpen(e.detail);
    window.addEventListener('fg-portal-action', handler);
    return () => window.removeEventListener('fg-portal-action', handler);
  }, []);

  const handleAction = (action) => {
    if (action === 'login') return onLogin();
    if (action === 'about') {
      document.getElementById('lp-pillars')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (action === 'scroll-opps') {
      document.getElementById('lp-current-opps')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (action === 'real-estate') {
      setFormOpen('real-estate');
      return;
    }
    setFormOpen(action);
  };

  return (
    <div className="lp">
      <FgLandingTopbar onLogin={onLogin} />

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero__copy">
          <p className="lp-hero__eyebrow">{L.hero.eyebrow}</p>
          <h1 className="lp-hero__title">{L.hero.title}</h1>
          <p className="lp-hero__sub">{L.hero.sub}</p>
          <div className="lp-hero__ctas">
            <button className="lp-btn lp-btn--primary" onClick={() => handleAction(L.hero.primaryCta.action)}>
              {L.hero.primaryCta.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="lp-btn lp-btn--ghost" onClick={() => handleAction(L.hero.secondaryCta.action)}>
              {L.hero.secondaryCta.label}
            </button>
          </div>
        </div>
        <div className="lp-hero__visual">
          <FgLandingVisual brands={D.BRANDS} />
        </div>
      </section>

      {/* Trust pillars */}
      <section className="lp-pillars" id="lp-pillars">
        {L.pillars.map(p => (
          <div key={p.id} className="lp-pillar">
            <p className="lp-pillar__val">{p.value}</p>
            <p className="lp-pillar__label">{p.label}</p>
            <p className="lp-pillar__foot">{p.foot}</p>
          </div>
        ))}
      </section>

      {/* Who are you? — 4-tile entry carousel */}
      <FgWhoAreYou data={L.whoAreYou} onAction={handleAction} />

      {/* Current Opportunities — live openings */}
      <FgCurrentOpportunities data={L.currentOpportunities} fgData={D} onOpen={(opp) => { setSelectedOpp(opp); setOppDetailOpen(true); }} />

      {/* Brand showcase */}
      <section className="lp-brands">
        <p className="lp-brands__eyebrow">The ecosystem</p>
        <h2 className="lp-brands__title">Four brands, one platform.</h2>
        <div className="lp-brands__grid">
          {D.BRANDS.map(b => (
            <article key={b.id} className="lp-brand-card" style={{ '--bc': b.tokens.primary }}>
              <div className="lp-brand-card__mark" style={{ background: b.tokens.primary, color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff' }}>
                {b.logoSrc
                  ? <img src={b.logoSrc} alt={b.name} style={{ filter: logoFilter(b.tokens.primary), padding: 10, width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span>{b.logoMark}</span>}
              </div>
              <div className="lp-brand-card__copy">
                <p className="lp-brand-card__name">{b.name}</p>
                <p className="lp-brand-card__kind">{b.kind}</p>
                <p className="lp-brand-card__tag">{b.tagline}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* JOIN section removed — entry points are handled by the "Who are you?" carousel + header portals */}

      {/* Ecosystem teaser */}
      <section className="lp-eco">
        <div className="lp-eco__head">
          <p className="lp-eco__eyebrow">{L.ecosystemTeaser.eyebrow}</p>
          <h2 className="lp-eco__title">{L.ecosystemTeaser.title}</h2>
          <p className="lp-eco__sub">{L.ecosystemTeaser.sub}</p>
        </div>
        <div className="lp-eco__grid">
          {L.ecosystemTeaser.pillars.map((p, i) => (
            <article key={p.id} className="lp-eco-tile">
              <span className="lp-eco-tile__num">{String(i + 1).padStart(2, '0')}</span>
              <p className="lp-eco-tile__label">{p.label}</p>
            </article>
          ))}
        </div>
      </section>

      <FgLandingFooter />

      {/* Application form modal */}
      {formOpen && <FgLandingFormModal kind={formOpen} fgData={D} onClose={() => setFormOpen(null)} />}

      {/* Opportunity detail modal */}
      {oppDetailOpen && selectedOpp && (
        <FgOppDetailModal opp={selectedOpp} fgData={D} onClose={() => setOppDetailOpen(false)} />
      )}
    </div>
  );
}

// ====================================================================
// Topbar — minimal: logo + investor login link
// ====================================================================
function FgLandingTopbar({ onLogin }) {
  const L = window.FG_DATA.LANDING;
  const portals = L.portals || [];
  const icons = {
    brand: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>),
    candidate: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a1 1 0 0 0-1 1v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>),
    investor: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>),
    developer: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V13h6v8"/></svg>)
  };
  const handle = (p) => {
    if (p.href) { window.location.href = p.href; return; }
    if (p.action) {
      window.dispatchEvent(new CustomEvent('fg-portal-action', { detail: p.action }));
    }
  };
  return (
    <header className="lp-topbar">
      <img src="img/fg-logo.png" alt="Franchise Generation" className="lp-topbar__logo" />
      <nav className="lp-topbar__nav">
        <div className="fg-portals">
          {portals.map(p => (
            <button key={p.id} className="fg-portal" onClick={() => handle(p)}>
              <span className="fg-portal__icon">{icons[p.id]}</span>
              <span className="fg-portal__label">{p.label}</span>
              <span className="fg-portal__tooltip">{p.tooltip}</span>
            </button>
          ))}
        </div>
        <a href="login.html?portal=admin" className="lp-topbar__staff" title="Consultant & Admin sign in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20a8 8 0 0 1 16 0"/>
            <path d="M15 7l1.5 1.5L19 6"/>
          </svg>
          <span>Staff</span>
        </a>
      </nav>
    </header>
  );
}

// ====================================================================
// Footer
// ====================================================================
function FgLandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__copy">
        <img src="img/fg-logo.png" alt="Franchise Generation" className="lp-footer__logo" />
        <p>© 2026 Franchise Generation · A structured franchise ecosystem in Belgium.</p>
      </div>
      <div className="lp-footer__links">
        <a href="#">Legal</a>
        <a href="#">Privacy</a>
        <a href="#">Contact</a>
      </div>
    </footer>
  );
}

// ====================================================================
// Visual — abstract grid of brand monograms with brand colors
// ====================================================================
// ====================================================================
// Hero visual — single-photo auto-rotating carousel
// ====================================================================
function FgLandingVisual({ brands }) {
  const slides = [
    { src: 'img/shop-1.png', caption: "L'Atelier Châtelain · Bruxelles" },
    { src: 'img/shop-2.png', caption: "L'Atelier Sablon · Bruxelles" },
    { src: 'img/shop-3.png', caption: "L'Atelier Anvers · Antwerpen" },
    { src: 'img/couq-logo.jpg', caption: 'Couq · Saint-Géry, Bruxelles' }
  ];
  const [idx, setIdx] = lState(0);
  lEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % slides.length), 4200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="lp-photo">
      <div className="lp-photo__frame">
        {slides.map((s, i) => (
          <div key={i}
            className={'lp-photo__slide' + (i === idx ? ' is-active' : '')}
            style={{ backgroundImage: `url(${s.src})` }}>
            <div className="lp-photo__caption">{s.caption}</div>
          </div>
        ))}
      </div>
      <div className="lp-photo__dots">
        {slides.map((_, i) => (
          <button key={i} className={'lp-photo__dot' + (i === idx ? ' is-active' : '')}
            onClick={() => setIdx(i)} aria-label={'Photo ' + (i + 1)}></button>
        ))}
      </div>
    </div>
  );
}

// ====================================================================
// Application modal — routes to either brand application (single form)
// or candidate onboarding (multi-step wizard with brand selector,
// opportunity carousel, and lead creation).
// ====================================================================
function FgLandingFormModal({ kind, fgData, onClose }) {
  if (kind === 'brand-application') return <FgBrandApplicationModal fgData={fgData} onClose={onClose} />;
  if (kind === 'new-brand-concept') return <FgNewBrandConceptModal fgData={fgData} onClose={onClose} />;
  if (kind === 'investor-onboarding') return <FgInvestorOnboardingModal fgData={fgData} onClose={onClose} />;
  if (kind === 'real-estate') return <FgRealEstateModal fgData={fgData} onClose={onClose} />;
  return <FgCandidateOnboardingModal fgData={fgData} onClose={onClose} />;
}

// ----- Brand application (unchanged single-form) ----------------------
function FgBrandApplicationModal({ fgData, onClose }) {
  const [step, setStep] = lState('form');
  const fields = [
    { id: 'brand',   label: 'Brand name',           type: 'text',     placeholder: 'e.g. Couq' },
    { id: 'sector',  label: 'Sector',               type: 'select',   options: ['Food & Beverage', 'Bakery & Pâtisserie', 'Coffee & Brunch', 'Retail', 'Wellness', 'Other'] },
    { id: 'stage',   label: 'Stage',                type: 'select',   options: ['Pilot validated', '1–3 shops', '4–10 shops', '10+ shops'] },
    { id: 'name',    label: 'Your name',            type: 'text',     placeholder: 'Full name' },
    { id: 'email',   label: 'Email',                type: 'email',    placeholder: 'you@brand.com' },
    { id: 'message', label: 'Why Franchise Generation?', type: 'textarea', placeholder: 'A few lines about your brand and ambition.' }
  ];
  return (
    <>
      <div className="lp-scrim" onClick={onClose}></div>
      <div className="lp-modal" role="dialog">
        <header className="lp-modal__head">
          <div>
            <p className="lp-modal__eyebrow">For brands</p>
            <h2 className="lp-modal__title">Brand application</h2>
            <p className="lp-modal__sub">Tell us about your brand. We respond within 5 working days.</p>
          </div>
          <button className="lp-modal__close" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </header>
        {step === 'form' ? (
          <form className="lp-modal__body" onSubmit={(e) => { e.preventDefault(); setStep('success'); }}>
            {fields.map(f => (
              <div key={f.id} className={'lp-field' + (f.type === 'textarea' ? ' lp-field--wide' : '')}>
                <label>{f.label}</label>
                {f.type === 'textarea'
                  ? <textarea rows={4} placeholder={f.placeholder} required></textarea>
                  : f.type === 'select'
                    ? <select required defaultValue=""><option value="" disabled>Select…</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}</select>
                    : <input type={f.type} placeholder={f.placeholder} required />}
              </div>
            ))}
            <div className="lp-modal__actions">
              <button type="button" className="lp-btn lp-btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="lp-btn lp-btn--primary">Submit
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="lp-modal__success">
            <div className="lp-modal__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
            <h3>Application received.</h3>
            <p>Thank you — our team will be in touch shortly with the next steps.</p>
            <button className="lp-btn lp-btn--primary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </>
  );
}

// ----- Candidate onboarding wizard ------------------------------------
function FgCandidateOnboardingModal({ fgData, onClose }) {
  const D = fgData;
  const [step, setStep] = lState('profile'); // profile | brands | opportunities | detail | success
  const [profile, setProfile] = lState({ name: '', email: '', phone: '', region: '', capital: '' });
  const [brandPicks, setBrandPicks] = lState([]); // brand ids
  const [activeOpp, setActiveOpp] = lState(null);
  const [leadId, setLeadId] = lState(null);

  const updateProfile = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const profileValid = profile.name && profile.email && profile.region && profile.capital;

  const matchedOpps = brandPicks.length === 0
    ? D.ONBOARDING_OPPORTUNITIES
    : D.ONBOARDING_OPPORTUNITIES.filter(o => brandPicks.includes(o.brand));

  const createLead = () => {
    // In production: POST /candidate-leads -> returns leadId
    const id = 'lead-' + Date.now();
    setLeadId(id);
    setStep('success');
  };

  return (
    <>
      <div className="lp-scrim" onClick={onClose}></div>
      <div className="lp-modal lp-modal--wide" role="dialog">
        <header className="lp-modal__head">
          <div>
            <p className="lp-modal__eyebrow">For candidates</p>
            <h2 className="lp-modal__title">
              {step === 'profile' && 'Tell us about you'}
              {step === 'brands' && 'Which brands are you interested in?'}
              {step === 'opportunities' && 'Opportunities matching your profile'}
              {step === 'detail' && 'Opportunity detail'}
              {step === 'success' && 'Your lead has been created'}
            </h2>
            <p className="lp-modal__sub">
              {step === 'profile' && 'Step 1 of 3 · We use this to match you with the right brand.'}
              {step === 'brands' && 'Step 2 of 3 · Select one or more brands you\'d like to operate.'}
              {step === 'opportunities' && 'Step 3 of 3 · Tap a card to see the full project brief.'}
              {step === 'detail' && 'Project brief · validate your interest below.'}
              {step === 'success' && 'A consultant will reach out within 48 hours.'}
            </p>
          </div>
          <button className="lp-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {/* Step progress */}
        {['profile', 'brands', 'opportunities'].includes(step) && (
          <div className="lp-steps">
            {['profile', 'brands', 'opportunities'].map((s, i) => (
              <div key={s} className={'lp-step' + (s === step ? ' is-active' : '') + (['profile', 'brands', 'opportunities'].indexOf(step) > i ? ' is-done' : '')}>
                <span className="lp-step__num">{i + 1}</span>
                <span className="lp-step__label">{['Profile', 'Brands', 'Opportunities'][i]}</span>
              </div>
            ))}
          </div>
        )}

        {step === 'profile' && (
          <div className="lp-modal__body">
            <div className="lp-field"><label>Your name</label><input type="text" value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} placeholder="Full name" required /></div>
            <div className="lp-field"><label>Email</label><input type="email" value={profile.email} onChange={(e) => updateProfile('email', e.target.value)} placeholder="you@email.com" required /></div>
            <div className="lp-field"><label>Phone</label><input type="tel" value={profile.phone} onChange={(e) => updateProfile('phone', e.target.value)} placeholder="+32…" /></div>
            <div className="lp-field">
              <label>Preferred region</label>
              <select value={profile.region} onChange={(e) => updateProfile('region', e.target.value)} required>
                <option value="" disabled>Select…</option>
                {D.REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div className="lp-field lp-field--wide">
              <label>Available capital</label>
              <select value={profile.capital} onChange={(e) => updateProfile('capital', e.target.value)} required>
                <option value="" disabled>Select…</option>
                {['Under €25k', '€25k – €75k', '€75k – €150k', '€150k+'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="lp-modal__actions">
              <button type="button" className="lp-btn lp-btn--ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="lp-btn lp-btn--primary" disabled={!profileValid} onClick={() => setStep('brands')}>
                Continue
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {step === 'brands' && (
          <div className="lp-modal__brands">
            <p className="lp-modal__note">Select one or several. You can update your preferences later in your candidate profile.</p>
            <div className="lp-brand-pick">
              {D.BRANDS.map(b => {
                const active = brandPicks.includes(b.id);
                return (
                  <button key={b.id} type="button"
                    className={'lp-brand-badge' + (active ? ' is-active' : '')}
                    style={{ '--bb': b.tokens.primary }}
                    onClick={() => setBrandPicks(ps => active ? ps.filter(x => x !== b.id) : [...ps, b.id])}>
                    <span className="lp-brand-badge__mark" style={{ background: b.tokens.primary }}>
                      {b.logoSrc
                        ? <img src={b.logoSrc} alt="" style={{ filter: logoFilter(b.tokens.primary), padding: 8, width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <span style={{ color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff' }}>{b.logoMark}</span>}
                    </span>
                    <div className="lp-brand-badge__copy">
                      <p className="lp-brand-badge__name">{b.name}</p>
                      <p className="lp-brand-badge__kind">{b.kind}</p>
                    </div>
                    <span className="lp-brand-badge__check">
                      {active && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="lp-modal__actions">
              <button type="button" className="lp-btn lp-btn--ghost" onClick={() => setStep('profile')}>← Back</button>
              <button type="button" className="lp-btn lp-btn--primary" onClick={() => setStep('opportunities')}>
                {brandPicks.length === 0 ? 'See all opportunities' : `See ${matchedOpps.length} matching`}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {step === 'opportunities' && (
          <FgOnboardOpps opps={matchedOpps} fgData={D} onBack={() => setStep('brands')} onOpen={(o) => { setActiveOpp(o); setStep('detail'); }} />
        )}

        {step === 'detail' && activeOpp && (
          <FgOnboardDetail opp={activeOpp} fgData={D} onBack={() => setStep('opportunities')} onInterested={createLead} />
        )}

        {step === 'success' && (
          <FgOnboardSuccess profile={profile} opp={activeOpp} fgData={D} leadId={leadId} onClose={onClose} />
        )}
      </div>
    </>
  );
}

// ----- Opportunity carousel inside the wizard -------------------------
function FgOnboardOpps({ opps, fgData, onBack, onOpen }) {
  const trackRef = React.useRef(null);
  const [canPrev, setCanPrev] = lState(false);
  const [canNext, setCanNext] = lState(opps.length > 1);
  const D = fgData;

  const update = () => {
    const el = trackRef.current; if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  lEffect(() => { update(); }, [opps]);
  const scroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    const tile = el.querySelector('.lp-opp-card');
    const step = tile ? tile.getBoundingClientRect().width + 14 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="lp-modal__opps">
      <div className="lp-opp-car">
        <button className="lp-opp-car__arrow lp-opp-car__arrow--prev" disabled={!canPrev} onClick={() => scroll(-1)} aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="lp-opp-car__track" ref={trackRef} onScroll={update}>
          {opps.map(o => {
            const b = D.brandById(o.brand);
            const region = D.REGIONS.find(r => r.id === o.region);
            return (
              <button key={o.id} className="lp-opp-card" onClick={() => onOpen(o)}>
                <div className="lp-opp-card__media">
                  <img src={o.image} alt="" />
                  <div className="lp-opp-card__badges">
                    <span className="lp-opp-card__badge lp-opp-card__badge--brand" style={{ background: b.tokens.primary, color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff' }}>● {b.name}</span>
                    <span className="lp-opp-card__badge">{region?.label}</span>
                  </div>
                </div>
                <div className="lp-opp-card__body">
                  <p className="lp-opp-card__city">{o.city}</p>
                  <h4 className="lp-opp-card__name">{o.name.replace(b.name + ' ', '')}</h4>
                  <div className="lp-opp-card__meta">
                    <span>{o.format}</span><span>·</span><span>{o.opening}</span>
                  </div>
                  <div className="lp-opp-card__finance">
                    <div>
                      <p className="lp-opp-card__finance-l">Money needed</p>
                      <p className="lp-opp-card__finance-v">{D.fmtEur(o.requiredInvest)}</p>
                    </div>
                    <div>
                      <p className="lp-opp-card__finance-l">Your contribution</p>
                      <p className="lp-opp-card__finance-v">{D.fmtEur(o.candidateContrib)}</p>
                    </div>
                  </div>
                  <div className="lp-opp-card__pills">
                    <span className="lp-opp-card__pill">{o.status}</span>
                    <span className="lp-opp-card__pill lp-opp-card__pill--ghost">{o.financingNeed}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <button className="lp-opp-car__arrow lp-opp-car__arrow--next" disabled={!canNext} onClick={() => scroll(1)} aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="lp-modal__actions">
        <button type="button" className="lp-btn lp-btn--ghost" onClick={onBack}>← Adjust brands</button>
        <span className="lp-modal__count">{opps.length} project{opps.length > 1 ? 's' : ''} matched</span>
      </div>
    </div>
  );
}

// ----- Opportunity detail (inside modal) ------------------------------
function FgOnboardDetail({ opp, fgData, onBack, onInterested }) {
  const D = fgData;
  const b = D.brandById(opp.brand);
  const region = D.REGIONS.find(r => r.id === opp.region);
  return (
    <div className="lp-modal__detail">
      <div className="lp-opp-detail">
        <div className="lp-opp-detail__visuals">
          <div className="lp-opp-detail__brand" style={{ background: b.tokens.primary }}>
            <div className="lp-opp-detail__brand-inner">
              {b.logoSrc
                ? <img src={b.logoSrc} alt="" style={{ filter: logoFilter(b.tokens.primary), maxWidth: '70%' }} />
                : <span style={{ color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff', fontSize: 64, fontWeight: 700 }}>{b.logoMark}</span>}
            </div>
            <p className="lp-opp-detail__brand-tag" style={{ color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff' }}>{b.tagline}</p>
          </div>
          <div className="lp-opp-detail__photo"><img src={opp.image} alt="" /></div>
        </div>

        <div className="lp-opp-detail__body">
          <div className="lp-opp-detail__head">
            <p className="lp-opp-detail__eyebrow">{b.name} · {opp.format}</p>
            <h3 className="lp-opp-detail__title">{opp.name}</h3>
            <p className="lp-opp-detail__desc">{opp.description}</p>
          </div>
          <div className="lp-opp-detail__grid">
            <FactRow l="Location" v={opp.city} />
            <FactRow l="Region" v={region?.label} />
            <FactRow l="Opening" v={opp.opening} />
            <FactRow l="Format" v={opp.format} />
            <FactRow l="Required investment" v={D.fmtEur(opp.requiredInvest)} />
            <FactRow l="Candidate contribution" v={D.fmtEur(opp.candidateContrib)} />
            <FactRow l="Financing" v={opp.financingNeed} />
            <FactRow l="Estimated payback" v={opp.payback} />
            <FactRow l="Status" v={opp.status} />
          </div>
        </div>
      </div>
      <div className="lp-modal__actions">
        <button type="button" className="lp-btn lp-btn--ghost" onClick={onBack}>← Back to opportunities</button>
        <button type="button" className="lp-btn lp-btn--primary" onClick={onInterested}>
          I am interested
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

function FactRow({ l, v }) {
  return (
    <div className="lp-fact">
      <p className="lp-fact__l">{l}</p>
      <p className="lp-fact__v">{v}</p>
    </div>
  );
}

// ----- Success ---------------------------------------------------------
function FgOnboardSuccess({ profile, opp, fgData, leadId, onClose }) {
  const D = fgData;
  const b = opp ? D.brandById(opp.brand) : null;
  return (
    <div className="lp-modal__success">
      <div className="lp-modal__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
      <h3>Your interest is registered.</h3>
      <p>
        We've created a lead for <strong>{opp?.name}</strong>{b && ` (${b.name})`}. A consultant will review your profile and reach out within 48 hours.
      </p>
      <p className="lp-modal__lead-id">Lead reference: <strong>{leadId}</strong></p>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <a className="lp-btn lp-btn--primary" href={'candidate.html?lead=' + (leadId || '')}>
          Open my candidate space →
        </a>
        <button className="lp-btn lp-btn--ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

Object.assign(window, { FgLanding });

// ====================================================================
// Investor onboarding modal — multi-step
// ====================================================================
function FgInvestorOnboardingModal({ fgData, onClose }) {
  const D = fgData;
  const IO = D.LANDING.investorOnboarding;
  const [step, setStep] = lState('form');
  const [data, setData] = lState({
    name: '', email: '', phone: '',
    types: [], budget: '', regions: [], preference: '', involvement: ''
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggle = (k, v) => setData(d => ({ ...d, [k]: d[k].includes(v) ? d[k].filter(x => x !== v) : [...d[k], v] }));
  const canSubmit = data.name && data.email && data.types.length > 0 && data.budget;
  const [leadId, setLeadId] = lState(null);

  const submit = () => {
    if (!canSubmit) return;
    setLeadId('inv-' + Date.now());
    setStep('opportunities');
  };

  // Investment opportunities derived from API mock
  const opps = D.ONBOARDING_OPPORTUNITIES.slice(0, 6).map(o => {
    const b = D.brandById(o.brand);
    return {
      ...o,
      brandName: b.name,
      brandColor: b.tokens.primary,
      roi: o.brand === 'mania' ? 8.8 : o.brand === 'couq' ? 8.2 : o.brand === 'cookies' ? 7.5 : 8.4,
      progress: Math.round(((o.requiredInvest - o.candidateContrib * 3) / o.requiredInvest) * 100),
      maturity: 'Early stage'
    };
  });

  return (
    <>
      <div className="lp-scrim" onClick={onClose}></div>
      <div className="lp-modal lp-modal--wide" role="dialog">
        <header className="lp-modal__head">
          <div>
            <p className="lp-modal__eyebrow">For investors</p>
            <h2 className="lp-modal__title">
              {step === 'form' ? 'Parcours investisseur — quelques informations' : step === 'opportunities' ? 'Opportunités correspondant à votre profil' : 'Investisseur'}
            </h2>
            <p className="lp-modal__sub">
              {step === 'form' ? 'Nous créons un lead investisseur que notre équipe et un consultant prendront en charge sous 48 h.' : 'Découvrez les projets ouverts au financement.'}
            </p>
          </div>
          <button className="lp-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {step === 'form' ? (
          <form className="lp-modal__body" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="lp-field"><label>Nom complet</label><input type="text" value={data.name} onChange={(e) => set('name', e.target.value)} required /></div>
            <div className="lp-field"><label>Email</label><input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} required /></div>
            <div className="lp-field"><label>Téléphone</label><input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+32…" /></div>
            <div className="lp-field">
              <label>Budget disponible</label>
              <select value={data.budget} onChange={(e) => set('budget', e.target.value)} required>
                <option value="" disabled>Sélectionner…</option>
                {IO.budgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="lp-field lp-field--wide">
              <label>Types d'investissement recherchés (multi)</label>
              <div className="inv-chips">
                {IO.investmentTypes.map(t => (
                  <button key={t.id} type="button"
                    className={'inv-chip' + (data.types.includes(t.id) ? ' is-active' : '')}
                    onClick={() => toggle('types', t.id)}>{t.label}</button>
                ))}
              </div>
            </div>

            <div className="lp-field lp-field--wide">
              <label>Régions d'intérêt (multi)</label>
              <div className="inv-chips">
                {D.REGIONS.map(r => (
                  <button key={r.id} type="button"
                    className={'inv-chip' + (data.regions.includes(r.id) ? ' is-active' : '')}
                    onClick={() => toggle('regions', r.id)}>{r.label}</button>
                ))}
              </div>
            </div>

            <div className="lp-field lp-field--wide">
              <label>Préférence</label>
              <div className="inv-chips">
                {IO.preferences.map(p => (
                  <button key={p.id} type="button"
                    className={'inv-chip' + (data.preference === p.id ? ' is-active' : '')}
                    onClick={() => set('preference', p.id)}>{p.label}</button>
                ))}
              </div>
            </div>

            <div className="lp-field lp-field--wide">
              <label>Niveau d'implication</label>
              <div className="inv-involvement">
                {IO.involvement.map(i => (
                  <button key={i.id} type="button"
                    className={'inv-involve' + (data.involvement === i.id ? ' is-active' : '')}
                    onClick={() => set('involvement', i.id)}>
                    <strong>{i.label}</strong>
                    <span>{i.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lp-modal__actions">
              <button type="button" className="lp-btn lp-btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="lp-btn lp-btn--primary" disabled={!canSubmit}>
                Voir les opportunités
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="lp-modal__opps">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 0 4px' }}>
              <span className="nb-card__badge" style={{ background: '#3a4030' }}>INVESTOR</span>
              <span className="nb-card__badge" style={{ background: '#9c2a1f' }}>NEW LEAD</span>
              <span style={{ fontSize: 11, color: 'rgba(14,27,40,0.55)', marginLeft: 'auto' }}>Référence : {leadId}</span>
            </div>
            <div className="lp-opp-car">
              <div className="lp-opp-car__track">
                {opps.map(o => (
                  <article key={o.id} className="lp-opp-card" style={{ cursor: 'default' }}>
                    <div className="lp-opp-card__media">
                      <img src={o.image} alt="" />
                      <div className="lp-opp-card__badges">
                        <span className="lp-opp-card__badge lp-opp-card__badge--brand" style={{ background: o.brandColor, color: logoFilter(o.brandColor) === 'brightness(0)' ? '#1A1612' : '#fff' }}>● {o.brandName}</span>
                      </div>
                    </div>
                    <div className="lp-opp-card__body">
                      <p className="lp-opp-card__city">{o.city}</p>
                      <h4 className="lp-opp-card__name">{o.name.replace(o.brandName + ' ', '')}</h4>
                      <div className="lp-opp-card__meta"><span>{o.format}</span><span>·</span><span>{o.opening}</span></div>
                      <div className="lp-opp-card__finance">
                        <div><p className="lp-opp-card__finance-l">Budget recherché</p><p className="lp-opp-card__finance-v">{D.fmtEur(o.requiredInvest)}</p></div>
                        <div><p className="lp-opp-card__finance-l">ROI estimé</p><p className="lp-opp-card__finance-v">{o.roi.toFixed(1)} %</p></div>
                      </div>
                      <div style={{ height: 4, background: 'rgba(14,27,40,0.08)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: Math.min(100, Math.max(15, o.progress)) + '%', background: '#3a4030', borderRadius: 2 }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(14,27,40,0.55)' }}>
                        <span>{o.status}</span><span>{o.maturity}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="lp-btn lp-btn--primary lp-btn--sm" style={{ flex: 1 }}>I'm interested</button>
                        <button className="lp-btn lp-btn--ghost lp-btn--sm">Full file</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="lp-modal__actions">
              <button className="lp-btn lp-btn--ghost" onClick={onClose}>Fermer</button>
              <a className="lp-btn lp-btn--primary" href="index.html">Aller au portail investisseur →</a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ====================================================================
// Real estate developer modal — quick lead capture
// ====================================================================
function FgRealEstateModal({ fgData, onClose }) {
  const [step, setStep] = lState('form');
  const [data, setData] = lState({ name: '', company: '', email: '', phone: '', city: '', surface: '', description: '' });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const canSubmit = data.name && data.email && data.city;
  return (
    <>
      <div className="lp-scrim" onClick={onClose}></div>
      <div className="lp-modal" role="dialog">
        <header className="lp-modal__head">
          <div>
            <p className="lp-modal__eyebrow">For developers</p>
            <h2 className="lp-modal__title">Propose a location</h2>
            <p className="lp-modal__sub">Partagez une cellule commerciale ou un projet immobilier — l'équipe développement vous recontacte sous 5 jours ouvrés.</p>
          </div>
          <button className="lp-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>
        {step === 'form' ? (
          <form className="lp-modal__body" onSubmit={(e) => { e.preventDefault(); setStep('success'); }}>
            <div className="lp-field"><label>Nom</label><input type="text" value={data.name} onChange={(e) => set('name', e.target.value)} required /></div>
            <div className="lp-field"><label>Société</label><input type="text" value={data.company} onChange={(e) => set('company', e.target.value)} /></div>
            <div className="lp-field"><label>Email</label><input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} required /></div>
            <div className="lp-field"><label>Téléphone</label><input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            <div className="lp-field"><label>Ville / quartier</label><input type="text" value={data.city} onChange={(e) => set('city', e.target.value)} required /></div>
            <div className="lp-field"><label>Surface (m²)</label><input type="text" value={data.surface} onChange={(e) => set('surface', e.target.value)} /></div>
            <div className="lp-field lp-field--wide"><label>Description du projet</label><textarea rows={3} value={data.description} onChange={(e) => set('description', e.target.value)} placeholder="Type de cellule, état, disponibilité, droit au bail…"></textarea></div>
            <div className="lp-modal__actions">
              <button type="button" className="lp-btn lp-btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="lp-btn lp-btn--primary" disabled={!canSubmit}>Envoyer</button>
            </div>
          </form>
        ) : (
          <div className="lp-modal__success">
            <div className="lp-modal__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
            <h3>Merci !</h3>
            <p>Votre proposition a été transmise à l'équipe développement. Réponse sous 5 jours ouvrés.</p>
            <button className="lp-btn lp-btn--primary" onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </>
  );
}

// ====================================================================
// Who are you? — 4-tile entry carousel
// ====================================================================
function FgWhoAreYou({ data, onAction }) {
  const trackRef = React.useRef(null);
  const [canPrev, setCanPrev] = lState(false);
  const [canNext, setCanNext] = lState(true);
  const update = () => {
    const el = trackRef.current; if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  lEffect(() => { update(); }, []);
  const scroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    const tile = el.querySelector('.wru-tile');
    const step = tile ? tile.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  return (
    <section className="wru" id="lp-wru">
      <header className="wru__head">
        <h2 className="wru__title">{data.title}</h2>
        <p className="wru__sub">{data.sub}</p>
      </header>
      <div className="wru__car">
        <button className="wru__arrow wru__arrow--prev" disabled={!canPrev} onClick={() => scroll(-1)} aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="wru__track" ref={trackRef} onScroll={update}>
          {data.tiles.map(t => (
            <article key={t.id} className={'wru-tile wru-tile--' + t.tone}
              style={{ '--wru-accent': t.accent }}
              onClick={() => onAction(t.action)}>
              <div className="wru-tile__glyph"></div>
              <p className="wru-tile__eyebrow">{t.eyebrow}</p>
              <h3 className="wru-tile__title">{t.title}</h3>
              <p className="wru-tile__body">{t.body}</p>
              <button className="wru-tile__cta" onClick={(e) => { e.stopPropagation(); onAction(t.action); }}>
                {t.ctaLabel}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </article>
          ))}
        </div>
        <button className="wru__arrow wru__arrow--next" disabled={!canNext} onClick={() => scroll(1)} aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
}

// ====================================================================
// Current Opportunities — live openings carousel
// ====================================================================
function FgCurrentOpportunities({ data, fgData, onOpen }) {
  const D = fgData;
  const trackRef = React.useRef(null);
  const [canPrev, setCanPrev] = lState(false);
  const [canNext, setCanNext] = lState(true);
  const update = () => {
    const el = trackRef.current; if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  lEffect(() => { update(); }, []);
  const scroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    const tile = el.querySelector('.co-card');
    const step = tile ? tile.getBoundingClientRect().width + 14 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  const opps = D.ONBOARDING_OPPORTUNITIES.slice(0, 4);
  return (
    <section className="co" id="lp-current-opps">
      <header className="co__head">
        <div>
          <h2 className="co__title">{data.title}</h2>
          <p className="co__sub">{data.sub}</p>
        </div>
      </header>
      <div className="co__car">
        <button className="co__arrow co__arrow--prev" disabled={!canPrev} onClick={() => scroll(-1)} aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="co__track" ref={trackRef} onScroll={update}>
          {opps.map(o => {
            const b = D.brandById(o.brand);
            const badge = data.badges?.[o.id];
            const region = D.REGIONS.find(r => r.id === o.region);
            return (
              <article key={o.id} className="co-card" onClick={() => onOpen(o)}>
                <div className="co-card__media">
                  <img src={o.image} alt="" />
                  <div className="co-card__media-fade"></div>
                  {badge && <span className={'co-card__badge co-card__badge--' + badge.tone}>{badge.label}</span>}
                  <div className="co-card__brand-row">
                    <span className="co-card__brand-mark" style={{ background: b.tokens.primary, color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff' }}>{b.logoMark}</span>
                    <span className="co-card__brand-name">{b.name}</span>
                  </div>
                  <div className="co-card__media-title">
                    <h3>{o.city}</h3>
                    <p>{region?.label}</p>
                  </div>
                </div>
                <div className="co-card__body">
                  <div className="co-card__meta-row">
                    <span className="co-card__meta-pill">{o.format}</span>
                    <span className="co-card__meta-pill co-card__meta-pill--ghost">{o.opening}</span>
                  </div>
                  <div className="co-card__row">
                    <div><span>Budget</span><strong>{D.fmtEur(o.requiredInvest)}</strong></div>
                    <div><span>Apport</span><strong>{D.fmtEur(o.candidateContrib)}</strong></div>
                  </div>
                  <button className="lp-btn lp-btn--primary lp-btn--sm co-card__cta" onClick={(e) => { e.stopPropagation(); onOpen(o); }}>
                    I'm interested
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <button className="co__arrow co__arrow--next" disabled={!canNext} onClick={() => scroll(1)} aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
}

// ====================================================================
// Opportunity detail modal — quick lead generation
// ====================================================================
function FgOppDetailModal({ opp, fgData, onClose }) {
  const D = fgData;
  const b = D.brandById(opp.brand);
  const region = D.REGIONS.find(r => r.id === opp.region);
  const [step, setStep] = lState('detail'); // detail | form | success
  const [data, setData] = lState({ name: '', email: '', phone: '' });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const canSubmit = data.name && data.email;
  const [leadId, setLeadId] = lState(null);

  const submit = () => {
    if (!canSubmit) return;
    const id = 'lead-' + Date.now();
    setLeadId(id);
    setStep('success');
  };

  return (
    <>
      <div className="lp-scrim" onClick={onClose}></div>
      <div className="lp-modal lp-modal--wide" role="dialog">
        <header className="lp-modal__head">
          <div>
            <p className="lp-modal__eyebrow" style={{ color: b.tokens.primary }}>● {b.name}</p>
            <h2 className="lp-modal__title">{opp.name}</h2>
            <p className="lp-modal__sub">{opp.format} · {opp.city} · {region?.label}</p>
          </div>
          <button className="lp-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {step === 'detail' && (
          <>
            <div className="opp-modal">
              <div className="opp-modal__left" style={{ background: b.tokens.primary }}>
                <div className="opp-modal__brand-mark">
                  {b.logoSrc
                    ? <img src={b.logoSrc} alt="" style={{ filter: logoFilter(b.tokens.primary), maxWidth: '70%' }} />
                    : <span style={{ color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff', fontSize: 56, fontWeight: 700 }}>{b.logoMark}</span>}
                </div>
                <div className="opp-modal__brand-info" style={{ color: logoFilter(b.tokens.primary) === 'brightness(0)' ? b.tokens.ink : '#fff' }}>
                  <p className="opp-modal__brand-name">{b.name}</p>
                  <p className="opp-modal__brand-tag">{b.tagline}</p>
                  <div className="opp-modal__brand-kpis">
                    <div><span>Budget nécessaire</span><strong>{D.fmtEur(opp.requiredInvest)}</strong></div>
                    <div><span>Apport candidat</span><strong>{D.fmtEur(opp.candidateContrib)}</strong></div>
                    <div><span>TRI cible</span><strong>{(b.id === 'atelier' ? '8,4' : b.id === 'couq' ? '8,2' : b.id === 'cookies' ? '7,5' : '8,8')} %</strong></div>
                    <div><span>Expérience conseillée</span><strong>Retail / F&B · 3 ans+</strong></div>
                  </div>
                </div>
              </div>
              <div className="opp-modal__right">
                <div className="opp-modal__photo"><img src={opp.image} alt="" /></div>
                <div className="opp-modal__facts">
                  <div><span>Localisation</span><strong>{opp.city}</strong></div>
                  <div><span>Surface</span><strong>{opp.format}</strong></div>
                  <div><span>Zone de chalandise</span><strong>≈ 28 000 hab.</strong></div>
                  <div><span>Ouverture prévue</span><strong>{opp.opening}</strong></div>
                  <div><span>Statut</span><strong>{opp.status}</strong></div>
                </div>
                <p className="opp-modal__desc">{opp.description}</p>
              </div>
            </div>
            <div className="lp-modal__actions">
              <button className="lp-btn lp-btn--ghost" onClick={onClose}>Fermer</button>
              <button className="lp-btn lp-btn--primary" onClick={() => setStep('form')}>
                I am interested
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </>
        )}

        {step === 'form' && (
          <form className="lp-modal__body" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: 13, color: 'rgba(14,27,40,0.65)' }}>
              Express your interest — un consultant {b.name} vous recontacte sous 48 h.
            </p>
            <div className="lp-field"><label>Nom complet</label><input type="text" value={data.name} onChange={(e) => set('name', e.target.value)} required /></div>
            <div className="lp-field"><label>Email</label><input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} required /></div>
            <div className="lp-field lp-field--wide"><label>Téléphone</label><input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+32…" /></div>
            <div className="lp-modal__actions">
              <button type="button" className="lp-btn lp-btn--ghost" onClick={() => setStep('detail')}>← Retour</button>
              <button type="submit" className="lp-btn lp-btn--primary" disabled={!canSubmit}>Envoyer ma candidature</button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="lp-modal__success">
            <div className="lp-modal__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
            <h3>Votre intérêt est enregistré.</h3>
            <p>Lead créé pour <strong>{opp.name}</strong>. Un consultant {b.name} vous recontacte sous 48 h ouvrées.</p>
            <p className="lp-modal__lead-id">Référence : <strong>{leadId}</strong></p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a className="lp-btn lp-btn--primary" href="candidate.html">Ouvrir mon espace candidat →</a>
              <button className="lp-btn lp-btn--ghost" onClick={onClose}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ====================================================================
// New brand / concept lead form (Make Your Own Brand)
// ====================================================================
function FgNewBrandConceptModal({ fgData, onClose }) {
  const D = fgData;
  const DRAFT_KEY = 'fg-new-brand-draft';
  const initial = (() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || {}; } catch { return {}; }
  })();
  const [step, setStep] = lState('form');
  const [data, setData] = lState({
    name: '', email: '', phone: '',
    projectName: '', conceptType: 'bakery',
    location: '', budget: '',
    description: '', inspirations: '',
    files: [],
    ...initial
  });
  const [savedAt, setSavedAt] = lState(null);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const fileRef = React.useRef(null);
  const canSubmit = data.name && data.email && data.projectName && data.description;

  const saveDraft = () => {
    const toSave = { ...data };
    delete toSave.files;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
    setSavedAt(new Date().toLocaleTimeString());
  };
  const submit = () => {
    if (!canSubmit) return;
    const lead = {
      id: 'nbl-' + Date.now(),
      candidate: { name: data.name, email: data.email, phone: data.phone },
      projectName: data.projectName,
      conceptType: data.conceptType,
      location: data.location,
      budget: parseInt((data.budget || '').toString().replace(/\D/g, ''), 10) || 0,
      description: data.description,
      inspirations: data.inspirations,
      attachments: (data.files || []).map(f => f.name),
      status: 'to-analyse',
      assignedTo: 'Équipe développement',
      createdAt: 'À l\'instant'
    };
    D.NEW_BRAND_LEADS.unshift(lead);
    localStorage.removeItem(DRAFT_KEY);
    setStep('success');
  };

  return (
    <>
      <div className="lp-scrim" onClick={onClose}></div>
      <div className="lp-modal" role="dialog">
        <header className="lp-modal__head">
          <div>
            <p className="lp-modal__eyebrow">Make Your Own Brand</p>
            <h2 className="lp-modal__title">Présentez votre projet</h2>
            <p className="lp-modal__sub">Concept, marque ou idée de franchise — l'équipe développement vous recontacte sous 48 h ouvrées.</p>
          </div>
          <button className="lp-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {step === 'form' ? (
          <form className="lp-modal__body" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="lp-field"><label>Nom du candidat</label><input type="text" value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="Prénom et nom" required /></div>
            <div className="lp-field"><label>Email</label><input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="vous@email.com" required /></div>
            <div className="lp-field"><label>Téléphone</label><input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+32…" /></div>
            <div className="lp-field"><label>Nom du projet / marque</label><input type="text" value={data.projectName} onChange={(e) => set('projectName', e.target.value)} placeholder="Le nom de votre future marque" required /></div>
            <div className="lp-field">
              <label>Type de concept</label>
              <select value={data.conceptType} onChange={(e) => set('conceptType', e.target.value)}>
                {D.CONCEPT_TYPES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="lp-field"><label>Localisation souhaitée</label><input type="text" value={data.location} onChange={(e) => set('location', e.target.value)} placeholder="Ville, quartier, région…" /></div>
            <div className="lp-field"><label>Budget estimé (€)</label><input type="text" value={data.budget} onChange={(e) => set('budget', e.target.value)} placeholder="ex. 80 000" /></div>
            <div className="lp-field lp-field--wide">
              <label>Description courte du concept</label>
              <textarea rows={4} value={data.description} onChange={(e) => set('description', e.target.value)} placeholder="Quelques lignes sur le concept, le produit, l'expérience cliente." required></textarea>
            </div>
            <div className="lp-field lp-field--wide">
              <label>Inspirations / références</label>
              <textarea rows={2} value={data.inspirations} onChange={(e) => set('inspirations', e.target.value)} placeholder="Enseignes, lieux, lien Pinterest, comptes Instagram…"></textarea>
            </div>
            <div className="lp-field lp-field--wide">
              <label>Logo ou images (optionnel)</label>
              <div className="fg-help-attach">
                {(data.files || []).map((f, i) => (
                  <span key={i} className="fg-help-attach__item">{f.name}
                    <button type="button" onClick={() => set('files', data.files.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
                <button type="button" className="fg-help-attach__add" onClick={() => fileRef.current?.click()}>+ Ajouter un fichier</button>
                <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
                  onChange={(e) => set('files', [...(data.files || []), ...Array.from(e.target.files || [])])} />
              </div>
            </div>
            <div className="lp-modal__actions">
              {savedAt && <span style={{ fontSize: 11, color: 'rgba(14,27,40,0.55)', marginRight: 'auto' }}>Brouillon sauvegardé · {savedAt}</span>}
              <button type="button" className="lp-btn lp-btn--ghost" onClick={saveDraft}>Sauvegarder en brouillon</button>
              <button type="submit" className="lp-btn lp-btn--primary" disabled={!canSubmit}>
                Envoyer à l'équipe
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="lp-modal__success">
            <div className="lp-modal__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
            <h3>Votre projet a bien été envoyé.</h3>
            <p>Votre projet a bien été envoyé à notre équipe développement. Un consultant vous recontactera sous 48 h ouvrées.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <a className="lp-btn lp-btn--primary" href="consultant.html?tab=new-brands">Voir le lead dans le consultant portal →</a>
              <button className="lp-btn lp-btn--ghost" onClick={onClose}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ====================================================================
// Concept carousel — inside the "Are you a brand?" tile
// ====================================================================
function FgConceptCarousel({ concepts, onAction }) {
  const trackRef = React.useRef(null);
  const [canPrev, setCanPrev] = lState(false);
  const [canNext, setCanNext] = lState(true);
  const update = () => {
    const el = trackRef.current; if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  lEffect(() => { update(); }, []);
  const scroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    const tile = el.querySelector('.lp-cc-tile');
    const step = tile ? tile.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  // Concept tile color palette — rotates through brand-neutral pastels
  const palettes = [
    { bg: '#F5EFE3', accent: '#6B5430' },
    { bg: '#EDE7DA', accent: '#3a4030' },
    { bg: '#F1E6DE', accent: '#8B5A3C' },
    { bg: '#E8DCC0', accent: '#8B3A2A' },
    { bg: '#EFE5D6', accent: '#B8862E' },
    { bg: '#E6E0D2', accent: '#4a6b7c' },
    { bg: '#F0E5DC', accent: '#9c6a1f' },
    { bg: '#E8E2D2', accent: '#2d6a4f' }
  ];

  return (
    <div className="lp-cc">
      <div className="lp-cc__head">
        <p className="lp-cc__eyebrow">{concepts.eyebrow}</p>
        <h4 className="lp-cc__title">{concepts.title}</h4>
        <p className="lp-cc__sub">{concepts.sub}</p>
      </div>

      <div className="lp-cc__car">
        <button className="lp-cc__arrow lp-cc__arrow--prev" disabled={!canPrev} onClick={() => scroll(-1)} aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="lp-cc__track" ref={trackRef} onScroll={update}>
          {concepts.list.map((c, i) => {
            const pal = palettes[i % palettes.length];
            return (
              <article key={c.id} className="lp-cc-tile" style={{ '--cc-bg': pal.bg, '--cc-accent': pal.accent }}>
                <div className="lp-cc-tile__mock">
                  <ConceptMockup palette={pal} kind={c.kind} title={c.title} />
                  {c.tag && <span className="lp-cc-tile__tag">{c.tag}</span>}
                </div>
                <div className="lp-cc-tile__body">
                  <p className="lp-cc-tile__kind">{c.kind}</p>
                  <h5 className="lp-cc-tile__title">{c.title}</h5>
                  <p className="lp-cc-tile__pos">{c.positioning}</p>
                  <div className="lp-cc-tile__rows">
                    <div><span>Model</span><strong>{c.model}</strong></div>
                    <div><span>Expansion</span><strong>{c.expansion}</strong></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <button className="lp-cc__arrow lp-cc__arrow--next" disabled={!canNext} onClick={() => scroll(1)} aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="lp-cc__ctas">
        {concepts.ctas.map((c, i) => (
          <button key={i}
            className={'lp-btn ' + (i === 0 ? 'lp-btn--primary' : 'lp-btn--ghost')}
            onClick={() => onAction(c.action)}>
            {c.label}
            {i === 0 && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        ))}
      </div>
    </div>
  );
}

// Minimal SVG mockup placeholder — uses concept palette + a typographic mark
function ConceptMockup({ palette, kind, title }) {
  // Build a 2-char monogram from the title
  const monogram = (title.match(/\b[A-Za-z]/g) || ['F','G']).slice(0, 2).join('').toUpperCase();
  return (
    <div className="lp-cc-mock" style={{ background: palette.bg }}>
      <div className="lp-cc-mock__bar" style={{ background: palette.accent }}></div>
      <div className="lp-cc-mock__mono" style={{ color: palette.accent }}>{monogram}</div>
      <div className="lp-cc-mock__kind" style={{ color: palette.accent }}>{kind}</div>
      <svg className="lp-cc-mock__lines" viewBox="0 0 200 60" preserveAspectRatio="none">
        <line x1="0" y1="20" x2="200" y2="20" stroke={palette.accent} strokeOpacity="0.18" strokeWidth="1" />
        <line x1="0" y1="38" x2="160" y2="38" stroke={palette.accent} strokeOpacity="0.12" strokeWidth="1" />
        <line x1="0" y1="52" x2="120" y2="52" stroke={palette.accent} strokeOpacity="0.10" strokeWidth="1" />
      </svg>
    </div>
  );
}
