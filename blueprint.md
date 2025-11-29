# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API and Sungrow iSolarCloud API to provide users with a comprehensive, real-time dashboard of their vehicles and solar energy systems.

## Sungrow Authentication Flow Improvement

* **Objective:** Create a seamless user experience by automatically redirecting to the Sungrow dashboard after a successful authentication.
* **Implementation:**
    * The `app/auth/sungrow/page.tsx` file has been updated to handle the OAuth 2.0 callback.
    * Upon receiving a successful response from the `getSungrowToken` server action, the user is now programmatically redirected to the `/sungrow/dashboard` page using the `useRouter` hook from `next/navigation`.
    * The redundant and confusing `app/sungrow/callback/page.tsx` file has been deleted to streamline the codebase.
* **Status:** **Completed**

## Build Error Resolution

* **Objective:** Resolve persistent build errors that were preventing successful deployment.
* **Root Cause:** The primary issue was improper handling of the `cookies()` function from `next/headers` in Server Actions, leading to TypeScript type errors. A secondary issue was a missing null check for a URL search parameter.
* **Solution:**
    * **Cookie Handling:** Refactored `app/sungrow/actions.ts` to consistently use `(await cookies())` for all cookie interactions, mirroring the working implementation in `app/actions.ts`.
    * **Null Check:** Added validation in the callback page to ensure the `code` URL parameter is present before use.
* **Status:** **Completed**

## Tesla Integration

* **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login and stores the access token in a secure HTTP-only cookie.
* **Dashboard:** A unified view displaying detailed data for all of the user's vehicles.
* **Logout:** A secure logout function is provided.

## Sungrow Integration

* **Purpose:** Allows users to connect their Sungrow solar panel inverter to view energy data.
* **Authentication Flow:**
    1.  User clicks "Connect to Sungrow" and is redirected to the Sungrow iSolarCloud authorization page.
    2.  After approval, they are redirected back to the application's callback handler.
    3.  A server action exchanges the authorization `code` for an access token.
    4.  Upon success, the user is automatically redirected to the `/sungrow/dashboard`.
* **Token Exchange:** A server action securely handles the code-for-token exchange.
* **Configuration:** API keys and redirect URLs are managed via environment variables.

## User Experience Improvements

* **Tesla Re-authentication:** The combined dashboard now intelligently detects if the Tesla session has expired (while Sungrow remains active) and provides a direct "Connect Tesla" button, preventing users from getting stuck in a "No vehicles found" state.

## Styling & Design

* **Framework:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design.
* **Aesthetics:** UI components are polished with icons, balanced layouts, and clear typography.