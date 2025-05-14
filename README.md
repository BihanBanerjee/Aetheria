# Aetheria - Context-Aware Repository Intelligence

<div align="center">
  <img src="/public/aetheria-logo.svg" alt="Aetheria Logo" width="120" />
  <h3>Where AI Meets Your Codebase</h3>
</div>

## 🌟 Overview

Aetheria is an AI-powered platform that brings intelligent context to your GitHub repositories. It combines vector search capabilities with commit analysis and meeting summarization to help development teams understand, navigate, and collaborate on their codebase more effectively.

## ✨ Key Features

### 📊 Vector Search for Code

- **Context-Aware Search**: Ask questions about your codebase in natural language
- **Intelligent Code Lookup**: Quickly find relevant files and code snippets
- **Semantic Understanding**: Get answers with precise file references and explanations

### 📝 Commit Analysis

- **AI-Generated Summaries**: Automatically analyze commit diffs for easier understanding
- **Commit History Tracking**: View recent commits with detailed AI explanations
- **Development Insights**: Understand code changes without reading through diffs

### 🎙️ Meeting Summaries

- **Audio Transcription**: Upload meeting recordings in common formats (MP3, WAV, M4A)
- **Discussion Analysis**: AI identifies key points, decisions, and action items
- **Easily Reference Discussions**: Quickly find and reference past technical discussions

### 👥 Team Collaboration

- **Shared Context**: Invite team members to collaborate on projects
- **Knowledge Persistence**: Save questions and answers for future reference
- **Streamlined Onboarding**: Help new developers understand the codebase quickly

## 🛠️ Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM, PostgreSQL with vector extension
- **AI Integration**: AI models for code summarization, commit analysis, and meeting understanding
- **Authentication**: Secure user authentication with Clerk
- **Payments**: Stripe integration for credit purchases

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL with vector extension installed
- GitHub account (for repository integration)
- API keys for various services

### Environment Setup

Create a `.env` file with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/aetheria"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aetheria.git
cd aetheria

# Install dependencies
bun install

# Set up the database
bunx prisma db psuh

# Run the development server
bun dev
```

## 💻 Usage

1. **Sign Up**: Create an account or sign in
2. **Create a Project**: Link your GitHub repository to Aetheria
3. **Ask Questions**: Use the Q&A feature to ask about your codebase
4. **Upload Meetings**: Add meeting recordings for AI analysis
5. **View Commits**: Explore commit history with AI-generated summaries

## 📊 Credit System

Aetheria uses a credit-based system:
- Each file indexed from a repository consumes 1 credit
- New accounts start with 150 free credits
- Additional credits can be purchased through the billing page
- Ask unlimited questions once files are indexed (no additional credit cost)

## 🔗 Project Structure

```
src/
  ├── app/                   # Next.js application routes
  ├── components/            # Reusable UI components
  ├── hooks/                 # Custom React hooks
  ├── lib/                   # Utility functions and services
  ├── server/                # Server-side code and API routes
  ├── styles/                # Global styles and theme variables
  ├── trpc/                  # tRPC client configuration
  └── utils/                 # Helper utilities
```

## 📸 Screenshots

<div align="center">
  <img src="/images/dashboard.png" alt="Dashboard" width="45%" />
  <img src="/images/codeAnalysis.png" alt="Q&A Interface" width="45%" />
</div>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

If you have any questions or feedback, please reach out to us at support@aetheria.ai