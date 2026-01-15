# GyanSetu Backend

Adaptive Mastery & Engagement Platform (AMEP) Backend Service

## 🎯 Overview

GyanSetu Backend powers the Adaptive Mastery & Engagement Platform, converting classroom activity, assessments, and project data into real-time insights, adaptive learning paths, and objective soft-skill evaluation.

## 🧱 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MongoDB
- **Cache/Realtime**: Redis
- **Realtime Transport**: WebSockets (Socket.IO)
- **Auth**: JWT + RBAC
- **Deployment**: Docker

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## 🚀 Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

### Docker

```bash
# Start all services (MongoDB, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Classroom & Course

- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class details
- `POST /api/classes/:id/join` - Join class
- `GET /api/classes/:id/students` - Get class students

### Mastery Engine

- `GET /api/mastery/:studentId` - Get student mastery
- `POST /api/mastery/update` - Update mastery
- `GET /api/mastery/at-risk` - Get at-risk students

### Engagement Tracking

- `POST /api/engagement/log` - Log engagement
- `GET /api/engagement/class/:classId` - Get class engagement
- `GET /api/engagement/student/:studentId` - Get student engagement

### Alerts

- `GET /api/alerts/class/:classId` - Get class alerts
- `POST /api/alerts/:id/resolve` - Resolve alert

### Project-Based Learning

- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `POST /api/projects/:id/team` - Create team
- `POST /api/projects/:id/artifact` - Submit artifact

### Soft-Skill Assessment

- `POST /api/soft-skills/peer-review` - Submit peer review
- `GET /api/soft-skills/:studentId` - Get student soft skills

### Analytics & Dashboards

- `GET /api/dashboard/teacher` - Teacher dashboard
- `GET /api/dashboard/admin` - Admin dashboard

## 🔌 WebSocket Events

### Client → Server

- `join-class` - Join class room (teachers)

### Server → Client

- `CONFUSION_ALERT` - Confusion detected
- `ENGAGEMENT_DROP` - Engagement dropped
- `MASTERY_THRESHOLD` - Mastery threshold crossed
- `ALERT` - General alert notification

## 🗄️ Database Collections

- `users` - User accounts
- `classes` - Classrooms
- `subjects` - Subjects
- `concepts` - Learning concepts
- `mastery_records` - Mastery tracking
- `engagement_logs` - Engagement data
- `projects` - PBL projects
- `peer_reviews` - Peer reviews
- `alerts` - System alerts

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation with Zod

## 📝 Environment Variables

See `.env.example` for required environment variables.

## 🧪 Testing

```bash
npm test
```

## 📚 Project Structure

```
src/
├── modules/          # Feature modules
│   ├── auth/
│   ├── classroom/
│   ├── mastery/
│   ├── engagement/
│   ├── alerts/
│   ├── pbl/
│   ├── soft-skills/
│   └── analytics/
├── models/            # Database models
├── middlewares/       # Express middlewares
├── sockets/           # WebSocket handlers
├── utils/             # Utility functions
└── app.ts             # Main application
```

## 🚀 Deployment

The backend is containerized and can be deployed to:

- **Render**: Connect GitHub repo and deploy
- **AWS**: Use ECS/Fargate with the provided Dockerfile
- **Railway**: Connect repo and deploy
- **Heroku**: Use container registry

## 📄 License

MIT
