# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API to allow users to authenticate and interact with their vehicle data. It implements the third-party token OAuth 2.0 flow.

## Features & Design

*   **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login.
*   **Dashboard:** A simple dashboard to display vehicle information after successful authentication.
*   **Styling:** Uses Tailwind CSS for a clean, modern design.

## Current Plan

*   **Objective:** Re-implement the Tesla Fleet API OAuth flow.
*   **Steps:**
    1.  Create `app/actions.ts` to handle the server-side token exchange.
    2.  Create the UI for the authentication flow:
        *   Update `app/page.tsx` to be the login page.
        *   Create `app/callback/page.tsx` to handle the redirect from Tesla.
        *   Create `app/callback/client-page.tsx` for the client-side logic on the callback page.
        *   Create `app/dashboard/page.tsx` for the post-authentication experience.
    3.  Add necessary environment variables for API keys.
    4.  Verify the build and ensure the flow is working.
