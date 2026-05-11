DEV.BG Job Tracker
A full-stack job tracking platform built on top of dev.bg. A Python scraper keeps a live PostgreSQL database of every job listing on the site, and a React frontend lets you browse, apply, and track each application through a full hiring pipeline.

Architecture Overview
┌─────────────────────────────────────────────────────┐
│                   Cron Scheduler                    │
│  - Daily: full category sweep                       │
│  - Every 15 min: first-page poll (latest posts)     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Python Scraper Engine                  │
│  - Crawls all job categories on dev.bg              │
│  - Normalizes raw HTML → structured records         │
│  - time.sleep(5) between categories                 │
│  - Upserts via ON CONFLICT DO NOTHING               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│            FastAPI REST Backend                     │
│  - Job listing endpoints                            │
│  - Application management endpoints                 │
│  - JWT authentication                               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                    │
│  - Stores all normalized job posts                  │
│  - Tracks application state per user                │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              React Frontend                         │
│  - JWT auth + profile page                          │
│  - Job listings dashboard                           │
│  - Application pipeline tracker                     │
│  - Personal analytics                               │
└─────────────────────────────────────────────────────┘

Tech Stack
LayerTechnologyScraperPythonSchedulingCron jobsBackendFastAPIDatabasePostgreSQLFrontendReactAuthJWT

Scraping Engine
The scraper is the core of the project. It runs as a standalone Python script triggered by two cron jobs.
Dual cron strategy
JobFrequencyScopePurposeFull sweepDailyAll categoriesKeeps the DB complete — catches edits, removals, newly added categoriesLatest pollEvery 15 minFirst page onlyNear real-time detection of new posts with minimal DB load
The 15-minute job is intentionally scoped to page 1 only. Scraping all categories every 15 minutes would be wasteful — new posts always appear at the top, so one page is enough to catch them fast.
Polite scraping
pythonfor category in categories:
    scrape_category(category)
    time.sleep(5)
A 5-second delay between each category request keeps the scraper from hammering dev.bg. No rate limiting or blocking has been encountered.
Deduplication
Job posts are upserted using PostgreSQL's ON CONFLICT DO NOTHING. This means re-running the scraper is fully idempotent — no duplicate records, no extra logic needed in the application layer.
sqlINSERT INTO jobs (...)
VALUES (...)
ON CONFLICT DO NOTHING;
Data normalization
Raw HTML is never stored. Before every insert, the scraper parses and normalizes each job post into structured fields (title, company, location, category, tags, date, etc.). This keeps the database clean and query-friendly from day one.

Backend — FastAPI
The REST API handles job listing queries, user auth, and application state management.
Authentication
JWT-based auth. Tokens are issued on login and validated on every protected endpoint. No third-party auth service — implemented directly in FastAPI.
Key endpoints
GET    /jobs              # List all jobs (filterable by category, location, etc.)
GET    /jobs/{id}         # Single job detail
POST   /applications      # Create an application record
PATCH  /applications/{id} # Update application status
GET    /applications      # List user's applications
GET    /profile/analytics # Aggregated stats for the current user

Application Pipeline
Each job application is tracked through one of five statuses:
Applied → Interview Incoming → Offer Received
                             → Rejected
Status is stored per user per job in the database and updated via the frontend UI.

Frontend — React

Dashboard — browse all 1,661+ scraped listings, sort by date, search by keyword
Applications — view and manage your tracked applications with status pipeline
Interviews — dedicated view for upcoming interviews
Profile — personal analytics (applications sent, response rate, pipeline breakdown)
Auth — login / register, JWT stored and sent with every API request


Local Setup
Prerequisites

Python 3.10+
Node.js 18+
PostgreSQL

Backend
bashgit clone https://github.com/panayotovv/job-tracker-backend
cd job-tracker-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Configure your environment:
envDATABASE_URL=postgresql://user:password@localhost:5432/jobtracker
SECRET_KEY=your_jwt_secret
Run migrations and start the server:
bashalembic upgrade head
uvicorn main:app --reload
Scraper
bashpython scraper.py
To run on a schedule, add to crontab:
bash# Full sweep — daily at midnight
0 0 * * * /path/to/venv/bin/python /path/to/scraper.py --mode full

# Latest posts — every 15 minutes
*/15 * * * * /path/to/venv/bin/python /path/to/scraper.py --mode latest
Frontend
bashgit clone https://github.com/panayotovv/job-tracker-frontend
cd job-tracker-frontend
npm install
npm run dev
