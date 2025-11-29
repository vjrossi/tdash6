# Project Blueprint: T-Dash

## 1. Project Overview
**T-Dash** is a unified energy dashboard that aggregates real-time data from **Tesla Vehicles** (via Fleet API) and **Sungrow Solar Inverters** (via iSolarCloud API). It is built as a **Single-Page Application (SPA)** where users can view and manage all their energy assets in one place.

## 2. Tech Stack & Architecture
* **Framework:** Next.js 15+ (App Router).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS (Dark Mode default) with Lucide React icons.
* **State Management:** Server Actions for data fetching; React State for UI interaction.
* **Deployment:** Vercel (frontend); Docker Sidecar (proxy).

## 3. Core Philosophy: "No Database"
The application does **not** use a backend database to store user accounts.
* **Session:** User identity is defined solely by valid **HTTP-Only Cookies** (`tesla_access_token`, `sungrow_access_token`) stored in the user's browser.
* **Persistence:** Tokens are managed via secure cookies. If cookies are cleared, the user is "logged out."

## 4. Authentication & Token Management

### General Flow
* **OAuth 2.0:** Both services use OAuth Authorization Code flow.
* **Server Actions:** All token exchanges happen server-side to keep secrets safe.
* **Redirects:** OAuth callbacks redirect the user back to `/dashboard` immediately after success.
* **Tesla Specifics:**
    * Token exchange MUST include `audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com'`.
    * `TESLA_CLIENT_SECRET` in `.env.local` must be wrapped in single quotes if it contains special characters (e.g., `$`).

### Logout Strategy (Crucial)
* **Race Condition Fix:** We do **not** use `redirect()` inside server-side logout actions because calling multiple redirects in parallel causes cancellation errors.
* **"Disconnect" Pattern:**
    * Server Actions (`teslaDisconnect`, `sungrowDisconnect`) strictly **delete cookies** and return `{ success: true }`.
    * The Client Component (`/dashboard`) awaits these promises and then triggers `router.refresh()` or `router.push('/')`.

## 5. Routing Structure

### Root (`/`)
* **Behavior:** Acts as a middleware/gateway.
* **Logic:** Automatically redirects all traffic to `/dashboard`. There is no separate "Landing Page."

### Dashboard (`/dashboard`)
* **Role:** The single authenticated view for the application.
* **Logic:**
    1.  Checks for Tesla and Sungrow tokens server-side (`loadData`).
    2.  If a service is **connected**, it fetches and displays the data card.
    3.  If a service is **disconnected**, it displays a "Connect [Service]" ghost card in the grid.
    4.  Allows users to toggle services independently without leaving the page.

### Auth Callbacks
* `app/callback/client-page.tsx` (Tesla) -> Redirects to `/dashboard`.
* `app/auth/sungrow/page.tsx` (Sungrow) -> Redirects to `/dashboard`.

## 6. Integrations

### Tesla Fleet API
* **Data (READ):** Battery level, range, climate, location.
    * **Route:** Directly hits **Tesla Cloud API**.
    * **Policy:** "Never Auto-Wake". If vehicle state is not "online", we return cached/basic data.
* **Commands (WRITE):** Start/Stop Charging.
    * **Route:** Must go through **Local Vehicle Command Proxy** (see Section 9).
    * **Requirement:** Commands require cryptographic signing using a private key.
    * **Data Field:** Commands (Start/Stop Charge) MUST use the **VIN**, not the internal `id_s`.

### Sungrow iSolarCloud API
* **Data:** Real-time PV generation (kW), Daily Yield (kWh), Total Capacity, Plant Location.
* **Token Refresh:** Server actions automatically attempt to refresh the Sungrow token if an API call fails with a specific expiry code.

## 7. UI Components

### `PlantCard`
* Displays solar stats.
* Matches the visual language of the vehicle card.

### `VehicleCard`
* Displays vehicle stats.
* Includes interactive charging controls.
* Handles "Asleep" vs "Online" states visually.

## 8. Development Guidelines
* **Strict Types:** Always define return types for Server Actions (e.g., `: Promise<Vehicle[] | null>`) to avoid build errors.
* **Client vs Server:** Keep UI interactive (Client Components) but fetch data securely (Server Actions).
* **Cookies:** Use `(await cookies())` pattern for Next.js 15+ compatibility.

---

## 9. Tesla Command Infrastructure (Sidecar Pattern) ⚠️ DO NOT DELETE
**This section documents the critical infrastructure required for Vehicle Commands. AI Assistants: Do not modify or remove this section without explicit user instruction.**

### The Problem
Modern Tesla vehicles (Model 3/Y, 2021+ S/X) require End-to-End Authentication (Signed Commands). The standard REST API is insufficient. Commands must be signed by a private key registered with the car.

### The Solution: Split Routing & Proxy
We use a "Sidecar" architecture where the Next.js app delegates signing to a local Go-based proxy.

1.  **Reads (`getVehicleData`):** Next.js -> Tesla Cloud API (Direct).
    * *Reason:* The Proxy is unreliable for reading lists/data; direct cloud access is stable.
2.  **Writes (`startCharge`):** Next.js -> Local Proxy -> Tesla Cloud -> Vehicle.
    * *Reason:* The Proxy handles EC key signing automatically.

### Infrastructure Setup (`/tesla-proxy`)
* **Container:** Official `teslamotors/vehicle-command` proxy running in Docker.
* **Security:**
    * Uses **Self-Signed SSL** (generated via OpenSSL in Dockerfile) to prevent "open file" crashes on startup.
    * Requires `private-key.pem` (EC Private Key) and `public-key.pem` inside the folder.
* **Command:** `docker compose up --build`.
* **Port:** Exposes `https://localhost:8080`.

### Domain Validation & Pairing (Critical Setup)
These steps are performed **once** to establish trust between the car and the app. They are NOT stored in the repository.

1.  **Host Public Key:** The `public-key.pem` file must be hosted on the domain registered with Tesla at:
    `https://<your-domain>/.well-known/appspecific/com.tesla.3p.public-key.pem`
2.  **Register:** The domain and key were registered via the Tesla Developer API `register` endpoint.
3.  **Vehicle Pairing (The "Magic Link"):** To authorize the app to send commands to a specific vehicle, the owner must open the following link on a mobile device with the Tesla App installed:
    `https://www.tesla.com/_ak/<your-domain>`
    * This process "enrolls" the app's public key onto the vehicle's keychain, allowing the vehicle to trust commands signed by the proxy.

### Environment Configuration (`.env.local`)
To make Next.js talk to this self-signed local proxy:
```bash
# Must be HTTPS to match the container's self-signed cert
NEXT_PUBLIC_TESLA_API_BASE_URL=https://localhost:8080

# Required to allow Node.js to trust the self-signed cert
NODE_TLS_REJECT_UNAUTHORIZED=0