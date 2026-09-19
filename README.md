# JANSETU AI
### "From Citizen Voice to Development Priority"

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvivekkcodes%2Fjansetu-ai&root-directory=frontend)

An AI-powered **Development Intelligence and Priority Engine** that bridges the gap between fragmented citizen grievances and strategic public infrastructure investments.

---

## 1. Problem
Governments struggle to consolidate citizen development requests because information is fragmented across disparate call centers, paper petitions, and disconnected departmental grievance ticketing systems. 

This causes:
- **Infrastructure Blindspots**: 500 citizens complaining about the same washed-out culvert are treated as 500 isolated, competing tickets rather than a single acute development gap.
- **Misaligned Capital Allocations**: Public investments are frequently deployed without objective, geographically aggregated citizen demand data.
- **Inability to Measure Impact**: Authorities have no closed-loop mechanism to evaluate whether a completed public works project actually resolved the underlying community distress.

---

## 2. Solution: JanSetu AI
JanSetu AI transforms unstructured citizen complaints across voice, conversational text, and photos into structured, geographically grounded **Development Intelligence**.

Instead of a traditional grievance portal saying:
> *"Complaint received. Forwarded to local desk."*

JanSetu AI identifies and explains:
> *"647 related citizen reports indicate a high-priority rural road connectivity gap affecting ~8,420 people and reducing access to healthcare facilities."*

---

## 3. The Core Workflow

```
Citizen Input (Voice / Text / Image)
  ↓
Multilingual AI Understanding (Hindi / English / Local dialects)
  ↓
Location & Privacy Preservation (Geocoding & Spatial Anonymization)
  ↓
Issue & Severity Classification (Hazard extraction & Service mapping)
  ↓
Spatial & Semantic Clustering (DBSCAN + TF-IDF cosine similarity)
  ↓
Demographic & Infrastructure Gap Correlation (Census 2021 & PMGSY)
  ↓
Transparent Mathematical Priority Engine (6-Factor Normalized Score)
  ↓
AI Recommendation & Explainability ("Why This Is Prioritized")
  ↓
Government Intelligence Dashboard (Map, Hotspots, Gaps, Analytics)
  ↓
Action Tracking & Project Lifecycle (Identified → Approved → Completed)
  ↓
Closed-Loop Impact Measurement (Before vs After Audits)
```

---

## 4. Key Innovations & Features

### A. Citizen Experience (Mobile-First Civic Portal)
- **🎤 Multilingual Browser Voice Input**: Integrated with Web Speech API for seamless Hindi and English voice dictation, real-time live waveform indicator, instant transcription, and pre-submission text editing.
- **✍️ Conversational Text Reporting**: Friendly natural-language input with one-click realistic sample prompts in Devanagari and English.
- **📷 AI Evidence Inspection**: Image upload with automated visual detection (e.g., potholes, pipeline fractures, effluent waterlogging) clearly tagged as **"AI Observation"** to prevent misleading legal claims.
- **📍 Multi-Option Location Selection**: HTML5 Geolocation with reverse geocoding, district/ward dropdown, or interactive Leaflet map pin placement.
- **🛡️ Anonymous by Default**: No mandatory login required for citizens; exact home coordinates are spatially aggregated to safeguard privacy.

### B. Government / Admin Intelligence Dashboard
- **🗺️ Interactive Hotspot Map**: Prominent Leaflet map displaying spatial demand density clusters color-coded by priority (Critical = Red pulse, High = Orange, Moderate = Yellow).
- **📊 Real-Time Analytics & Gaps**: Executive KPI cards, category breakdown bar charts, priority distribution pie charts, and district-level infrastructure gap scores ($100 - \text{Existing Infrastructure Index}$).
- **🧮 Transparent 6-Factor Priority Engine**:
  $$\text{Priority} = 30\% \cdot \text{Demand} + 20\% \cdot \text{Population} + 20\% \cdot \text{InfraGap} + 15\% \cdot \text{Severity} + 10\% \cdot \text{CriticalService} + 5\% \cdot \text{Urgency}$$
  Configurable weight sliders allow administrators to calibrate the model.
