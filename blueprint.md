# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API and Sungrow iSolarCloud API to provide users with a comprehensive, real-time dashboard of their vehicles and solar energy systems.

## Environment Variable Logging

*   **Objective:** To debug issues with environment variables in the production environment, logging has been added to the `sungrow-config.ts` file.
*   **Mechanism:** As each Sungrow-related environment variable is read, its value is logged to the console. This provides a direct and simple way to inspect the values that the application is receiving from the Vercel environment.
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

## Current Plan: Implement Environment Variable Logging

*   **Objective:** Add console logging to `sungrow-config.ts` to display the values of environment variables as they are read by the application.
*   **Status:** Completed
*   **Steps:**
    1.  Updated `lib/sungrow-config.ts` to log the values of all Sungrow-related environment variables.
    2.  Updated `blueprint.md` to reflect the new logging strategy.
    3.  Build and push the changes for redeployment.
