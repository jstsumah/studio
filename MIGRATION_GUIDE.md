# Project Migration Guide

This guide provides the steps to move your application and its Firebase backend to a new workspace or Google Cloud/Firebase account.

Your project is composed of two independent parts that need to be handled:
1.  **The Application Code**: The Next.js project files.
2.  **The Firebase Backend**: The database, authentication, and storage services.

## Migration Steps

Follow these steps to migrate your project successfully.

### 1. Move the Application Code

Your code should be stored in a Git repository (like on GitHub, GitLab, etc.). This makes it easily portable.

- If your code is already in a repository, you can simply clone it in your new workspace.
- If not, initialize a new Git repository in your project folder, commit your code, and push it to a remote repository provider of your choice.

### 2. Create a New Firebase Project

In the new Google Cloud account or workspace where you want to host the app:

- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click **"Add project"** and follow the steps to create a new Firebase project.

### 3. Enable Required Firebase Services

Inside your new Firebase project, you must enable the same services used by the application:

- **Authentication**: Go to **Build > Authentication** and click **"Get started"**. Enable the **Email/Password** provider.
- **Firestore Database**: Go to **Build > Firestore Database** and click **"Create database"**. Start in **production mode**. Choose a location for your database.
- **Storage**: Go to **Build > Storage** and click **"Get started"**. Follow the prompts to enable Cloud Storage.

### 4. Get the New Firebase Configuration

You need to get the configuration object that links your application code to your new Firebase project.

- In the Firebase Console, go to **Project Overview** and click the **Project settings** gear icon.
- In the **General** tab, scroll down to the "Your apps" section.
- Click the **Web** icon (`</>`) to create a new Web App.
- Give your app a nickname and click **"Register app"**.
- Firebase will display a `firebaseConfig` object. Copy this entire object.

### 5. Update Your Application Code

In your application's code:

- Open the file at `src/lib/firebase.ts`.
- **Replace** the entire existing `firebaseConfig` object with the new one you copied from your new Firebase project.

### 6. Set Up Security Rules & Data

Your new backend needs the correct security rules and initial data.

#### a. Update Security Rules

You need to copy the rules from your old project (or from the project files) to the new one.

- **Firestore Rules**:
  - Go to **Build > Firestore Database > Rules** tab.
  - **Replace** the default rules with your application's Firestore rules.
  - Click **Publish**.

- **Storage Rules**:
  - Go to **Build > Storage > Rules** tab.
  - **Replace** the default rules with your application's Storage rules.
  - Click **Publish**.

#### b. Seed the Database

Your new database is empty. Run the seed script to populate it with the initial set of companies, employees, and assets.

- Open a terminal in your project's root directory.
- Run the command: `npm run seed`.
- This will connect to your new Firebase project (using the updated config) and add the necessary data.

### 7. Create Authentication Users

The seed script adds user data to the database, but it does not create the actual login accounts. You must do this manually in the Firebase console.

- Go to **Build > Authentication > Users** tab.
- Click **"Add user"** and create accounts for the emails used in the seed data (e.g., `jane.doe@example.com`, `john.smith@example.com`).

### 8. Deploy

Your application is now fully migrated. You can deploy it using the instructions in `DEPLOYMENT.md`.
