# Environment Variables Setup

## Backend (.env)

Create a `.env` file in the `backend/` directory with the following content:

```env
# ============================================
# GyanSetu Backend - Environment Variables
# ============================================

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gyansetu

# Redis Configuration (OPTIONAL - Currently Disabled)
# Redis is commented out in the code and not required
# Uncomment redis.ts and app.ts if you need Redis for caching
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Python Mastery Backend Integration
PYTHON_MASTERY_API_URL=http://localhost:8000

# AI Integration (Gemini)
GEMINI_API_KEY=your-gemini-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Quick Setup

```bash
cd backend
cp ENV_SETUP.md .env
# Then edit .env with your actual values
```

---

## Mastery Backend (.env)

The Python backend currently uses in-memory storage and hardcoded configuration. If you want to use environment variables, create `.env` in `mastery_backend/`:

```env
# ============================================
# GyanSetu Mastery Backend (Python) - Environment Variables
# ============================================

# Server Configuration
PORT=8000
HOST=0.0.0.0

# FastAPI Configuration
APP_NAME=GyanSetu Mastery Engine
API_PREFIX=/api

# Note: BKT parameters are currently in bkt.py
# Knowledge decay is in decay.py
# These can be made configurable in the future
```

### Using .env in Python

Install python-dotenv:

```bash
cd mastery_backend
pip install python-dotenv
```

Then in `main.py`, add:

```python
from dotenv import load_dotenv
load_dotenv()
```

---

## Environment Variable Descriptions

### Backend Variables

| Variable                  | Description             | Why Needed                        |
| ------------------------- | ----------------------- | --------------------------------- |
| `PORT`                    | Node.js server port     | Defines HTTP server port          |
| `NODE_ENV`                | Environment mode        | Controls logging/features         |
| `CORS_ORIGIN`             | Allowed origins         | Enables frontend API access       |
| `MONGODB_URI`             | MongoDB connection      | Stores all application data       |
| `REDIS_HOST`              | Redis hostname          | **Optional** - Currently disabled |
| `REDIS_PORT`              | Redis port              | **Optional** - Currently disabled |
| `JWT_SECRET`              | JWT signing key         | Secures authentication tokens     |
| `JWT_EXPIRES_IN`          | Token expiration        | Session duration control          |
| `PYTHON_MASTERY_API_URL`  | Python backend URL      | Integration with BKT engine       |
| `GEMINI_API_KEY`          | Gemini API key          | AI assessment generation          |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window       | Prevents API abuse                |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | Request limit                     |

### Mastery Backend Variables (Optional)

| Variable | Description         | Why Needed            |
| -------- | ------------------- | --------------------- |
| `PORT`   | FastAPI server port | HTTP server port      |
| `HOST`   | Server host binding | Network configuration |

---

## Security Notes

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Change JWT_SECRET in production** - Use strong random key
3. **Use strong MongoDB credentials** - Especially for production
4. **Rotate API keys regularly** - Especially Gemini API key
5. **Use environment-specific configs** - Different values for dev/staging/prod

---

## Docker Configuration

When using Docker Compose, update these in `.env`:

```env
MONGODB_URI=mongodb://mongodb:27017/gyansetu
# REDIS_HOST=redis  # Redis is disabled for now
```

## Redis Status

**Redis is currently DISABLED** in the codebase. All Redis-related code has been commented out because:

- It's not needed for the current implementation
- It was causing connection errors
- The app runs perfectly without it

To re-enable Redis:

1. Uncomment code in `backend/src/utils/redis.ts`
2. Uncomment `import { connectRedis }` in `backend/src/app.ts`
3. Uncomment `await connectRedis()` in `startServer()`
4. Configure Redis environment variables
5. Ensure Redis server is running
