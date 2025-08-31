# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - starts Next.js development server on port 3000
- **Build**: `npm run build` - creates production build
- **Production**: `npm start` - serves production build
- **Lint**: `npm run lint` - runs ESLint with Next.js configuration

## Project Architecture

### Framework & Core Technologies
- **Next.js 15** with App Router (not Pages Router)
- **TypeScript** with strict mode enabled
- **React 18** with Server Components
- **Tailwind CSS** for styling with custom configurations
- **MongoDB** with Mongoose ODM for data persistence
- **Clerk** for authentication and user management (primary auth system)
- **EdgeStore** for file storage and management

### Authentication Systems
The app uses **dual authentication** patterns:
- **Clerk** (primary): Used for user sessions and route protection
- **NextAuth** (legacy): Exists in codebase but commented out in `auth.ts`

Route protection is handled via `middleware.ts` with:
- Rate limiting (10 requests/second per IP)
- Arcjet shield protection
- Public routes: `/`, `/login`, `/register`, `/aboutus`, `/sign-in`, `/sign-up`
- Protected system routes: config files, `.env`, `.git`, etc.

### Database Models (MongoDB/Mongoose)
Key entities in `/models/`:
- **User**: Core user data with teams, events, posts, and social features
- **Team**: Team/group functionality with member management
- **Events**: Event system with participation tracking
- **EventPost/UserPost/TeamPost**: Different post types for content sharing
- **Document**: File/document management system

### Directory Structure
- `/app/` - Next.js App Router pages and layouts
  - `/api/` - API routes organized by feature (auth, events, teams, posts, etc.)
  - Page routes: academics, profile, team, event, resources, aboutus
- `/components/` - Reusable UI components organized by feature
- `/lib/` - Utility functions, database connections, external service clients
- `/action/` - Server actions for team and user operations
- `/models/` - Mongoose schemas
- `/config/` - Database and service configurations
- `/uploads/` - Local file storage directory

### Key Features
- **Social Media Platform** for IIEST Shibpur
- **Team Management**: Create, join, and manage teams
- **Event System**: Create events, manage participation, event posts
- **Document Sharing**: PDF parsing and document management
- **File Uploads**: Image and document handling via EdgeStore
- **AI Integration**: Together AI for content generation
- **Search**: User and content search functionality

### UI Framework
- **Radix UI** components for accessible primitives
- **Framer Motion** for animations
- **React Query** for data fetching and caching
- **Tailwind CSS** with custom scrollbar and typography plugins
- **Custom fonts**: Geist Sans and Geist Mono

### Security & Performance
- **Rate limiting** via rate-limiter-flexible
- **Bot protection** via Arcjet
- **Input validation** using Zod schemas
- **Password hashing** with bcryptjs
- **File validation** and secure uploads
- **Environment variable** protection in middleware

### Development Notes
- Uses `@/*` path aliases for imports
- TypeScript with strict configuration
- Dark theme as default in layout
- Custom CSS for profile pages in `/app/styles/`
- Environment variables required: MONGO_URI, CLERK_*, ARCJET_KEY, EDGESTORE_*, etc.