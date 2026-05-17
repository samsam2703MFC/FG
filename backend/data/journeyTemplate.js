'use strict';

// Journey template: 19 steps (10 pipeline + 8 training phases + opening).
// Used by createJourney() to instantiate a fresh journey for each onboarding record.
// Each section.items[].code is unique within the template and used as a stable key.

const JOURNEY_TEMPLATE = [
  // ─── Pipeline Steps ────────────────────────────────────────────────────────
  {
    code: 's1', ordinal: 1, category: 'PIPELINE',
    title: 'Premier contact & qualification',
    description: 'Appel initial et évaluation du profil candidat.',
    weekOffset: 'W-58', weekStartNum: 58, weekEndNum: 56,
    budgetCents: 0,
    sections: [
      {
        code: 's1-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Qualification initiale',
        items: [
          { code: 's1-i1', label: 'CV et lettre de motivation reçus', required: true },
          { code: 's1-i2', label: 'Appel téléphonique initial (15–30 min) effectué', required: true, actionType: 'CALL' },
          { code: 's1-i3', label: 'Résumé du profil candidat rédigé', required: true },
          { code: 's1-i4', label: 'Jotform de qualification envoyé et reçu', required: true },
        ]
      }
    ]
  },
  {
    code: 's2', ordinal: 2, category: 'PIPELINE',
    title: 'Scoring & profiling',
    description: 'Entretien approfondi, grille de scoring (0–100), vérification alignement partenaire.',
    weekOffset: 'W-56 → W-54', weekStartNum: 56, weekEndNum: 54,
    budgetCents: 0,
    sections: [
      {
        code: 's2-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Grille de scoring',
        items: [
          { code: 's2-i1', label: 'Entretien de scoring conduit (90 min)', required: true, actionType: 'MEETING' },
          { code: 's2-i2', label: 'Alignement du partenaire confirmé', required: true },
          { code: 's2-i3', label: 'Capacité financière vérifiée (min. contribution)', required: true },
          { code: 's2-i4', label: 'Motivation et vision validées — score calculé', required: true },
        ]
      }
    ]
  },
  {
    code: 's3', ordinal: 3, category: 'PIPELINE',
    title: 'Présentation de l\'enseigne',
    description: 'Présentation formelle du concept, valeurs et réseau L\'Atelier By.',
    weekOffset: 'W-54 → W-52', weekStartNum: 54, weekEndNum: 52,
    budgetCents: 0,
    sections: [
      {
        code: 's3-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Présentation enseigne',
        items: [
          { code: 's3-i1', label: 'Dossier de présentation envoyé et accusé de réception', required: true },
          { code: 's3-i2', label: 'Réunion de présentation en ligne effectuée', required: true, actionType: 'MEETING' },
          { code: 's3-i3', label: 'Questions candidat traitées', required: true },
          { code: 's3-i4', label: 'Localisation préliminaire discutée', required: false },
        ]
      }
    ]
  },
  {
    code: 's4', ordinal: 4, category: 'PIPELINE',
    title: 'Visite site & immersion',
    description: 'Visite d\'une boutique de référence + immersion d\'une journée en cuisine.',
    weekOffset: 'W-52 → W-50', weekStartNum: 52, weekEndNum: 50,
    budgetCents: 0,
    sections: [
      {
        code: 's4-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Immersion terrain',
        items: [
          { code: 's4-i1', label: 'Visite de site confirmée', required: true },
          { code: 's4-i2', label: 'Immersion d\'une journée planifiée et effectuée', required: true },
          { code: 's4-i3', label: 'Formulaire de retour d\'immersion complété', required: true },
          { code: 's4-i4', label: 'Valeurs L\'Atelier By validées par le candidat', required: true },
        ]
      }
    ]
  },
  {
    code: 's5', ordinal: 5, category: 'PIPELINE',
    title: 'Faisabilité financière',
    description: 'Analyse budgétaire, pré-approbation bancaire, vérification de l\'apport.',
    weekOffset: 'W-50 → W-48', weekStartNum: 50, weekEndNum: 48,
    budgetCents: 0,
    sections: [
      {
        code: 's5-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Analyse financière',
        items: [
          { code: 's5-i1', label: 'Apport personnel documenté', required: true },
          { code: 's5-i2', label: 'Lettre de pré-approbation bancaire reçue', required: true },
          { code: 's5-i3', label: 'Pré-devis assurance obtenu', required: false },
          { code: 's5-i4', label: 'Capacité d\'investissement totale confirmée', required: true },
        ]
      }
    ]
  },
  {
    code: 's6', ordinal: 6, category: 'LEGAL',
    title: 'DIP — Document d\'Information Précontractuelle',
    description: 'Remise du DIP (loi belge), période de réflexion 30 jours, révision juridique.',
    weekOffset: 'W-48 → W-42', weekStartNum: 48, weekEndNum: 42,
    budgetCents: 500000, budgetBrandCents: 500000, budgetCandidateCents: 0,
    sections: [
      {
        code: 's6-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Checklist DIP',
        items: [
          { code: 's6-i1', label: 'Identité juridique et capacité de signature vérifiées', required: true },
          { code: 's6-i2', label: 'Documentation de l\'apport financier confirmée', required: true },
          { code: 's6-i3', label: 'Alignement partenaire/conjoint confirmé (si applicable)', required: true },
          { code: 's6-i4', label: 'Rendez-vous avec conseil juridique indépendant planifié', required: true },
          { code: 's6-i5', label: 'Validation Pierre + Loïc avant contrat — Gate G1', required: true },
        ]
      },
      {
        code: 's6-docs', ordinal: 2, type: 'DOCUMENTS', title: 'Annexes DIP',
        items: [
          { code: 's6-d1', label: 'DIP L\'Atelier By signé', fileName: 'DIP_LAtelier_By_v2026.pdf', required: true },
          { code: 's6-d2', label: 'Rapport financier enseigne 2024', fileName: 'Bilan_2024.pdf', required: true },
          { code: 's6-d3', label: 'Rapport financier enseigne 2023', fileName: 'Bilan_2023.pdf', required: true },
          { code: 's6-d4', label: 'Certificat de marque (INPI)', fileName: 'Certificat_marque.pdf', required: true, hint: 'En attente du service juridique' },
          { code: 's6-d5', label: 'Liste des franchisés actuels', fileName: 'Liste_franchises.pdf', required: true },
          { code: 's6-d6', label: 'Étude de marché — zone locale', fileName: 'Etude_marche.pdf', required: true },
        ]
      },
      {
        code: 's6-payment', ordinal: 3, type: 'PAYMENT', title: 'Acompte DIP — 5 000 €',
        paymentAmount: 500000, paymentRef: 'DIP-XXXX-YYYY', paymentLabel: 'Acompte d\'information précontractuelle',
        items: [
          { code: 's6-p1', label: 'Preuve de virement — acompte DIP 5 000 €', fileName: 'Virement_DIP.pdf', required: true }
        ]
      },
      {
        code: 's6-gate', ordinal: 4, type: 'GATE', title: 'Gate Franchise G1',
        gateName: 'G1 — Gate DIP',
        gateDesc: 'Validation par le Conseiller Franchise + COO Qualité requise avant de procéder au contrat. Toute la documentation doit être complète.',
        items: []
      }
    ]
  },
  {
    code: 's7', ordinal: 7, category: 'LEGAL',
    title: 'Financement & garanties',
    description: 'Prêt bancaire final, mise en place des garanties, assurance.',
    weekOffset: 'W-42 → W-38', weekStartNum: 42, weekEndNum: 38,
    budgetCents: 0,
    sections: [
      {
        code: 's7-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Financement',
        items: [
          { code: 's7-i1', label: 'Offre de prêt définitive signée', required: true },
          { code: 's7-i2', label: 'Garanties bancaires constituées', required: true },
          { code: 's7-i3', label: 'Police d\'assurance franchise souscrite', required: true },
        ]
      }
    ]
  },
  {
    code: 's8', ordinal: 8, category: 'LEGAL',
    title: 'Négociation du contrat',
    description: 'Revue du contrat de franchise avec conseil juridique, discussion clause par clause.',
    weekOffset: 'W-38 → W-34', weekStartNum: 38, weekEndNum: 34,
    budgetCents: 0,
    sections: [
      {
        code: 's8-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Révision contractuelle',
        items: [
          { code: 's8-i1', label: 'Contrat révisé par un conseil juridique indépendant', required: true },
          { code: 's8-i2', label: 'Clauses d\'exclusivité territoriale vérifiées', required: true },
          { code: 's8-i3', label: 'Conditions de renouvellement et de résiliation validées', required: true },
          { code: 's8-i4', label: 'Accord sur toutes les clauses — projet signé', required: true },
        ]
      }
    ]
  },
  {
    code: 's9', ordinal: 9, category: 'LEGAL',
    title: 'Signature du contrat',
    description: 'Signature du contrat de franchise + paiement du droit d\'entrée.',
    weekOffset: 'W-34 → W-30', weekStartNum: 34, weekEndNum: 30,
    budgetCents: 1000000, budgetBrandCents: 1000000, budgetCandidateCents: 0,
    sections: [
      {
        code: 's9-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Signature',
        items: [
          { code: 's9-i1', label: 'Contrat de franchise signé par les deux parties', required: true },
          { code: 's9-i2', label: 'Date de début de formation confirmée', required: true },
          { code: 's9-i3', label: 'Accès extranet franchisé activé', required: true },
        ]
      },
      {
        code: 's9-payment', ordinal: 2, type: 'PAYMENT', title: 'Droit d\'entrée — 10 000 €',
        paymentAmount: 1000000, paymentRef: 'CONTRAT-XXXX-YYYY', paymentLabel: 'Droit d\'entrée franchise',
        items: [
          { code: 's9-p1', label: 'Preuve de virement — droit d\'entrée 10 000 €', fileName: 'Virement_contrat.pdf', required: true }
        ]
      },
      {
        code: 's9-gate', ordinal: 3, type: 'GATE', title: 'Gate Franchise G2',
        gateName: 'G2 — Gate Contrat',
        gateDesc: 'Validation complète du comité : tous les documents financiers validés, aval du conseil juridique obtenu, territoire confirmé.',
        items: []
      }
    ]
  },
  {
    code: 's10', ordinal: 10, category: 'MANAGEMENT',
    title: 'Préparation pré-formation',
    description: 'Commandes d\'équipement, recrutement équipe, montage administratif pré-ouverture.',
    weekOffset: 'W-30 → W-26', weekStartNum: 30, weekEndNum: 26,
    budgetCents: 0,
    sections: [
      {
        code: 's10-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Préparation',
        items: [
          { code: 's10-i1', label: 'Devis équipement validé et commandé', required: true },
          { code: 's10-i2', label: 'Offres d\'emploi publiées', required: true },
          { code: 's10-i3', label: 'Entité juridique franchise créée (SA/SRL)', required: true },
          { code: 's10-i4', label: 'Compte bancaire professionnel ouvert', required: true },
        ]
      }
    ]
  },

  // ─── Training Phases ────────────────────────────────────────────────────────
  {
    code: 'p1', ordinal: 11, category: 'FORMATION',
    title: 'Phase 1 — Immersion',
    description: 'Immersion boutique : observation des opérations quotidiennes et de la culture de marque.',
    weekOffset: 'W-46 → W-42', weekStartNum: 46, weekEndNum: 42,
    budgetCents: 500000, budgetBrandCents: 375000, budgetCandidateCents: 125000,
    phaseColor: '#E3F2FD',
    sections: [
      {
        code: 'p1-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p1-fo1', label: 'FO-31 · Fondamentaux opérations boutique', code2: 'FO-31', required: true },
          { code: 'p1-fo2', label: 'FO-32 · Hygiène et sécurité alimentaire', code2: 'FO-32', required: true },
          { code: 'p1-fo3', label: 'FO-33 · Gestion des flux clients', code2: 'FO-33', required: true },
          { code: 'p1-fo4', label: 'FO-37 · Identité de marque L\'Atelier By', code2: 'FO-37', required: true },
          { code: 'p1-fo5', label: 'FO-02 · Ouverture et fermeture boutique', code2: 'FO-02', required: true },
        ]
      },
      {
        code: 'p1-c', ordinal: 2, type: 'COMPETENCE', title: 'Compétences',
        items: [
          { code: 'p1-c1', label: 'C-ID.ADN · Identité et ADN de la marque', required: true },
          { code: 'p1-c2', label: 'C-VENTE.Accueil · Accueil client excellence', required: true },
          { code: 'p1-c3', label: 'C-VENTE.Standards · Standards de vente', required: true },
          { code: 'p1-c4', label: 'C-TRANS.HACCP · Traçabilité et HACCP', required: true },
          { code: 'p1-c5', label: 'C-PLAN.Ouverture · Planification ouverture', required: true },
        ]
      },
      {
        code: 'p1-tasks', ordinal: 3, type: 'TASKS', title: 'Tâches',
        items: [
          { code: 'p1-t1', label: 'AC-01 · Rapport d\'observation jour 1', required: true },
          { code: 'p1-t2', label: 'AC-22 · Journal de bord immersion', required: true },
          { code: 'p1-t3', label: 'AC-02 · Fiche de poste remplie', required: true },
          { code: 'p1-t4', label: 'AC-04 · Bilan mi-immersion avec tuteur', required: true },
          { code: 'p1-t5', label: 'CL-08 · Grille d\'auto-évaluation', required: true },
        ]
      },
      {
        code: 'p1-docs', ordinal: 4, type: 'DOCUMENTS', title: 'Documents',
        items: [
          { code: 'p1-d1', label: 'Quizz Phase 1', fileName: 'Quizz_P1.pdf', required: true },
          { code: 'p1-d2', label: 'Photos d\'observation', fileName: 'Photos_observation.zip', required: false },
          { code: 'p1-d3', label: 'Évaluation Phase 1', fileName: 'Eval_P1.pdf', required: true },
        ]
      }
    ]
  },
  {
    code: 'p2', ordinal: 12, category: 'FORMATION',
    title: 'Phase 2 — Vente',
    description: 'Techniques de vente, service client, upselling, fidélisation.',
    weekOffset: 'W-42 → W-38', weekStartNum: 42, weekEndNum: 38,
    budgetCents: 500000, budgetBrandCents: 250000, budgetCandidateCents: 250000,
    phaseColor: '#D1ECF1',
    sections: [
      {
        code: 'p2-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p2-fo1', label: 'FO-01 · Techniques de vente premium', code2: 'FO-01', required: true },
          { code: 'p2-fo2', label: 'FO-04 · Gestion de la caisse', code2: 'FO-04', required: true },
          { code: 'p2-fo3', label: 'FO-13 · Programme fidélité', code2: 'FO-13', required: true },
          { code: 'p2-fo4', label: 'FO-14 · Upselling et cross-selling', code2: 'FO-14', required: true },
          { code: 'p2-fo5', label: 'FO-19 · Conseil produit boulangerie-pâtisserie', code2: 'FO-19', required: true },
        ]
      },
      {
        code: 'p2-c', ordinal: 2, type: 'COMPETENCE', title: 'Compétences',
        items: [
          { code: 'p2-c1', label: 'C-VENTE.Accueil · Accueil et premier contact', required: true },
          { code: 'p2-c2', label: 'C-VENTE.Conseil · Conseil produit adapté', required: true },
          { code: 'p2-c3', label: 'C-VENTE.Upselling · Vente additionnelle', required: true },
          { code: 'p2-c4', label: 'C-VENTE.Caisse · Encaissement et clôture', required: true },
          { code: 'p2-c5', label: 'C-VENTE.Fidélité · Activation programme fidélité', required: true },
        ]
      },
      {
        code: 'p2-docs', ordinal: 3, type: 'DOCUMENTS', title: 'Documents',
        items: [
          { code: 'p2-d1', label: 'Quizz Phase 2', fileName: 'Quizz_P2.pdf', required: true },
          { code: 'p2-d2', label: 'Rapport mystery shopping', fileName: 'Mystery_shopping.pdf', required: true },
          { code: 'p2-d3', label: 'Évaluation Phase 2', fileName: 'Eval_P2.pdf', required: true },
        ]
      }
    ]
  },
  {
    code: 'p3', ordinal: 13, category: 'FORMATION',
    title: 'Phase 3 — Boulangerie',
    description: 'Fondamentaux boulangerie : pain, pâtisserie, viennoiserie, production.',
    weekOffset: 'W-38 → W-34', weekStartNum: 38, weekEndNum: 34,
    budgetCents: 500000, budgetBrandCents: 250000, budgetCandidateCents: 250000,
    phaseColor: '#B8E0D2',
    sections: [
      {
        code: 'p3-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p3-fo1', label: 'FO-07 · Panification et pétrissage', code2: 'FO-07', required: true },
          { code: 'p3-fo2', label: 'FO-08 · Façonnage et fermentation', code2: 'FO-08', required: true },
          { code: 'p3-fo3', label: 'FO-09 · Cuisson pains spéciaux', code2: 'FO-09', required: true },
          { code: 'p3-fo4', label: 'FO-12 · Pâtisserie et viennoiserie', code2: 'FO-12', required: true },
          { code: 'p3-fo5', label: 'FO-03 · Gestion DLC et FIFO', code2: 'FO-03', required: true },
        ]
      },
      {
        code: 'p3-c', ordinal: 2, type: 'COMPETENCE', title: 'Compétences',
        items: [
          { code: 'p3-c1', label: 'C-PROD.Pain · Maîtrise des pains signature', required: true },
          { code: 'p3-c2', label: 'C-PROD.Pâtisserie · Réalisation des entremets', required: true },
          { code: 'p3-c3', label: 'C-PROD.Viennoiserie · Croissants et brioches', required: true },
          { code: 'p3-c4', label: 'C-PROD.Cuisson · Maîtrise des fours', required: true },
          { code: 'p3-c5', label: 'C-TRANS.FIFO-DLC · Rotation et traçabilité', required: true },
        ]
      },
      {
        code: 'p3-products', ordinal: 3, type: 'PRODUCTS', title: 'Gamme produits — validation',
        items: [
          { code: 'p3-p1', label: 'Pain Tradition', icon: '🥖', meta: 'Pain' },
          { code: 'p3-p2', label: 'Pain Levain', icon: '🥖', meta: 'Pain' },
          { code: 'p3-p3', label: 'Pains Spéciaux', icon: '🥯', meta: 'Pain' },
          { code: 'p3-p4', label: 'Croissant', icon: '🥐', meta: 'Viennoiserie' },
          { code: 'p3-p5', label: 'Couque', icon: '🥖', meta: 'Viennoiserie' },
          { code: 'p3-p6', label: 'Brioche', icon: '🍞', meta: 'Viennoiserie' },
          { code: 'p3-p7', label: 'Tarte de saison', icon: '🍰', meta: 'Pâtisserie' },
          { code: 'p3-p8', label: 'Éclair', icon: '🧁', meta: 'Pâtisserie' },
          { code: 'p3-p9', label: 'Entremets', icon: '🎂', meta: 'Pâtisserie' },
        ]
      }
    ]
  },
  {
    code: 'p4', ordinal: 14, category: 'FORMATION',
    title: 'Phase 4 — Traiteur',
    description: 'Préparations traiteur : plats chauds/froids, sandwiches, salades.',
    weekOffset: 'W-34 → W-30', weekStartNum: 34, weekEndNum: 30,
    budgetCents: 500000, budgetBrandCents: 250000, budgetCandidateCents: 250000,
    phaseColor: '#C7CEEA',
    sections: [
      {
        code: 'p4-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p4-fo1', label: 'FO-10 · Préparations froides traiteur', code2: 'FO-10', required: true },
          { code: 'p4-fo2', label: 'FO-51 · Plats chauds signature', code2: 'FO-51', required: true },
          { code: 'p4-fo3', label: 'FO-52 · Sandwiches et tartines', code2: 'FO-52', required: true },
          { code: 'p4-fo4', label: 'FO-53 · Salades composées', code2: 'FO-53', required: true },
          { code: 'p4-fo5', label: 'FO-46 · Plateau catering & buffet', code2: 'FO-46', required: true },
        ]
      },
      {
        code: 'p4-products', ordinal: 2, type: 'PRODUCTS', title: 'Plats signature CP-25',
        items: [
          { code: 'p4-p1', label: 'Carpaccio', icon: '🥩', meta: 'Entrée froide' },
          { code: 'p4-p2', label: 'Tuna peach', icon: '🍑', meta: 'Entrée froide' },
          { code: 'p4-p3', label: 'Quinoa & Thon', icon: '🍱', meta: 'Salade' },
          { code: 'p4-p4', label: 'Salade Caesar', icon: '🥗', meta: 'Salade' },
          { code: 'p4-p5', label: 'Saumon belle-vue', icon: '🐟', meta: 'Plat froid' },
          { code: 'p4-p6', label: 'Beef tagliata', icon: '🥩', meta: 'Plat chaud' },
          { code: 'p4-p7', label: 'Tomates & burrata', icon: '🍅', meta: 'Entrée froide' },
          { code: 'p4-p8', label: 'Tomates & crevettes', icon: '🦐', meta: 'Entrée froide' },
          { code: 'p4-p9', label: 'Vitello tonnato', icon: '🥩', meta: 'Plat froid' },
        ]
      }
    ]
  },
  {
    code: 'p5', ordinal: 15, category: 'MANAGEMENT',
    title: 'Phase 5 — Assistant Manager',
    description: 'Rotation de 3 mois assistant manager : planning, stock, briefings équipe.',
    weekOffset: 'W-30 → W-18', weekStartNum: 30, weekEndNum: 18,
    budgetCents: 1500000, budgetBrandCents: 750000, budgetCandidateCents: 750000,
    phaseColor: '#D4EDDA',
    sections: [
      {
        code: 'p5-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p5-fo1', label: 'FO-28 · Techniques de briefing équipe', code2: 'FO-28', required: true },
          { code: 'p5-fo2', label: 'FO-24 · Gestion des plannings', code2: 'FO-24', required: true },
          { code: 'p5-fo3', label: 'FO-25 · Inventaires et stocks', code2: 'FO-25', required: true },
          { code: 'p5-fo4', label: 'FO-26 · Réception commandes fournisseurs', code2: 'FO-26', required: true },
          { code: 'p5-fo5', label: 'FO-27 · Gestion des pertes et casse', code2: 'FO-27', required: true },
        ]
      },
      {
        code: 'p5-c', ordinal: 2, type: 'COMPETENCE', title: 'Compétences',
        items: [
          { code: 'p5-c1', label: 'C-RH.Briefing · Animer un briefing quotidien', required: true },
          { code: 'p5-c2', label: 'C-PLAN.Planning · Construire et gérer un planning', required: true },
          { code: 'p5-c3', label: 'C-STOCK.Inventaire · Réaliser un inventaire', required: true },
          { code: 'p5-c4', label: 'C-STOCK.Réception · Contrôler une réception', required: true },
          { code: 'p5-c5', label: 'C-STOCK.Casse · Gérer et documenter la casse', required: true },
        ]
      },
      {
        code: 'p5-gate', ordinal: 3, type: 'GATE', title: 'Gate Franchise G3',
        gateName: 'G3 — Gate Mid-Management',
        gateDesc: 'Évaluation mi-parcours : compétences managériales validées par le tuteur réseau. Scores minimum requis sur toutes les compétences.',
        items: []
      }
    ]
  },
  {
    code: 'p6', ordinal: 16, category: 'MANAGEMENT',
    title: 'Phase 6 — Store Manager',
    description: 'Autonomie manager 3 mois : KPIs, RH, pilotage franchise.',
    weekOffset: 'W-18 → W-6', weekStartNum: 18, weekEndNum: 6,
    budgetCents: 1500000, budgetBrandCents: 750000, budgetCandidateCents: 750000,
    phaseColor: '#A8D8B9',
    sections: [
      {
        code: 'p6-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p6-fo1', label: 'FO-05 · Pilotage tableau de bord franchise', code2: 'FO-05', required: true },
          { code: 'p6-fo2', label: 'FO-06 · Lecture et analyse KPI', code2: 'FO-06', required: true },
          { code: 'p6-fo3', label: 'FO-29 · Évaluation et entretien collaborateur', code2: 'FO-29', required: true },
          { code: 'p6-fo4', label: 'FO-30 · Recrutement et intégration', code2: 'FO-30', required: true },
          { code: 'p6-fo5', label: 'FO-35 · Gestion des conflits équipe', code2: 'FO-35', required: true },
        ]
      },
      {
        code: 'p6-c', ordinal: 2, type: 'COMPETENCE', title: 'Compétences',
        items: [
          { code: 'p6-c1', label: 'C-PILOTAGE.Franchise · Gérer en autonomie', required: true },
          { code: 'p6-c2', label: 'C-PILOTAGE.KPI · Analyser et agir sur les KPIs', required: true },
          { code: 'p6-c3', label: 'C-RH.Évaluation · Conduire un entretien annuel', required: true },
          { code: 'p6-c4', label: 'C-RH.Recrutement · Recruter et intégrer', required: true },
          { code: 'p6-c5', label: 'C-RH.Conflit · Gérer un conflit équipe', required: true },
        ]
      }
    ]
  },
  {
    code: 'p7', ordinal: 17, category: 'STAGE',
    title: 'Phase 7 — Stage Supervision',
    description: '14 jours de stage supervisé : marketing local, B2B, outils digitaux.',
    weekOffset: 'W-6 → W-2', weekStartNum: 6, weekEndNum: 2,
    budgetCents: 500000, budgetBrandCents: 375000, budgetCandidateCents: 125000,
    phaseColor: '#FFF59D',
    sections: [
      {
        code: 'p7-fo', ordinal: 1, type: 'TRAINING', title: 'Formations',
        items: [
          { code: 'p7-fo1', label: 'FO-37 · Marketing de proximité', code2: 'FO-37', required: true },
          { code: 'p7-fo2', label: 'FO-43 · Réseaux sociaux & contenu local', code2: 'FO-43', required: true },
          { code: 'p7-fo3', label: 'FO-45 · Événements saisonniers', code2: 'FO-45', required: true },
          { code: 'p7-fo4', label: 'FO-40 · Vente B2B et comptes entreprises', code2: 'FO-40', required: true },
          { code: 'p7-fo5', label: 'FO-15 · Tableau de bord digital', code2: 'FO-15', required: true },
        ]
      },
      {
        code: 'p7-c', ordinal: 2, type: 'COMPETENCE', title: 'Compétences',
        items: [
          { code: 'p7-c1', label: 'C-MKT.Local · Animer le marketing de proximité', required: true },
          { code: 'p7-c2', label: 'C-MKT.Digital · Gérer les réseaux sociaux', required: true },
          { code: 'p7-c3', label: 'C-MKT.Saisons · Piloter les temps forts saisonniers', required: true },
          { code: 'p7-c4', label: 'C-VENTE.B2B · Prospecter et fidéliser les comptes B2B', required: true },
          { code: 'p7-c5', label: 'C-PILOTAGE.KPI · Analyser les indicateurs de performance', required: true },
        ]
      }
    ]
  },
  {
    code: 'p8', ordinal: 18, category: 'STAGE',
    title: 'Phase 8 — Immersion Totale',
    description: 'Immersion complète 2 semaines : évaluation autonomie opérationnelle.',
    weekOffset: 'W-2 → W-0', weekStartNum: 2, weekEndNum: 0,
    budgetCents: 500000, budgetBrandCents: 375000, budgetCandidateCents: 125000,
    phaseColor: '#F2C9A0',
    sections: [
      {
        code: 'p8-fo', ordinal: 1, type: 'TRAINING', title: 'Formations finales',
        items: [
          { code: 'p8-fo1', label: 'FO-38 · Finance franchise — lecture P&L', code2: 'FO-38', required: true },
          { code: 'p8-fo2', label: 'FO-41 · Conformité enseigne et audits', code2: 'FO-41', required: true },
          { code: 'p8-fo3', label: 'FO-44 · Identité visuelle et merchandising', code2: 'FO-44', required: true },
          { code: 'p8-fo4', label: 'FO-16 · Mise en œuvre ouverture', code2: 'FO-16', required: true },
          { code: 'p8-fo5', label: 'FO-36 · Feedback et amélioration continue', code2: 'FO-36', required: true },
        ]
      },
      {
        code: 'p8-tasks', ordinal: 2, type: 'TASKS', title: 'Tâches finales',
        items: [
          { code: 'p8-t1', label: 'CL-01-T01 · Plan d\'ouverture complet remis', required: true },
          { code: 'p8-t2', label: 'CL-01-T04 · Simulation J-1 validée', required: true },
          { code: 'p8-t3', label: 'CL-10-T01 · Budget prévisionnel an 1 finalisé', required: true },
          { code: 'p8-t4', label: 'CL-10-T02 · Plan marketing 12 mois soumis', required: true },
          { code: 'p8-t5', label: 'CL-10-T03 · Plan RH an 1 validé', required: true },
        ]
      },
      {
        code: 'p8-payment', ordinal: 3, type: 'PAYMENT', title: 'Solde formation — 5 000 €',
        paymentAmount: 500000, paymentRef: 'FINAL-XXXX-YYYY', paymentLabel: 'Solde formation (Gate G4)',
        items: [
          { code: 'p8-p1', label: 'Preuve de virement — solde formation 5 000 €', fileName: 'Virement_final.pdf', required: true }
        ]
      },
      {
        code: 'p8-gate', ordinal: 4, type: 'GATE', title: 'Gate Franchise G4',
        gateName: 'G4 — Validation finale',
        gateDesc: 'Fin des stages — validation finale : franchisé prêt à ouvrir. Signature du procès-verbal d\'ouverture par le COO Qualité.',
        items: []
      }
    ]
  },

  // ─── Opening ────────────────────────────────────────────────────────────────
  {
    code: 'opening', ordinal: 19, category: 'OPENING',
    title: 'Grande Ouverture',
    description: 'Jour J et première semaine d\'opérations avec soutien de l\'équipe enseigne.',
    weekOffset: 'W-0', weekStartNum: 0, weekEndNum: 0,
    budgetCents: 0,
    sections: [
      {
        code: 'opening-checklist', ordinal: 1, type: 'CHECKLIST', title: 'Checklist ouverture',
        items: [
          { code: 'op-i1', label: 'Équipe complète briefée et en poste', required: true },
          { code: 'op-i2', label: 'Stock initial livré et contrôlé', required: true },
          { code: 'op-i3', label: 'Système caisse et TPE opérationnels', required: true },
          { code: 'op-i4', label: 'Communication d\'ouverture lancée (réseaux, presse locale)', required: true },
          { code: 'op-i5', label: 'Tuteur réseau présent J-0 et J+1', required: true },
        ]
      }
    ]
  }
];

module.exports = { JOURNEY_TEMPLATE };
