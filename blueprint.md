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
*   **Token Exchange:** A server action now correctly handles exchanging the authorization code for an access token. The request includes the `grant_type: 'authorization_code'`, `appkey`, `code`, and `redirect_uri` in the JSON body, and sends the `x-access-key` (the App Secret) in the headers. This matches the requirements specified in the Sungrow API documentation.
*   **Configuration:** All API keys and redirect URLs are managed securely via environment variables, compatible with Vercel's production environment.
*   **Error Handling:** Robust error handling and logging have been implemented in the server action to provide clear, detailed error messages from the Sungrow API, preventing generic HTTP error pages from obscuring the root cause.
*   **Status:** **Completed**

## Styling & Design

*   **Framework:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design.
*   **Aesthetics:** UI components are polished with icons, balanced layouts, and clear typography.

## Current Plan: Fix Sungrow Token Exchange Request

*   **Objective:** Add the missing `grant_type` parameter to the Sungrow token exchange request body to resolve the `403` error.
*   **Status:** Completed
*   **Steps:**
    1.  Updated the `getSungrowToken` action in `app/sungrow/actions.ts` to include `grant_type: 'authorization_code'` in the POST request body.
    2.  Improved error logging to capture the full response body on failure.
    3.  Updated `blueprint.md` to reflect the change.
    4.  Commit and push changes for redeployment.
