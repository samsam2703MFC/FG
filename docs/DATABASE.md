# Franchise Generation — PostgreSQL Database Schema

Complete reference for all tables, columns, indexes, relationships, and design patterns used in the Franchise Generation platform database.

---

## Table of Contents

1. [Overview](#overview)
2. [Tables](#tables)
   - [users](#users)
   - [brands](#brands)
   - [brand_kpi_labels](#brand_kpi_labels)
   - [brand_copy](#brand_copy)
   - [brand_presentation](#brand_presentation)
   - [brand_presentation_slides](#brand_presentation_slides)
   - [brand_presentation_videos](#brand_presentation_videos)
   - [brand_presentation_docs](#brand_presentation_docs)
   - [brand_team](#brand_team)
   - [shops](#shops)
   - [shop_kpi](#shop_kpi)
   - [investors](#investors)
   - [investor_preferences](#investor_preferences)
   - [investments](#investments)
   - [repayment_schedules](#repayment_schedules)
   - [opportunities](#opportunities)
   - [candidates](#candidates)
   - [candidate_brand_preferences](#candidate_brand_preferences)
   - [candidate_leads](#candidate_leads)
   - [lead_history](#lead_history)
   - [lead_appointments](#lead_appointments)
   - [consultants](#consultants)
   - [developers](#developers)
   - [support_tickets](#support_tickets)
   - [support_messages](#support_messages)
   - [support_attachments](#support_attachments)
   - [documents](#documents)
   - [notifications](#notifications)
   - [regions](#regions)
   - [new_brand_leads](#new_brand_leads)
   - [landings](#landings)
3. [Entity Relationship Description](#entity-relationship-description)
4. [Index Recommendations](#index-recommendations)
5. [Multi-Tenancy Notes](#multi-tenancy-notes)
6. [Audit Logging](#audit-logging)
7. [Migration Strategy](#migration-strategy)

---

## Overview

**Database:** PostgreSQL 15+
**ORM:** Prisma 5.x
**Charset:** UTF-8
**Timezone:** All timestamps stored in UTC

The database serves a multi-portal application:
- **Investor portal** — tracks investments, repayments, documents
- **Candidate portal** — franchise onboarding pipeline
- **Consultant portal** — lead management and pipeline
- **Brand portal** — network visibility and performance
- **Developer portal** — real estate location submissions
- **Admin backoffice** — cross-portal management

---

## Tables

---

### users

Core authentication and identity table. One row per platform user regardless of role.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login email address |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt-hashed password (cost factor 12) |
| `role` | `VARCHAR(50)` | NOT NULL | One of: `admin`, `investor`, `candidate`, `consultant`, `developer`, `brand` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last profile update |
| `last_login` | `TIMESTAMPTZ` | NULL | Timestamp of most recent successful login |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX users_email_idx ON users(email)`
- `INDEX users_role_idx ON users(role)`

**Example row:**
```
id:            550e8400-e29b-41d4-a716-446655440000
email:         claire.vermeulen@example.com
password_hash: $2b$12$abc123...
role:          investor
created_at:    2023-06-15 10:00:00+00
updated_at:    2026-05-16 08:30:00+00
last_login:    2026-05-16 08:30:00+00
```

---

### brands

Master catalog of all franchise brands in the FG ecosystem. Each brand has its own design system (tokens) stored here — the UI renders whatever the API returns, making it brand-agnostic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Slug identifier (e.g. `atelier`, `couq`, `cookies`, `mania`) |
| `name` | `VARCHAR(255)` | NOT NULL | Human-readable brand name |
| `tagline` | `VARCHAR(500)` | NULL | Short brand tagline |
| `kind` | `VARCHAR(255)` | NULL | Concept category (e.g. "Boulangerie · Pâtisserie") |
| `city` | `VARCHAR(255)` | NULL | City of origin |
| `headquarters` | `VARCHAR(255)` | NULL | Headquarters location string |
| `founded` | `SMALLINT` | NULL | Year the brand was founded |
| `established` | `VARCHAR(255)` | NULL | Human-readable network size description |
| `logo_src` | `VARCHAR(500)` | NULL | Path or URL to full logo image |
| `logo_mark` | `VARCHAR(10)` | NULL | Single character or symbol fallback logo mark |
| `theme` | `VARCHAR(50)` | NULL | CSS theme class applied when viewing this brand |
| `primary_color` | `VARCHAR(10)` | NULL | Primary hex color (e.g. `#8D1D2C`) |
| `secondary_color` | `VARCHAR(10)` | NULL | Secondary hex color |
| `ink_color` | `VARCHAR(10)` | NULL | Text/ink hex color |
| `bg_color` | `VARCHAR(10)` | NULL | Background hex color |
| `surface_color` | `VARCHAR(10)` | NULL | Card/surface hex color |
| `accent_color` | `VARCHAR(10)` | NULL | Accent hex color |
| `font_display` | `VARCHAR(255)` | NULL | CSS font stack for display headings |
| `font_ui` | `VARCHAR(255)` | NULL | CSS font stack for UI text |
| `font_accent` | `VARCHAR(255)` | NULL | CSS font stack for accent elements |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Indexes:**
- `PRIMARY KEY (id)`

**Example row:**
```
id:             atelier
name:           L'Atelier By
tagline:        Boulangerie de quartier · Belgique
kind:           Boulangerie · Pâtisserie
city:           Bruxelles
headquarters:   Bruxelles, BE
founded:        2022
established:    5 magasins
logo_src:       img/logo.png
logo_mark:      A
theme:          atelier
primary_color:  #8D1D2C
secondary_color:#F2C9A0
ink_color:      #1c1a17
bg_color:       #EAE4DC
surface_color:  #FFFFFF
accent_color:   #8D1D2C
font_display:   "DM Sans", system-ui, sans-serif
created_at:     2024-01-01 00:00:00+00
```

---

### brand_kpi_labels

Per-brand localized labels for the four standard KPI metrics. Stored separately to keep the brands table lean and to support easy i18n extension.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Parent brand |
| `ca` | `VARCHAR(100)` | NOT NULL | Label for the revenue metric (e.g. "Chiffre d'affaires") |
| `profit` | `VARCHAR(100)` | NOT NULL | Label for the profit metric (e.g. "Profit net") |
| `cust` | `VARCHAR(100)` | NOT NULL | Label for the customer count metric (e.g. "Clients / jour") |
| `basket` | `VARCHAR(100)` | NOT NULL | Label for the basket metric (e.g. "Panier moyen") |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX brand_kpi_labels_brand_idx ON brand_kpi_labels(brand_id)`

**Example row:**
```
id:      1
brand_id:atelier
ca:      Chiffre d'affaires
profit:  Profit net
cust:    Clients / jour
basket:  Panier moyen
```

---

### brand_copy

Tone-of-voice and vocabulary configuration per brand. Drives the generic brand shell rendering.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Parent brand |
| `eco_noun` | `VARCHAR(100)` | NOT NULL | Singular noun for a unit location (e.g. "magasin", "kiosque", "pizzeria") |
| `eco_noun_plural` | `VARCHAR(100)` | NOT NULL | Plural noun for multiple units |
| `verdict` | `VARCHAR(255)` | NULL | Short-form network health verdict (e.g. "Sur la trajectoire") |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX brand_copy_brand_idx ON brand_copy(brand_id)`

---

### brand_presentation

Hero section and investment summary for the investor-facing brand presentation. One row per brand. Updated via the CMS.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Parent brand |
| `hero_eyebrow` | `VARCHAR(255)` | NULL | Small text above the hero title |
| `hero_title` | `VARCHAR(500)` | NULL | Main hero heading |
| `hero_baseline` | `VARCHAR(500)` | NULL | Hero subtitle / baseline |
| `hero_sub` | `TEXT` | NULL | Full concept description for the hero section |
| `hero_primary_cta` | `VARCHAR(255)` | NULL | Label for the primary CTA button |
| `invest_min` | `INTEGER` | NULL | Minimum investment ticket in EUR |
| `invest_max` | `INTEGER` | NULL | Maximum investment ticket in EUR (if capped) |
| `invest_return` | `DECIMAL(5,2)` | NULL | Target ROI percentage |
| `invest_payback` | `VARCHAR(50)` | NULL | Human-readable payback period (e.g. "4,8 ans") |
| `invest_shops` | `INTEGER` | NULL | Number of open shops in the network |
| `network_perf` | `VARCHAR(255)` | NULL | Network performance label (e.g. "+8,4 % CA vs budget 2025") |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX brand_presentation_brand_idx ON brand_presentation(brand_id)`

---

### brand_presentation_slides

Ordered carousel slides for the brand investor presentation. Supports multiple content types rendered by the generic UI.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_presentation_id` | `INTEGER` | NOT NULL, FK → brand_presentation(id) | Parent presentation |
| `type` | `VARCHAR(50)` | NOT NULL | Slide type: `image`, `kpi`, `concept`, `text`, `highlight` |
| `title` | `VARCHAR(500)` | NULL | Slide title |
| `sub` | `TEXT` | NULL | Slide subtitle or caption |
| `media_url` | `VARCHAR(500)` | NULL | Image or video URL |
| `order` | `SMALLINT` | NOT NULL, DEFAULT 0 | Display order within the carousel |

**Foreign Keys:**
- `brand_presentation_id` → `brand_presentation(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX bps_presentation_order_idx ON brand_presentation_slides(brand_presentation_id, order)`

---

### brand_presentation_videos

Video assets shown in the brand presentation (concept video, founder message, shop tour).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_presentation_id` | `INTEGER` | NOT NULL, FK → brand_presentation(id) | Parent presentation |
| `type` | `VARCHAR(50)` | NOT NULL | Video type: `main`, `founder`, `tour` |
| `title` | `VARCHAR(500)` | NOT NULL | Video title |
| `description` | `TEXT` | NULL | Short description / subtitle |
| `url` | `VARCHAR(500)` | NULL | Video URL (Vimeo, YouTube, or direct) |
| `thumbnail` | `VARCHAR(500)` | NULL | Thumbnail image URL |

**Foreign Keys:**
- `brand_presentation_id` → `brand_presentation(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`

---

### brand_presentation_docs

Downloadable documents shown in the brand presentation (investor decks, franchise dossiers, legal).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_presentation_id` | `INTEGER` | NOT NULL, FK → brand_presentation(id) | Parent presentation |
| `title` | `VARCHAR(500)` | NOT NULL | Document title |
| `kind` | `VARCHAR(100)` | NOT NULL | Document category (e.g. "Brand deck", "Contrat type") |
| `size` | `VARCHAR(50)` | NULL | Human-readable file size |
| `url` | `VARCHAR(500)` | NULL | Download URL (signed CDN URL) |

**Foreign Keys:**
- `brand_presentation_id` → `brand_presentation(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`

---

### brand_team

Team roster shown in the investor presentation. Each row is one person-role entry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Parent brand |
| `role` | `VARCHAR(255)` | NOT NULL | Role title (e.g. "Co-fondateur", "Operational Manager") |
| `person_name` | `VARCHAR(255)` | NOT NULL | Full name of the person in this role |
| `description` | `TEXT` | NULL | Short bio or role description |
| `can_contact` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether investors can contact this person via the portal |
| `order` | `SMALLINT` | NOT NULL, DEFAULT 0 | Display order within the team section |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX brand_team_brand_order_idx ON brand_team(brand_id, order)`

---

### shops

Physical franchise shop locations. Each shop belongs to one brand and one region.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(100)` | PK | Slug identifier (e.g. `couq-chatelain`) |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Parent brand |
| `name` | `VARCHAR(255)` | NOT NULL | Shop display name |
| `city` | `VARCHAR(255)` | NOT NULL | City where the shop is located |
| `region_id` | `VARCHAR(50)` | NOT NULL, FK → regions(id) | Geographic region |
| `address` | `VARCHAR(500)` | NULL | Full street address |
| `surface_m2` | `SMALLINT` | NULL | Shop floor area in square metres |
| `opened_at` | `DATE` | NULL | Opening date |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'open' | One of: `open`, `pre-opening`, `closed`, `paused` |
| `photo_url` | `VARCHAR(500)` | NULL | Primary shop photo URL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE RESTRICT
- `region_id` → `regions(id)` ON DELETE RESTRICT

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX shops_brand_idx ON shops(brand_id)`
- `INDEX shops_region_idx ON shops(region_id)`
- `INDEX shops_status_idx ON shops(status)`

**Example row:**
```
id:         couq-chatelain
brand_id:   couq
name:       Couq Châtelain
city:       Bruxelles
region_id:  bxl
address:    Place du Châtelain 12, 1050 Ixelles
surface_m2: 72
opened_at:  2024-06-01
status:     open
```

---

### shop_kpi

Monthly KPI snapshots per shop. Used for performance charts, consultant reports, and investor dashboards.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `shop_id` | `VARCHAR(100)` | NOT NULL, FK → shops(id) | Parent shop |
| `period` | `VARCHAR(10)` | NOT NULL | Period identifier in `YYYY-MM` format |
| `ca` | `INTEGER` | NOT NULL | Monthly revenue in EUR |
| `food_cost` | `DECIMAL(5,2)` | NULL | Food cost as percentage of revenue |
| `labour_cost` | `DECIMAL(5,2)` | NULL | Labour cost as percentage of revenue |
| `profit_net` | `DECIMAL(5,2)` | NOT NULL | Net profit margin percentage |
| `progression` | `DECIMAL(5,2)` | NULL | Revenue vs budget variance percentage |
| `customers_per_day` | `INTEGER` | NULL | Average daily customer count |
| `basket_avg` | `DECIMAL(8,2)` | NULL | Average basket value in EUR |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When this snapshot was recorded |

**Foreign Keys:**
- `shop_id` → `shops(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX shop_kpi_shop_period_idx ON shop_kpi(shop_id, period)`
- `INDEX shop_kpi_shop_idx ON shop_kpi(shop_id)`

**Example row:**
```
id:               1
shop_id:          couq-chatelain
period:           2026-04
ca:               64000
food_cost:        31.50
labour_cost:      26.80
profit_net:       14.20
progression:      6.80
customers_per_day:220
basket_avg:       6.90
recorded_at:      2026-05-02 09:00:00+00
```

---

### investors

Investor profiles linked to a user account. Stores financial summary figures updated on each repayment cycle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Investor identifier (e.g. `inv_001`) |
| `user_id` | `UUID` | NOT NULL, FK → users(id) | Linked user account |
| `full_name` | `VARCHAR(255)` | NOT NULL | Investor's full name |
| `email` | `VARCHAR(255)` | NOT NULL | Contact email (may differ from login email) |
| `phone` | `VARCHAR(50)` | NULL | Phone number |
| `address` | `VARCHAR(500)` | NULL | Postal address |
| `tier` | `VARCHAR(50)` | NOT NULL, DEFAULT 'Bronze' | Investment tier: `Bronze`, `Argent`, `Or`, `Privilège` |
| `total_invested` | `DECIMAL(12,2)` | NOT NULL, DEFAULT 0 | Total capital invested across all brands (EUR) |
| `total_valuation` | `DECIMAL(12,2)` | NOT NULL, DEFAULT 0 | Current portfolio valuation (EUR) |
| `total_paid` | `DECIMAL(12,2)` | NOT NULL, DEFAULT 0 | Total repayments received to date (EUR) |
| `remaining` | `DECIMAL(12,2)` | NOT NULL, DEFAULT 0 | Capital still outstanding (EUR) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Profile creation timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX investors_user_idx ON investors(user_id)`
- `INDEX investors_tier_idx ON investors(tier)`

---

### investor_preferences

Per-channel notification preferences for each investor. One row per preference toggle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `investor_id` | `VARCHAR(50)` | NOT NULL, FK → investors(id) | Parent investor |
| `channel` | `VARCHAR(50)` | NOT NULL | Notification channel: `email`, `sms`, `push` |
| `event_type` | `VARCHAR(100)` | NOT NULL | Event type (e.g. `payment`, `report`, `doc`, `opportunity`, `newsletter`) |
| `enabled` | `BOOLEAN` | NOT NULL, DEFAULT true | Whether this preference is active |

**Foreign Keys:**
- `investor_id` → `investors(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX investor_prefs_investor_event_channel_idx ON investor_preferences(investor_id, event_type, channel)`

---

### investments

Each investment by an investor into a specific shop. Source of truth for portfolio and repayment calculations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `investor_id` | `VARCHAR(50)` | NOT NULL, FK → investors(id) | Investing investor |
| `shop_id` | `VARCHAR(100)` | NOT NULL, FK → shops(id) | Shop being invested in |
| `amount` | `DECIMAL(12,2)` | NOT NULL | Investment amount in EUR |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'active' | One of: `active`, `completed`, `defaulted`, `pending` |
| `start_date` | `DATE` | NOT NULL | Investment start date |
| `end_date` | `DATE` | NULL | Planned or actual end date |
| `roi_target` | `DECIMAL(5,2)` | NOT NULL | Agreed annual ROI percentage |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Foreign Keys:**
- `investor_id` → `investors(id)` ON DELETE RESTRICT
- `shop_id` → `shops(id)` ON DELETE RESTRICT

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX investments_investor_idx ON investments(investor_id)`
- `INDEX investments_shop_idx ON investments(shop_id)`
- `INDEX investments_status_idx ON investments(status)`

**Example row:**
```
id:         1
investor_id:inv_001
shop_id:    couq-chatelain
amount:     25000.00
status:     active
start_date: 2024-06-01
end_date:   2029-06-01
roi_target: 8.20
created_at: 2024-06-01 14:00:00+00
```

---

### repayment_schedules

Monthly repayment rows generated when an investment is created (amortization table). Tracks payment status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `investment_id` | `INTEGER` | NOT NULL, FK → investments(id) | Parent investment |
| `due_date` | `DATE` | NOT NULL | Date when payment is due |
| `amount` | `DECIMAL(10,2)` | NOT NULL | Amount due in EUR (principal + interest) |
| `paid` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether the payment has been made |
| `paid_at` | `TIMESTAMPTZ` | NULL | Timestamp when payment was processed |

**Foreign Keys:**
- `investment_id` → `investments(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX repayment_schedules_investment_idx ON repayment_schedules(investment_id)`
- `INDEX repayment_schedules_due_date_paid_idx ON repayment_schedules(due_date, paid)` — used for monthly payment batch jobs

---

### opportunities

Franchise and investment opportunities listed on the public marketplace and candidate carousel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(100)` | PK | Slug identifier (e.g. `op-gent`) |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Brand this opportunity belongs to |
| `name` | `VARCHAR(255)` | NOT NULL | Opportunity display name |
| `city` | `VARCHAR(255)` | NOT NULL | City where the shop will open |
| `region_id` | `VARCHAR(50)` | NOT NULL, FK → regions(id) | Geographic region |
| `format` | `VARCHAR(255)` | NULL | Format description (e.g. "Boutique 84 m²") |
| `opening_date` | `VARCHAR(50)` | NULL | Human-readable opening timeline (e.g. "Q3 2026") |
| `required_invest` | `INTEGER` | NULL | Total investment required in EUR |
| `candidate_contrib` | `INTEGER` | NULL | Candidate personal contribution in EUR |
| `financing_need` | `VARCHAR(500)` | NULL | Financing structure description |
| `payback` | `VARCHAR(50)` | NULL | Payback period (e.g. "4,8 ans") |
| `status` | `VARCHAR(100)` | NOT NULL | Status label (e.g. "Closing imminent", "En recherche candidat") |
| `description` | `TEXT` | NULL | Full opportunity description |
| `image_url` | `VARCHAR(500)` | NULL | Opportunity image URL |
| `type` | `VARCHAR(50)` | NOT NULL, DEFAULT 'franchise' | One of: `franchise`, `investment`, `new-brand` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE RESTRICT
- `region_id` → `regions(id)` ON DELETE RESTRICT

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX opportunities_brand_idx ON opportunities(brand_id)`
- `INDEX opportunities_region_idx ON opportunities(region_id)`
- `INDEX opportunities_type_idx ON opportunities(type)`

**Example row:**
```
id:              op-gent
brand_id:        atelier
name:            L'Atelier Gand
city:            Gent
region_id:       fla
format:          Boutique 84 m²
opening_date:    Q3 2026
required_invest: 320000
candidate_contrib:60000
financing_need:  Tax shelter + prêt investisseur
payback:         4,8 ans
status:          Closing imminent
type:            franchise
```

---

### candidates

Franchise candidate profiles. A candidate can be linked to multiple opportunities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Candidate identifier (e.g. `cand-001`) |
| `user_id` | `UUID` | NULL, FK → users(id) | Linked user account (NULL if no login yet) |
| `full_name` | `VARCHAR(255)` | NOT NULL | Candidate's full name |
| `email` | `VARCHAR(255)` | NOT NULL | Contact email |
| `phone` | `VARCHAR(50)` | NULL | Phone number |
| `address` | `VARCHAR(500)` | NULL | Postal address |
| `region_id` | `VARCHAR(50)` | NULL, FK → regions(id) | Preferred region |
| `language` | `VARCHAR(255)` | NULL | Languages spoken (free text) |
| `experience` | `TEXT` | NULL | Professional background description |
| `situation` | `VARCHAR(255)` | NULL | Current professional situation |
| `motivation` | `TEXT` | NULL | Candidate motivation statement |
| `budget` | `INTEGER` | NULL | Available personal capital in EUR |
| `financing_capacity` | `TEXT` | NULL | Additional financing capacity description |
| `notes` | `TEXT` | NULL | Internal consultant notes (not shown to candidate) |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'to-analyse' | One of: `to-analyse`, `in-discussion`, `recommended`, `validated`, `rejected`, `on-hold` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Profile creation timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE SET NULL
- `region_id` → `regions(id)` ON DELETE SET NULL

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX candidates_status_idx ON candidates(status)`
- `INDEX candidates_region_idx ON candidates(region_id)`

---

### candidate_brand_preferences

Many-to-many table linking candidates to their preferred brands.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `candidate_id` | `VARCHAR(50)` | NOT NULL, FK → candidates(id) | Candidate |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Preferred brand |

**Foreign Keys:**
- `candidate_id` → `candidates(id)` ON DELETE CASCADE
- `brand_id` → `brands(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX cbp_candidate_brand_idx ON candidate_brand_preferences(candidate_id, brand_id)`

---

### candidate_leads

The core pipeline table. Links a candidate to a specific opportunity and tracks the validation status and fit score assigned by the consultant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Lead link identifier (e.g. `opp-link-001`) |
| `candidate_id` | `VARCHAR(50)` | NOT NULL, FK → candidates(id) | Candidate |
| `opportunity_id` | `VARCHAR(100)` | NOT NULL, FK → opportunities(id) | Opportunity being evaluated |
| `brand_id` | `VARCHAR(50)` | NOT NULL, FK → brands(id) | Brand (denormalized for query convenience) |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'to-analyse' | One of: `to-analyse`, `in-discussion`, `recommended`, `validated`, `rejected`, `on-hold` |
| `fit_score` | `SMALLINT` | NULL | Consultant-assigned fit score 0–100 |
| `consultant_id` | `VARCHAR(50)` | NULL, FK → consultants(id) | Assigned consultant |
| `notes` | `TEXT` | NULL | Consultant notes on this specific match |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When interest was first expressed |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Foreign Keys:**
- `candidate_id` → `candidates(id)` ON DELETE CASCADE
- `opportunity_id` → `opportunities(id)` ON DELETE RESTRICT
- `brand_id` → `brands(id)` ON DELETE RESTRICT
- `consultant_id` → `consultants(id)` ON DELETE SET NULL

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX cl_candidate_idx ON candidate_leads(candidate_id)`
- `INDEX cl_opportunity_idx ON candidate_leads(opportunity_id)`
- `INDEX cl_consultant_idx ON candidate_leads(consultant_id)`
- `INDEX cl_status_idx ON candidate_leads(status)`

**Example row:**
```
id:            opp-link-001
candidate_id:  cand-001
opportunity_id:op-bxl-cookies
brand_id:      cookies
status:        recommended
fit_score:     92
consultant_id: cons-001
notes:         Très bon match. Budget aligné, expérience retail forte.
created_at:    2026-05-12 10:00:00+00
updated_at:    2026-05-15 15:00:00+00
```

---

### lead_history

Immutable audit log of status changes on candidate leads. One row per status transition.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `lead_id` | `VARCHAR(50)` | NOT NULL, FK → candidate_leads(id) | Parent lead |
| `from_status` | `VARCHAR(50)` | NULL | Previous status (NULL for initial creation) |
| `to_status` | `VARCHAR(50)` | NOT NULL | New status |
| `changed_by` | `VARCHAR(255)` | NOT NULL | Name or system identifier of who made the change |
| `note` | `TEXT` | NULL | Optional note attached to this transition |
| `changed_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | When the change occurred |

**Foreign Keys:**
- `lead_id` → `candidate_leads(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX lead_history_lead_idx ON lead_history(lead_id)`

---

### lead_appointments

Scheduled appointments attached to a lead (discovery calls, site visits, committee meetings).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `lead_id` | `VARCHAR(50)` | NOT NULL, FK → candidate_leads(id) | Parent lead |
| `type` | `VARCHAR(255)` | NOT NULL | Appointment type (e.g. "Visioconférence", "Visite kiosque pilote") |
| `scheduled_at` | `TIMESTAMPTZ` | NOT NULL | Date and time of the appointment |
| `location` | `VARCHAR(500)` | NULL | Physical or virtual location |
| `notes` | `TEXT` | NULL | Pre/post appointment notes |

**Foreign Keys:**
- `lead_id` → `candidate_leads(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX lead_appointments_lead_idx ON lead_appointments(lead_id)`

---

### consultants

Consultant profiles. Consultants manage candidate leads and coordinate brand development.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Consultant identifier (e.g. `cons-001`) |
| `user_id` | `UUID` | NOT NULL, FK → users(id) | Linked user account |
| `full_name` | `VARCHAR(255)` | NOT NULL | Full name |
| `email` | `VARCHAR(255)` | NOT NULL | Contact email |
| `phone` | `VARCHAR(50)` | NULL | Phone number |
| `active_leads` | `INTEGER` | NOT NULL, DEFAULT 0 | Count of currently active leads (denormalized for performance) |
| `performance_score` | `DECIMAL(3,1)` | NULL | Performance score 0.0–5.0 |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Profile creation timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX consultants_user_idx ON consultants(user_id)`

---

### developers

Real estate developers who propose commercial locations to the FG network.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `user_id` | `UUID` | NULL, FK → users(id) | Linked user account (NULL for anonymous submissions) |
| `full_name` | `VARCHAR(255)` | NOT NULL | Contact person name |
| `company` | `VARCHAR(255)` | NULL | Company or agency name |
| `email` | `VARCHAR(255)` | NOT NULL | Contact email |
| `phone` | `VARCHAR(50)` | NULL | Phone number |
| `city` | `VARCHAR(255)` | NULL | City of the proposed location |
| `surface_m2` | `INTEGER` | NULL | Available surface area in square metres |
| `rent` | `INTEGER` | NULL | Monthly rent in EUR |
| `description` | `TEXT` | NULL | Full description of the commercial space |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'pending' | One of: `pending`, `active`, `inactive` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Submission timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE SET NULL

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX developers_status_idx ON developers(status)`

---

### support_tickets

Helpdesk tickets initiated by investors, candidates, or pushed by admins. Threads are stored in support_messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Ticket identifier (e.g. `t-001`) |
| `user_id` | `UUID` | NOT NULL, FK → users(id) | User who owns the ticket |
| `category_id` | `VARCHAR(50)` | NOT NULL | Category: `investment`, `repayment`, `technical`, `document`, `legal`, `opportunity`, `general` |
| `priority_id` | `VARCHAR(50)` | NOT NULL, DEFAULT 'normal' | Priority: `low`, `normal`, `high`, `urgent` |
| `subject` | `VARCHAR(500)` | NOT NULL | Ticket subject line |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'open' | One of: `open`, `resolved`, `awaiting-investor`, `awaiting-admin` |
| `brand_id` | `VARCHAR(50)` | NULL, FK → brands(id) | Optional brand context |
| `assigned_to` | `VARCHAR(255)` | NULL | Name of the admin/agent handling the ticket |
| `origin` | `VARCHAR(50)` | NOT NULL, DEFAULT 'investor' | Who created the ticket: `investor`, `admin`, `system` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Ticket creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last activity timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `brand_id` → `brands(id)` ON DELETE SET NULL

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX support_tickets_user_idx ON support_tickets(user_id)`
- `INDEX support_tickets_status_idx ON support_tickets(status)`
- `INDEX support_tickets_priority_idx ON support_tickets(priority_id)`

---

### support_messages

Individual messages within a support ticket thread. Supports both user and admin replies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Message identifier (e.g. `m-001`) |
| `ticket_id` | `VARCHAR(50)` | NOT NULL, FK → support_tickets(id) | Parent ticket |
| `from_type` | `VARCHAR(50)` | NOT NULL | Sender type: `investor`, `admin`, `system` |
| `content` | `TEXT` | NOT NULL | Message body (HTML or plain text) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Message timestamp |

**Foreign Keys:**
- `ticket_id` → `support_tickets(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX support_messages_ticket_idx ON support_messages(ticket_id, created_at)`

---

### support_attachments

File attachments uploaded with support messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `message_id` | `VARCHAR(50)` | NOT NULL, FK → support_messages(id) | Parent message |
| `filename` | `VARCHAR(255)` | NOT NULL | Original filename |
| `url` | `VARCHAR(500)` | NOT NULL | CDN/storage URL |

**Foreign Keys:**
- `message_id` → `support_messages(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`

---

### documents

Central document vault for all user-scoped documents — KYC/AML, investment contracts, repayment schedules, tax attestations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Document identifier (e.g. `d-kyc-id`) |
| `owner_id` | `VARCHAR(50)` | NOT NULL | ID of the investor or candidate who owns this document |
| `owner_type` | `VARCHAR(50)` | NOT NULL | Owner type: `investor`, `candidate` |
| `brand_id` | `VARCHAR(50)` | NULL, FK → brands(id) | Optional brand association (NULL for cross-brand docs) |
| `type` | `VARCHAR(50)` | NOT NULL | Document type: `investment`, `ownership`, `kyc`, `aml`, `banking`, `tax`, `contract`, `schedule`, `statement` |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'pending' | Document status: `validated`, `pending`, `expired`, `missing`, `signed`, `review` |
| `title` | `VARCHAR(500)` | NOT NULL | Document title |
| `filename` | `VARCHAR(255)` | NULL | Original filename |
| `url` | `VARCHAR(500)` | NULL | Signed CDN URL (regenerated on each request; time-limited) |
| `expires_at` | `DATE` | NULL | Document expiry date (for KYC, AML, tax docs) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Upload/creation timestamp |

**Foreign Keys:**
- `brand_id` → `brands(id)` ON DELETE SET NULL

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX documents_owner_idx ON documents(owner_id, owner_type)`
- `INDEX documents_type_idx ON documents(type)`
- `INDEX documents_status_idx ON documents(status)`
- `INDEX documents_expires_idx ON documents(expires_at)` — used for expiry notifications

**Example row:**
```
id:          d-kyc-id
owner_id:    inv_001
owner_type:  investor
brand_id:    NULL
type:        kyc
status:      validated
title:       Pièce d'identité — Carte d'identité belge
filename:    carte-identite-cv.pdf
expires_at:  2033-06-15
created_at:  2023-06-15 10:30:00+00
```

---

### notifications

User notification feed. New notifications are pushed by scheduled jobs (payments, reports) or triggered by events (new opportunity, document signed).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Notification identifier (e.g. `n1`) |
| `user_id` | `UUID` | NOT NULL, FK → users(id) | Recipient user |
| `title` | `VARCHAR(500)` | NOT NULL | Notification headline |
| `body` | `TEXT` | NULL | Notification body text |
| `type` | `VARCHAR(50)` | NOT NULL | Notification type: `payment`, `report`, `doc`, `opp`, `system` |
| `read` | `BOOLEAN` | NOT NULL, DEFAULT false | Whether the user has read this notification |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Notification creation timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX notifications_user_read_idx ON notifications(user_id, read, created_at DESC)` — primary query pattern

---

### regions

Geographic region reference data used across shops, opportunities, and candidates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Region slug (e.g. `bxl`, `wal`, `fla`) |
| `code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Region code (same as id for consistency) |
| `label` | `VARCHAR(255)` | NOT NULL | Human-readable region name |

**Indexes:**
- `PRIMARY KEY (id)`

**Example rows:**
```
id: bxl  | code: bxl     | label: Bruxelles-Capitale
id: wal  | code: wal     | label: Wallonie
id: fla  | code: fla     | label: Flandre
id: fr-nord | code: fr-nord | label: France · Hauts-de-France
id: nl   | code: nl      | label: Pays-Bas
```

---

### new_brand_leads

New brand concept submissions from the landing page "Make Your Own Brand" CTA. Reviewed by the brand strategy team.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `VARCHAR(50)` | PK | Lead identifier (e.g. `nbl-001`) |
| `candidate_name` | `VARCHAR(255)` | NOT NULL | Submitter name |
| `email` | `VARCHAR(255)` | NOT NULL | Contact email |
| `phone` | `VARCHAR(50)` | NULL | Phone number |
| `project_name` | `VARCHAR(255)` | NULL | Proposed brand/concept name |
| `concept_type` | `VARCHAR(100)` | NULL | Concept category: `bakery`, `coffee`, `restaurant`, `foodcourt`, `retail`, `other` |
| `location` | `VARCHAR(500)` | NULL | Preferred city and neighborhood |
| `budget` | `INTEGER` | NULL | Available budget in EUR |
| `description` | `TEXT` | NULL | Concept description |
| `inspirations` | `TEXT` | NULL | Reference brands or concepts |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'to-analyse' | One of: `to-analyse`, `in-discussion`, `validated`, `rejected` |
| `assigned_to` | `VARCHAR(255)` | NULL | Name of assigned brand strategist |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Submission timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX new_brand_leads_status_idx ON new_brand_leads(status)`

---

### landings

CMS-managed landing page content. One row per named landing page (currently one: the main landing). The `data` column is JSONB — the entire page content tree is stored as a single document.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PK | Auto-incrementing identifier |
| `key` | `VARCHAR(100)` | NOT NULL, UNIQUE | Page identifier (e.g. `main`, `investor`, `candidate`) |
| `data` | `JSONB` | NOT NULL | Full page content document as JSON |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Last CMS update timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX landings_key_idx ON landings(key)`
- `GIN INDEX landings_data_gin_idx ON landings USING GIN (data)` — for JSONB queries

---

## Entity Relationship Description

The following describes the key relationships between tables:

**Core user hierarchy:**
`users` → `investors` (one-to-one via user_id)
`users` → `candidates` (one-to-one via user_id)
`users` → `consultants` (one-to-one via user_id)
`users` → `developers` (one-to-many via user_id)

**Brand data tree:**
`brands` → `brand_kpi_labels` (one-to-one)
`brands` → `brand_copy` (one-to-one)
`brands` → `brand_presentation` (one-to-one)
`brand_presentation` → `brand_presentation_slides` (one-to-many)
`brand_presentation` → `brand_presentation_videos` (one-to-many)
`brand_presentation` → `brand_presentation_docs` (one-to-many)
`brands` → `brand_team` (one-to-many)
`brands` → `shops` (one-to-many)
`brands` → `opportunities` (one-to-many)

**Shop performance:**
`shops` → `shop_kpi` (one-to-many, one row per month)

**Investment chain:**
`investors` → `investments` ← `shops` (many-to-many through investments)
`investments` → `repayment_schedules` (one-to-many)

**Candidate pipeline:**
`candidates` ← `candidate_brand_preferences` → `brands` (many-to-many)
`candidates` → `candidate_leads` ← `opportunities` (many-to-many through candidate_leads)
`candidate_leads` → `lead_history` (one-to-many, immutable audit log)
`candidate_leads` → `lead_appointments` (one-to-many)
`consultants` → `candidate_leads` (one-to-many, assignment)

**Support thread:**
`users` → `support_tickets` (one-to-many)
`support_tickets` → `support_messages` (one-to-many)
`support_messages` → `support_attachments` (one-to-many)

**Document vault:**
`investors.id` or `candidates.id` → `documents` (polymorphic via owner_id + owner_type)

**Notifications:**
`users` → `notifications` (one-to-many)

**Lookup tables (no upstream FK):**
`regions` — referenced by `shops`, `opportunities`, `candidates`
`brands` — the root anchor for most domain entities
`landings` — standalone CMS content

---

## Index Recommendations

The following indexes are recommended beyond those already declared per-table, based on expected high-frequency query patterns:

```sql
-- Investor dashboard: portfolio by investor
CREATE INDEX idx_investments_investor_status ON investments(investor_id, status);

-- Monthly payment batch: unpaid installments due today
CREATE INDEX idx_repayments_due_unpaid ON repayment_schedules(due_date) WHERE paid = false;

-- Consultant pipeline board: leads grouped by step and consultant
CREATE INDEX idx_cl_consultant_step ON candidate_leads(consultant_id, status);

-- Document expiry monitoring (30-day rolling check)
CREATE INDEX idx_docs_expires_status ON documents(expires_at, status)
  WHERE expires_at IS NOT NULL;

-- Notification badge count (unread per user)
CREATE INDEX idx_notif_user_unread ON notifications(user_id)
  WHERE read = false;

-- Opportunity marketplace (public, filtered by brand/region/type)
CREATE INDEX idx_opps_brand_region_type ON opportunities(brand_id, region_id, type);

-- Candidate search by region and status
CREATE INDEX idx_candidates_region_status ON candidates(region_id, status);
```

---

## Multi-Tenancy Notes

The platform uses a **brand-scoped** (rather than schema-per-tenant) multi-tenancy approach:

- Every brand-linked entity (shops, opportunities, investments, documents, team, presentation) carries a `brand_id` foreign key.
- API handlers validate that the requesting user has permission to access resources belonging to the requested `brand_id`.
- Investors see only brands/shops in which they have an active `investments` row.
- Candidates are not brand-scoped — they can express interest in any opportunity across all brands.
- Consultants are associated with specific brands via their `candidate_leads` assignments.
- The `brands` table is fully public (no auth required to read brand catalog and presentation).
- KPI data (shop_kpi) is gated behind the investor portal: only investors with a matching `investments` row can read shop KPIs for that shop.

**Row-level security pattern (recommended for sensitive tables):**

```sql
-- Example: investors can only read their own documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY investor_own_docs ON documents
  USING (owner_type = 'investor' AND owner_id = current_setting('app.investor_id'));
```

---

## Audit Logging

**Implemented in application layer:**

- `lead_history` — immutable log of every status transition on a `candidate_lead`. Never deleted or updated.
- `updated_at` columns — present on all mutable tables. Updated via Prisma `@updatedAt` decorator or a DB trigger.

**Recommended additions:**

```sql
-- Generic audit log table
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  table_name  VARCHAR(100) NOT NULL,
  record_id   VARCHAR(100) NOT NULL,
  action      VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  old_data    JSONB,
  new_data    JSONB,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_log_table_record_idx ON audit_log(table_name, record_id);
CREATE INDEX audit_log_user_idx ON audit_log(changed_by, changed_at DESC);
```

Tables that should be covered by the audit log trigger: `investments`, `repayment_schedules`, `documents`, `candidate_leads`, `support_tickets`.

---

## Migration Strategy

The project uses **Prisma Migrate** for schema versioning.

**Recommended workflow:**

1. **Local development:**
   ```bash
   # Generate and apply a new migration
   npx prisma migrate dev --name descriptive_name

   # Apply all pending migrations
   npx prisma migrate deploy

   # Seed the database with sample data
   npx prisma db seed
   # or
   node backend/data/seed.js
   ```

2. **Production deployments:**
   - Migrations are run automatically during the deployment pipeline before the new server version starts.
   - Never run `prisma migrate dev` in production — use `prisma migrate deploy` only.
   - All migrations are backwards-compatible (no DROP COLUMN or ALTER COLUMN with a data type change in the same deploy as a new server version).

3. **Rollback strategy:**
   - Prisma does not natively support rollback. Rollbacks are handled by running a new "undo" migration that reverses the change.
   - For zero-downtime deploys, use the expand/contract pattern:
     - **Expand:** Add new columns (nullable), deploy new code that writes both old and new.
     - **Migrate:** Backfill data.
     - **Contract:** Drop old columns in a subsequent deploy.

4. **Branch strategy:**
   - Each feature branch that changes the schema generates its own migration file.
   - Migrations are squashed before merging to `main` if they belong to the same logical feature.
   - The `migrations/` folder is committed to version control and treated as an immutable ledger.
