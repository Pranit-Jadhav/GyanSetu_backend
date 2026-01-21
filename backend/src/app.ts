import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./utils/database";
// import { connectRedis } from "./utils/redis"; // Redis disabled for now
import { errorHandler } from "./middlewares/errorHandler";
import path from "path";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import classroomRoutes from "./modules/classroom/classroom.routes";
import masteryRoutes from "./modules/mastery/mastery.routes";
import engagementRoutes from "./modules/engagement/engagement.routes";
import alertsRoutes from "./modules/alerts/alerts.routes";
import pblRoutes from "./modules/pbl/pbl.routes";
import softSkillsRoutes from "./modules/soft-skills/soft-skills.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import assessmentRoutes from "./modules/assessment/assessment.routes";
import curriculumRoutes from "./modules/curriculum/curriculum.routes";
import adminRoutes from "./modules/admin/admin.routes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// WebSocket test page (static HTML)
app.get("/websocket-test.html", (req, res) => {
  // Serve from backend/ directory (works in dev and prod)
  res.sendFile(path.join(process.cwd(), "websocket-test.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classroomRoutes);
app.use("/api/mastery", masteryRoutes);
app.use("/api/engagement", engagementRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", pblRoutes);
app.use("/api/soft-skills", softSkillsRoutes);
app.use("/api/dashboard", analyticsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    // await connectRedis(); // Redis disabled for now - not needed

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 GyanSetu Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Setup WebSocket
    const { SocketHandler } = await import("./sockets/socket.handler");
    const socketHandler = new SocketHandler(server);
    socketHandler.startMonitoring();

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
