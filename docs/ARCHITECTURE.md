# Project Architecture

## Overview

Full-stack classified ads marketplace built with Next.js (frontend) and Laravel (backend).

## Folder Structure

```
/
├── src/              # Next.js frontend application
│   ├── app/          # App router pages & layouts
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities, API client, stores
│   └── types/        # TypeScript type definitions
├── backend/          # Laravel API backend
│   ├── app/          # Application logic (controllers, models)
│   ├── config/       # Configuration files
│   ├── database/     # Migrations & seeders
│   ├── routes/       # API route definitions
│   └── storage/      # Logs, cache, uploads
├── database/         # Root-level database schemas
│   ├── migrations/   # Database migrations
│   └── seeders/      # Database seeders
├── docs/             # Project documentation
├── uploads/          # User-uploaded files (gitignored content)
├── public/           # Static assets (images, icons)
└── scripts/          # Automation & utility scripts
```

## Tech Stack

| Layer       | Technology                |
|-------------|---------------------------|
| Frontend    | Next.js 14, React 18, TS  |
| Backend     | Laravel 10+, PHP 8+       |
| Database    | MySQL / MariaDB           |
| Realtime    | Socket.IO                 |
| Auth        | JWT + Google OAuth        |
| UI          | Tailwind CSS, Lucide Icons|
| State       | Zustand, SWR              |

## Branch Strategy

- `main`       → Production-ready code
- `develop`    → Active development
- `feature/*`  → New features (merge → develop)
- `bugfix/*`   → Bug fixes (merge → develop)
- `hotfix/*`   → Urgent production fixes (merge → main & develop)
