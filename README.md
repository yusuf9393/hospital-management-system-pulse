# Pulse — Hospital Management System

Full-stack app: React + Vite frontend, Express backend, MySQL database, JWT auth.
All modules are implemented: Dashboard, Patients, Doctors, Appointments, Billing.

## Recent fixes (important)

- **Dashboard updates live**: stats refetch on mount, on tab focus, and via a **Refresh** button. Counts now reflect active doctors and non-cancelled appointments.
- **Trend chart**: fixed SQL so the last 7 days always show (zeros for quiet days) and day labels stay consistent.
- **Auth**: `/api/auth/register` is now **admin-only** (first admin still comes from `node seed.js`).
- **Logout**: navigates cleanly to `/login`. Already-logged-in users are redirected away from the login page.
- Lists (patients / appointments / billing / doctors) already re-load after create/update/delete.

## Project structure
```
hospital-management/
├── frontend/          React + Vite + Tailwind + Framer Motion
├── backend/           Express + MySQL + JWT
├── database/schema.sql
└── docker-compose.yml Runs the whole stack with one command
```

## Option A — Run locally without Docker

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env       # fill in your MySQL password and a JWT secret
node seed.js                # creates the first admin login (prints the password)
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Log in with the credentials `seed.js` printed (default `admin@pulse.com` / `Admin@123` — change it after first login).

## Option B — Run locally with Docker

```bash
cp .env.example .env         # set DB_PASSWORD and JWT_SECRET
docker compose up --build
docker compose exec backend node seed.js
```

Visit `http://localhost` and log in.

## Can you deploy this on Firebase?

**Short answer: not as-is, and not recommended as the primary host.**

| Part | Firebase support | Recommendation |
|------|------------------|----------------|
| **Frontend (React SPA)** | Yes — Firebase Hosting | Works well |
| **Backend (Express + JWT)** | Partial — Cloud Functions (HTTP) or Cloud Run | Possible but needs rewrite; Express on Functions has cold starts &  timeout limits |
| **MySQL database** | No native MySQL | You need **Cloud SQL (MySQL)** or an external MySQL (PlanetScale, Railway, Aiven). Firebase Realtime DB / Firestore are NoSQL and would require rewriting every query |

**Practical path if you want “Firebase” for the UI only:**
1. Deploy `frontend/` to **Firebase Hosting** (`firebase init hosting` → build with `VITE_API_URL` pointing at your backend).
2. Deploy `backend/` to **Render**, **Railway**, or **Cloud Run**.
3. Put MySQL on **Cloud SQL**, PlanetScale, or Railway.

**Easier full-stack options (already documented in this repo):**
- **Path 1:** Docker Compose on a VPS / DigitalOcean / EC2
- **Path 2:** Backend on Render (`render.yaml` included) + Frontend on Vercel/Netlify + managed MySQL

## Deploying for real

### Path 1: One host, Docker Compose
1. Server with Docker, copy repo, set strong `DB_PASSWORD` and `JWT_SECRET` in `.env`.
2. `docker compose up -d --build`
3. Point DNS + TLS reverse proxy at the frontend container.
4. `docker compose exec backend node seed.js` once.

### Path 2: Managed platforms
- **Database:** PlanetScale / Railway / Aiven MySQL — run `database/schema.sql`.
- **Backend:** Render (use `render.yaml`) or Railway. Set `DB_*`, `JWT_SECRET`, `CORS_ORIGIN`.
- **Frontend:** Vercel or Netlify. Set `VITE_API_URL` to the backend URL at build time.

## Before you make this public
- Change the seeded admin password.
- Use a strong random `JWT_SECRET`.
- Register is already locked to admins; keep it that way (or remove the route).
- Consider rate-limiting `/api/auth/login`.
- In production Docker, remove the `3306:3306` port mapping so MySQL is not public.

## Roles
- **admin** — full access including doctor create/edit/delete
- **doctor** / **receptionist** — patients, appointments, billing (doctors read-only)

## Design
Palette: deep teal (`primary`) on clinical white (`surface`), vital-sign red (`pulse`). Display: Fraunces; body: Inter.
