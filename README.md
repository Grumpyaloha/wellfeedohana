# Well Feed Ohana
 Well Fed ʻOhana - Site Analysis & Planning Tool

This is a data-driven React application designed for the "Well Fed ʻOhana" non-profit. It transforms a detailed site analysis checklist into a dynamic, multi-section digital form. The application uses Google Firebase for backend services (Authentication, Firestore Database) and integrates with the Google Gemini AI for intelligent data summarization.

## Features

- **Dynamic Multi-Section Form**: Guides facilitators through a comprehensive site analysis.
- **Firebase Integration**: Securely saves all form data in real-time to a queryable Firestore database.
- **User Authentication**: Manages user sessions for data integrity.
- **AI-Powered Summaries**: Utilizes the Gemini API to generate actionable insights and recommendations from the collected data.
- **Responsive Design**: Mobile-first interface ensures usability on any device, from phones to desktops.
- **Ready for Deployment**: Structured for easy deployment to Firebase Hosting or other cloud providers.

---

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Google Cloud / Firebase project.

### 1. Clone the Repository

First, clone this repository to your local machine.

```bash
git clone <your-repository-url>
cd well-fed-ohana-app
```

### 2. Install Dependencies

Install the necessary Node.js packages.

```bash
npm install
```

### 3. Configure Firebase

You need to connect the application to your Firebase project.

1.  Navigate to your project in the [Firebase Console](https://console.firebase.google.com/).
2.  Go to **Project settings** (click the ⚙️ gear icon).
3.  Under the "General" tab, find the "Your apps" section.
4.  Click the web icon (`</>`) to add a web app. If you already have one, select it.
5.  Find and copy the `firebaseConfig` object.
6.  In the project, navigate to `src/firebaseConfig.js`. Paste your credentials into this file.

### 4. Run the Development Server

To see the application running locally, use the following command.

```bash
npm start
```

This will open the app in your browser at `http://localhost:3000`.

---

## Deployment

This application is optimized for deployment on **Firebase Hosting**.

### 1. Install Firebase CLI

If you don't have it already, install the Firebase Command Line Interface globally.

```bash
npm install -g firebase-tools
```

### 2. Login and Initialize Firebase

Log in to your Google account and initialize Firebase within the project directory.

```bash
firebase login
firebase init
```

Follow the CLI prompts:
- **Which Firebase features?** ➡️ Select **Hosting**.
- **Project Setup** ➡️ Choose **Use an existing project** and select your project.
- **Public directory?** ➡️ Type **`build`**.
- **Configure as a single-page app?** ➡️ Type **`y`** (Yes).
- **Set up automatic builds with GitHub?** ➡️ Type **`n`** (No) for now.

### 3. Build and Deploy

Create a production build of the app and deploy it.

```bash
npm run build
firebase deploy
```

Once complete, the CLI will provide you with the live URL for your application.

