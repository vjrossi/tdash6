# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API and Sungrow iSolarCloud API to provide users with a comprehensive, real-time dashboard of their vehicles and solar energy systems.

## Build Error Resolution

*   **Objective:** Resolve persistent build errors that were preventing successful deployment.
*   **Root Cause:** The primary issue was improper handling of the `cookies()` function from `next/headers` in Server Actions, leading to TypeScript type errors. A secondary issue was a missing null check for a URL search parameter.
*   **Solution:**
    *   **Cookie Handling:** Refactored `app/sungrow/actions.ts` to consistently use `(await cookies())` for all cookie interactions, mirroring the working implementation in `app/actions.ts`. This ensures that the `cookies` object is correctly resolved before being used.
    *   **Null Check:** Added a validation check in `app/sungrow/callback/page.tsx` to ensure the `code` URL parameter is present before attempting to use it, preventing a type error.
*   **Status:** **Completed**

## Tesla Integration

*   **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login. The authentication flow is handled by exchanging an authorization code for an access token, which is then stored in a secure HTTP-only cookie.
*   **Dashboard:** A single, unified view that displays detailed data for all of the user's vehicles.
*   **Logout:** A logout button is provided for users to securely end their session.

## Sungrow Integration

*   **Purpose:** Allows users to connect their Sungrow solar panel inverter to the application to view energy data.
*   **Authentication Flow:**
    1.  The user clicks a "Connect to Sungrow" button on the `/sungrow` page.
    2.  They are redirected to the Sungrow iSolarCloud authorization page.
    3.  After approving the request, they are redirected back to the application at `/auth/sungrow`.
    4.  A server action (`getSungrowToken`) automatically exchanges the received authorization `code` for an access token.
    5.  The access token data is then displayed on the page for verification.
*   **Token Exchange:** A server action handles exchanging the authorization code for an access token, with all required parameters and headers.
*   **Configuration:** All API keys and redirect URLs are managed securely via environment variables.
*   **Error Handling & Logging:**
    *   **Server-Side:** Logging has been added to show the values of the environment variables as they are read by the application.
    *   **Client-Side:** The callback page provides detailed logging and renders raw server errors, preventing generic Next.js error messages from obscuring the root cause.
*   **Status:** **Completed**

## Styling & Design

*   **Framework:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design.
*   **Aesthetics:** UI components are polished with icons, balanced layouts, and clear typography.

