// Franchise Portal — L'Atelier By
// Rendered when a candidate has been validated & an onboarding journey created.
// Uses the same design tokens as backoffice (backoffice.css).

/* ─── Constants ─────────────────────────────────────────────────── */
const CAT_COLORS = {
  PIPELINE:   { bg: 'rgba(88,120,168,.12)', text: '#5878A8', label: 'Pipeline' },
  LEGAL:      { bg: 'rgba(141,29,44,.10)',  text: '#8D1D2C', label: 'Juridique' },
  FORMATION:  { bg: 'rgba(91,140,90,.12)',  text: '#5B8C5A', label: 'Formation' },
  MANAGEMENT: { bg: 'rgba(216,155,74,.15)', text: '#b87d30', label: 'Management' },
  STAGE:      { bg: 'rgba(14,27,40,.08)',   text: '#4A4A48', label: 'Stage' },
  OPENING:    { bg: 'rgba(141,29,44,.15)',  text: '#8D1D2C', label: 'Ouverture' },
};

const SEC_ICONS = {
  CHECKLIST:  '✓',
  TRAINING:   '📚',
  COMPETENCE: '⭐',
  TASKS:      '📋',
  PRODUCTS:   '🧺',
  DOCUMENTS:  '📄',
  PAYMENT:    '💶',
  GATE:       '🚦',
};

const ACTION_CHIPS = {
  CALL:         { label: '📞 Appel',    bg: 'rgba(88,120,168,.12)', text: '#5878A8' },
  MEETING:      { label: '🤝 Réunion',  bg: 'rgba(216,155,74,.15)', text: '#b87d30' },
  CONVERSATION: { label: '💬 Échange',  bg: 'rgba(141,29,44,.10)',  text: '#8D1D2C' },
};

/* ─── Utilities ─────────────────────────────────────────────────── */
function getToken() {
  try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; }
}

async function api(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...opts.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

function fmtEur(cents) {
  if (!cents) return '—';
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);
}

function dateFromWeek(targetOpen, weeksBack) {
  if (!targetOpen) return null;
  const d = new Date(targetOpen);
  d.setDate(d.getDate() - weeksBack * 7);
  return d.toLocaleDateString('fr-BE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function computeProgress(sections) {
  let total = 0, done = 0;
  for (const s of sections) {
    for (const i of s.items) {
      if (i.required) { total++; if (i.done || i.uploaded) done++; }
    }
  }
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/* ─── Toast ─────────────────────────────────────────────────────── */
const _toastListeners = [];
function toast(type, msg) { _toastListeners.forEach(fn => fn({ type, msg, id: Date.now() })); }

function ToastHost() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    const handler = t => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3200);
    };
    _toastListeners.push(handler);
    return () => { const i = _toastListeners.indexOf(handler); if (i > -1) _toastListeners.splice(i, 1); };
  }, []);
  return (
    <div className="bo-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`bo-toast bo-toast--${t.type}`}>
          <span className="bo-toast__dot" />{t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─── Status dot ────────────────────────────────────────────────── */
function StepCircle({ ordinal, status }) {
  const base = {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700, flexShrink: 0, transition: 'all 200ms',
  };
  if (status === 'DONE') return (
    <div style={{ ...base, background: '#5B8C5A', color: '#fff' }}>✓</div>
  );
  if (status === 'ACTIVE') return (
    <div className="pulse-ruby" style={{ ...base, background: '#8D1D2C', color: '#fff' }}>⚡</div>
  );
  return <div style={{ ...base, background: 'rgba(14,27,40,.06)', color: 'rgba(14,27,40,.35)', border: '1.5px solid rgba(14,27,40,.10)' }}>{ordinal}</div>;
}

/* ─── Progress badge ─────────────────────────────────────────────── */
function ProgressBadge({ sections }) {
  const { total, done } = computeProgress(sections);
  if (total === 0) return null;
  const cls = done === 0 ? 'rgba(14,27,40,.30)' : done >= total ? '#5B8C5A' : '#D89B4A';
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: cls, background: done >= total ? 'rgba(91,140,90,.12)' : done > 0 ? 'rgba(216,155,74,.12)' : 'rgba(14,27,40,.06)', padding: '2px 8px', borderRadius: 20 }}>
      {done >= total ? `✓ ${done}/${total}` : `${done}/${total}`}
    </span>
  );
}

