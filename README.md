# AutoBidGo AI Training Platform

Invite-only AI voice training web application. Admins create contributor accounts, contributors record scripts in batches, admins review recordings, earnings accrue per approved script, and contributors can request withdrawals.

## Tech Stack
- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **ORM:** Prisma
- **Auth:** JWT in secure HTTP-only cookies
- **Password hashing:** bcrypt
- **UI:** Tailwind CSS (component-style system included in `/client/src/components/ui`)
- **Uploads:** local server storage
- **Audio recording:** Browser MediaRecorder API

## Repo Structure
- `client/` – React app
- `server/` – Express API + Prisma

## Setup
### Prerequisites
- Node.js 18+ recommended

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Create a `.env` file **in `server/`** based on `env.example` (this repo includes `env.example` instead of `.env.example`).

Example `server/.env`:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
UPLOAD_DIR="./uploads"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

Example `client/.env`:
```bash
VITE_API_URL="http://localhost:4000"
```

### 3) Database migrations
```bash
npm run prisma:migrate --workspace server
```

### 4) Seed data
```bash
npm run prisma:seed --workspace server
```

### 5) Run the app
```bash
npm run dev
```
- Client: http://localhost:5173
- Server: http://localhost:4000

## Default Admin Login (seed)
- Email: `admin@example.com`
- Password: `Admin123!`

## Notes
- The app is **invite-only**: there is **no public registration**.
- Audio uploads are stored locally under `server/uploads/recordings`.
- Profile photos are stored locally under `server/uploads/photos`.
- Upload files are served through authenticated API endpoints (not publicly).

## Main Features
- Admin user creation with temporary credentials
- First-login forced password change
- Mandatory profile setup with photo + consents
- Script recording workflow with preview and submit
- 10-script batches; next batch locked until admin approval
- Admin recording review (approve/reject with reason)
- Earnings ledger preventing duplicate payment
- Withdrawal requests showing invitation manager contact

