# GyanSetu Frontend

A modern educational analytics platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: JWT-based login/signup system
- **Role-based Access**: Separate dashboards for teachers and students
- **Real-time Monitoring**: WebSocket integration for live classroom sessions
- **Analytics Dashboard**: Comprehensive educational metrics and insights
- **Responsive Design**: Mobile-first approach with beautiful UI

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Backend server running on port 3001

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create environment file (see ENV_SETUP.md for details)

3. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:4028`

### Environment Setup

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Authentication

### Demo Accounts

**Teacher:**
- Email: teacher@gyansetu.com
- Password: password123

**Student:**
- Email: student@gyansetu.com
- Password: password123

## API Integration

The frontend connects to the backend API for:
- User authentication and authorization
- Dashboard data and analytics
- Real-time WebSocket communication
- Mastery tracking and assessments

## WebSocket Features

- Live classroom session management
- Real-time confusion and engagement monitoring
- Interactive polls and alerts
- Anonymous student participation

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context for authentication
- **Real-time**: Socket.io-client for WebSocket communication
- **Icons**: Heroicons via custom icon component

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checking

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── teacher-analytics-hub/  # Teacher dashboard
│   ├── student-progress-portal/ # Student dashboard
│   ├── real-time-monitoring/    # Live classroom
│   └── class-performance-analytics/ # Admin analytics
├── components/            # Reusable components
│   ├── common/           # Shared components (Header, etc.)
│   └── ui/               # UI primitives
├── contexts/             # React contexts
└── styles/               # Global styles and Tailwind config
```

## Testing

1. Start the backend server first
2. Start the frontend with `pnpm dev`
3. Use the demo accounts to test different user roles
4. Test WebSocket functionality in the real-time monitoring page

## Production Deployment

Build the application:

```bash
pnpm build
pnpm start
```

Make sure to set proper environment variables for production backend URLs.