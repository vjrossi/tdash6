# Project Blueprint

## Overview

This application integrates with the Tesla Fleet API to allow users to authenticate and view a comprehensive, real-time dashboard of their vehicles.

## Features & Design

*   **Authentication:** Utilizes Tesla's OAuth 2.0 for secure login. The authentication flow is handled by exchanging an authorization code for an access token, which is then stored in a secure HTTP-only cookie.
*   **Single-Page Dashboard:** A single, unified view that displays detailed data for all of the user's vehicles.
*   **Styling:** Uses Tailwind CSS for a clean, modern, and beautiful dark-mode design. UI components will be polished with icons, balanced layouts, and clear typography.
*   **Logout:** A logout button is provided for users to securely end their session.

## Current Plan

*   **Objective:** Redesign the dashboard to be a single-page experience and display a richer set of vehicle data.
*   **Status:** In Progress
*   **Steps:**
    1.  Install `lucide-react` to provide a library of modern icons.
    2.  Update the main dashboard page to fetch detailed data for all vehicles in parallel.
    3.  Completely redesign the `VehicleCard` component to create a beautiful and intuitive layout for the new, comprehensive data set. This will include:
        *   **Charge State:** Battery level (with a visual progress bar), charging status, and range.
        *   **Climate Control:** Interior and exterior temperatures, and climate status.
        *   **Vehicle Status:** Odometer, current location, and sentry mode status.
        *   **Tyre Pressure:** A new, beautifully designed section to display the pressure of each tyre in PSI.
    4.  Convert all distance units from miles to kilometres (e.g., odometer and range).
