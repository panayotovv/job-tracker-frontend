DEV.BG Job Tracker 🇧🇬
A full-stack job tracking platform built on top of dev.bg. A Python scraper keeps a live PostgreSQL database of every job listing on the site, and a React frontend lets you browse, apply, and track each application through a full hiring pipeline.
✨ Features
🕷️ Smart Scraping Engine
A Python scraper crawls every job category on dev.bg and stores clean, normalized records in PostgreSQL. Raw HTML is never saved — only structured data.
⏱️ Dual Cron Strategy
Two cron jobs keep the database fresh. A full category sweep runs daily to keep every listing up to date. A lightweight first-pag
