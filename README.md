# ⚡ SyncBoard — Real-Time Collaborative Kanban Board
> **AImploy Technical Assessment Submission — Task 1: Full-Stack Developer**  
> *A production-grade, highly responsive task-management web application featuring room-based WebSocket synchronization, role-based authorization, optimistic drag-and-drop, and comprehensive test coverage.*

---

## 🚀 Live Demo & Documentation Links

| Resource | Live Production Link | Local Development Link |
| :--- | :--- | :--- |
| **Frontend Web App** | **[syncboard-client-xkpi.onrender.com](https://syncboard-client-xkpi.onrender.com)** | [http://localhost:5173](http://localhost:5173) |
| **Backend API Server** | **[syncboard-api-zawe.onrender.com](https://syncboard-api-zawe.onrender.com)** | [http://localhost:5000](http://localhost:5000) |
| **Interactive Swagger API Docs** | **[syncboard-api-zawe.onrender.com/api-docs](https://syncboard-api-zawe.onrender.com/api-docs)** | [http://localhost:5000/api-docs](http://localhost:5000/api-docs) |
| **Backend Health Check** | **[syncboard-api-zawe.onrender.com/health](https://syncboard-api-zawe.onrender.com/health)** | [http://localhost:5000/health](http://localhost:5000/health) |

> [!NOTE]
> *On the free tier, Render automatically spins down services after 15 minutes of inactivity. If visiting the live app for the first time in a while, please allow ~30 seconds for the backend instance to spin up.*

---

## 📋 Evaluation Checklist & Acceptance Criteria

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Authentication & AuthZ** | JWT Bearer token authentication, bcrypt password hashing, board ownership & member-level route authorization (403 Forbidden for unauthorized users). | ✅ Complete |
| **User-Specific Boards & Cards** | Multi-board workspaces, task cards with `title`, `description`, `status` (`To Do`, `In Progress`, `Done`), `priority`, `assignee`, and timestamps. | ✅ Complete |
| **Interactive Movement** | Smooth drag-and-drop reordering via `@hello-pangea/dnd`, plus accessible direct status-toggle action badges on every card. | ✅ Complete |
| **Real-Time Collaboration** | Room-isolated WebSocket broadcasting using Socket.IO (`card:created`, `card:updated`, `card:moved`, `card:deleted`, `card:typing`, `active-users`). | ✅ Complete |
| **Zero-Refresh Synchronization** | Multiple concurrent browser sessions (e.g., normal window + incognito) viewing the same board sync instantly without refreshing. | ✅ Complete |
| **Persistence & Database Indexes** | MongoDB with compound indexes (`boardId`, `status`, `order`, `assignee`). Changes survive page reloads and server restarts. | ✅ Complete |
| **Connection & UI States** | Responsive UI with live connection status pill (`Connected (Live Sync)` / `Connecting...` / `Offline`), loading skeletons, and empty states. | ✅ Complete |
| **Accessibility & WCAG AA** | High-contrast palette (≥ 4.5:1 for normal text), ≥ 12px meaningful labels, full keyboard reachability (`:focus-visible`, <kbd>Enter</kbd>/<kbd>Space</kbd>/<kbd>Esc</kbd>), and `prefers-reduced-motion`. | ✅ Complete |
| **UX & Single Scroll Strategy** | Flattened 2-layer columns, pinned sticky headers, single per-column vertical scroll (no double scrollbars), subtle scrollbars, and quieted "Done" card states. | ✅ Complete |
| **Live Presence & Typing** | Active collaborator avatar cluster with green status dots & `+N` overflow for 2+ users, alongside real-time card editing typing badges. | ✅ Complete |
| **Zero-Config Reviewer Setup** | Seamless fallback to `mongodb-memory-server` if local MongoDB is not running, allowing 1-click execution without external dependencies. | ✅ Complete |
| **Automated Testing Suite** | Comprehensive Jest + Supertest integration test suite covering auth, duplicate prevention, unauthorized access rejection, and card movement. | ✅ Complete |

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    subgraph Client [Frontend: React 18 + Vite + Tailwind CSS]
        UI[Kanban Board & Drag-and-Drop UI]
        AuthCtx[Auth Context & JWT Store]
        SocketCtx[Socket.IO Client & Live Connection Pill]
    end

    subgraph Server [Backend: Node.js + Express.js]
        REST[REST API Endpoints]
        AuthMW[JWT Auth Middleware & Board Authorization]
        SocketSrv[Socket.IO Room Manager]
        Swagger[Interactive Swagger UI /api-docs]
    end

    subgraph Data [Persistence Layer]
        MongoDB[(MongoDB Atlas / Local / In-Memory Fallback)]
    end

    UI -->|HTTP Requests with Bearer Token| REST
    REST --> AuthMW
    AuthMW --> MongoDB
    SocketCtx <-->|WebSocket Events| SocketSrv
    SocketSrv -.->|Broadcast to Board Room| SocketCtx
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, `@hello-pangea/dnd` (accessible drag-and-drop), `socket.io-client`, Axios, Lucide Icons.
- **Backend**: Node.js (ES Modules), Express.js, Socket.IO.
- **Database & ODM**: MongoDB with Mongoose (with automated in-memory fallback for local development).
- **Authentication**: JSON Web Tokens (JWT), bcrypt.js.
- **API Documentation**: Swagger UI / OpenAPI 3.0 mounted at `/api-docs`.
- **Testing**: Jest, Supertest, MongoDB Memory Server.

---

## ⚡ Quickstart Guide (Local Development)

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v22.20.0`)
- npm `v9+` or `v10+`
- *(Optional)* Local MongoDB or MongoDB Atlas URI (SyncBoard will automatically start an in-memory database if no local MongoDB is detected).

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "AImploy assignment"

# Install both backend and frontend dependencies in one command:
npm run install:all
```

### 2. Environment Setup
The project comes pre-configured with default `.env` files for both server and client:
- `server/.env` (configured for port 5000 and JWT secret)
- `client/.env` (configured for port 5173 pointing to local server)

### 3. Start the Application
Open two terminal windows (or run concurrently):

**Terminal 1 — Backend Server:**
```bash
cd server
npm run dev
# Or from the root directory:
npm run server
```
*Server starts on `http://localhost:5000` with interactive Swagger docs at `http://localhost:5000/api-docs`.*

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# Or from the root directory:
npm run client
```
*Client starts on `http://localhost:5173`.*

---

## 👥 Testing Real-Time Multi-User Collaboration

To experience the dual-session real-time sync with zero effort:
1. Open [http://localhost:5173/login](http://localhost:5173/login) in your primary browser.
2. Click the **"User 1 (Alex)"** one-click demo button to sign in.
3. Open an **Incognito / Private Window** and navigate to [http://localhost:5173/login](http://localhost:5173/login).
4. Click the **"User 2 (Taylor)"** one-click demo button to sign in.
5. In Window 1, open or create a board and click **"Collaborators"** ➔ enter `taylor@syncboard.dev` ➔ Invite.
6. Open the same board in Window 2:
   - Notice both users' live avatars in the navbar.
   - Drag or create a card in Window 1 ➔ **watch it update instantaneously in Window 2 without any page refresh!**
   - Start typing in a card modal in Window 1 ➔ observe the live typing indicator in Window 2.

---

## 🧪 Running Automated Tests

Run the complete Jest & Supertest integration suite:

```bash
cd server
npm test
# Or from root:
npm run test:server
```

**Test Suite Coverage:**
- `POST /api/auth/register`: User creation and JWT token issuance.
- `POST /api/auth/register`: Duplicate email prevention.
- `POST /api/auth/login`: Credential validation & error responses.
- `GET /api/auth/me`: Bearer token extraction and protected profile access.
- `POST /api/boards`: Board creation with default columns.
- `GET /api/boards/:id`: **Security Authorization Guard (403 Forbidden for unauthorized access).**
- `POST /api/cards`: Task creation with column positioning and ordering.
- `PATCH /api/cards/:id/move`: Column movement, re-indexing, and DB persistence.
- `DELETE /api/boards/:id`: Cascade deletion of boards and associated task cards.

---

## 📖 API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user & obtain JWT | Public |
| `POST` | `/api/auth/login` | Authenticate & obtain JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Protected (Bearer) |
| `GET` | `/api/auth/users` | Search registered users by email/name | Protected (Bearer) |
| `GET` | `/api/boards` | Get all boards owned or shared with user | Protected (Bearer) |
| `POST` | `/api/boards` | Create a new board workspace | Protected (Bearer) |
| `GET` | `/api/boards/:id` | Get board details and card columns | Protected (Authorized) |
| `PUT` | `/api/boards/:id` | Update board title or description | Protected (Authorized) |
| `DELETE`| `/api/boards/:id` | Delete board and cascade delete cards | Protected (Owner only) |
| `POST` | `/api/boards/:id/members`| Invite collaborator to board | Protected (Authorized) |
| `GET` | `/api/boards/:id/activities`| Retrieve board audit trail | Protected (Authorized) |
| `POST` | `/api/cards` | Create card (emits `card:created`) | Protected (Authorized) |
| `PUT` | `/api/cards/:id` | Update card (emits `card:updated`) | Protected (Authorized) |
| `PATCH`| `/api/cards/:id/move` | Move/reorder card (emits `card:moved`)| Protected (Authorized) |
| `DELETE`| `/api/cards/:id` | Delete card (emits `card:deleted`) | Protected (Authorized) |

*Full OpenAPI schema, example payloads, and live request execution available at `http://localhost:5000/api-docs`.*

---

## ♿ Accessibility, UX & Design Architecture

### 1. WCAG AA Contrast Compliance & Typography
- **Contrast Ratios (≥ 4.5:1)**: Color pairings across all pastel backgrounds, priority pills, and due-date chips are calibrated for high contrast:
  - **Urgent**: `#991b1b` on `#fef2f2` (**7.5:1**)
  - **High**: `#9a3412` on `#fff7ed` (**6.6:1**)
  - **Medium**: `#1e40af` on `#eff6ff` (**7.6:1**)
  - **Low**: `#334155` on `#f8fafc` (**7.2:1**)
  - **Done**: `#52525b` on `#f4f4f5` (**6.2:1**)
  - **Muted Labels & Placeholders**: Replaced low-contrast grays with `#58515f` (**> 6.5:1** on `#fffdf7` / `#f1f2fa`).
- **Minimum 12px Font Size**: All meaningful labels, priority pills, date chips, and timestamps enforce a minimum font size of `12px` (`text-xs`).

### 2. Full Keyboard Navigation & ARIA Semantics
- **Card Interaction**: Task cards include `role="button"`, `tabIndex={0}`, descriptive `aria-label` attributes, and open via <kbd>Enter</kbd> or <kbd>Space</kbd>.
- **Keyboard-Visible Actions**: Quick status transition buttons reveal via `focus-within:opacity-100` so keyboard users can shift columns without hover.
- **Modal Dialogs**: Modals implement `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and dismiss instantly on <kbd>Escape</kbd>.
- **Focus Indicators**: Universal `:focus-visible` styling (`outline: 2px solid #8264b4`) provides distinct visual feedback during tab navigation.
- **Reduced Motion**: Respects `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions, smooth scrolling, and decorative spin/ping animations.

### 3. Layout Streamlining & Single-Scroll Architecture
- **2-Layer Flattened Columns**: Removed extraneous inner trays, allowing cards ~20% more horizontal space while keeping a clean background separation.
- **Pinned Column Headers**: Column titles, task counters, and column `+` buttons remain sticky at the top during scrolling.
- **Zero Double Scrollbars**: The viewport is locked with a single per-column vertical scroll (`.column-card-scroll`) and subtle custom scrollbars.
- **Quieted "Done" Tasks**: Completed cards adopt a subtle `opacity-70`, strikethrough typography, a checkmark icon, and a neutral priority pill to reduce clutter.
- **Smart Relative Dates**: Displays context-aware due dates (`Overdue · <date>`, `Today`, `Tomorrow`, `Later`, `Done`) evaluated in local calendar time.

### 4. Real-Time Collaborator Presence
- **Online Collaborators Badge**: When 2 or more users view the same board concurrently, an avatar cluster appears in the navbar next to the Live Sync pill with individual green online dots, name tooltips, and a `+N` overflow indicator.

---

## 🔒 Security & Data Integrity Highlights

1. **Server-Side Authorization**: Hiding UI controls is not relied upon. Every board endpoint performs an explicit server-side lookup verifying whether `req.user._id` matches the board `owner` or is present in `board.members`. Unauthorized calls strictly return `403 Forbidden`.
2. **Password Security**: Passwords are never stored in plaintext; salted with 10 rounds of `bcrypt` and stripped from all Mongoose query serialization (`select: false` and `toJSON` delete).
3. **Database Indexing**: Compound indexes on `{ board: 1, status: 1, order: 1 }` ensure $O(\log N)$ query performance during column reordering and board fetches.
4. **WebSocket Room Isolation**: Socket events are strictly broadcasted to the respective `boardId` room (`io.to(boardId).emit(...)`), preventing cross-tenant leakage.

---

## 🌐 Production Deployment Guide (Render.com)

This application is deployed and hosted on Render:

### 1. Backend Web Service (`syncboard-api`)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `node src/server.js`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `MONGO_URI`: `mongodb+srv://<credentials>@cluster.mongodb.net/syncboard`
  - `JWT_SECRET`: `<secure-random-token>`
  - `JWT_EXPIRE`: `7d`
  - `CLIENT_URL`: `https://syncboard-client-xkpi.onrender.com`

### 2. Frontend Static Site (`syncboard-client`)
- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Redirects / Rewrites:**
  - Source: `/*` ➔ Destination: `/index.html` (Action: `Rewrite` for SPA routing)
- **Environment Variables:**
  - `VITE_API_URL`: `https://syncboard-api-zawe.onrender.com/api`
  - `VITE_SOCKET_URL`: `https://syncboard-api-zawe.onrender.com`

---

## 📈 Production Roadmap, Shortcomings & Global Scale Architecture

While SyncBoard delivers a production-grade, highly responsive MVP with live WebSockets, secure authorization, and accessible UI, scaling the platform to support **millions of concurrent global users and massive enterprise datasets** requires addressing several architectural evolution points:

### 1. Real-Time Horizontal Scaling & Distributed Presence
- **Current MVP Boundary**: Socket.IO runs within a single Node.js process. Board rooms and active presence Maps (`activeUsersPerBoard`) are stored in server process memory.
- **Enterprise Upgrade**:
  - **Redis Pub/Sub Cluster Adapter (`@socket.io/redis-adapter`)**: Distribute WebSocket broadcast events across multiple stateless Node.js container instances behind a Layer 7 Application Load Balancer (ALB).
  - **Distributed Ephemeral Presence**: Move active collaborator tracking from in-memory Maps to **Redis Hashsets with sliding-window TTL heartbeats (`EXPIRE 30s`)**, ensuring zero split-brain presence states during autoscaling pod teardowns or deployments.
  - **Edge-Terminated WebSockets**: Transition to managed edge WebSocket services (e.g. Cloudflare Durable Objects, AWS API Gateway WebSocket, or Ably) to terminate SSL connections within 10–20ms of the user globally.

### 2. Massive Data Handling & High-Throughput Card Ordering ($O(1)$ Lexorank)
- **Current MVP Boundary**: Card sorting uses sequential integer ordering (`order: 0, 1, 2...`). Moving a card to the top of a column with 1,000 cards triggers an $O(N)$ bulk database write update across all subsequent cards.
- **Enterprise Upgrade**:
  - **Fractional Indexing (Lexorank)**: Adopt lexicographical string-based midpoint ranking (similar to JIRA/Linear). Dragging a card between keys `"a0"` and `"a1"` assigns `"a0V"`, converting all card movements into strictly atomic **$O(1)$ single-document mutations** with zero write amplification.
  - **Virtualized Infinite Scrolling**: Columns with tens of thousands of cards currently render all DOM elements. Upgrading to `@tanstack/react-virtual` paired with cursor-based column pagination (`limit=50`, `after_id`) ensures only the visible card viewport is kept in memory.
  - **MongoDB Database Sharding**: Shard the `cards` and `activities` collections using hashed `boardId` keys across an Atlas Sharded Cluster, isolating read/write workloads per workspace.
  - **Read/Write Splitting & Analytical Offloading**: Direct write transactions to primary MongoDB replica nodes while routing search queries, activity audit trails, and dashboard overviews to geographically distributed secondary read replicas.

### 3. Concurrent Conflict Resolution & Collaborative Rich Text (CRDTs)
- **Current MVP Boundary**: Last-Write-Wins (LWW) REST update semantics. If two collaborators simultaneously edit a card title or description, the latter payload overwrites the former.
- **Enterprise Upgrade**:
  - **Conflict-free Replicated Data Types (CRDTs)**: Integrate **Yjs** or **Automerge** over WebSocket rooms for true simultaneous character-by-character collaborative editing inside card descriptions and comments.
  - **Offline-First Mutation Queue**: Store pending client mutations inside browser **IndexedDB** using Service Workers. On network disconnection, actions queue optimistically and reconcile seamlessly with exponential backoff on reconnection.

### 4. Global Multi-Region Latency & Edge Acceleration
- **Current MVP Boundary**: Hosted in a single cloud region (Render Oregon/Frankfurt). Cross-continental users encounter higher round-trip latency (RTT).
- **Enterprise Upgrade**:
  - **Anycast Global CDN**: Route static assets and API requests through Cloudflare / Fastly Anycast edge PoPs with HTTP/3 and Brotli compression.
  - **Geographic Data Locality**: Implement multi-region backend clusters with regional read caching (e.g. AWS Global Accelerator or Cloudflare Workers Edge API caching for public/read-only board endpoints using `stale-while-revalidate`).

### 5. Enterprise Security, Governance & Observability
- **Current MVP Boundary**: JWT tokens stored in `localStorage`; standard Node.js `console.log` output; board-level role checks.
- **Enterprise Upgrade**:
  - **Hardened Cookie Authentication**: Store authentication tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies with refresh token rotation and short-lived (15-minute) access tokens to eliminate XSS token exfiltration vectors.
  - **Distributed Rate Limiting**: Deploy Redis token-bucket rate limiters (`rate-limiter-flexible`) across REST API routes and socket handshake attempts to prevent brute-force attacks and DoS spikes.
  - **Granular Enterprise RBAC & Organizations**: Introduce an Organization tenant hierarchy with customizable permission matrices (Owner, Admin, Editor, Commenter, Viewer, Guest).
  - **Distributed Tracing & Telemetry**: Instrument the full stack with **OpenTelemetry**, exporting metrics and traces to Prometheus/Grafana or Datadog, propagating correlation IDs (`x-request-id`) from the React client through Express middleware down to database query spans.
  - **Audit Log Archival**: Stream board activity logs to cold storage (e.g. AWS S3 Parquet / BigQuery) for regulatory retention and compliance analytics without ballooning operational database size.

---

## 📄 License
This project was designed and implemented for the **AImploy Full-Stack Developer Assessment**. Licensed under the MIT License.
