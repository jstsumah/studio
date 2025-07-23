# Firebase App Hosting Deployment Guide

This guide provides the steps to deploy your Next.js application using Firebase App Hosting.

## Prerequisites

- Your application code must be in a GitHub repository.
- You must have access to the Firebase project associated with this application.

## Deployment Steps

1.  **Push Your Code to GitHub:**
    *   Ensure all the latest changes are committed and pushed to your main branch (e.g., `main` or `master`) on GitHub.

2.  **Navigate to the Firebase Console:**
    *   Open your project in the [Firebase Console](https://console.firebase.google.com/).

3.  **Go to App Hosting:**
    *   In the "Build" section of the left-hand menu, click on **App Hosting**.

4.  **Create a Backend:**
    *   Click the button to get started and create your first "backend".
    *   You will be prompted to connect to GitHub. Authorize Firebase to access your repositories.

5.  **Connect Your Repository:**
    *   Select the GitHub repository containing your application code.
    *   Configure the deployment settings:
        *   **Root directory:** Keep this as the default (`/`).
        *   **Deployment branch:** Choose the branch you want to deploy from (e.g., `main`).

6.  **Deploy!**
    *   Save the configuration. Firebase will automatically start the first deployment.
    *   You can watch the progress in the App Hosting dashboard. When it's finished, Firebase will provide you with a public URL where you can access your live application.

From now on, every time you push a new commit to your deployment branch, Firebase App Hosting will automatically rebuild and redeploy your application.
