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
*   **Token Exchange:** A server action handles exchanging the authorization code for an access token. The request includes the `grant_type: 'authorization_code'`, `appkey`, `code`, and `redirect_uri` in the JSON body, and sends the `x-access-key` (the App Secret) in the headers.
*   **Configuration:** All API keys and redirect URLs are managed securely via environment variables.
*   **Error Handling & Logging:**
    *   **Server-Side:** The `getSungrowToken` action now performs detailed logging of the request body and the raw response from the Sungrow API. This provides complete visibility into the API transaction in the Vercel function logs.
    *   **Client-Side:** The `/auth/sungrow` callback page logs the full error object to the browser console and displays any raw HTML or text error received from the server directly on the page. This prevents generic messages from hiding the true nature of an error.
*   **Status:** **Completed**

## Styling & Design

*   **Framework:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design.
*   **Aesthetics:** UI components are polished with icons, balanced layouts, and clear typography.

## Current Plan: Implement Comprehensive Logging

*   **Objective:** Add detailed client and server-side logging to the Sungrow authentication flow for easier debugging.
*   **Status:** Completed
*   **Steps:**
    1.  Updated `app/sungrow/actions.ts` to log the outgoing request body and the full raw response from the Sungrow API.
    2.  Updated `app/auth/sungrow/page.tsx` to log error details to the browser console and render the raw error response on the page.
    3.  Updated `blueprint.md` to document the new logging features.
    4.  Commit and push changes for redeployment.