- **🔍 Explainability Badges ("Why This Is Prioritized")**: Every hotspot provides a human-verifiable rationale checklist (e.g., *647 reports, emergency ambulance access blocked, 8,420 beneficiaries, 58/100 infrastructure gap*).
- **💡 Actionable AI Intervention Dossiers**: Comprehensive project proposals including problem summary, physical evidence, expected service impact, and required civil engineering verifications.
- **📌 Project Lifecycle Pipeline**: Kanban board tracking civic interventions through 6 statutory stages: `Identified` &rarr; `Verified` &rarr; `Proposed` &rarr; `Approved` &rarr; `In Progress` &rarr; `Completed`.
- **📈 Before vs After Impact Measurement**: Verified before/after metrics showing drop in citizen complaints (-70% to -88%), infrastructure index gains, and ambulance transit time reductions.
- **🤖 JanSetu AI Intelligence Assistant**: Database-grounded conversational agent with zero hallucination. Answers questions strictly from application records with verified data citations.
- **⚡ Live Simulation Mode**: Built-in hackathon demonstration feature allowing judges to inject bursts of incoming emergency reports and watch live clustering, priority re-scoring, and map updates.

---

## 5. Technology Stack

- **Frontend**:
  - React 18, Vite, TypeScript
  - Tailwind CSS, Lucide Icons
  - Leaflet & React-Leaflet (OpenStreetMap)
  - Recharts
- **Backend**:
  - Python 3.11 - 3.14
  - FastAPI (REST API with automatic OpenAPI Swagger docs)
  - Pydantic v2 (Strict schema validation)
  - SQLAlchemy 2.0 (ORM)
  - SQLite (zero-config local demo) / Supabase PostgreSQL (production)
- **Machine Learning & Spatial Algorithms**:
  - `scikit-learn`: DBSCAN for spatial clustering
  - `scikit-learn`: TF-IDF Vectorizer & Cosine Similarity for duplicate/related report detection
  - `numpy`: Distance matrix computation
- **AI & Vision Providers**:
  - Google Gemini 2.5 Flash API (Configurable)
  - Built-in High-Accuracy Multilingual Deterministic NLP Engine (Ensures 100% functionality even offline or without API keys)

---

## 6. Project Structure

```text
jansetu-ai/
├── frontend/                     # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Top navigation, language toggle, simulation trigger
│   │   │   └── AssistantDrawer.tsx# JanSetu AI grounded assistant drawer
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Public civic introduction & architecture flow
│   │   │   ├── CitizenPortal.tsx # Voice/Text/Image citizen reporting interface
│   │   │   └── AdminDashboard.tsx# Government analytics, map, kanban, and settings
│   │   ├── services/
│   │   │   └── api.ts            # Typed REST API client
│   │   ├── types/
│   │   │   └── index.ts          # Core TypeScript interfaces
│   │   ├── i18n/
│   │   │   └── translations.ts   # English & Hindi translation dictionaries
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # Python FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── reports.py        # Report submission, preview, and listing
│   │   │   ├── hotspots.py       # Hotspot ranking, detail, and merge/split
│   │   │   ├── priority.py       # Priority engine and weights configuration
│   │   │   ├── recommendations.py# Intervention dossiers
│   │   │   ├── projects.py       # Project lifecycle and kanban updates
│   │   │   ├── impact.py         # Before/after comparative measurements
│   │   │   ├── assistant.py      # Database-grounded chat assistant
│   │   │   ├── simulation.py     # Live simulation batch trigger
│   │   │   └── analytics.py      # KPI summaries and infrastructure gaps
│   │   ├── core/
│   │   │   ├── config.py         # Environment variables and default weights
│   │   │   └── database.py       # SQLAlchemy engine and session dependency
│   │   ├── models/
│   │   │   └── models.py         # Normalized database models
│   │   ├── schemas/
│   │   │   └── schemas.py        # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── ai_service.py     # Gemini client + Multilingual NLP fallback
│   │   │   ├── clustering.py     # DBSCAN spatial & TF-IDF similarity
│   │   │   ├── priority_engine.py# Mathematical transparent scoring formula
│   │   │   ├── vision_service.py # Evidence photo inspection
│   │   │   ├── recommendation_service.py # Intervention dossiers
│   │   │   └── data_adapters.py  # DPG adapter for Census and PMGSY data
│   │   └── main.py               # FastAPI entrypoint with CORS
│   ├── tests/
│   │   └── test_api.py           # Pytest test suite (100% pass)
│   └── requirements.txt
│
├── data/
│   └── seed_generator.py         # Seeds 5,280+ reports, hotspots, and demographics
├── scripts/
│   └── writer.py
├── .env.example
├── README.md
└── start.ps1                     # One-click startup script for Windows
```

---

## 7. Quickstart & Installation

### Prerequisites
- Python 3.10+ (tested through Python 3.14)
- Node.js 18+ and npm

