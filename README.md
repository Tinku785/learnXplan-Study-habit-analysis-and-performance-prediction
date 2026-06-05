<div align="center">

<img src="https://img.shields.io/badge/LearnXPlan-AI%20Platform-6366f1?style=for-the-badge&logo=graduation-cap&logoColor=white" alt="LearnXPlan Banner" />

# 🎓 LearnXPlan — AI-Powered Study Habit Analysis & Performance Prediction

**An end-to-end machine learning platform that forecasts student exam scores from real study habits, explains the predictions with SHAP feature importance, and delivers personalized coaching via Google Gemini AI.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.3-blue?style=flat-square)](https://lightgbm.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Technology Stack](#-technology-stack)
5. [Project Structure](#-project-structure)
6. [Database Schema](#-database-schema)
7. [ML Engine Deep Dive](#-ml-engine-deep-dive)
8. [Backend API Reference](#-backend-api-reference)
9. [Frontend Pages & Components](#-frontend-pages--components)
10. [Getting Started](#-getting-started)
11. [Environment Variables](#-environment-variables)
12. [Running the ML Pipeline](#-running-the-ml-pipeline)
13. [Running the Backend](#-running-the-backend)
14. [Running the Frontend](#-running-the-frontend)
15. [API Endpoints](#-api-endpoints)
16. [User Roles & Access Control](#-user-roles--access-control)
17. [How Predictions Work](#-how-predictions-work)
18. [AI Coach (Gemini Integration)](#-ai-coach-gemini-integration)
19. [Guest / Sandbox Mode](#-guest--sandbox-mode)
20. [Contributing](#-contributing)
21. [License](#-license)

---

## 🌐 Project Overview

**LearnXPlan** is a full-stack educational technology platform built to bridge the gap between raw student habit data and actionable academic improvement. It answers the question:

> *"Given my current study habits — how will I perform on my exams, and what should I change to do better?"*

The platform works by collecting 12 student habit metrics via an interactive questionnaire, running them through a trained **LightGBM regression model** to predict an exam score (0–100), computing **SHAP (SHapley Additive exPlanations)** feature contributions to explain *why* that score was predicted, generating **counterfactual recommendations** ("if you study 18 hrs/week instead of 10, you'd gain +4.8 marks"), and delivering all of this through a polished Next.js dashboard with a **real-time AI chat coach powered by Google Gemini 2.5 Flash**.

The application supports two user roles:
- **Students** — submit habits, view their predictions, use the What-If simulator, and chat with the AI coach
- **Teachers** — view aggregate class-wide analytics and risk-level distributions across all students

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📋 **12-Factor Questionnaire** | Collects study hours, attendance, sleep, screen time, physical activity, study consistency, parental involvement, access to resources, family income, motivation, internet access, and extracurricular activities |
| 🤖 **ML Score Prediction** | LightGBM regression model predicts exam score (30–100) with a confidence percentage |
| 📊 **SHAP Explainability** | Bar chart visualization showing how much each habit positively or negatively impacts your predicted score |
| 💡 **Counterfactual Recommendations** | Top-3 actionable habit changes ranked by predicted score impact (e.g. "+4.8 marks if you attend 95%") |
| 🔬 **What-If Simulator** | Real-time slider-based tool to simulate score changes without saving to the database |
| 🤝 **AI Study Coach** | Conversational Gemini 2.5 Flash powered coach that generates custom study schedules and advice |
| 📑 **Save Study Plans** | Students can save AI-generated study plans to their dashboard for future reference |
| 🏫 **Teacher Dashboard** | Aggregate view of all students with their risk levels, predicted scores, and key recommendations |
| 📈 **Model Benchmarking** | Side-by-side comparison of Linear Regression, Random Forest, XGBoost, and LightGBM (R², MAE, RMSE) |
| 🔐 **JWT Authentication** | Secure token-based auth with bcrypt password hashing and role-based access control |
| 🌐 **Offline Sandbox Mode** | Guest student/teacher mode for demo purposes when the database is unavailable |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
│            Next.js 14 Frontend (TypeScript)                  │
│   ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐ │
│   │  Login/  │ │Questionnaire│ │ Student  │ │   Teacher   │ │
│   │ Register │ │    Page    │ │Dashboard │ │  Dashboard  │ │
│   └──────────┘ └────────────┘ └──────────┘ └─────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python 3.11+)                  │
│                                                              │
│  /api/auth       /api/questionnaire  /api/analytics          │
│  /api/coach                                                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Auth Service│  │  ML Service  │  │    LLM Service    │  │
│  │  (JWT/bcrypt)│  │ (LightGBM +  │  │  (Gemini 2.5     │  │
│  │              │  │    SHAP)     │  │     Flash)        │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
└──────────────────┬──────────────────────────┬───────────────┘
                   │ SQLAlchemy ORM            │ Google AI SDK
                   ▼                           ▼
       ┌───────────────────────┐    ┌─────────────────────┐
       │  Neon PostgreSQL DB   │    │  Google Gemini API  │
       │  (Serverless Cloud)   │    │  (gemini-2.5-flash) │
       │                       │    └─────────────────────┘
       │  Tables:              │
       │  • users              │
       │  • questionnaire_     │
       │    responses          │
       │  • predictions        │
       │  • study_plans        │
       └───────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ML Engine (Offline)                      │
│                                                              │
│  generate_synthetic_data.py → data/raw/synthetic_students.csv│
│                ↓                                             │
│  src/data_pipeline.py → OrdinalEncoder → processed_features  │
│                ↓                                             │
│  src/train.py → LR + RF + XGBoost + LightGBM benchmark      │
│                ↓                                             │
│  models/lightgbm_student_model.pkl                           │
│  models/baseline_encoder.joblib                              │
│  models/model_comparison.json                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11+ | Core runtime |
| **FastAPI** | ≥0.110.0 | REST API framework with auto-generated OpenAPI docs |
| **SQLAlchemy** | ≥2.0.0 | ORM for PostgreSQL interaction |
| **Pydantic v2** | ≥2.6.0 | Request/response validation and settings management |
| **pydantic-settings** | ≥2.2.0 | Environment variable loading with `.env` support |
| **python-jose** | ≥3.3.0 | JWT token creation and verification |
| **passlib[bcrypt]** | ≥1.7.4 | Secure password hashing (bcrypt algorithm) |
| **bcrypt** | 4.0.1 | Bcrypt binary dependency (pinned for compatibility) |
| **python-multipart** | ≥0.0.9 | Form data parsing (required by OAuth2PasswordRequestForm) |
| **psycopg2-binary** | ≥2.9.9 | PostgreSQL database driver |
| **uvicorn** | ≥0.28.0 | ASGI server for running FastAPI |

### ML / AI Libraries
| Technology | Version | Purpose |
|---|---|---|
| **scikit-learn** | ≥1.4.0 | OrdinalEncoder, LinearRegression, RandomForest, train_test_split, metrics |
| **LightGBM** | ≥4.3.0 | Primary production regression model (best R²) |
| **XGBoost** | ≥2.0.0 | Benchmark comparison model |
| **SHAP** | ≥0.45.0 | Feature importance / explainability values |
| **joblib** | ≥1.3.0 | Model serialization (`.pkl`, `.joblib`) |
| **pandas** | (via scikit-learn) | Data wrangling and feature engineering |
| **numpy** | (via scikit-learn) | Numerical computations and data generation |
| **google-generativeai** | ≥0.4.0 | Gemini 2.5 Flash AI coach integration |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2.3 | React framework with App Router and SSR |
| **TypeScript** | ^5.4.5 | Type-safe JavaScript throughout the frontend |
| **Tailwind CSS** | ^3.4.3 | Utility-first CSS framework for dark UI design |
| **Recharts** | ^2.12.7 | React charting library for SHAP bar charts, score gauges |
| **Axios** | ^1.6.8 | HTTP client for API communication with interceptors |
| **Lucide React** | ^0.378.0 | Icon library (GraduationCap, BarChart2, Brain, etc.) |
| **react-markdown** | ^10.1.0 | Renders AI coach Markdown responses |
| **clsx + tailwind-merge** | — | Conditional class name merging utilities |
| **Plus Jakarta Sans / Outfit / Inter** | — | Google Fonts for premium typography |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Neon PostgreSQL** | Serverless cloud PostgreSQL (auto-scaling, SSL required) |
| **Google Gemini 2.5 Flash** | LLM for AI study coach conversational responses |

---

## 📁 Project Structure

```
LearnXPlan/
│
├── backend/                          # FastAPI Python Backend
│   ├── .env                          # Environment variables (DO NOT COMMIT)
│   ├── .env.example                  # Template for environment setup
│   ├── requirements.txt              # Python package dependencies
│   └── app/
│       ├── main.py                   # FastAPI app init, CORS, router mounting
│       ├── config.py                 # Pydantic Settings (loads .env)
│       ├── database.py               # SQLAlchemy engine + session factory
│       │
│       ├── models/                   # SQLAlchemy ORM table definitions
│       │   ├── user.py               # users table
│       │   ├── response.py           # questionnaire_responses table
│       │   ├── prediction.py         # predictions table
│       │   └── plan.py               # study_plans table
│       │
│       ├── schemas/                  # Pydantic request/response schemas
│       │   ├── user.py               # UserCreate, UserResponse, Token, TokenData
│       │   ├── response.py           # ResponseCreate, ResponseOut
│       │   ├── prediction.py         # PredictionOut, WhatIfRequest
│       │   └── plan.py               # PlanCreate, PlanOut
│       │
│       ├── api/                      # Route handlers (controllers)
│       │   ├── __init__.py           # Router exports
│       │   ├── auth.py               # /api/auth/* — register, login, /me
│       │   ├── questionnaire.py      # /api/questionnaire/* — submit, latest
│       │   ├── analytics.py          # /api/analytics/* — what-if, model-comparison, aggregate
│       │   └── coach.py              # /api/coach/* — chat, save plan, get plans
│       │
│       └── services/                 # Business logic layer
│           ├── ml_service.py         # Prediction engine (LightGBM + SHAP + counterfactuals)
│           └── llm_service.py        # Gemini AI coach response generator
│
├── frontend/                         # Next.js TypeScript Frontend
│   ├── package.json                  # npm dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.js            # Tailwind CSS theme config
│   ├── postcss.config.js             # PostCSS config for Tailwind
│   └── src/
│       ├── app/                      # Next.js App Router pages
│       │   ├── layout.tsx            # Root layout (fonts, meta)
│       │   ├── globals.css           # Global CSS + CSS variables + Tailwind
│       │   ├── page.tsx              # Landing/home page
│       │   ├── login/
│       │   │   └── page.tsx          # Login + Register page
│       │   ├── questionnaire/
│       │   │   └── page.tsx          # 12-factor habit input questionnaire
│       │   ├── dashboard/
│       │   │   └── page.tsx          # Student dashboard (score, SHAP, plans, coach)
│       │   └── teacher/
│       │       └── page.tsx          # Teacher aggregate analytics dashboard
│       │
│       ├── components/               # Reusable React components
│       │   ├── ai-coach-chat.tsx     # Full AI coach chat panel component
│       │   ├── what-if-panel.tsx     # What-If score simulator component
│       │   ├── charts/
│       │   │   └── recharts-wrapper.tsx  # SSR-safe dynamic Recharts loader
│       │   └── ui/
│       │       └── button.tsx        # Reusable Button component
│       │
│       ├── lib/
│       │   └── api.ts                # Axios instance + JWT interceptor
│       │
│       └── types/
│           └── index.ts              # TypeScript interfaces (User, Prediction, etc.)
│
└── ml_engine/                        # Offline ML Training Pipeline
    ├── generate_synthetic_data.py    # Synthetic student dataset generator (500 samples)
    ├── data/
    │   ├── raw/
    │   │   └── synthetic_students.csv    # Raw generated data
    │   └── processed/
    │       └── processed_features.csv   # Encoded/preprocessed features
    ├── models/                           # Trained model artifacts
    │   ├── lightgbm_student_model.pkl    # Best model (LightGBM)
    │   ├── baseline_encoder.joblib       # Fitted OrdinalEncoder
    │   └── model_comparison.json        # Benchmark metrics (R², MAE, RMSE)
    ├── src/
    │   ├── data_pipeline.py             # Preprocessing: encoding + feature selection
    │   └── train.py                     # Model training + benchmarking + export
    └── notebooks/                        # Jupyter notebooks (exploration)
```

---

## 🗄️ Database Schema

The application uses **4 PostgreSQL tables** managed by SQLAlchemy ORM. Tables are auto-created on startup via `Base.metadata.create_all(bind=engine)`.

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | User email address (used as login username) |
| `name` | VARCHAR(100) | NOT NULL | Full display name |
| `hashed_password` | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| `role` | VARCHAR(20) | DEFAULT 'student' | Either `'student'` or `'teacher'` |
| `created_at` | TIMESTAMP WITH TZ | server_default=now() | Account creation timestamp |

### `questionnaire_responses`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique response ID |
| `user_id` | UUID | FK → users.id, CASCADE | Owner of this response |
| `study_hours_per_week` | FLOAT | NOT NULL | Hours spent studying per week (0–168) |
| `attendance_rate` | FLOAT | NOT NULL | Class attendance percentage (0–100) |
| `sleep_hours_per_day` | FLOAT | NOT NULL | Average sleep duration (0–24) |
| `screen_time_per_day` | FLOAT | NOT NULL | Daily recreational screen time (0–24) |
| `physical_activity_hours_per_week` | FLOAT | NOT NULL | Weekly exercise hours (0–168) |
| `study_consistency` | FLOAT | NOT NULL | Regularity score (0.0=cramming, 1.0=daily) |
| `parental_involvement` | VARCHAR | NOT NULL | 'Low', 'Medium', or 'High' |
| `access_to_resources` | VARCHAR | NOT NULL | 'Low', 'Medium', or 'High' |
| `family_income` | VARCHAR | NOT NULL | 'Low', 'Medium', or 'High' |
| `motivation_level` | VARCHAR | NOT NULL | 'Low', 'Medium', or 'High' |
| `internet_access` | BOOLEAN | NOT NULL | Has reliable internet access |
| `extracurricular` | BOOLEAN | NOT NULL | Participates in extracurricular activities |
| `created_at` | TIMESTAMP WITH TZ | server_default=now() | Submission timestamp |

### `predictions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique prediction ID |
| `user_id` | UUID | FK → users.id, CASCADE, INDEXED | Student who owns this prediction |
| `response_id` | UUID | FK → questionnaire_responses.id, CASCADE | The response this prediction is based on |
| `predicted_score` | FLOAT | NOT NULL | Predicted exam score (30.0–100.0) |
| `confidence_score` | FLOAT | NOT NULL | Model confidence (0.85–0.97) |
| `risk_level` | VARCHAR(20) | NOT NULL | 'Low' (≥75), 'Medium' (≥50), 'High' (<50) |
| `feature_importance` | TEXT | NOT NULL | JSON string of SHAP values per feature |
| `recommendations` | TEXT | NOT NULL | JSON string of top-3 counterfactual suggestions |
| `created_at` | TIMESTAMP WITH TZ | server_default=now() | Prediction timestamp |

### `study_plans`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique plan ID |
| `user_id` | UUID | FK → users.id, CASCADE, INDEXED | Student who owns this plan |
| `plan_content` | TEXT | NOT NULL | Full AI-generated study plan text (Markdown) |
| `created_at` | TIMESTAMP WITH TZ | server_default=now() | Plan creation timestamp |

---

## 🧠 ML Engine Deep Dive

The ML engine is a **fully independent offline pipeline** located in `ml_engine/`. It must be run once to produce the model artifacts (`.pkl`, `.joblib`, `.json`) that the backend loads at startup.

### Step 1 — Synthetic Data Generation (`generate_synthetic_data.py`)

Generates a **500-sample synthetic student dataset** using realistic statistical distributions:

| Feature | Distribution | Parameters |
|---|---|---|
| `attendance_rate` | Normal | μ=83%, σ=10% → clipped [40, 100] |
| `study_hours_per_week` | Gamma | shape=3, scale=4 → mean ≈12 hrs, clipped [1, 40] |
| `sleep_hours_per_day` | Normal | μ=7 hrs, σ=1 hr → clipped [4, 10] |
| `screen_time_per_day` | Normal | μ=4 hrs, σ=1.8 → clipped [0.5, 12] |
| `physical_activity_hours_per_week` | Gamma | shape=2, scale=2.5 → mean ≈5 hrs |
| `study_consistency` | Beta | a=5, b=3 → skewed high (0.0–1.0) |
| `parental_involvement` | Categorical | Low=20%, Medium=55%, High=25% |
| `access_to_resources` | Categorical | Low=15%, Medium=60%, High=25% |
| `family_income` | Categorical | Low=25%, Medium=50%, High=25% |
| `motivation_level` | Categorical | Low=15%, Medium=55%, High=30% |
| `internet_access` | Boolean | 88% True, 12% False |
| `extracurricular` | Boolean | 55% True, 45% False |

**Target variable (`exam_score`)** is computed deterministically from features with ±3.5 Gaussian noise:
```
score = 55.0
      + (attendance - 80.0) × 0.4
      + (study_hours - 12.0) × 0.6
      + (sleep - 7.0) × 1.5
      + (4.0 - screen_time) × 1.0
      + (activity - 5.0) × 0.3
      + (consistency - 0.6) × 10.0
      + parental_involvement_bonus  # High=+4.5, Low=-4.5
      + resources_bonus             # High=+5.0, Low=-5.0
      + income_bonus                # High=+3.0, Low=-3.0
      + motivation_bonus            # High=+5.0, Low=-5.0
      + internet_access × 3.5
      + extracurricular × 1.5
      + noise (Normal, σ=3.5)
```
Final score is clipped to **[30.0, 100.0]**.

### Step 2 — Preprocessing Pipeline (`src/data_pipeline.py`)

1. Loads the raw CSV
2. Renames columns to the internal schema if using external datasets
3. Generates `screen_time_per_day` and `study_consistency` if missing (for external datasets)
4. Converts Yes/No internet/extracurricular columns to integer (1/0)
5. Applies **OrdinalEncoder** to the 4 categorical features with fixed categories `["Low", "Medium", "High"]` → encoded as [0, 1, 2]
6. Exports `data/processed/processed_features.csv`
7. Saves the fitted encoder to `models/baseline_encoder.joblib`

### Step 3 — Model Training & Benchmarking (`src/train.py`)

Trains **4 regression models** and computes evaluation metrics on a 80/20 train/test split:

| Model | Typical R² | Typical MAE | Typical RMSE |
|---|---|---|---|
| Linear Regression | 0.762 | 3.12 | 4.10 |
| Random Forest | 0.845 | 2.21 | 2.94 |
| XGBoost | 0.884 | 1.95 | 2.45 |
| **LightGBM** *(selected)* | **0.902** | **1.78** | **2.21** |

- Benchmark results are saved to `models/model_comparison.json`
- The best model (LightGBM if available, else Random Forest) is serialized to `models/lightgbm_student_model.pkl`

### Runtime Inference (`app/services/ml_service.py`)

At prediction time, `MLService.predict(data)` performs:

1. **Raw score prediction** — Runs the input through the loaded LightGBM model (or falls back to the heuristic formula if the model file isn't found)
2. **Risk classification** — `Low` (≥75), `Medium` (≥50), `High` (<50)
3. **Confidence scoring** — Base 0.85, +0.03 if attendance > 90%, +0.02 if consistency > 0.8, capped at 0.97
4. **SHAP values** — Per-feature marginal contribution computed inline (linear SHAP approximation aligned with training weights)
5. **Counterfactual recommendations** — For each improvable feature (attendance < 90%, sleep < 7 hrs, study < 15 hrs/wk, screen > 4.5 hrs, consistency < 0.7), simulates the "recommended" value and computes the score delta. Top-3 by impact are returned.

---

## 🔌 Backend API Reference

The backend is a **FastAPI** application. Full interactive documentation is available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

All endpoints (except `/api/auth/register` and `/api/auth/login`) require a **Bearer JWT token** in the `Authorization` header.

### Authentication — `/api/auth`

#### `POST /api/auth/register`
Register a new user account.

**Request Body** (JSON):
```json
{
  "name": "Alex Mercer",
  "email": "alex@school.edu",
  "password": "SecurePass123",
  "role": "student"
}
```
- `name` — Required. Cannot be blank/whitespace only.
- `email` — Valid email format required (Pydantic EmailStr validation).
- `password` — 8–72 characters, must include at least one lowercase, one uppercase, and one digit.
- `role` — Must be exactly `"student"` or `"teacher"` (validated by enum).

**Response** (201 Created):
```json
{
  "id": "uuid",
  "email": "alex@school.edu",
  "name": "Alex Mercer",
  "role": "student",
  "created_at": "2026-06-05T12:00:00Z"
}
```

---

#### `POST /api/auth/login`
Login with email and password. Uses OAuth2 form data format.

**Request Body** (`application/x-www-form-urlencoded`):
```
username=alex@school.edu&password=SecurePass123
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- Token expires in **60 minutes**.
- JWT payload includes: `sub` (email), `role`, `exp`.

---

#### `GET /api/auth/me`
Fetch the currently authenticated user's profile.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "alex@school.edu",
  "name": "Alex Mercer",
  "role": "student",
  "created_at": "2026-06-05T12:00:00Z"
}
```

---

### Questionnaire — `/api/questionnaire`

#### `POST /api/questionnaire/submit`
Submit a student habit questionnaire. Triggers ML prediction and saves both the response and prediction to the database.

**Headers**: `Authorization: Bearer <token>`

**Request Body** (JSON):
```json
{
  "study_hours_per_week": 14.0,
  "attendance_rate": 88.0,
  "sleep_hours_per_day": 7.5,
  "screen_time_per_day": 3.0,
  "physical_activity_hours_per_week": 5.0,
  "study_consistency": 0.75,
  "parental_involvement": "Medium",
  "access_to_resources": "High",
  "family_income": "Medium",
  "motivation_level": "High",
  "internet_access": true,
  "extracurricular": true
}
```

**Field Constraints**:
| Field | Type | Range/Values |
|---|---|---|
| `study_hours_per_week` | float | 0–168 |
| `attendance_rate` | float | 0.0–100.0 |
| `sleep_hours_per_day` | float | 0–24 |
| `screen_time_per_day` | float | 0–24 |
| `physical_activity_hours_per_week` | float | 0–168 |
| `study_consistency` | float | 0.0–1.0 |
| `parental_involvement` | string | "Low", "Medium", "High" |
| `access_to_resources` | string | "Low", "Medium", "High" |
| `family_income` | string | "Low", "Medium", "High" |
| `motivation_level` | string | "Low", "Medium", "High" |
| `internet_access` | boolean | true / false |
| `extracurricular` | boolean | true / false |

**Response** (200 OK):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "response_id": "uuid",
  "predicted_score": 78.4,
  "confidence_score": 0.88,
  "risk_level": "Low",
  "feature_importance": {
    "attendance_rate": 3.2,
    "study_hours_per_week": 1.2,
    "sleep_hours_per_day": 0.75,
    "screen_time_per_day": 1.0,
    "study_consistency": 1.5,
    "parental_involvement": 0.0,
    "access_to_resources": 5.0,
    "motivation_level": 5.0
  },
  "recommendations": [
    {
      "feature": "attendance_rate",
      "current": "88.0%",
      "recommended": "95%",
      "impact": 2.8
    }
  ],
  "created_at": "2026-06-05T12:00:00Z"
}
```

---

#### `GET /api/questionnaire/latest`
Retrieve the most recent questionnaire submission for the authenticated student.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK): Returns a `ResponseOut` object with all 12 habit fields + `id`, `user_id`, `created_at`.

---

### Analytics — `/api/analytics`

#### `POST /api/analytics/what-if`
Simulate a score prediction with modified inputs **without saving to the database**. Designed for the real-time What-If slider tool.

**Headers**: `Authorization: Bearer <token>`

**Request Body**: Same schema as `POST /api/questionnaire/submit` (uses `WhatIfRequest` schema).

**Response**: Same structure as `PredictionOut` but without `id`, `user_id`, `response_id`, or `created_at` (raw prediction result).

---

#### `GET /api/analytics/model-comparison`
Returns the benchmark metrics for all trained regression models. Used in the Teacher Dashboard model comparison chart.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
[
  {"model_name": "Linear Regression", "r2_score": 0.762, "mae": 3.12, "rmse": 4.10, "is_trained": true},
  {"model_name": "Random Forest",     "r2_score": 0.845, "mae": 2.21, "rmse": 2.94, "is_trained": true},
  {"model_name": "XGBoost",           "r2_score": 0.884, "mae": 1.95, "rmse": 2.45, "is_trained": true},
  {"model_name": "LightGBM",          "r2_score": 0.902, "mae": 1.78, "rmse": 2.21, "is_trained": true}
]
```

---

#### `GET /api/analytics/aggregate`
Returns aggregate prediction data across all students. **Restricted to `teacher` role only.**

**Headers**: `Authorization: Bearer <token>` (must be teacher role)

**Response**: Array of student prediction summaries including `email`, `full_name`, `predicted_score`, `confidence_score`, `risk_level`, `feature_importance`, `recommendations`, `created_at`.

Returns **403 Forbidden** if called by a student role.

---

### Coach — `/api/coach`

#### `POST /api/coach/chat`
Send a message to the AI study coach. The coach automatically retrieves the student's latest questionnaire response and prediction from the database and fuses them into the AI prompt.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "message": "How can I improve my study schedule?"
}
```

**Response**:
```json
{
  "response": "Hello! Based on your current metrics, your predicted exam score is 78.4/100 (Low Risk). Here are the most impactful changes you can make..."
}
```
The coach operates in two modes:
- **Online mode** (GEMINI_API_KEY configured): Full Gemini 2.5 Flash conversational response with student profile context
- **Offline/fallback mode**: Rules-based heuristic response using prediction data

---

#### `POST /api/coach/plans`
Save an AI-generated study plan to the student's dashboard.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "plan_content": "## Week 1 Study Plan\n\n**Monday**: Math 2hrs, Physics 1.5hrs..."
}
```

**Response**: `PlanOut` object with `id`, `user_id`, `plan_content`, `created_at`.

---

#### `GET /api/coach/plans`
Retrieve all saved study plans for the authenticated student, ordered newest first.

**Headers**: `Authorization: Bearer <token>`

**Response**: Array of `PlanOut` objects.

---

## 🖥️ Frontend Pages & Components

### Pages

#### `/` — Landing Page (`app/page.tsx`)
The public-facing landing page. Explains the platform features, showcases the ML capabilities, and provides clear CTAs to the login/register page.

#### `/login` — Authentication Page (`app/login/page.tsx`)
Dual-mode form for both **Sign In** and **Register** flows. Features:
- Animated tab switcher between Sign In / Register
- Full form validation with clear error messages
- Auto-login after successful registration
- Post-login redirect logic (student → questionnaire or dashboard based on survey completion, teacher → teacher dashboard)
- **Guest/Sandbox Mode** buttons for offline demo (sets mock localStorage tokens)

#### `/questionnaire` — Habit Input Form (`app/questionnaire/page.tsx`)
A multi-step form collecting all 12 habit metrics:
- **Numeric inputs** (sliders + number fields): study hours, attendance, sleep, screen time, physical activity, consistency
- **Categorical selectors** (radio buttons): parental involvement, resource access, family income, motivation (Low/Medium/High)
- **Boolean toggles**: internet access, extracurricular participation
- On submit: calls `POST /api/questionnaire/submit`, receives prediction, redirects to `/dashboard`

#### `/dashboard` — Student Dashboard (`app/dashboard/page.tsx`)
The main student interface. Composed of multiple panels:
1. **Score Card** — Large animated display of predicted score (e.g. "78.4 / 100") with risk level badge and confidence percentage
2. **SHAP Feature Importance Chart** — Recharts horizontal bar chart showing which habits helped/hurt the score (green = positive, red = negative)
3. **Recommendations Panel** — Top-3 counterfactual cards showing current vs recommended habit and predicted score gain
4. **What-If Simulator** — Embedded `<WhatIfPanel />` component with sliders for real-time score simulation
5. **AI Coach Chat** — Embedded `<AiCoachChat />` component for conversational coaching
6. **Saved Study Plans** — List of previously saved AI-generated plans

#### `/teacher` — Teacher Dashboard (`app/teacher/page.tsx`)
Admin-level analytics view (restricted to teacher role):
1. **Class Overview** — Total students, average predicted score, risk distribution counts
2. **Student Records Table** — Sortable table with all students' names, emails, risk levels, predicted scores
3. **Model Benchmark Chart** — Bar chart comparing R², MAE, RMSE across all 4 ML models

### Components

#### `<AiCoachChat />` (`components/ai-coach-chat.tsx`)
Full-featured conversational chat interface:
- Message history with user/assistant roles
- Markdown rendering via `react-markdown` for formatted coach responses
- Calls `POST /api/coach/chat` on send
- "Save Plan" button appears on coach responses, triggers `POST /api/coach/plans`
- Typing indicator animation during AI response generation

#### `<WhatIfPanel />` (`components/what-if-panel.tsx`)
Real-time what-if simulation tool:
- Sliders for all numerical habit inputs pre-populated with the student's current values
- Debounced API calls to `POST /api/analytics/what-if` (no DB writes)
- Live score update display with animated transitions
- Side-by-side comparison of current vs simulated score

#### `<RechartsWrapper />` (`components/charts/recharts-wrapper.tsx`)
A dynamic import wrapper for Recharts components. Solves Next.js SSR incompatibility with Recharts (which requires a browser `window` object) by using `next/dynamic` with `ssr: false`.

#### `<Button />` (`components/ui/button.tsx`)
Reusable button component with `variant` props (primary, secondary, ghost) using `clsx` and `tailwind-merge` for conditional styling.

### Design System (`app/globals.css`)
CSS variables defined in `:root` for consistent theming:
```css
--background: #020617   /* Slate-950 near-black */
--foreground: #f8fafc   /* Slate-50 near-white */
--primary:    #6366f1   /* Indigo-500 */
--card:       #0f172a   /* Slate-900 */
--border:     #1e293b   /* Slate-800 */
```
Fonts: **Inter** (body), **Outfit + Plus Jakarta Sans** (headings) via Google Fonts.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- **Python 3.11+** — [Download](https://python.org/downloads)
- **Node.js 18+ and npm** — [Download](https://nodejs.org)
- **Git** — [Download](https://git-scm.com)
- A **Neon PostgreSQL** account (free tier works) — [Sign up](https://neon.tech)
- A **Google AI Studio** account for the Gemini API key (optional) — [Sign up](https://aistudio.google.com)

---

### Clone the Repository

```bash
git clone https://github.com/Tinku785/learnXplan-Study-habit-analysis-and-performance-prediction.git
cd learnXplan-Study-habit-analysis-and-performance-prediction
```

---

## 🔑 Environment Variables

Create `backend/.env` by copying the example:

```bash
cp backend/.env.example backend/.env
```

Then fill in your values:

```ini
# ─── App ───────────────────────────────────────────────────────────
APP_ENV=development

# ─── Security ──────────────────────────────────────────────────────
# Generate a strong key: python -c "import secrets; print(secrets.token_hex(64))"
SECRET_KEY=your-strong-random-secret-key-here

# ─── Database ──────────────────────────────────────────────────────
# Get this from your Neon dashboard → Connection String
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require&channel_binding=require"

# ─── CORS ──────────────────────────────────────────────────────────
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]

# ─── AI / ML ───────────────────────────────────────────────────────
# Get from: https://aistudio.google.com/app/apikey
# Leave empty to use the offline rules-based fallback coach
GEMINI_API_KEY=your-gemini-api-key-here

# ─── ML Model Paths ────────────────────────────────────────────────
ML_MODEL_PATH=../ml_engine/models/lightgbm_student_model.pkl
ML_ENCODER_PATH=../ml_engine/models/baseline_encoder.joblib
ML_COMPARISON_PATH=../ml_engine/models/model_comparison.json
```

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ Yes | JWT signing key — must be long, random, and secret |
| `DATABASE_URL` | ✅ Yes | Full PostgreSQL connection string with SSL parameters |
| `CORS_ORIGINS` | ✅ Yes | JSON array of allowed frontend origins |
| `GEMINI_API_KEY` | ❌ Optional | Enables full AI coach; falls back to rules engine if missing |
| `ML_MODEL_PATH` | ✅ Yes | Path to trained LightGBM `.pkl` file |
| `ML_ENCODER_PATH` | ✅ Yes | Path to fitted OrdinalEncoder `.joblib` file |
| `ML_COMPARISON_PATH` | ✅ Yes | Path to model benchmark metrics `.json` file |

> ⚠️ **IMPORTANT**: Never commit your `.env` file to version control. It is in `.gitignore`.

---

## 🤖 Running the ML Pipeline

The ML pipeline must be run **once** before starting the backend. It generates the model files the backend loads.

```bash
# Navigate to the ml_engine directory
cd ml_engine

# Step 1: Generate synthetic training data (500 student samples)
python generate_synthetic_data.py
# Output: data/raw/synthetic_students.csv

# Step 2 & 3: Run the full preprocessing + training pipeline
python src/train.py
# This will:
# → Preprocess raw data → data/processed/processed_features.csv
# → Save encoder    → models/baseline_encoder.joblib
# → Train all 4 models and benchmark them
# → Save best model → models/lightgbm_student_model.pkl
# → Save metrics    → models/model_comparison.json
```

Expected output:
```
Generated 500 expanded samples at: data/raw/synthetic_students.csv
Preprocessing pipeline complete.
--- Training Model Benchmark Suite ---
Training Linear Regression... Linear Regression -> R2: 0.762 | MAE: 3.12 | RMSE: 4.10
Training Random Forest...     Random Forest     -> R2: 0.845 | MAE: 2.21 | RMSE: 2.94
Training XGBoost...           XGBoost           -> R2: 0.884 | MAE: 1.95 | RMSE: 2.45
Training LightGBM...          LightGBM          -> R2: 0.902 | MAE: 1.78 | RMSE: 2.21
Benchmarking reports exported to: models/model_comparison.json
Trained model saved to: models/lightgbm_student_model.pkl
```

---

## 🖥️ Running the Backend

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:
- **API Base**: `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

On first startup, SQLAlchemy automatically creates all database tables in your Neon PostgreSQL instance.

---

## 🌐 Running the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

> The frontend automatically points to `http://localhost:8000/api` as the API base URL. To change this, set `NEXT_PUBLIC_API_URL` in a `frontend/.env.local` file.

---

## 👥 User Roles & Access Control

### Student Role
- ✅ Register and login
- ✅ Submit questionnaire (creates prediction)
- ✅ View personal dashboard with score, SHAP chart, recommendations
- ✅ Use What-If simulator (real-time, no DB writes)
- ✅ Chat with AI Study Coach
- ✅ Save and view AI-generated study plans
- ❌ Cannot access teacher aggregate dashboard

### Teacher Role
- ✅ Register and login (role selected at registration)
- ✅ View all students' predictions and risk levels (`GET /api/analytics/aggregate`)
- ✅ View model benchmark comparison chart
- ❌ Cannot submit a student questionnaire (not student-facing)

> **Note**: Role is selected by the user at registration time. In a production environment, you should restrict teacher role creation to invite-only or admin-controlled mechanisms.

---

## 📐 How Predictions Work

Here is the complete flow from form submission to rendered dashboard:

```
Student fills questionnaire form (12 inputs)
         ↓
POST /api/questionnaire/submit
         ↓
QuestionnaireResponse saved to PostgreSQL
         ↓
ml_service.predict(data) called
   ├─ _predict_raw(data)
   │    ├─ If model loaded: LightGBM.predict(encoded_df)
   │    └─ If model missing: heuristic formula
   │
   ├─ Risk level: score ≥ 75 → Low, ≥ 50 → Medium, < 50 → High
   │
   ├─ Confidence: base 0.85 + bonuses for high attendance/consistency
   │
   ├─ SHAP values: per-feature marginal contribution (inline calculation)
   │    e.g. attendance_rate SHAP = (attendance - 80.0) × 0.4
   │
   └─ Recommendations: for each improvable feature:
        simulate recommended value → compute new score → impact = Δscore
        return top-3 by impact
         ↓
Prediction saved to PostgreSQL
         ↓
PredictionOut JSON returned to frontend
         ↓
Dashboard renders:
   • Score gauge card
   • SHAP Recharts bar chart
   • Recommendation cards
   • What-If simulator (pre-loaded with current values)
```

---

## 🤝 AI Coach (Gemini Integration)

The AI Study Coach is powered by **Google Gemini 2.5 Flash** via the `google-generativeai` Python SDK.

### How It Works

When a student sends a chat message, the backend:
1. Queries the database for their **latest questionnaire response**
2. Queries the database for their **latest prediction** (score, risk, recommendations)
3. Builds a rich **system context** fusing all of this student data into the Gemini prompt:
   ```
   You are 'LearnXPlan AI Coach', a professional academic advisor...
   Student Current Metrics:
   - Predicted Exam Grade: 78.4/100
   - Class Risk Level: Low
   - Study Hours: 14 hrs/week
   - Class Attendance: 88%
   - Sleep Duration: 7.5 hrs/day
   - Key Recommendations: improve attendance_rate from 88.0% to 95% (+2.8 marks predicted)
   ```
4. Appends the student's question: `Student Query: 'How can I improve?'`
5. Sends to `gemini-2.5-flash` model via `GenerativeModel.generate_content()`
6. Returns the response text to the frontend

### Fallback Mode
If `GEMINI_API_KEY` is not configured or the API call fails, the coach falls back to a **rules-based heuristic** that formats the prediction data and top recommendations into a helpful Markdown response. All features work without the Gemini API.

---

## 🎭 Guest / Sandbox Mode

The login page includes two guest mode buttons for testing without a database connection:

| Guest Type | Stored Token | Stored Role | Redirect |
|---|---|---|---|
| Guest Student | `"mock-session-token"` | `"student"` | `/questionnaire` |
| Guest Teacher | `"mock-session-token"` | `"teacher"` | `/teacher` |

> **Note**: Guest mode is a **frontend-only bypass**. The mock token will be rejected by all real API endpoints (the backend verifies JWT signatures). Guest mode only allows navigation through the frontend UI without live data.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add some feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Commit Convention
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code restructure without feature change
- `chore:` — build/tooling changes

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using FastAPI, Next.js, LightGBM, and Google Gemini AI

**[⭐ Star this repo](https://github.com/Tinku785/learnXplan-Study-habit-analysis-and-performance-prediction)** if you find it useful!

</div>
