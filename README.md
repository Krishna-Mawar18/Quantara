# Quantara - AI-Powered Data Intelligence Platform

<p align="center">
  <img src="public/Tech Logo - New Group.png" alt="Quantara Logo" width="200"/>
</p>

<p align="center">
  Transform raw data into actionable insights with AI-powered analytics and machine learning
</p>

<p align="center">
  <a href="https://github.com/DarkSpark18/Quantara/stargazers">
    <img src="https://img.shields.io/github/stars/DarkSpark18/Quantara?style=flat-square" alt="Stars"/>
  </a>
  <a href="https://github.com/DarkSpark18/Quantara/issues">
    <img src="https://img.shields.io/github/issues/DarkSpark18/Quantara?style=flat-square" alt="Issues"/>
  </a>
  <a href="https://github.com/DarkSpark18/Quantara/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/DarkSpark18/Quantara?style=flat-square" alt="License"/>
  </a>
</p>

---

## ✨ Features

### 📊 Data Analytics
- **Smart Upload** - Drag-and-drop CSV/Excel files with automatic parsing
- **Column Analysis** - Automatic statistics, distributions, and correlations
- **Interactive Charts** - Bar, line, pie, scatter, radar, and stacked charts
- **AI Insights** - Natural language pattern detection and recommendations

### 🤖 ML Playground
- **10+ ML Algorithms** - Random Forest, Gradient Boosting, Neural Networks, and more
- **Feature Engineering** - Create derived features with 13+ operations
- **Auto-Training** - One-click model training with optimized hyperparameters
- **Predictions** - Generate predictions on new data instantly

### 💳 Billing & Plans
- **Multiple Tiers** - Free, Pro, Pro Plus, and Enterprise plans
- **Usage Limits** - Dataset limits, row limits, and prediction quotas
- **Razorpay Integration** - Secure subscription management

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | FastAPI, Python 3.11+ |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Firebase Auth (Google + Email/Password) |
| **Machine Learning** | Scikit-learn, Pandas, NumPy |
| **Cloud Storage** | AWS S3 |
| **Payments** | Razorpay |
| **State Management** | Zustand |
| **Charts** | Recharts |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- Firebase account
- AWS S3 bucket (optional)

### 1. Clone & Install

```bash
git clone https://github.com/DarkSpark18/Quantara.git
cd Quantara/quantara
npm install
```

### 2. Environment Setup

**Frontend (.env.local)**
```bash
cp .env.example .env.local
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (backend/.env)**
```bash
cd backend
cp .env.example .env
```

Required variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Database Setup

Run the schema in Supabase SQL Editor:
```bash
backend/supabase_schema.sql
```

### 4. Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication → Email/Password and Google sign-in
3. Download service account JSON → save as `backend/firebase-service-account.json`

### 5. Run Development Servers

**Frontend**
```bash
npm run dev
# Opens at http://localhost:3000
```

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API docs at http://localhost:8000/docs
```

---

## 📁 Project Structure

```
quantara/
├── src/                         # Next.js Frontend
│   ├── app/                     # App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── dashboard/          # Protected dashboard
│   │       ├── page.tsx        # Dashboard home
│   │       ├── analytics/      # Analytics page
│   │       ├── billing/        # Billing page
│   │       ├── playground/     # ML Playground
│   │       ├── settings/        # User settings
│   │       └── upload/         # Data upload
│   ├── components/
│   │   ├── ui/                 # UI components (Button, Card, Modal, etc.)
│   │   ├── layout/             # Layout components (Sidebar, Header)
│   │   ├── charts/             # Chart components
│   │   └── landing/            # Landing page components
│   ├── store/                  # Zustand stores
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                   # Utilities (API, Firebase, utils)
│   └── types/                  # TypeScript definitions
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth.py
│   │   │   ├── datasets.py
│   │   │   ├── analytics.py
│   │   │   ├── billing.py
│   │   │   └── playground.py   # ML endpoints
│   │   ├── core/              # Core configuration
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── plan_enforcement.py
│   │   ├── services/          # Business logic
│   │   │   ├── analytics_service.py
│   │   │   ├── feature_engineering.py
│   │   │   └── billing_service.py
│   │   ├── ml/                # Machine learning
│   │   │   └── playground_predictor.py
│   │   └── main.py            # FastAPI entry point
│   ├── supabase_schema.sql    # Database schema
│   └── requirements.txt
│
├── docker-compose.yml          # Docker setup
└── package.json
```

---

## 🧪 ML Playground Models

| Model | Type | Best For |
|-------|------|----------|
| Random Forest | Ensemble | Best overall performance |
| Gradient Boosting | Ensemble | High accuracy tasks |
| Extra Trees | Ensemble | Fast, robust predictions |
| Decision Tree | Single | Interpretable results |
| Logistic Regression | Linear | Binary classification |
| K-Nearest Neighbors | Instance | Simple pattern recognition |
| Support Vector Machine | Linear/Non-linear | Complex decision boundaries |
| Neural Network (MLP) | Deep Learning | Complex patterns |
| Naive Bayes | Probabilistic | Quick baseline |
| AdaBoost | Ensemble | Adaptive learning |

---

## 🎨 Design System

### Colors
- **Primary**: Violet (#7C3AED)
- **Secondary**: Purple (#A855F7)
- **Background**: Zinc tones
- **Accent**: Emerald for success, Red for errors

### Components
- Button, Badge, Card, Modal, Dialog
- Input, Dropdown (native HTML)
- Charts (Recharts)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  <a href="https://github.com/DarkSpark18">DarkSpark18</a> • MIT License
</p>

---

<p align="center">
  Built with ❤️ by the Quantara Team
</p>
