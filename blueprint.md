
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
*   **Configuration:** All API keys and redirect URLs are managed securely via environment variables, compatible with Vercel's production environment. This follows the same secure pattern as the Tesla integration.
*   **Error Handling:** Robust error handling is implemented on both the server action (providing clear logs) and the client-side callback page (displaying user-friendly error messages).
*   **Status:** **Completed**

## Styling & Design

*   **Framework:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design.
*   **Aesthetics:** UI components are polished with icons, balanced layouts, and clear typography.

## Current Plan: Deployment

*   **Objective:** Commit and push all recent changes to the repository.
*   **Status:** In Progress
*   **Steps:**
    1.  Update `blueprint.md` to reflect the completed Sungrow integration.
    2.  Stage all new and modified files for commit.
    3.  Create a commit with a descriptive message.
    4.  Push the commit to the remote repository.
