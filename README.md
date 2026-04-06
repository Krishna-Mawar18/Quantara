# Quantara - Data Intelligence Platform

A production-grade SaaS platform that democratizes data intelligence by converting raw datasets (CSV/Excel) into actionable business insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4 |
| Auth | Firebase Auth (Google + Email/Password) |
| Database | Supabase (PostgreSQL) |
| Backend | FastAPI, Python |
| ML/Analytics | Scikit-learn, Pandas, NumPy |
| Cloud Storage | AWS S3 |
| Billing | Razorpay |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
quantara/
├── src/                    # Next.js frontend
│   ├── app/                # App router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── auth/           # Login & Register (Firebase Auth)
│   │   └── dashboard/      # Dashboard pages
│   ├── components/         # Reusable components
│   ├── lib/
│   │   ├── firebase.ts     # Firebase config (lazy init)
│   │   └── api.ts          # API client (auto token refresh)
│   ├── store/              # Zustand state (Firebase auth)
│   └── types/              # TypeScript types
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes (Supabase queries)
│   │   ├── core/
│   │   │   ├── config.py   # Settings (Supabase + Firebase)
│   │   │   ├── database.py # Supabase client
│   │   │   └── security.py # Firebase token verification
│   │   ├── services/       # Business logic
│   │   ├── ml/             # ML/Analytics engine
│   │   └── main.py         # FastAPI app entry
│   ├── supabase_schema.sql # Database schema
│   └── requirements.txt
├── docker-compose.yml
├── .env.example            # Frontend env vars
└── backend/.env.example    # Backend env vars
```

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `backend/supabase_schema.sql`
3. Copy your project URL and anon key

### 2. Set up Firebase

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication → Email/Password and Google sign-in
3. Download service account JSON → save as `backend/firebase-service-account.json`
4. Copy web app config values

### 3. Frontend

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_FIREBASE_* values
npm install
npm run dev
```

Opens at http://localhost:3000

### 4. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_*, FIREBASE_* values
uvicorn app.main:app --reload
```

API docs at http://localhost:8000/docs

### 5. Docker (Full Stack)

```bash
docker-compose up --build
```

## Features

- **Firebase Auth** - Google OAuth + email/password, managed by Firebase
- **Supabase DB** - PostgreSQL with real-time capabilities
- **Instant Upload** - CSV/Excel drag-and-drop with auto-parsing
- **Smart Analytics** - Automated stats, correlations, distributions
- **Visualizations** - Bar, line, pie charts generated automatically
- **Predictive Modeling** - ML models built from your data
- **AI Insights** - Natural language pattern detection
- **Billing** - Razorpay subscription management

## Database Schema

Run `backend/supabase_schema.sql` in the Supabase SQL Editor to create:

- `users` - User profiles (synced from Firebase)
- `datasets` - Uploaded file metadata
- `subscriptions` - Billing/plan data
