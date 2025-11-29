# Project Blueprint: T-Dash

## 1. Project Overview
**T-Dash** is a unified energy dashboard that aggregates real-time data from **Tesla Vehicles** (via Fleet API) and **Sungrow Solar Inverters** (via iSolarCloud API). It is built as a **Single-Page Application (SPA)** where users can view and manage all their energy assets in one place.

## 2. Tech Stack & Architecture
* **Framework:** Next.js 15+ (App Router).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS (Dark Mode default) with Lucide React icons.
* **State Management:** Server Actions for data fetching; React State for UI interaction.
* **Deployment:** Vercel (recommended).

## 3. Core Philosophy: "No Database"
The application does **not** use a backend database to store user accounts.
* **Session:** User identity is defined solely by valid **HTTP-Only Cookies** (`tesla_access_token`, `sungrow_access_token`) stored in the user's browser.
* **Persistence:** Tokens are managed via secure cookies. If cookies are cleared, the user is "logged out."

## 4. Authentication & Token Management

### General Flow
* **OAuth 2.0:** Both services use OAuth Authorization Code flow.
* **Server Actions:** All token exchanges happen server-side to keep secrets safe.
* **Redirects:** OAuth callbacks redirect the user back to `/dashboard` immediately after success.

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
* **Data:** Battery level, range, climate status, tyre pressure, location, odometer.
* **Controls:** Start/Stop Charging.
* **Vehicle State Policy:**
    * **Never Auto-Wake:** The app checks `vehicle.state` first.
    * **Asleep:** If "asleep", the app displays a "Moon" icon and **does not** call detailed data endpoints. It relies on the user to wake the car externally or via a manual "Refresh" action if implemented.
    * **Offline:** Distinct from "Asleep", indicated by a connection error.

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
*Last Updated: Current State of Production*