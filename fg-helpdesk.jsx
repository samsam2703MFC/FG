/* global React, window */
// Discreet floating Helpdesk — FAB + modal with conversation list,
// chat view, and new-ticket form. Brand-adaptive: picks up the current
// theme's CSS vars. Always rendered at the app root.

const { useState: hState, useEffect: hEffect, useRef: hRef, useMemo: hMemo } = React;

function FgHelpdesk({ fgData }) {
  const D = fgData;
  const [open, setOpen] = hState(false);
  const [view, setView] = hState('list'); // list | thread | new
  const [activeId, setActiveId] = hState(null);
  const [tickets, setTickets] = hState(D.SUPPORT_TICKETS);

  // Compute unread admin messages
  const unread = hMemo(() => {
    return tickets.reduce((acc, t) => acc + t.messages.filter(m => m.author === 'admin' && m.unread).length, 0);
  }, [tickets]);

  // Lock body scroll while modal open
  hEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Mark messages as read when opening the corresponding thread
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const openThread = (id) => {
    setActiveId(id);
    setView('thread');
    // Mark messages of this ticket as read
    setTickets(ts => ts.map(t => t.id === id
      ? { ...t, messages: t.messages.map(m => ({ ...m, unread: false })) }
      : t));
  };

  return (
    <>
      {/* Floating FAB */}
      <button className={'fg-help-fab' + (open ? ' is-open' : '')}
        onClick={() => { setOpen(o => !o); setView('list'); }}
        aria-label={open ? 'Fermer l\'aide' : 'Ouvrir l\'aide'}
        title="Support · Franchise Generation">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
        )}
        {unread > 0 && !open && <span className="fg-help-fab__dot">{unread}</span>}
      </button>

      {/* Modal */}
      {open && (
        <>
          <div className="fg-help-scrim" onClick={() => setOpen(false)}></div>
          <div className="fg-help-modal" role="dialog" aria-label="Support Franchise Generation">
            <FgHelpHeader view={view} setView={setView} setOpen={setOpen}
              ticket={tickets.find(t => t.id === activeId)} fgData={D} />
            <div className="fg-help-body">
              {view === 'list' && <FgHelpList tickets={tickets} fgData={D} onOpen={openThread} onNew={() => setView('new')} />}
              {view === 'thread' && <FgHelpThread ticket={tickets.find(t => t.id === activeId)} fgData={D} onSend={(body) => {
                setTickets(ts => ts.map(t => t.id === activeId
                  ? { ...t, messages: [...t.messages, { id: 'm-' + Date.now(), author: 'investor', name: D.INVESTOR.name, body, time: 'À l\'instant', attachments: [] }], updatedAt: 'À l\'instant' }
                  : t));
              }} />}
              {view === 'new' && <FgHelpNew fgData={D} onCancel={() => setView('list')} onSubmit={(ticket) => {
                const id = 't-' + Date.now();
                setTickets(ts => [{ ...ticket, id, status: 'open', origin: 'investor', updatedAt: 'À l\'instant', assignedTo: 'Équipe support · en attente' }, ...ts]);
                setActiveId(id);
                setView('thread');
              }} />}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ====================================================================
// Header
// ====================================================================
function FgHelpHeader({ view, setView, setOpen, ticket, fgData }) {
  const D = fgData;
  if (view === 'thread' && ticket) {
    const cat = D.SUPPORT_CATEGORIES.find(c => c.id === ticket.category);
    const brand = ticket.brand ? D.brandById(ticket.brand) : null;
    return (
      <header className="fg-help-head fg-help-head--thread">
        <button className="fg-help-back" onClick={() => setView('list')} aria-label="Retour">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="fg-help-head__title">
          <p className="fg-help-head__eyebrow">{cat?.label}{brand && ` · ${brand.name}`}</p>
          <p className="fg-help-head__h">{ticket.subject}</p>
          <p className="fg-help-head__sub">{ticket.assignedTo}</p>
        </div>
        <button className="fg-help-close" onClick={() => setOpen(false)} aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </header>
    );
  }
  if (view === 'new') {
    return (
      <header className="fg-help-head">
        <button className="fg-help-back" onClick={() => setView('list')} aria-label="Retour">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="fg-help-head__title">
          <p className="fg-help-head__h">Nouveau message</p>
          <p className="fg-help-head__sub">Décrivez votre demande — l'équipe vous répond sous 24 h ouvrées.</p>
        </div>
        <button className="fg-help-close" onClick={() => setOpen(false)} aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </header>
    );
  }
  return (
    <header className="fg-help-head">
      <div className="fg-help-head__title">
        <p className="fg-help-head__eyebrow">Support · Franchise Generation</p>
        <p className="fg-help-head__h">Comment pouvons-nous aider ?</p>
        <p className="fg-help-head__sub">Conversations & notifications de l'équipe.</p>
      </div>
      <button className="fg-help-close" onClick={() => setOpen(false)} aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </header>
  );
}

// ====================================================================
// Thread list
// ====================================================================
function FgHelpList({ tickets, fgData, onOpen, onNew }) {
  const D = fgData;
  const statusLabel = {
    'open': 'Ouvert', 'awaiting-investor': 'À votre attention',
    'awaiting-admin': 'En attente support', 'resolved': 'Résolu'
  };
  return (
    <div className="fg-help-list">
      <button className="fg-help-list__new" onClick={onNew}>
        <span className="fg-help-list__new-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
        </span>
        <div>
          <p className="fg-help-list__new-h">Nouveau message</p>
          <p className="fg-help-list__new-sub">Question, demande, signalement — réponse sous 24 h ouvrées.</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, opacity: 0.5 }}><path d="M9 6l6 6-6 6"/></svg>
      </button>

      <p className="fg-help-list__section">Conversations</p>
      {tickets.map(t => {
        const last = t.messages[t.messages.length - 1];
        const unreadCount = t.messages.filter(m => m.author === 'admin' && m.unread).length;
        const cat = D.SUPPORT_CATEGORIES.find(c => c.id === t.category);
        const brand = t.brand ? D.brandById(t.brand) : null;
        return (
          <button key={t.id} className={'fg-help-thread' + (unreadCount > 0 ? ' is-unread' : '')} onClick={() => onOpen(t.id)}>
            <div className="fg-help-thread__avatar" style={brand ? { background: brand.tokens.primary, color: '#fff' } : {}}>
              {brand ? brand.logoMark : 'FG'}
            </div>
            <div className="fg-help-thread__main">
              <div className="fg-help-thread__row">
                <p className="fg-help-thread__subj">{t.subject}</p>
                <span className="fg-help-thread__time">{t.updatedAt}</span>
              </div>
              <p className="fg-help-thread__last">
                <span className="fg-help-thread__author">{last.author === 'investor' ? 'Vous' : last.name}:</span> {last.body}
              </p>
              <div className="fg-help-thread__meta">
                <span className="fg-help-thread__cat">{cat?.label}</span>
                <span className={'fg-help-thread__status fg-help-thread__status--' + t.status}>● {statusLabel[t.status]}</span>
              </div>
            </div>
            {unreadCount > 0 && <span className="fg-help-thread__unread">{unreadCount}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ====================================================================
// Thread (chat view)
// ====================================================================
function FgHelpThread({ ticket, fgData, onSend }) {
  const D = fgData;
  const [draft, setDraft] = hState('');
  const endRef = hRef(null);

  hEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [ticket?.messages.length]);

  if (!ticket) return null;
  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="fg-help-thread-view">
      <div className="fg-help-msgs">
        {ticket.messages.map(m => (
          <div key={m.id} className={'fg-help-msg fg-help-msg--' + m.author}>
            <div className="fg-help-msg__bubble">
              {m.author === 'admin' && <p className="fg-help-msg__name">{m.name}</p>}
              <p className="fg-help-msg__body">{m.body}</p>
              {m.attachments && m.attachments.length > 0 && (
                <div className="fg-help-msg__att">
                  {m.attachments.map((a, i) => (
                    <button key={i} className="fg-help-msg__file">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                      <span>{a.name}</span>
                      <span className="fg-help-msg__file-size">{a.size}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="fg-help-msg__time">{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="fg-help-composer">
        <button className="fg-help-composer__attach" title="Joindre un fichier" aria-label="Joindre">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire un message…"
          rows={1}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
        />
        <button className="fg-help-composer__send" disabled={!draft.trim()} onClick={submit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
        </button>
      </div>
    </div>
  );
}

// ====================================================================
// New ticket form
// ====================================================================
function FgHelpNew({ fgData, onCancel, onSubmit }) {
  const D = fgData;
  const A = window.PORTAL_DATA;
  const [cat, setCat] = hState('general');
  const [subject, setSubject] = hState('');
  const [body, setBody] = hState('');
  const [priority, setPriority] = hState('normal');
  const [scope, setScope] = hState('global'); // global | brand:xxx | project:xxx
  const [files, setFiles] = hState([]);
  const fileRef = hRef(null);

  const projects = hMemo(() => {
    const list = A.PROJECTS.map(p => ({ id: p.id, brand: 'atelier', label: p.name }));
    Object.entries(D.BRAND_PORTFOLIOS).forEach(([brandId, port]) => {
      port.shops.forEach(s => list.push({ id: s.id, brand: brandId, label: s.name }));
    });
    return list;
  }, []);

  const canSubmit = subject.trim() && body.trim();

  const submit = () => {
    if (!canSubmit) return;
    let brand = null, project = null;
    if (scope.startsWith('brand:')) brand = scope.split(':')[1];
    else if (scope.startsWith('project:')) {
      project = scope.split(':')[1];
      brand = projects.find(p => p.id === project)?.brand || null;
    }
    onSubmit({
      category: cat,
      subject: subject.trim(),
      priority,
      brand,
      project,
      messages: [{
        id: 'm-' + Date.now(),
        author: 'investor',
        name: D.INVESTOR.name,
        body: body.trim(),
        time: 'À l\'instant',
        attachments: files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` }))
      }]
    });
  };

  return (
    <div className="fg-help-form">
      <div className="fg-help-field">
        <label>Catégorie</label>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {D.SUPPORT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="fg-help-field">
        <label>Lié à</label>
        <select value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="global">Demande générale</option>
          <optgroup label="Marque">
            {D.BRANDS.map(b => <option key={b.id} value={'brand:' + b.id}>{b.name}</option>)}
          </optgroup>
          <optgroup label="Projet / magasin">
            {projects.map(p => <option key={p.id} value={'project:' + p.id}>{p.label}</option>)}
          </optgroup>
        </select>
      </div>

      <div className="fg-help-field">
        <label>Priorité</label>
        <div className="fg-help-priority">
          {D.SUPPORT_PRIORITIES.map(p => (
            <button key={p.id} type="button"
              className={'fg-help-priority__opt' + (priority === p.id ? ' is-active' : '') + ' fg-help-priority__opt--' + p.id}
              onClick={() => setPriority(p.id)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="fg-help-field">
        <label>Sujet</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex. Question sur le calendrier de remboursement" />
      </div>

      <div className="fg-help-field">
        <label>Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
          placeholder="Décrivez votre demande, le contexte et toute information utile."></textarea>
      </div>

      <div className="fg-help-field">
        <label>Pièces jointes ({files.length})</label>
        <div className="fg-help-attach">
          {files.map((f, i) => (
            <span key={i} className="fg-help-attach__item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              {f.name}
              <button onClick={() => setFiles(fs => fs.filter((_, idx) => idx !== i))} aria-label="Supprimer">×</button>
            </span>
          ))}
          <button className="fg-help-attach__add" onClick={() => fileRef.current?.click()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M12 5v14M5 12h14"/></svg>
            Ajouter un fichier
          </button>
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
            onChange={(e) => setFiles(fs => [...fs, ...Array.from(e.target.files || [])])} />
        </div>
      </div>

      <div className="fg-help-form__actions">
        <button className="fg-btn fg-btn--ghost" onClick={onCancel}>Annuler</button>
        <button className="fg-btn fg-btn--accent" disabled={!canSubmit} onClick={submit}>
          Envoyer
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { FgHelpdesk });
