# Link Hub - All-Subject English Enlightenment Platform
# Link Hub - 全科英语启蒙平台

This project is a Next.js application designed as a personal navigation hub for important links, tailored for the "All-Subject English Enlightenment" platform by Erin's team. It features a public-facing page to display categorized links and an admin panel for managing this content.

本项目是一个 Next.js 应用程序，作为 Erin 团队“全科英语启蒙”平台的重要链接个人导航中心。它包含一个面向公众的页面，用于显示分类链接，以及一个用于管理此内容的管理面板。

## Features / 功能特性

*   **Public Link Display**: Dynamically displays categorized links on the homepage.
    *   **公共链接显示**: 在主页动态显示分类链接。
*   **Search Functionality**: Allows users to search through categories and links.
    *   **搜索功能**: 允许用户搜索类别和链接。
*   **Admin Panel**: Secure section for managing categories and links.
    *   **管理面板**: 用于管理类别和链接的安全区域。
    *   CRUD operations for categories (name, description, icon).
        *   类别的 CRUD 操作（名称、描述、图标）。
    *   CRUD operations for links (title, URL, description, category, icon).
        *   链接的 CRUD 操作（标题、URL、描述、类别、图标）。
    *   Admin dashboard with content overview.
        *   包含内容概览的管理仪表板。
    *   Settings page to change admin password and (conceptually) theme settings.
        *   用于更改管理员密码和（概念上）主题设置的设置页面。
*   **Authentication**: Simple password-based authentication for the admin panel.
    *   **身份验证**: 管理面板的简单密码认证。
*   **Theme Customization**:
    *   **主题定制**:
    *   Light/Dark mode toggle.
        *   浅色/深色模式切换。
    *   Multiple color scheme options (Purple Bliss, Classic Teal, Forest Whisper, Ocean Blue, Sunset Orange, Rose Pink).
        *   多种配色方案选项（紫色幸福、经典青色、森林低语、海洋蓝、日落橙、玫瑰粉）。
    *   Theme preferences are saved in `localStorage`.
        *   主题偏好保存在 `localStorage` 中。
*   **Responsive Design**: Adapts to various screen sizes (mobile, tablet, desktop).
    *   **响应式设计**: 适应各种屏幕尺寸（手机、平板电脑、桌面）。
*   **Data Storage Options**:
    *   **数据存储选项**:
    *   **Local Storage**: Default data persistence using browser's `localStorage`.
        *   **本地存储**: 默认使用浏览器的 `localStorage` 进行数据持久化。
    *   **PostgreSQL**: Optional cloud-based relational database, configurable via environment variables.
        *   **PostgreSQL**: 可选的基于云的关系型数据库，可通过环境变量配置。
    *   **MongoDB**: Optional cloud-based NoSQL database, configurable via environment variables.
        *   **MongoDB**: 可选的基于云的 NoSQL 数据库，可通过环境变量配置。
*   **Genkit Integration**: Includes setup for Google's Genkit for potential AI features (currently minimal usage).
    *   **Genkit 集成**: 包含 Google Genkit 的设置，用于潜在的 AI 功能（目前使用最少）。

## Tech Stack / 技术栈

*   **Framework**: Next.js (App Router)
    *   **框架**: Next.js (App Router)
*   **Language**: TypeScript
    *   **语言**: TypeScript
*   **Styling**: Tailwind CSS
    *   **样式**: Tailwind CSS
*   **UI Components**: ShadCN UI
    *   **UI 组件**: ShadCN UI
*   **Icons**: Lucide React
    *   **图标**: Lucide React
*   **State Management**: React Context API (for Theme), React Hooks (`useState`, `useEffect`)
    *   **状态管理**: React Context API (用于主题), React Hooks (`useState`, `useEffect`)
*   **Form Handling**: React Hook Form with Zod for validation
    *   **表单处理**: React Hook Form 与 Zod (用于验证)
*   **AI Toolkit**: Genkit (with Google AI plugin)
    *   **AI 工具包**: Genkit (集成 Google AI 插件)
*   **Database (Optional)**: PostgreSQL, MongoDB
    *   **数据库 (可选)**: PostgreSQL, MongoDB
*   **Linting/Formatting**: ESLint, Prettier (implied by Next.js standards)
    *   **代码检查/格式化**: ESLint, Prettier (Next.js 标准中隐含)

## Getting Started / 开始使用

### Prerequisites / 先决条件

*   Node.js (v18 or later recommended)
    *   Node.js (推荐 v18 或更高版本)
*   npm or yarn
    *   npm 或 yarn
*   Access to a PostgreSQL or MongoDB instance if using cloud storage.
    *   如果使用云存储，需要有 PostgreSQL 或 MongoDB 实例的访问权限。

### Installation / 安装

1.  **Clone the repository**:
    **克隆仓库**:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies**:
    **安装依赖**:
    ```bash
    npm install
    # or
    # 或
    yarn install
    ```

