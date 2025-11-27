# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API to allow users to authenticate and view a comprehensive, real-time dashboard of their vehicles.

## Sungrow Integration

This new feature will allow users to connect their Sungrow solar panel inverter to the application.

## Features & Design

*   **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login. The authentication flow is handled by exchanging an authorization code for an access token, which is then stored in a secure HTTP-only cookie.
*   **Single-Page Dashboard:** A single, unified view that displays detailed data for all of the user's vehicles.
*   **Styling:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design. UI components will be polished with icons, balanced layouts, and clear typography.
*   **Logout:** A logout button is provided for users to securely end their session.

## Current Plan

*   **Objective:** Add UI and backend for the Sungrow API integration.
*   **Status:** In Progress
*   **Steps:**
    1.  Create a new `blueprint.md` to track the Sungrow integration.
    2.  Store Sungrow API credentials in a new file `lib/sungrow-config.ts`.
    3.  Create a new page at `/sungrow` with a "Connect to Sungrow" button.
    4.  The button will redirect to the Sungrow Authorize URL.
    5.  Create a new callback page at `/auth/sungrow` to handle the redirect.
    6.  Update the main page to include a link to the `/sungrow` page.
