# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbo
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run both linting and type checking
- `npm run format:check` - Check code formatting with Prettier
- `npm run format:write` - Format code with Prettier

### Database Commands
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Testing
No specific test commands are configured. Check if tests are added before running any test commands.

## Architecture Overview

Aetheria is a Next.js 15 application with a full-stack TypeScript setup that provides AI-powered repository analysis, commit tracking, and meeting transcription capabilities.

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC for type-safe APIs, Prisma ORM with PostgreSQL
- **Database**: PostgreSQL with vector extension for embeddings
- **Authentication**: Clerk
- **AI Integration**: Google Gemini API, AssemblyAI for transcription
- **Background Jobs**: Inngest for processing pipelines
- **Payments**: Stripe integration
- **File Storage**: Firebase Storage

### Key Architecture Patterns

#### tRPC API Structure
- Single router in `src/server/api/root.ts` exports `appRouter`
- Routers organized in `src/server/api/routers/` (currently only `project.ts`)
- Client-side tRPC setup in `src/trpc/`

#### Database Schema (Prisma)
- **User**: Authentication and credits management
- **Project**: GitHub repository connections with processing status
- **SourceCodeEmbedding**: Vector embeddings for code search
- **Meeting**: Audio transcription and analysis
- **Question**: Q&A history for projects
- **Commit**: Git commit analysis and AI summaries

#### Background Processing (Inngest)
- Functions in `src/lib/inngest/functions/`
- Project processing: repository indexing, file processing, commit analysis
- Meeting processing: transcription and issue extraction
- Credit deduction and status updates

#### Authentication & Authorization
- Clerk handles authentication
- Users linked to projects via `UserToProject` junction table
- Credit-based system (150 free credits, 1 credit per indexed file)

### Project Processing Pipeline
1. **INITIALIZING**: Project created
2. **LOADING_REPO**: Repository data fetched
3. **INDEXING_REPO**: Files processed and embedded
4. **POLLING_COMMITS**: Commit history analyzed
5. **DEDUCTING_CREDITS**: Credits deducted
6. **COMPLETED**: Ready for queries

### Environment Variables
The application uses extensive environment configuration. Key variables include:
- Database connection (`DATABASE_URL`)
- Clerk authentication keys
- Stripe payment processing
- API keys for Gemini, AssemblyAI, GitHub
- Firebase configuration

### File Organization
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable UI components (Radix UI + custom)
- `src/lib/` - Utility functions and external service integrations
- `src/server/` - Server-side API and database logic
- `src/hooks/` - Custom React hooks
- `src/styles/` - Global styles and theme configuration

### Key Features
- **Vector Search**: Semantic code search using embeddings
- **Commit Analysis**: AI-generated summaries of git commits
- **Meeting Transcription**: Audio-to-text with issue extraction
- **Team Collaboration**: Multi-user project access
- **Credit System**: Usage-based billing model

## Development Notes

### Database Setup
Requires PostgreSQL with vector extension for embedding storage. Use `npm run db:push` to sync schema changes.

### AI Integration
- Google Gemini API for code analysis and commit summarization
- AssemblyAI for meeting transcription
- Vector similarity search for code queries

### Background Jobs
Inngest handles asynchronous processing. Check `src/lib/inngest/functions/` for job definitions and `src/api/inngest/route.ts` for the webhook endpoint.

### File Processing
GitHub repositories are processed file-by-file, with embeddings stored for semantic search. Large repositories may take significant time to process.