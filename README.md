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
    *   **PostgreSQL**: Optional cloud-based relational database, configurable via environment variables.
    *   **MongoDB**: Optional cloud-based NoSQL database, configurable via environment variables.
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
*   **Database (Optional)**: PostgreSQL, MongoDB
*   **Linting/Formatting**: ESLint, Prettier (implied by Next.js standards)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   Access to a PostgreSQL or MongoDB instance if using cloud storage.

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

    Example `.env.local` for local storage:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="local"
    ```

    Example `.env.local` for PostgreSQL:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="postgres"
    POSTGRES_HOST="your_postgres_host"
    POSTGRES_PORT="5432"
    POSTGRES_USER="your_postgres_user"
    POSTGRES_PASSWORD="your_postgres_password"
    POSTGRES_DB="your_postgres_database_name"
    # Optional: POSTGRES_CONNECTION_STRING="postgresql://user:password@host:port/database" (overrides individual vars)
    ```

    Example `.env.local` for MongoDB:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="mongodb"
    MONGODB_URI="your_mongodb_connection_string" # e.g., mongodb+srv://user:pass@cluster.mongodb.net/
    MONGODB_DB_NAME="your_mongodb_database_name"
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
    *   `postgres`: Uses PostgreSQL. Requires PostgreSQL connection variables below.
    *   `mongodb`: Uses MongoDB. Requires MongoDB connection variables below.

*   **PostgreSQL Variables** (Required if `NEXT_PUBLIC_DATA_SOURCE_TYPE` is "postgres"):
    *   `POSTGRES_HOST`: Hostname or IP address of your PostgreSQL server.
    *   `POSTGRES_PORT`: Port number for PostgreSQL (default is 5432).
    *   `POSTGRES_USER`: Username for connecting to PostgreSQL.
    *   `POSTGRES_PASSWORD`: Password for the PostgreSQL user.
    *   `POSTGRES_DB`: Name of the PostgreSQL database.
    *   `POSTGRES_CONNECTION_STRING` (Optional): A full PostgreSQL connection string. If provided, it may override the individual parameters above depending on the client library's behavior.

*   **MongoDB Variables** (Required if `NEXT_PUBLIC_DATA_SOURCE_TYPE` is "mongodb"):
    *   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017` or `mongodb+srv://user:password@cluster.host.net/`).
    *   `MONGODB_DB_NAME`: The name of the MongoDB database to use.


**Important Note on Data Services:** When using PostgreSQL or MongoDB, data operations are intended to be server-side. The current client-side pages will require refactoring to use Next.js Server Actions or API routes that invoke these server-side data operations. `LocalDataService` remains client-compatible.

## Admin Panel Access

*   **URL**: `/admin`
*   **Default Password**: `admin`

You can change the password from the `/admin/settings` page after logging in. Note that for the mock `localStorage` setup, changing the password updates a mock stored password, but the login check always uses "admin".

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
    *   `src/lib/data-service.ts`: Main data service, switches between local, PostgreSQL, and MongoDB.
    *   `src/lib/local-data-service.ts`: `localStorage` based data operations.
    *   `src/lib/postgres-data-service.ts`: PostgreSQL based data operations (structure provided).
    *   `src/lib/mongo-data-service.ts`: MongoDB based data operations (structure provided).
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

Ensure your environment variables are correctly set up on your deployment platform, especially for PostgreSQL or MongoDB configurations if you choose to use them. You will also need to ensure your database schema is set up for PostgreSQL.

## Contributing

This project is primarily developed by Erin's All-Subject English Enlightenment team and Terry. For contributions, please follow standard Git workflow (fork, branch, pull request).
