# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API and Sungrow iSolarCloud API to provide users with a comprehensive, real-time dashboard of their vehicles and solar energy systems.

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
    *   **Server-Side:** The `getSungrowToken` action now includes a pre-flight check to ensure that the `SUNGROW_APP_KEY` and `SUNGROW_SECRET_KEY` environment variables are present on the server. This prevents cryptic production errors by providing a clear, actionable error message if the server is not configured correctly.
    *   **Client-Side:** The callback page provides detailed logging and renders raw server errors, preventing generic Next.js error messages from obscuring the root cause.
*   **Status:** **Completed**

## Styling & Design

*   **Framework:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design.
*   **Aesthetics:** UI components are polished with icons, balanced layouts, and clear typography.

## Current Plan: Improve Production Error Clarity

*   **Objective:** Add a specific server-side check for environment variables to provide a clear error message in production, avoiding the generic Next.js "Server Components render error."
*   **Status:** Completed
*   **Steps:**
    1.  Updated `app/sungrow/actions.ts` to include a check for the existence of `SUNGROW_APP_KEY` and `SUNGROW_SECRET_KEY` on the server.
    2.  Updated `blueprint.md` to reflect the new error handling.
    3.  Commit and push the changes for redeployment.
