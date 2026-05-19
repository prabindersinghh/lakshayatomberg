# Lakshya — Goal Tracking Portal

> Atomberg's internal quarterly goal-setting and performance tracking portal.

**Live:** [lakshayatomberg.vercel.app](https://lakshayatomberg.vercel.app)

![Lakshya](public/atomberg-logo.png)

---

## Demo Credentials

| Role     | Email                        | Password   | Entry Point       |
|----------|------------------------------|------------|-------------------|
| Employee | `arjun.mehta@atomberg.com`   | `Demo@1234`| `/employee`       |
| Manager  | `priya.sharma@atomberg.com`  | `Demo@1234`| `/manager`        |
| Admin    | `admin@atomberg.com`         | `Demo@1234`| `/admin`          |

> The app runs entirely on **mock data** — no Supabase setup is required for demo mode.

---

## Features

### Phase 1 — Goal Setting
- [x] Role-based login (Employee / Manager / Admin)
- [x] Quarterly goal sheets with thrust-area grouping
- [x] Goal creation wizard with unit-of-measure selection (Numeric Min / Max / Timeline / Zero-based)
- [x] Live weightage bar — tracks total allocation toward 100% (yellow → green at 100% → red above)
- [x] Validation: exactly 100% total · min 10% per goal · max 8 goals per sheet
- [x] Goal status lifecycle: Draft → Submitted → Manager Review → Approved / Returned
- [x] Goal lock once approved (no edits without manager unlock)
- [x] Inline manager edits on target and weightage during approval

### Phase 2 — Check-in & Scoring
- [x] Quarterly actual-entry form
- [x] Automated score computation per UoM type (capped at 150%)
- [x] Color-coded score rings — green ≥ 80% · yellow 50–79% · red < 50%
- [x] Weighted composite score per employee
- [x] Manager return modal with mandatory comment

### Reporting
- [x] Admin completion grid (RAG status per employee × quarter)
- [x] Audit log with actor, action, timestamp, and diff details
- [x] CSV export for completion grid and audit log

### Analytics (Bonus)
- [x] Quarter-on-quarter score trend (line chart)
- [x] Thrust-area distribution (donut chart)
- [x] Employee score heatmap (quarter × employee matrix)
- [x] Manager effectiveness bar chart

---

## Tech Stack

| Layer          | Library / Tool               | Version  |
|----------------|------------------------------|----------|
| UI Framework   | React                        | 19.x     |
| Language       | TypeScript                   | 6.x      |
| Build Tool     | Vite                         | 8.x      |
| Styling        | Tailwind CSS                 | 4.x      |
| Routing        | react-router-dom             | 7.x      |
| Forms          | react-hook-form + zod        | 7.x / 4.x|
| Charts         | Recharts                     | 3.x      |
| Notifications  | Sonner                       | 2.x      |
| Icons          | Lucide React                 | 1.x      |
| Spreadsheet    | xlsx                         | 0.18.x   |
| Backend (opt.) | Supabase                     | 2.x      |
| Deployment     | Vercel                       | —        |

---

## Project Structure

```
lakshya/
├── public/
│   └── atomberg-logo.png          # Favicon + sidebar brand mark
├── src/
│   ├── components/
│   │   ├── goals/
│   │   │   └── GoalForm.tsx        # Create/edit goal with live weightage preview
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx # Sidebar + top bar shell
│   │   │   ├── RoleGuard.tsx       # Route protection by role
│   │   │   ├── Sidebar.tsx         # Role-aware navigation
│   │   │   └── TopBar.tsx          # User badge + logout
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── ScoreRing.tsx       # Color-coded circular score indicator
│   │       └── WeightageBar.tsx    # Animated allocation bar
│   ├── contexts/
│   │   └── AuthContext.tsx         # Mock auth (sessionStorage) + role derivation
│   ├── lib/
│   │   ├── mockData.ts             # Full demo dataset (users, goals, cycles, logs)
│   │   ├── scoring.ts              # Pure TS score engine (all UoM types)
│   │   ├── supabaseClient.ts       # Supabase client (dormant without .env.local)
│   │   └── validations.ts          # Goal sheet validation rules
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx       # Two-column login with demo credential cards
│   │   ├── employee/
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── MyGoalsPage.tsx
│   │   │   └── QuarterlyCheckinPage.tsx
│   │   ├── manager/
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── ApprovalsPage.tsx
│   │   │   └── TeamPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminSettingsPage.tsx
│   │       ├── AnalyticsPage.tsx
│   │       ├── AuditLogPage.tsx
│   │       └── CompletionGridPage.tsx
│   ├── types/
│   │   └── index.ts                # All shared TypeScript interfaces
│   ├── App.tsx                     # Root router with role-guarded routes
│   ├── index.css                   # Tailwind @theme tokens + Google Fonts
│   └── main.tsx
├── .env.example                    # Environment variable template
├── .gitignore
├── index.html                      # App shell with meta/favicon
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                     # SPA rewrites + security headers
└── vite.config.ts
```

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/prabindersinghh/lakshayatomberg.git
cd lakshayatomberg

# 2. Install dependencies
npm install

# 3. (Optional) Configure Supabase
cp .env.example .env.local
# Edit .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# Skip this step to run entirely on mock data

# 4. Start the dev server
npm run dev
# → http://localhost:5173
```

### Other Commands

```bash
npm run build        # Production build (TypeScript check + Vite bundle)
npm run preview      # Preview production build locally on port 4173
npm run type-check   # TypeScript-only check (no emit)
npm run lint         # ESLint
```

---

## Vercel Deployment

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B — GitHub Integration

1. Push this repo to GitHub (already done if you're reading this).
2. Go to [vercel.com/new](https://vercel.com/new) → Import the `lakshayatomberg` repository.
3. Framework preset: **Vite** (auto-detected).
4. Add environment variables if using Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.

> `vercel.json` already handles SPA deep-link rewrites — no extra config needed.

---

## Connecting Supabase (Optional)

The app ships with complete mock data and works without a database. To connect a real backend:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Settings → API** and copy your Project URL and `anon` public key.
3. Add them to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Run database migrations from `supabase/migrations/` (when available).
5. Restart the dev server — the Supabase client activates automatically.

---

## Role-Based Access

| Path                  | Allowed Role |
|-----------------------|--------------|
| `/employee`           | employee     |
| `/employee/goals`     | employee     |
| `/employee/checkin`   | employee     |
| `/manager`            | manager      |
| `/manager/approvals`  | manager      |
| `/manager/team`       | manager      |
| `/admin`              | admin        |
| `/admin/completion`   | admin        |
| `/admin/audit`        | admin        |
| `/admin/analytics`    | admin        |
| `/admin/settings`     | admin        |

Attempting to access a route not matching your role redirects to your home dashboard. Unknown paths redirect to `/login`.

---

## Scoring Logic

| UoM Type      | Formula                                    | Notes                        |
|---------------|--------------------------------------------|------------------------------|
| Numeric Min   | `(actual / target) × 100`                 | Higher actual = better       |
| Numeric Max   | `(target / actual) × 100`                 | Lower actual = better (cost) |
| Timeline      | `100 − (daysLate × 5)`                    | On-time = 100, late penalised|
| Zero-based    | `actual === 0 ? 100 : 0`                  | Binary: zero incidents = 100 |

All scores are capped at **150%** and floored at **0%**.

**Weighted composite score:**
```
Σ (goal.score × goal.weightage) / Σ (goal.weightage)
```

**Score color thresholds:**
- Green — score ≥ 80
- Yellow — score 50–79
- Red — score < 50

---

## Validation Rules

| Rule                         | Detail                                      |
|------------------------------|---------------------------------------------|
| Total weightage              | Must equal exactly 100%                     |
| Per-goal minimum             | Each goal must be ≥ 10%                     |
| Maximum goals per sheet      | No more than 8 goals                        |
| Target value                 | Must be a positive number                   |
| Goal title                   | Required, max 120 characters                |

---

## Design System

| Token               | Value                  | Usage                          |
|---------------------|------------------------|--------------------------------|
| Brand Yellow        | `#FDB813`              | CTAs, active states, focus ring|
| Background          | `#FFFFFF` (70%)        | Page and card backgrounds      |
| Accent Yellow       | `#FDB813` (20%)        | Highlights, hover rows         |
| Dark                | `#111827` (10%)        | Sidebar, headings              |
| Hover row           | `#FFFBEC`              | Table row hover                |
| Heading font        | DM Sans                | Page titles, section headers   |
| Body font           | Plus Jakarta Sans      | All body copy, form labels     |
| Monospace font      | JetBrains Mono         | Score values, numeric data     |

---

## License

Internal use only — © 2025 Atomberg Technologies Pvt. Ltd.
