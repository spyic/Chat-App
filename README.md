# ChatApp — Real-Time Chat Application

A full-stack real-time one-to-one chat application built with React, Node.js, TypeScript, PostgreSQL, Firebase Firestore, and Socket.IO.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, TypeScript, Express.js |
| Database | PostgreSQL (Prisma ORM) + Firebase Firestore |
| Real-time | Socket.IO |
| Auth | JWT + bcryptjs |
| Validation | Zod |

## Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** v9+
- **PostgreSQL** installed and running locally
- **Firebase Project** (or Firebase Emulator Suite)

## Quick Start

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE chatapp;
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your database URL and Firebase credentials
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Firebase Setup

**Option A: Firebase Emulator (recommended for local dev)**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase emulators:start --only firestore`
3. Set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` in server `.env`

**Option B: Real Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Cloud Firestore
4. Go to Project Settings → Service Accounts → Generate new private key
5. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in server `.env`

> ⚠️ Never commit your Firebase service account key or `.env` file

## Demo Instructions

### Two-User Demo for Interviews

1. Open `http://localhost:5173` in **Chrome**
2. Open `http://localhost:5173` in a **Chrome Incognito window** (or another browser)
3. Register **User A** in window 1 (e.g., "Alice", alice@test.com)
4. Register **User B** in window 2 (e.g., "Bob", bob@test.com)
5. As User A: Click the search icon → Search for "Bob" → Click to start chat
6. Send a message from User A → See it appear instantly for User B
7. User B replies → User A sees it in real-time
8. Observe: typing indicators, online status, message timestamps, read receipts

### Features to Demonstrate

- ✅ User registration and login
- ✅ User search
- ✅ Create direct conversations
- ✅ Real-time messaging via Socket.IO
- ✅ Message persistence in Firestore
- ✅ Message history with pagination
- ✅ Sent/delivered/read indicators
- ✅ Online/offline status
- ✅ Typing indicators
- ✅ JWT authentication
- ✅ Chat membership authorization

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | JWT signing secret |
| `FRONTEND_URL` | Frontend URL for CORS |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |
| `FIRESTORE_EMULATOR_HOST` | Emulator host (optional) |

### Frontend (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |

## Project Structure

```
Chat app/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components (chat/, users/, common/)
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       ├── services/       # API service layer
│       ├── socket/         # Socket.IO client
│       ├── context/        # React Context (Auth)
│       ├── types/          # TypeScript types
│       └── utils/          # Utilities
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database, Firebase, env config
│   │   ├── middleware/     # Auth, error handling, validation
│   │   ├── modules/       # Feature modules (auth, users, chats, messages)
│   │   ├── socket/        # Socket.IO server setup
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Logger, error classes
│   └── prisma/            # Prisma schema and migrations
└── docs/                  # Documentation
```

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/users` | List users | Yes |
| GET | `/api/users/search?q=` | Search users | Yes |
| POST | `/api/chats` | Create/get direct chat | Yes |
| GET | `/api/chats` | Get user's chats | Yes |
| POST | `/api/chats/:id/messages` | Send message | Yes |
| GET | `/api/chats/:id/messages` | Get messages (paginated) | Yes |
| POST | `/api/chats/:id/messages/:msgId/read` | Mark as read | Yes |
| POST | `/api/chats/:id/messages/:msgId/delivered` | Mark as delivered | Yes |
| POST | `/api/chats/:id/last-seen` | Update last seen | Yes |
| GET | `/api/health` | Health check | No |

## Running Tests

```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [Firestore Schema](docs/FIRESTORE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Socket Events](docs/SOCKET_EVENTS.md)
- [Security](docs/SECURITY.md)
- [Design Decisions](docs/DESIGN_DECISIONS.md)
- [Interview Preparation](docs/INTERVIEW_PREPARATION.md)