/* ─── Section accordion ──────────────────────────────────────────── */
function SectionAccordion({ section, onboardingId, stepId, onItemToggle, onUpload, onNoteAdd }) {
  const [open, setOpen] = React.useState(true);
  const [noteItemId, setNoteItemId] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const saveNote = async (itemId) => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await api(`/onboarding/${onboardingId}/items/${itemId}/notes`, {
        method: 'POST', body: JSON.stringify({ content: noteText.trim() })
      });
      onNoteAdd(itemId, res.data);
      setNoteText(''); setNoteItemId(null);
      toast('success', 'Note ajoutée');
    } catch { toast('error', 'Erreur lors de l\'ajout de la note'); }
    setSaving(false);
  };

  return (
    <div style={{ border: '1px solid rgba(14,27,40,.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(14,27,40,.02)', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 16 }}>{SEC_ICONS[section.type] || '·'}</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A4A48' }}>{section.title}</span>
        <ProgressBadge sections={[section]} />
        <span style={{ fontSize: 14, color: 'rgba(14,27,40,.40)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* GATE */}
          {section.type === 'GATE' && (
            <div style={{ background: '#1A1A18', borderRadius: 10, padding: '16px 20px', marginTop: 12 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F2C9A0', fontWeight: 700, margin: '0 0 6px' }}>🚦 FRANCHISE GATE</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{section.gateName}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', margin: 0, lineHeight: 1.6 }}>{section.gateDesc}</p>
            </div>
          )}

          {/* PAYMENT */}
          {section.type === 'PAYMENT' && (
            <div style={{ background: 'linear-gradient(135deg, #FCF1E4 0%, #F2C9A0 100%)', borderRadius: 10, padding: '16px 20px', marginTop: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(14,27,40,.55)', fontWeight: 600, margin: '0 0 4px' }}>Paiement requis</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1A1A18', margin: '0 0 4px', fontFamily: 'serif' }}>{fmtEur(section.paymentAmount)}</p>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(14,27,40,.60)', margin: '0 0 6px' }}>{section.paymentRef}</p>
              <p style={{ fontSize: 12, color: 'rgba(14,27,40,.70)', margin: 0 }}>{section.paymentLabel}</p>
            </div>
          )}

          {/* PRODUCTS grid */}
          {section.type === 'PRODUCTS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
              {section.items.map(item => (
                <button key={item.id}
                  onClick={() => onItemToggle(item.id)}
                  style={{ padding: '14px 8px', borderRadius: 10, border: item.done ? '2px solid #5B8C5A' : '1.5px solid rgba(14,27,40,.10)', background: item.done ? 'rgba(91,140,90,.08)' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 140ms', position: 'relative' }}
                >
                  {item.done && <span style={{ position: 'absolute', top: 6, right: 8, color: '#5B8C5A', fontWeight: 700, fontSize: 13 }}>✓</span>}
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{item.icon || '📦'}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: item.done ? '#5B8C5A' : '#1A1A18' }}>{item.label}</div>
                  {item.meta && <div style={{ fontSize: 10, color: 'rgba(14,27,40,.45)', marginTop: 2 }}>{item.meta}</div>}
                </button>
              ))}
            </div>
          )}

          {/* Checklist / Training / Competence / Tasks / Documents */}
          {['CHECKLIST','TRAINING','COMPETENCE','TASKS','DOCUMENTS'].includes(section.type) && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.items.map(item => (
                <div key={item.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 10px', borderRadius: 8, background: 'rgba(14,27,40,.02)', border: '1px solid rgba(14,27,40,.06)' }}>
                    {/* Checkbox / Upload button */}
                    {section.type === 'DOCUMENTS' ? (
                      <button
                        onClick={() => onUpload(item.id)}
                        style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 4, border: item.uploaded ? 'none' : '1.5px solid rgba(14,27,40,.25)', background: item.uploaded ? '#5B8C5A' : 'transparent', color: '#fff', fontSize: 12, cursor: item.uploaded ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        disabled={item.uploaded}
                      >
                        {item.uploaded ? '✓' : '⬆'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onItemToggle(item.id)}
                        style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 4, border: item.done ? 'none' : '1.5px solid rgba(14,27,40,.25)', background: item.done ? '#5B8C5A' : 'transparent', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 140ms' }}
                      >
                        {item.done ? '✓' : ''}
                      </button>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {(item.code2 || item.code) && (
                          <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, background: 'rgba(14,27,40,.06)', padding: '1px 6px', borderRadius: 4, color: '#4A4A48' }}>
                            {item.code2 || item.code}
                          </span>
                        )}
                        <span style={{ fontSize: 13, color: '#1A1A18', textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>{item.label}</span>
                        {!item.required && <span style={{ fontSize: 10, color: 'rgba(14,27,40,.40)', fontStyle: 'italic' }}>optionnel</span>}
                        {item.actionType && ACTION_CHIPS[item.actionType] && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: ACTION_CHIPS[item.actionType].bg, color: ACTION_CHIPS[item.actionType].text }}>
                            {ACTION_CHIPS[item.actionType].label}
                          </span>
                        )}
                      </div>
                      {item.fileName && (
                        <p style={{ fontSize: 11, color: 'rgba(14,27,40,.50)', margin: '2px 0 0', fontStyle: 'italic' }}>{item.fileName}</p>
                      )}
                      {item.hint && (
                        <p style={{ fontSize: 11, color: '#D89B4A', margin: '2px 0 0' }}>ℹ️ {item.hint}</p>
                      )}

                      {/* Action notes */}
                      {item.actionType && (
                        <div style={{ marginTop: 8 }}>
                          {(item.actionNotes || []).map(note => (
                            <div key={note.id} style={{ background: '#FCF1E4', borderRadius: 6, padding: '7px 10px', marginBottom: 5, fontSize: 12 }}>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#8D1D2C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{note.authorInitials}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#4A4A48' }}>{note.authorName}</span>
                                <span style={{ fontSize: 10, color: 'rgba(14,27,40,.45)' }}>{new Date(note.createdAt).toLocaleDateString('fr-BE')}</span>
                              </div>
                              <p style={{ margin: 0, color: '#1A1A18', lineHeight: 1.5 }}>{note.content}</p>
                            </div>
                          ))}
                          {noteItemId === item.id ? (
                            <div style={{ marginTop: 4 }}>
                              <textarea
                                autoFocus
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder={`Ajouter une note ${ACTION_CHIPS[item.actionType]?.label || ''}…`}
                                style={{ width: '100%', minHeight: 72, borderRadius: 6, border: '1.5px solid rgba(14,27,40,.15)', padding: 8, fontSize: 12, fontFamily: 'inherit', resize: 'vertical' }}
                              />
                              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                <button className="bo-btn bo-btn--primary bo-btn--sm" onClick={() => saveNote(item.id)} disabled={saving || !noteText.trim()}>
                                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                                </button>
                                <button className="bo-btn bo-btn--ghost bo-btn--sm" onClick={() => { setNoteItemId(null); setNoteText(''); }}>Annuler</button>
                              </div>
                            </div>
                          ) : (
                            <button className="bo-btn bo-btn--ghost bo-btn--xs" style={{ marginTop: 4 }} onClick={() => setNoteItemId(item.id)}>
                              + Note {ACTION_CHIPS[item.actionType]?.label}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Step Modal ─────────────────────────────────────────────────── */
function StepModal({ step, onboardingId, targetOpenDate, onClose, onStepAdvance, onItemToggle, onUpload, onNoteAdd }) {
  const cat = CAT_COLORS[step.category] || CAT_COLORS.PIPELINE;
  const { total, done, pct } = computeProgress(step.sections);
  const isComplete = total === 0 || done >= total;
  const dateStr = targetOpenDate && step.weekStartNum > 0
    ? dateFromWeek(targetOpenDate, step.weekStartNum)
    : step.weekOffset;

  // Close on Escape
  React.useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="bo-scrim" style={{ zIndex: 400 }} onClick={onClose} />
      <div
        className="bo-modal"
        style={{ zIndex: 401, maxWidth: 820, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}
        role="dialog" aria-modal="true"
      >
        <header className="bo-modal__head" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: 20, background: cat.bg, color: cat.text }}>
                {cat.label}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(14,27,40,.45)', fontFamily: 'monospace' }}>{step.code}</span>
            </div>
            <h2 className="bo-modal__title">{step.title}</h2>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)' }}>📅 {dateStr}</span>
              <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)' }}>⏱ {step.weekOffset}</span>
              {step.budgetCents > 0 && (
                <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)' }}>💶 {fmtEur(step.budgetCents)}</span>
              )}
              {step.phaseColor && (
                <span style={{ width: 14, height: 14, borderRadius: 3, background: step.phaseColor, border: '1px solid rgba(14,27,40,.15)', display: 'inline-block', marginTop: 1 }} />
              )}
            </div>
          </div>
          <button className="bo-modal__close" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        </header>

        <div className="bo-modal__body" style={{ padding: '0 24px 12px' }}>
          {step.description && (
            <p style={{ fontSize: 13, color: 'rgba(14,27,40,.65)', marginBottom: 16, lineHeight: 1.6 }}>{step.description}</p>
          )}
          {step.sections.map(section => (
            <SectionAccordion
              key={section.id}
              section={section}
              onboardingId={onboardingId}
              stepId={step.id}
              onItemToggle={onItemToggle}
              onUpload={onUpload}
              onNoteAdd={onNoteAdd}
            />
          ))}
        </div>

        <footer className="bo-modal__actions" style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid rgba(14,27,40,.08)' }}>
          <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)', flex: 1 }}>
            {total > 0 ? `${done}/${total} validés · ${total - done} restant${total - done > 1 ? 's' : ''}` : 'Aucun élément requis'}
          </span>
          <button className="bo-btn bo-btn--ghost" onClick={onClose}>Fermer</button>
          {step.status === 'ACTIVE' && (
            <button
              className="bo-btn bo-btn--primary"
              disabled={!isComplete}
              onClick={() => { onStepAdvance(step.id); onClose(); }}
              title={isComplete ? '' : 'Complétez tous les éléments requis'}
            >
              Passer à l'étape suivante →
            </button>
          )}
        </footer>
      </div>
    </>
  );
}

/* ─── Timeline row ───────────────────────────────────────────────── */
function TimelineRow({ step, targetOpenDate, onClick }) {
  const cat = CAT_COLORS[step.category] || CAT_COLORS.PIPELINE;
  const { total, done, pct } = computeProgress(step.sections);
  const dateStr = targetOpenDate && step.weekStartNum > 0
    ? dateFromWeek(targetOpenDate, step.weekStartNum)
    : null;

  return (
    <div
      onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: '52px 1fr 180px 120px 80px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(14,27,40,.06)', cursor: 'pointer', transition: 'background 120ms' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,27,40,.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <StepCircle ordinal={step.ordinal} status={step.status} />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '1px 7px', borderRadius: 20, background: cat.bg, color: cat.text }}>{cat.label}</span>
          {step.phaseColor && <span style={{ width: 10, height: 10, borderRadius: 2, background: step.phaseColor, border: '1px solid rgba(14,27,40,.12)' }} />}
        </div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A18' }}>{step.title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(14,27,40,.50)' }}>{step.description}</p>
      </div>

      <div style={{ textAlign: 'right' }}>
        {dateStr && <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#8D1D2C' }}>{dateStr}</p>}
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(14,27,40,.45)', fontFamily: 'monospace' }}>{step.weekOffset}</p>
      </div>

      <div style={{ textAlign: 'right' }}>
        {step.budgetCents > 0 && (
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1A1A18' }}>{fmtEur(step.budgetCents)}</p>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        {total > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: done >= total ? '#5B8C5A' : done > 0 ? '#D89B4A' : 'rgba(14,27,40,.30)', background: done >= total ? 'rgba(91,140,90,.10)' : done > 0 ? 'rgba(216,155,74,.10)' : 'rgba(14,27,40,.05)', padding: '2px 8px', borderRadius: 20 }}>
            {done}/{total}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Global progress bar ────────────────────────────────────────── */
function GlobalProgress({ steps }) {
  let totalReq = 0, totalDone = 0;
  for (const s of steps) {
    const p = computeProgress(s.sections);
    totalReq += p.total; totalDone += p.done;
  }
  const pct = totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 0;
  const stepsComplete = steps.filter(s => s.status === 'DONE').length;

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 20, border: '1px solid rgba(14,27,40,.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Progression globale</h3>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)' }}><strong style={{ color: '#8D1D2C', fontSize: 18 }}>{stepsComplete}</strong>/{steps.length} étapes</span>
          <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)' }}><strong style={{ color: '#8D1D2C', fontSize: 18 }}>{totalDone}</strong>/{totalReq} éléments</span>
          <span style={{ fontSize: 12, color: 'rgba(14,27,40,.55)' }}><strong style={{ color: '#8D1D2C', fontSize: 18 }}>{pct}%</strong></span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'rgba(14,27,40,.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #8D1D2C 0%, #F2C9A0 100%)', borderRadius: 4, transition: 'width 400ms ease' }} />
      </div>
    </div>
  );
}

