# Environment Variables Setup for GyanSetu Frontend

## Required Environment Variables

Create a `.env.local` file in the root of the GyanSetu folder with the following variables:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Development Setup

1. Copy the above variables into a `.env.local` file
2. The frontend will connect to your backend API at `http://localhost:3001`
3. WebSocket connections will use `ws://localhost:3001`

## Production Setup

For production deployment, update the URLs to your production backend URLs:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
```

## Note

The `.env.local` file is gitignored and should not be committed to version control. Each developer should create their own `.env.local` file with the appropriate URLs for their environment.