3.  **Set up environment variables**:
    **设置环境变量**:
    Create a `.env.local` file in the root of your project and add the necessary environment variables. See the [Environment Variables](#environment-variables) section below.
    在项目根目录创建一个 `.env.local` 文件，并添加必要的环境变量。请参阅下面的 [Environment Variables / 环境变量](#environment-variables--环境变量) 部分。

    Example `.env.local` for local storage:
    本地存储示例 `.env.local`:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="local"
    ```

    Example `.env.local` for PostgreSQL:
    PostgreSQL 示例 `.env.local`:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="postgres"
    POSTGRES_HOST="your_postgres_host"
    POSTGRES_PORT="5432"
    POSTGRES_USER="your_postgres_user"
    POSTGRES_PASSWORD="your_postgres_password"
    POSTGRES_DB="your_postgres_database_name"
    # Optional: POSTGRES_CONNECTION_STRING="postgresql://user:password@host:port/database" (overrides individual vars)
    # 可选: POSTGRES_CONNECTION_STRING="postgresql://user:password@host:port/database" (会覆盖独立变量)
    ```

    Example `.env.local` for MongoDB:
    MongoDB 示例 `.env.local`:
    ```env
    NEXT_PUBLIC_DATA_SOURCE_TYPE="mongodb"
    MONGODB_URI="your_mongodb_connection_string" # e.g., mongodb+srv://user:pass@cluster.mongodb.net/ (例如)
    MONGODB_DB_NAME="your_mongodb_database_name"
    ```

### Running the Development Server / 运行开发服务器

Start the Next.js development server:
启动 Next.js 开发服务器：
```bash
npm run dev
# or
# 或
yarn dev
```
The application will be available at `http://localhost:9002`.
应用程序将在 `http://localhost:9002` 上可用。

### Running Genkit (Optional) / 运行 Genkit (可选)

If you plan to work with Genkit flows:
如果您计划使用 Genkit 工作流：
```bash
npm run genkit:dev
```
This will start the Genkit development server, usually on `http://localhost:4000`.
这将启动 Genkit 开发服务器，通常在 `http://localhost:4000` 上。

## Environment Variables / 环境变量

*   `NEXT_PUBLIC_DATA_SOURCE_TYPE`: Specifies the data storage method.
    *   `local`: Uses browser `localStorage` (default if not set).
    *   `postgres`: Uses PostgreSQL. Requires PostgreSQL connection variables below.
    *   `mongodb`: Uses MongoDB. Requires MongoDB connection variables below.
*   `NEXT_PUBLIC_DATA_SOURCE_TYPE`: 指定数据存储方式。
    *   `local`: 使用浏览器 `localStorage` (如果未设置，则为默认值)。
    *   `postgres`: 使用 PostgreSQL。需要下面的 PostgreSQL 连接变量。
    *   `mongodb`: 使用 MongoDB。需要下面的 MongoDB 连接变量。

*   **PostgreSQL Variables** (Required if `NEXT_PUBLIC_DATA_SOURCE_TYPE` is "postgres"):
    *   `POSTGRES_HOST`: Hostname or IP address of your PostgreSQL server.
    *   `POSTGRES_PORT`: Port number for PostgreSQL (default is 5432).
    *   `POSTGRES_USER`: Username for connecting to PostgreSQL.
    *   `POSTGRES_PASSWORD`: Password for the PostgreSQL user.
    *   `POSTGRES_DB`: Name of the PostgreSQL database.
    *   `POSTGRES_CONNECTION_STRING` (Optional): A full PostgreSQL connection string. If provided, it may override the individual parameters above depending on the client library's behavior.
*   **PostgreSQL 变量** (如果 `NEXT_PUBLIC_DATA_SOURCE_TYPE` 为 "postgres"，则为必需):
    *   `POSTGRES_HOST`: PostgreSQL 服务器的主机名或 IP 地址。
    *   `POSTGRES_PORT`: PostgreSQL 的端口号 (默认为 5432)。
    *   `POSTGRES_USER`: 连接 PostgreSQL 的用户名。
    *   `POSTGRES_PASSWORD`: PostgreSQL 用户的密码。
    *   `POSTGRES_DB`: PostgreSQL 数据库的名称。
    *   `POSTGRES_CONNECTION_STRING` (可选): 完整的 PostgreSQL 连接字符串。如果提供，根据客户端库的行为，它可能会覆盖上述单个参数。

*   **MongoDB Variables** (Required if `NEXT_PUBLIC_DATA_SOURCE_TYPE` is "mongodb"):
    *   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017` or `mongodb+srv://user:password@cluster.host.net/`).
    *   `MONGODB_DB_NAME`: The name of the MongoDB database to use.
*   **MongoDB 变量** (如果 `NEXT_PUBLIC_DATA_SOURCE_TYPE` 为 "mongodb"，则为必需):
    *   `MONGODB_URI`: 您的 MongoDB 连接字符串 (例如, `mongodb://localhost:27017` 或 `mongodb+srv://user:password@cluster.host.net/`)。
    *   `MONGODB_DB_NAME`: 要使用的 MongoDB 数据库的名称。

**Important Note on Data Services:** When using PostgreSQL or MongoDB, data operations are intended to be server-side. The current client-side pages will require refactoring to use Next.js Server Actions or API routes that invoke these server-side data operations. `LocalDataService` remains client-compatible.

**关于数据服务的重要说明:** 使用 PostgreSQL 或 MongoDB 时，数据操作旨在服务器端执行。当前的客户端页面将需要重构，以使用调用这些服务器端数据操作的 Next.js Server Actions 或 API 路由。`LocalDataService` 保持客户端兼容。

## Admin Panel Access / 管理面板访问

*   **URL**: `/admin`
*   **Default Password**: `admin`
    *   **默认密码**: `admin`

You can change the password from the `/admin/settings` page after logging in. Note that for the mock `localStorage` setup, changing the password updates a mock stored password, but the login check always uses "admin".
登录后，您可以从 `/admin/settings` 页面更改密码。请注意，对于模拟的 `localStorage` 设置，更改密码会更新模拟存储的密码，但登录检查始终使用“admin”。

## Project Structure / 项目结构

*   `src/app/`: Next.js App Router pages.
    *   `src/app/page.tsx`: Public-facing link hub.
    *   `src/app/admin/`: Admin panel pages and layout.
*   `src/app/`: Next.js App Router 页面。
    *   `src/app/page.tsx`: 面向公众的链接中心。
    *   `src/app/admin/`: 管理面板页面和布局。
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/admin/`: Admin-specific components.
    *   `src/components/layout/`: Layout components (header, footer, logo).
    *   `src/components/links/`: Components for displaying links.
*   `src/components/`: 可重用 React 组件。
    *   `src/components/ui/`: ShadCN UI 组件。
    *   `src/components/admin/`: 管理员特定组件。
    *   `src/components/layout/`: 布局组件 (页眉、页脚、标志)。
    *   `src/components/links/`: 用于显示链接的组件。
*   `src/lib/`: Core logic and services.
    *   `src/lib/auth-service.ts`: Mock authentication logic.
    *   `src/lib/data-service.ts`: Main data service, switches between local, PostgreSQL, and MongoDB.
    *   `src/lib/local-data-service.ts`: `localStorage` based data operations.
    *   `src/lib/postgres-data-service.ts`: PostgreSQL based data operations (structure provided).
    *   `src/lib/mongo-data-service.ts`: MongoDB based data operations (structure provided).
*   `src/lib/`: 核心逻辑和服务。
    *   `src/lib/auth-service.ts`: 模拟身份验证逻辑。
    *   `src/lib/data-service.ts`: 主要数据服务，可在本地、PostgreSQL 和 MongoDB 之间切换。
    *   `src/lib/local-data-service.ts`: 基于 `localStorage` 的数据操作。
    *   `src/lib/postgres-data-service.ts`: 基于 PostgreSQL 的数据操作 (提供结构)。
    *   `src/lib/mongo-data-service.ts`: 基于 MongoDB 的数据操作 (提供结构)。
*   `src/contexts/`: React Context providers (e.g., `ThemeContext.tsx`).
    *   `src/contexts/`: React Context 提供程序 (例如, `ThemeContext.tsx`)。
*   `src/hooks/`: Custom React hooks (e.g., `useToast.ts`, `use-mobile.ts`).
    *   `src/hooks/`: 自定义 React 钩子 (例如, `useToast.ts`, `use-mobile.ts`)。
*   `src/ai/`: Genkit related files.
    *   `src/ai/genkit.ts`: Genkit configuration.
    *   `src/ai/dev.ts`: Genkit development server entry point.
*   `src/ai/`: Genkit 相关文件。
    *   `src/ai/genkit.ts`: Genkit 配置。
    *   `src/ai/dev.ts`: Genkit 开发服务器入口点。
*   `src/types/`: TypeScript type definitions.
    *   `src/types/`: TypeScript 类型定义。
*   `public/`: Static assets.
    *   `public/`: 静态资源。
*   `src/app/globals.css`: Global styles and Tailwind CSS theme variables.
    *   `src/app/globals.css`: 全局样式和 Tailwind CSS 主题变量。
*   `tailwind.config.ts`: Tailwind CSS configuration.
    *   `tailwind.config.ts`: Tailwind CSS 配置。

## Deployment / 部署

This Next.js application can be deployed to any platform that supports Node.js, such as Vercel (recommended for Next.js), Netlify, or a custom server.
Ensure your environment variables are correctly set up on your deployment platform, especially for PostgreSQL or MongoDB configurations if you choose to use them. You will also need to ensure your database schema is set up for PostgreSQL.

此 Next.js 应用程序可以部署到任何支持 Node.js 的平台，例如 Vercel (推荐用于 Next.js)、Netlify 或自定义服务器。
请确保在您的部署平台上正确设置了环境变量，特别是如果您选择使用 PostgreSQL 或 MongoDB 配置。您还需要确保为 PostgreSQL 设置了数据库模式。

## Contributing / 贡献

This project is primarily developed by Erin's All-Subject English Enlightenment team and Terry. For contributions, please follow standard Git workflow (fork, branch, pull request).

该项目主要由 Erin 全科英语启蒙团队和 Terry 开发。如需贡献，请遵循标准的 Git 工作流程 (fork, branch, pull request)。
