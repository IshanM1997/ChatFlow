# 💬 ChatFlow — Real-Time Chat App

![Angular](https://img.shields.io/badge/Angular-15-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-010101?style=flat-square&logo=socket.io&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular_Material-15-6200EE?style=flat-square&logo=material-design&logoColor=white)

---

## 📖 About

**ChatFlow** is a full-stack real-time chat application with an Angular 15 frontend and a Node.js + Socket.io backend. Messages are delivered instantly via WebSockets. The Angular client uses RxJS `Subject` streams to distribute socket events throughout the application without polling or manual refresh.

JWT authentication with a silent refresh-token interceptor keeps sessions alive seamlessly — if the access token expires mid-session, the interceptor queues pending requests, refreshes the token in the background, then replays them automatically. Three demo accounts (alice, bob, charlie) let you test multi-user features by opening the app in multiple browser tabs.

---

## 🏷️ Topics

> Add these under **Repository → Settings → Topics** on GitHub:

```
angular angular15 typescript nodejs express socketio websocket
rxjs jwt auth-guard interceptor real-time chat dark-theme
angular-material spa fullstack
```

---

## 📸 Preview

```
╔══════════════════════════════════════════════════════════════╗
║ 💬 ChatFlow        │  # general                             ║
║ ─────────────────  │  ─────────────────────────────────     ║
║ Channels           │                                        ║
║  ▶ # general       │   [Alice]  Hey everyone! 👋   10:30am  ║
║    # tech          │                                        ║
║    # random        │       Hi Alice! How are you?  10:31am  ║
║                    │                         [own] ✓✓       ║
║ ─────────────────  │   bob is typing…                       ║
║  A alice    ●      │  ────────────────────────────────────  ║
║             🚪     │  Message #general      [Send ➤]        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Real-time messaging** | Socket.io WebSockets — zero-latency delivery |
| **JWT auth** | Login → access token (15min) + refresh token (7d) |
| **Refresh interceptor** | Queues requests on 401, silently refreshes, replays |
| **Auth guard** | `/chat` route protected — redirects to `/login` |
| **Typing indicator** | Animated dots + username shown to other members |
| **Read receipts** | ✓ sent / ✓✓ read indicators on own messages |
| **Channel rooms** | #general, #tech, #random — history on join |
| **Online presence** | Green dot on sidebar for connected users |
| **Dark theme** | Full dark UI with Angular Material |
| **Multi-tab testing** | Open 3 tabs as alice, bob, charlie |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 15, Angular Material 15 |
| Language | TypeScript 4.9 |
| Realtime | Socket.io-client, RxJS Subjects |
| HTTP | Angular HttpClient + JWT Interceptor |
| Auth | JWT (jsonwebtoken), refresh token flow |
| Backend | Node.js, Express, Socket.io 4 |
| State | BehaviorSubject / Subject streams |

---

## 🏗 Project Structure

```
chat-app/
├── server/                    ← Node.js backend
│   ├── package.json
│   └── src/
│       └── index.js           ← Express + Socket.io server
│
└── client/                    ← Angular frontend
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── src/app/
        ├── core/
        │   ├── guards/
        │   │   └── auth.guard.ts          ← CanActivate
        │   ├── interceptors/
        │   │   └── jwt.interceptor.ts     ← Token attach + refresh
        │   └── services/
        │       ├── auth.model.ts          ← Interfaces
        │       ├── auth.service.ts        ← Login, logout, token mgmt
        │       ├── socket.service.ts      ← Socket.io RxJS wrapper
        │       └── chat-room.service.ts   ← Room + message state
        └── features/
            ├── auth/components/
            │   ├── login.component.ts
            │   ├── login.component.html
            │   └── login.component.scss
            └── chat/components/
                ├── chat.component.*        ← Layout shell + sidebar
                └── message-area.component.*← Messages + input
```

---

## 🚀 Setup

### 1. Start the backend

```bash
cd server
npm install
npm start
# Server → http://localhost:3000
```

### 2. Start the Angular client

```bash
cd client
npm install --legacy-peer-deps
npm start
# Client → http://localhost:4200
```

### 3. Open multiple tabs

| Tab | Login as | Password |
|---|---|---|
| Tab 1 | alice   | alice123   |
| Tab 2 | bob     | bob123     |
| Tab 3 | charlie | charlie123 |

Send messages in one tab and see them appear instantly in the others. Watch the typing indicator when someone starts typing.

---

## 🔐 How JWT Refresh Works

```
Client           Server
  │──POST /login──▶│  returns { accessToken(15m), refreshToken(7d) }
  │                │
  │──GET /api/rooms?──▶│  401 (token expired)
  │                │
  JwtInterceptor queues the request
  │──POST /auth/refresh──▶│  returns { accessToken }
  │                │
  JwtInterceptor replays original request with new token
  │──GET /api/rooms──▶│  200 OK
```
