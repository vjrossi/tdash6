# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API to allow users to authenticate and view basic information about their vehicles.

## Features & Design

*   **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login. The authentication flow is handled by exchanging an authorization code for an access token, which is then stored in a secure HTTP-only cookie.
*   **Dashboard:** A simple dashboard that displays a list of the user's vehicles. For each vehicle, the following information is displayed:
    *   Vehicle Name
    *   VIN (Vehicle Identification Number)
    *   State (e.g., "online", "asleep")
*   **Styling:** Uses Tailwind CSS for a clean, modern design.
*   **Logout:** A logout button is provided for users to securely end their session.

## Completed Plan

*   **Objective:** Re-implement the Tesla Fleet API OAuth flow.
*   **Status:** Completed

*   **Objective:** Fetch and display vehicle data on the dashboard.
*   **Status:** Completed

*   **Objective:** Simplify the application to only display vehicle name, VIN, and state.
*   **Status:** Completed
