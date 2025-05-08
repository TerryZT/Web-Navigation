# Link Hub - All-Subject English Enlightenment Platform

This project is a Next.js application designed as a personal navigation hub for important links, tailored for the "All-Subject English Enlightenment" platform by Erin's team. It features a public-facing page to display categorized links and an admin panel for managing this content.

## Features

*   **Public Link Display**: Dynamically displays categorized links on the homepage.
*   **Search Functionality**: Allows users to search through categories and links.
*   **Admin Panel**: Secure section for managing categories and links.
    *   CRUD operations for categories (name, description, icon).
    *   CRUD operations for links (title, URL, description, category, icon).
    *   Admin dashboard with content overview.
    *   Settings page to change admin password and (conceptually) theme settings.
*   **Authentication**: Simple password-based authentication for the admin panel.
*   **Theme Customization**:
    *   Light/Dark mode toggle.
    *   Multiple color scheme options (Purple Bliss, Classic Teal, Forest Whisper, Ocean Blue, Sunset Orange, Rose Pink).
    *   Theme preferences are saved in `localStorage`.
*   **Responsive Design**: Adapts to various screen sizes (mobile, tablet, desktop).
*   **Data Storage Options**:
    *   **Local Storage**: Default data persistence using browser's `localStorage`.
    *   **Firebase Firestore**: Optional cloud-based storage, configurable via environment variables.
*   **Genkit Integration**: Includes setup for Google's Genkit for potential AI features (currently minimal usage).

## Tech Stack

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: ShadCN UI
*   **Icons**: Lucide React
*   **State Management**: React Context API (for Theme), React Hooks (`useState`, `useEffect`)
*   **Form Handling**: React Hook Form with Zod for validation
*   **AI Toolkit**: Genkit (with Google AI plugin)
*   **Database (Optional)**: Firebase Firestore
*   **Linting/Formatting**: ESLint, Prettier (implied by Next.js standards)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file in the root of your project and add the necessary environment variables. See the [Environment Variables](#environment-variables) section below.

    Example `.env.local`:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="local" # or "firebase"

    # Required if NEXT_PUBLIC_DATA_SOURCE_TYPE is "firebase"
    NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"
    ```

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:9002`.

### Running Genkit (Optional)

If you plan to work with Genkit flows:

```bash
npm run genkit:dev
```

This will start the Genkit development server, usually on `http://localhost:4000`.

## Environment Variables

*   `NEXT_PUBLIC_DATA_SOURCE_TYPE`: Specifies the data storage method.
    *   `local`: Uses browser `localStorage` (default if not set).
    *   `firebase`: Uses Firebase Firestore. Requires Firebase project setup and the variables below.
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase project's API key.
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase project's Auth domain.
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project's ID.
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase project's Storage bucket.
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase project's Messaging Sender ID.
*   `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase project's App ID.

## Admin Panel Access

*   **URL**: `/admin`
*   **Default Password**: `admin`

You can change the password from the `/admin/settings` page after logging in. Note that for the mock `localStorage` setup, changing the password updates a mock stored password, but the login check always uses "admin". For Firebase, this would involve backend changes not covered here.

## Project Structure

*   `src/app/`: Next.js App Router pages.
    *   `src/app/page.tsx`: Public-facing link hub.
    *   `src/app/admin/`: Admin panel pages and layout.
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/admin/`: Admin-specific components.
    *   `src/components/layout/`: Layout components (header, footer, logo).
    *   `src/components/links/`: Components for displaying links.
*   `src/lib/`: Core logic and services.
    *   `src/lib/auth-service.ts`: Mock authentication logic.
    *   `src/lib/data-service.ts`: Main data service, switches between local and Firebase.
    *   `src/lib/local-data-service.ts`: `localStorage` based data operations.
    *   `src/lib/firebase-data-service.ts`: Firebase Firestore based data operations.
    *   `src/lib/firebase-config.ts`: Firebase initialization.
*   `src/contexts/`: React Context providers (e.g., `ThemeContext.tsx`).
*   `src/hooks/`: Custom React hooks (e.g., `useToast.ts`, `use-mobile.ts`).
*   `src/ai/`: Genkit related files.
    *   `src/ai/genkit.ts`: Genkit configuration.
    *   `src/ai/dev.ts`: Genkit development server entry point.
*   `src/types/`: TypeScript type definitions.
*   `public/`: Static assets.
*   `src/app/globals.css`: Global styles and Tailwind CSS theme variables.
*   `tailwind.config.ts`: Tailwind CSS configuration.

## Deployment

This Next.js application can be deployed to any platform that supports Node.js, such as Vercel (recommended for Next.js), Netlify, or a custom server.

Ensure your environment variables are correctly set up on your deployment platform, especially for Firebase configuration if you choose to use it.

## Contributing

This project is primarily developed by Erin's All-Subject English Enlightenment team and Terry. For contributions, please follow standard Git workflow (fork, branch, pull request).
