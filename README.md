# Bossitive

Bossitive is a Tinder-style mobile app for pet owners to discover and match their pets.

This project now uses:
- Mobile app: Expo React Native (TypeScript)
- Backend API: Node.js + Express + MongoDB + JWT

## Project structure

- `src/` → Expo mobile app
- `backend/` → Express + MongoDB API

## 1) Run backend (MongoDB)

### Requirements
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/bossitive
JWT_SECRET=change_this_to_a_strong_secret
```

Start backend:

```bash
npm run dev
```

Health check:
- `GET http://localhost:4000/health`

## 2) Run mobile app

```bash
npm install
npx expo start -c
```

Then press `a` to open Android emulator.

## API base URL (Android emulator)

In `src/services/api.ts`:
- `http://10.0.2.2:4000` is already set for Android emulator.

If using real device, change to your LAN IP, e.g.:
- `http://192.168.x.x:4000`

## Implemented backend endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Pets
- `POST /pets/me` (create/update pet profile)
- `GET /pets/me`
- `GET /pets/explore`
- `GET /pets/:petId`

### Social
- `POST /social/like`
- `GET /social/matches`

### Chat
- `GET /chat/:matchId/messages`
- `POST /chat/:matchId/messages`

## Notes

- Firebase is no longer used by app flow.
- Auth token is stored locally via AsyncStorage.
- Chat currently refreshes on load/send (poll-like behavior), not websocket real-time yet.
