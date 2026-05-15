# 🎫 Ticket & Asset Management System

A production-ready microservices application with:
- **React + Vite + Tailwind CSS** frontend
- **Flask Ticket Service** (port 5001) with PostgreSQL `ticket_db`
- **Flask Asset Service** (port 5002) with PostgreSQL `asset_db`
- **Supabase** email+password authentication with RBAC

---

## 🏗️ Architecture

```
Frontend (port 5173)
    │
    ├── /api/tickets/* → Ticket Service (port 5001) → ticket_db
    └── /api/assets/*  → Asset Service  (port 5002) → asset_db
                            Both verify sessions via Supabase JWT claims
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Step 1: Create Databases

```bash
python scripts/create_databases.py
```

This creates `ticket_db` and `asset_db` in your PostgreSQL server.

### Step 2: Configure .env Files

Update the `DATABASE_PASSWORD` in both service `.env` files:

```
ticket-service/.env → DATABASE_PASSWORD=your_postgres_password
asset-service/.env  → DATABASE_PASSWORD=your_postgres_password
```

### Step 3: Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend services** (both use same Python env):
```bash
pip install -r ticket-service/requirements.txt
# asset-service uses identical deps, no need to install again
```

### Step 4: Start All Three Services

Open **3 terminal windows**:

**Terminal 1 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

**Terminal 2 — Ticket Service:**
```bash
cd ticket-service
python run.py
# → http://localhost:5001
```

**Terminal 3 — Asset Service:**
```bash
cd asset-service
python run.py
# → http://localhost:5002
```

---

## 🔌 API Endpoints

### Ticket Service (port 5001)

| Method | Endpoint | Auth | Admin Only |
|--------|----------|------|------------|
| POST   | /tickets | ✅ | ❌ |
| GET    | /tickets | ✅ | ❌ |
| GET    | /tickets/:id | ✅ | ❌ |
| PUT    | /tickets/:id | ✅ | ✅ |
| DELETE | /tickets/:id | ✅ | ✅ |
| GET    | /dashboard | ✅ | ❌ |
| GET    | /health | ❌ | ❌ |

### Asset Service (port 5002)

| Method | Endpoint | Auth | Admin Only |
|--------|----------|------|------------|
| POST   | /assets | ✅ | ❌ |
| GET    | /assets | ✅ | ❌ |
| GET    | /assets/:id | ✅ | ❌ |
| PUT    | /assets/:id | ✅ | ✅ |
| DELETE | /assets/:id | ✅ | ✅ |
| GET    | /health | ❌ | ❌ |

---

## 🔐 RBAC Rules

| Action | User | Admin |
|--------|------|-------|
| Create tickets/assets | ✅ | ✅ |
| View tickets/assets | ✅ (own only for tickets) | ✅ (all) |
| Update | ❌ | ✅ |
| Delete | ❌ | ✅ |

---

## 📁 Project Structure

```
.
├── frontend/               # React + Vite + Tailwind
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page-level components
│       ├── services/       # Axios API instances (ticketApi, assetApi)
│       ├── context/        # AuthContext (global auth state)
│       └── utils/          # RBAC guards, formatters
│
├── ticket-service/         # Flask Microservice 1
│   └── app/
│       ├── config/         # Settings from .env
│       ├── models/         # SQLAlchemy: Ticket, User
│       ├── routes/         # Blueprint: /tickets
│       └── middleware/     # require_auth, admin_required
│
├── asset-service/          # Flask Microservice 2
│   └── app/
│       ├── config/         # Settings from .env
│       ├── models/         # SQLAlchemy: Asset, User
│       ├── routes/         # Blueprint: /assets
│       └── middleware/     # require_auth, admin_required
│
└── scripts/
    └── create_databases.py # One-time DB setup script
```

---

## 📦 Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Project setup — folder structure, boilerplate, dependencies |
| 2 | ⏳ Next | Database schema + SQLAlchemy models |
| 3 | ⏳ | Backend APIs (full CRUD) |
| 4 | ⏳ | Authentication — Supabase integration |
| 5 | ⏳ | Frontend UI |
| 6 | ⏳ | API integration |
| 7 | ⏳ | Role-based access control |
| 8 | ⏳ | Testing |
| 9 | ⏳ | Performance & cleanup |
