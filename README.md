# PointWise - Opinion Assistant (React + FastAPI)

Web app for generating and analyzing medical-legal text with:
- VA DBQ opinion generation
- AI humanizer
- AI detector (4-category classification)

## Stack

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: FastAPI (Python)
- Auth: token sessions (SQLite)

## Project Structure

- `src/`: React frontend
- `backend/`: FastAPI backend
  - `main.py`: API entrypoint
  - `auth.py`: auth, sessions, bootstrap admin user
  - `logic.py`: legal-standard routing for DBQ
  - `detector.py`: detector v2
  - `core/*`: humanizer pipeline

## Environment Variables

Backend:
- `OPENAI_API_KEY` (required)
- `CORS_ORIGINS` (optional, comma-separated; default `*`)
- `DEFAULT_ADMIN_USERNAME` (optional, default `ivanesteva90`)
- `DEFAULT_ADMIN_PASSWORD` (optional, default `IvanEsteva!2026`)
- `DEFAULT_ADMIN_EMAIL` (optional)
- `DEFAULT_ADMIN_PLAN` (optional, default `pro`)
- `SEED_USER_GISELLE_PASSWORD` (optional, default `Giselle!2026`)
- `SEED_USER_LAURA_PASSWORD` (optional, default `Laura!2026`)
- `SEED_USER_GENERIC_PASSWORD` (optional, default `User!2026`)
- `AUTH_DB_PATH` (optional, default `backend/auth.db`)

Frontend:
- `VITE_API_BASE_URL` (optional, default `http://localhost:8000`)

## Local Run

1. Install frontend deps:
```bash
npm install
```

2. Install backend deps:
```bash
pip install -r backend/requirements.txt
```

3. Start backend:
```bash
python3 -m uvicorn backend.main:app --reload --port 8000
```

4. Start frontend:
```bash
npm run dev
```

5. Open:
`http://localhost:5173`

## Live Deployment (recommended)

- Frontend: Vercel/Netlify (build: `npm run build`, output: `dist`)
- Backend: Render/Railway (`uvicorn backend.main:app --host 0.0.0.0 --port $PORT`)
- Set `VITE_API_BASE_URL` to your backend URL.

## Notes

- The app now uses backend auth. The old hardcoded frontend credentials were removed.
- On startup, backend ensures baseline users exist: admin + `giselle` + `laura` + `user`.
- API endpoints `/generate`, `/api/humanize`, and `/api/detect` require `Authorization: Bearer <token>`.
