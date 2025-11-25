# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API to allow users to authenticate and interact with their vehicle data. It implements the third-party token OAuth 2.0 flow.

## Features & Design

*   **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login. The authentication flow is now more robust, using `zod` for validation, storing access tokens in secure HTTP-only cookies, and correctly constructing the `redirect_uri` using the `NEXT_PUBLIC_APP_URL` environment variable. The callback from Tesla is handled on a client-side component to exchange the authorization code for an access token.
*   **Dashboard:** A simple dashboard to display vehicle information after successful authentication. Users can view a list of their vehicles and click to see more detailed information. 
*   **Styling:** Uses Tailwind CSS for a clean, modern design.
*   **Logout:** A logout button is provided for users to securely end their session.
*   **Wake Up Vehicle:** Users can wake up a vehicle from sleep mode directly from the vehicle details page.

## Completed Plan

*   **Objective:** Re-implement the Tesla Fleet API OAuth flow.
*   **Status:** Completed

*   **Objective:** Fetch and display vehicle data on the dashboard.
*   **Status:** Completed

*   **Objective:** Add a "wake up" feature to wake a vehicle from sleep mode.
*   **Status:** Completed

*   **Objective:** Fix authentication flow based on provided sample code.
*   **Status:** Completed

*   **Objective:** Remove testbed functionality.
*   **Status:** Completed

## Next Steps

*   **Objective:** Enhance the user interface and add more vehicle controls.
*   **Steps:**
    1.  Improve the visual design of the dashboard and vehicle details pages.
    2.  Implement climate control (HVAC) features.
    3.  Implement lock/unlock functionality for the vehicle.
