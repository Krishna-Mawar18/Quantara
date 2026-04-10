# Quantara - Full Project Structure

```
quantara/
│
├── 📁 src/                              # Frontend source code (Next.js)
│   ├── app/                             # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── analytics/
│   │   │   ├── billing/
│   │   │   ├── playground/
│   │   │   ├── settings/
│   │   │   └── upload/
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   │
│   ├── components/                      # Reusable React components
│   │   ├── auth-provider.tsx
│   │   ├── charts/
│   │   │   ├── area-chart-component.tsx
│   │   │   ├── bar-chart-component.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── boxplot-chart-component.tsx
│   │   │   ├── bubble-chart-component.tsx
│   │   │   ├── chart-builder.tsx
│   │   │   ├── chart-card.tsx
│   │   │   ├── chart-renderer.tsx
│   │   │   ├── heatmap-chart-component.tsx
│   │   │   ├── histogram-chart-component.tsx
│   │   │   ├── index.ts
│   │   │   ├── line-chart-component.tsx
│   │   │   ├── line-chart.tsx
│   │   │   ├── overlay-line-chart-component.tsx
│   │   │   ├── pie-chart-component.tsx
│   │   │   ├── radar-chart-component.tsx
│   │   │   ├── scatter-chart-component.tsx
│   │   │   └── stacked-bar-chart-component.tsx
│   │   ├── landing/
│   │   │   ├── AIInsights.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── DashboardPreview.tsx
│   │   │   ├── Features.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   └── ...
│   │   └── ui/                          # Shadcn UI components
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── use-cache.tsx
│   │   ├── use-dialog.ts
│   │   └── useScrollAnimation.ts
│   │
│   ├── lib/                             # Utility functions & API clients
│   │   ├── api.ts
│   │   ├── cached-api.ts
│   │   ├── firebase.ts
│   │   └── utils.ts
│   │
│   ├── store/                           # Zustand state management
│   │   ├── auth.ts
│   │   ├── cache.ts
│   │   ├── chart-builder.ts
│   │   ├── charts.ts
│   │   ├── dataset.ts
│   │   └── playground.ts
│   │
│   └── types/                           # TypeScript type definitions
│       ├── charts.ts
│       └── index.ts
│
├── 📁 backend/                          # Python backend (FastAPI)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── firebase-service-account.json
│   ├── supabase_schema.sql
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py                      # FastAPI entry point
│       │
│       ├── api/                         # API route handlers
│       │   ├── __init__.py
│       │   ├── analytics.py
│       │   ├── auth.py
│       │   ├── billing.py
│       │   ├── playground.py
│       │   ├── schemas.py
│       │   └── upload.py
│       │
│       ├── core/                        # Core configuration & security
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── plan_enforcement.py
│       │   └── security.py
│       │
│       ├── ml/                          # Machine Learning models
│       │   ├── __init__.py
│       │   ├── playground_predictor.py
│       │   └── predictor.py
│       │
│       └── services/                    # Business logic services
│           ├── __init__.py
│           ├── analytics_service.py
│           ├── billing_service.py
│           ├── feature_engineering.py
│           └── s3_service.py
│
├── 📁 api/                              # API deployment
│   └── index.py
│
├── 📁 public/                           # Static assets (served by Next.js)
│
├── 📁 image/                            # Images & resources
│   └── README/
│
├── 📄 Configuration Files
│   ├── package.json                     # Node.js dependencies
│   ├── requirements.txt                 # Python dependencies
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── next.config.ts                   # Next.js configuration
│   ├── eslint.config.mjs                # ESLint configuration
│   ├── postcss.config.mjs               # PostCSS configuration
│   ├── components.json                  # Shadcn UI components config
│   ├── docker-compose.yml               # Docker Compose setup
│   ├── Dockerfile                       # Docker image for backend
│   ├── vercel.json                      # Vercel deployment config
│   └── global.d.ts                      # Global TypeScript definitions
│
├── 📄 Next.js Auto-generated
│   ├── next-env.d.ts                    # Next.js environment types
│
├── 📄 Documentation
│   ├── README.md                        # Project readme
│   ├── LICENSE                          # License file
│   ├── AGENTS.md                        # AI agent configuration
│   └── CLAUDE.md                        # Claude instructions
│
└── 🔧 Version Control
    └── .git/                            # Git repository
```

## Directory Breakdown

### Frontend (`src/`)
- **app/** - Next.js App Router pages and layouts
  - Authentication pages (login, register)
  - Dashboard with multiple modules (analytics, billing, playground, settings, upload)
  - Legal pages (privacy, terms)
- **components/** - Reusable components
  - 20+ chart components for data visualization
  - Landing page components
  - UI library components (Shadcn)
  - Layout components
- **hooks/** - Custom React hooks for caching, dialogs, animations
- **lib/** - Utility functions, API clients, Firebase config
- **store/** - Zustand stores for state management
- **types/** - TypeScript type definitions

### Backend (`backend/app/`)
- **api/** - FastAPI route handlers
  - Authentication
  - Analytics
  - Billing
  - File uploads
  - Playground functionality
- **core/** - Core functionality
  - Database configuration
  - Security & authentication
  - Plan enforcement
- **ml/** - Machine learning
  - Prediction models
  - Playground ML utilities
- **services/** - Business logic
  - Analytics service
  - Billing service
  - S3 integration
  - Feature engineering

### Configuration & Infrastructure
- Docker setup for containerization
- TypeScript, ESLint, and PostCSS configuration
- Vercel deployment configuration
- Supabase database schema
- Firebase service account

## Key Technologies

**Frontend:**
- Next.js (React framework)
- TypeScript
- Zustand (state management)
- Tailwind CSS / Shadcn UI
- Firebase Auth

**Backend:**
- Python 3.x
- FastAPI
- Supabase/PostgreSQL
- S3 (file storage)
- Machine Learning

**Deployment:**
- Docker & Docker Compose
- Vercel (frontend)
- Backend containerization