/* ─── Main portal component ──────────────────────────────────────── */
function FranchisePortal() {
  const [record, setRecord]   = React.useState(null);
  const [steps, setSteps]     = React.useState([]);
  const [progress, setProgress] = React.useState({ totalRequired: 0, totalDone: 0, pct: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);
  const [openStepId, setOpenStepId] = React.useState(null);

  const onboardingId = React.useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('id');
  }, []);

  // Load data
  React.useEffect(() => {
    if (!onboardingId) { setError('Aucun identifiant d\'onboarding fourni.'); setLoading(false); return; }
    api(`/onboarding/${onboardingId}`)
      .then(res => { setRecord(res.data.record); setSteps(res.data.journey || []); setProgress(res.data.progress || {}); })
      .catch(() => setError('Impossible de charger le dossier d\'onboarding.'))
      .finally(() => setLoading(false));
  }, [onboardingId]);

  // Toggle item
  const handleItemToggle = React.useCallback(async (itemId) => {
    try {
      const res = await api(`/onboarding/${onboardingId}/items/${itemId}/toggle`, { method: 'POST' });
      setSteps(prev => prev.map(step => ({
        ...step,
        sections: step.sections.map(sec => ({
          ...sec,
          items: sec.items.map(i => i.id === itemId ? { ...i, done: res.data.done } : i)
        }))
      })));
    } catch { toast('error', 'Erreur lors de la mise à jour'); }
  }, [onboardingId]);

  // Upload document
  const handleUpload = React.useCallback(async (itemId) => {
    try {
      await api(`/onboarding/${onboardingId}/items/${itemId}/upload`, { method: 'POST' });
      setSteps(prev => prev.map(step => ({
        ...step,
        sections: step.sections.map(sec => ({
          ...sec,
          items: sec.items.map(i => i.id === itemId ? { ...i, uploaded: true, done: true } : i)
        }))
      })));
      toast('success', 'Document marqué comme reçu');
    } catch { toast('error', 'Erreur lors de l\'upload'); }
  }, [onboardingId]);

  // Advance step
  const handleStepAdvance = React.useCallback(async (stepId) => {
    try {
      const res = await api(`/onboarding/${onboardingId}/steps/${stepId}/advance`, { method: 'POST' });
      setSteps(prev => prev.map(step => {
        if (step.id === stepId) return { ...step, status: 'DONE' };
        if (step.id === res.data.nextStepId) return { ...step, status: 'ACTIVE' };
        return step;
      }));
      toast('success', 'Étape validée · passage à la suivante');
    } catch (e) { toast('error', e.message || 'Étape incomplète'); }
  }, [onboardingId]);

  // Add action note
  const handleNoteAdd = React.useCallback((itemId, note) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      sections: step.sections.map(sec => ({
        ...sec,
        items: sec.items.map(i => i.id === itemId
          ? { ...i, actionNotes: [...(i.actionNotes || []), note] }
          : i)
      }))
    })));
  }, []);

  const openStep = steps.find(s => s.id === openStepId) || null;
  const pipelineSteps  = steps.filter(s => ['PIPELINE','LEGAL','MANAGEMENT'].includes(s.category) && s.code !== 'opening');
  const trainingSteps  = steps.filter(s => ['FORMATION','STAGE'].includes(s.category));
  const openingStep    = steps.find(s => s.code === 'opening');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="bo-spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, color: 'rgba(14,27,40,.55)' }}>Chargement du dossier…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>⚠️</p>
        <p style={{ fontSize: 15, color: '#8D1D2C', fontWeight: 600 }}>{error}</p>
        <a href="backoffice.html" className="bo-btn bo-btn--ghost" style={{ marginTop: 16, display: 'inline-flex' }}>← Retour backoffice</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      {/* Top nav */}
      <header style={{ background: '#1A1A18', padding: '0 32px', display: 'flex', alignItems: 'center', height: 56, position: 'sticky', top: 0, zIndex: 200, gap: 16 }}>
        <a href="backoffice.html" style={{ color: 'rgba(255,255,255,.60)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Backoffice
        </a>
        <span style={{ color: 'rgba(255,255,255,.20)' }}>|</span>
        <span style={{ color: '#F2C9A0', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>FRANCHISE PORTAL</span>
        {record && <span style={{ color: 'rgba(255,255,255,.30)', fontSize: 12 }}>{record.opportunityName || record.brand}</span>}
        <div style={{ flex: 1 }} />
        {record && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', background: 'rgba(255,255,255,.06)', padding: '4px 12px', borderRadius: 20 }}>
            {record.candidateName} · {record.opportunityName || record.brand}
          </span>
        )}
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {/* Candidate header card */}
        {record && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 20, border: '1px solid rgba(14,27,40,.08)', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #8D1D2C 0%, #F2C9A0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
              {record.candidateName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1A1A18' }}>{record.candidateName}</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(14,27,40,.55)' }}>
                {record.brand}{record.opportunityName ? ` · ${record.opportunityName}` : ''}
                {record.targetOpenDate && ` · Ouverture cible : ${new Date(record.targetOpenDate).toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(91,140,90,.12)', color: '#5B8C5A', fontSize: 12, fontWeight: 700 }}>
                ● Actif
              </span>
              <span style={{ fontSize: 12, color: 'rgba(14,27,40,.45)' }}>
                Validé par {record.validatedBy} · {new Date(record.createdAt).toLocaleDateString('fr-BE')}
              </span>
            </div>
          </div>
        )}

        {/* Global progress */}
        {steps.length > 0 && <GlobalProgress steps={steps} />}

        {/* Pipeline */}
        {pipelineSteps.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, marginBottom: 20, border: '1px solid rgba(14,27,40,.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(14,27,40,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Pipeline de sélection</h2>
              <span style={{ fontSize: 11, color: 'rgba(14,27,40,.45)' }}>{pipelineSteps.filter(s => s.status === 'DONE').length}/{pipelineSteps.length} étapes</span>
            </div>
            {pipelineSteps.map(step => (
              <TimelineRow key={step.id} step={step} targetOpenDate={record?.targetOpenDate} onClick={() => setOpenStepId(step.id)} />
            ))}
          </div>
        )}

        {/* Training phases */}
        {trainingSteps.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, marginBottom: 20, border: '1px solid rgba(14,27,40,.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(14,27,40,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Parcours de formation — 8 phases</h2>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {trainingSteps.map(s => s.phaseColor && (
                  <span key={s.id} title={s.title} style={{ width: 12, height: 12, borderRadius: 2, background: s.phaseColor, border: '1px solid rgba(14,27,40,.12)', cursor: 'default' }} />
                ))}
              </div>
            </div>
            {trainingSteps.map(step => (
              <TimelineRow key={step.id} step={step} targetOpenDate={record?.targetOpenDate} onClick={() => setOpenStepId(step.id)} />
            ))}
          </div>
        )}

        {/* Opening */}
        {openingStep && (
          <div style={{ background: 'linear-gradient(135deg, #8D1D2C 0%, #6B1521 100%)', borderRadius: 14, marginBottom: 20, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenStepId(openingStep.id)}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <StepCircle ordinal={openingStep.ordinal} status={openingStep.status} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(255,255,255,.60)', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Étape finale</p>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{openingStep.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{openingStep.description}</p>
              </div>
              <span style={{ color: 'rgba(255,255,255,.60)', fontSize: 20 }}>→</span>
            </div>
          </div>
        )}
      </div>

      {/* Step modal */}
      {openStep && (
        <StepModal
          step={openStep}
          onboardingId={onboardingId}
          targetOpenDate={record?.targetOpenDate}
          onClose={() => setOpenStepId(null)}
          onStepAdvance={handleStepAdvance}
          onItemToggle={handleItemToggle}
          onUpload={handleUpload}
          onNoteAdd={handleNoteAdd}
        />
      )}

      <ToastHost />
    </div>
  );
}

/* ─── Boot ───────────────────────────────────────────────────────── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(FranchisePortal));