### One-Click Launch (Windows PowerShell)
```powershell
.\start.ps1
```
This automatically verifies dependencies, seeds the 5,280+ record demo database if needed, launches the FastAPI backend on port 8000, and opens the frontend on port 5173!

---

### Manual Step-by-Step Setup

#### Step 1: Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
```

#### Step 2: Seed the Database
Populate 5,280+ realistic citizen reports across 5 districts (Varanasi, Gorakhpur, Prayagraj, Patna, Ranchi), demographic censuses, and active hotspots:
```bash
python ../data/seed_generator.py
```

#### Step 3: Run Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
- API Health Check: `http://localhost:8000/api/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

#### Step 4: Run Tests
```bash
python -m pytest tests/test_api.py -v
```

#### Step 5: Frontend Setup & Run
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser!

---

## 8. Environment Variables (`.env`)

Create a `.env` file in the project root:

```ini
# AI Provider ('gemini' or leave blank for deterministic rule fallback)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (defaults to local SQLite; supports Supabase PostgreSQL)
DATABASE_URL=sqlite:///./jansetu.db
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-supabase-key
```

*Note: JanSetu AI runs 100% seamlessly even without an API key thanks to its built-in multilingual NLP fallback engine.*

---

## 9. Hackathon Demo Walkthrough

1. **Visit Landing Page (`/`)**:
   - Inspect the 5-stage architecture flow: Citizen Voices &rarr; AI Understanding &rarr; Hotspot Clustering &rarr; Priority Engine &rarr; Development Action.
2. **Citizen Voice/Text Reporting (`/report`)**:
   - Switch language to **हिन्दी**.
   - Click the microphone [ 🎤 Speak ] to test live voice input (or select the sample prompt: *"हमारे गांव की सड़क बारिश में पूरी तरह खराब हो जाती है और एम्बुलेंस नहीं पहुंच पाती।"*).
   - Click **Submit Development Report**.
   - Watch the instant AI classification card extract: Category **"Road Infrastructure"**, Subcategory **"Rural Road Connectivity"**, Severity **9/10**, Urgency **9/10**, Affected Services **"Healthcare, Transportation"**.
3. **Government Intelligence Dashboard (`/admin`)**:
   - **Overview**: View executive KPIs across 5,280 reports and 37 hotspots.
   - **Interactive Map**: Pan the map to Varanasi East (`RD-2048`). Notice the red pulsing hotspot indicating 647+ consolidated reports.
   - **Hotspot Intelligence**: Click `RD-2048`. Review the 6-factor score (92.4/100) and the explainability checklist (*647 reports, ambulance transit blocked, 8,420 beneficiaries, 58/100 PMGSY gap*).
   - **AI Intervention Dossier**: Review the AI recommendation suggesting all-weather blacktopping under PMGSY Batch 2 with on-site PWD soil verification.
   - **Sanction Project**: Click [ Create Project ]. Watch it appear in the **Action Tracking Kanban**.
   - **Advance Pipeline**: Move the project from `Proposed` &rarr; `Approved` &rarr; `In Progress` &rarr; `Completed`.
   - **Impact Audit**: Switch to **Impact Measurement** tab. View before/after comparative charts showing a -88% drop in complaints and a +48.5 point gain in the road accessibility index.
4. **Interactive AI Assistant**:
   - Click the chat icon in the navigation bar to open the **JanSetu Intelligence Assistant**.
   - Click: *"Which development issue should the district administration investigate first?"*
   - Verify that the assistant answers with strict database grounding and verified record citations without hallucinating.
5. **Live Report Simulation**:
   - Click **"⚡ Simulate New Reports"** on the navbar.
   - Watch 5 incoming emergency reports get classified and linked to `RD-2048`.
   - The priority score and report counts dynamically recalculate live!

---

## 10. Security, Privacy & DPG Principles

- **Zero Coordinate Exposure**: Exact citizen coordinates are never publicly rendered. All mapping operates on clustered, privacy-preserving sector centroids.
- **Anonymous Reporting**: Citizens are never forced to register phone numbers or national IDs.
- **Explainability Over Black-Box AI**: An LLM never makes arbitrary budget decisions. Priorities are computed by a transparent, verifiable mathematical formula.
- **Digital Public Good (DPG) Adapter Layer**: Built with standardized schemas so state datasets (Census, PMGSY, Jal Jeevan Mission) can plug in with zero architectural rewrites.

---

## 11. License
Licensed under the open-source MIT License. Developed for digital public good infrastructure and civic technology innovation.
