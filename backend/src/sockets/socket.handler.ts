import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { Alert, AlertType, AlertSeverity } from '../models/Alert';
import { AlertsService } from '../modules/alerts/alerts.service';
import { EngagementLog } from '../models/EngagementLog';
import { MasteryRecord } from '../models/MasteryRecord';

export class SocketHandler {
  private io: SocketIOServer;
  private alertsService: AlertsService;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    this.alertsService = new AlertsService();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = verifyToken(token);
        (socket as any).user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = (socket as any).user as JWTPayload;
      console.log(`User connected: ${user.email} (${user.role})`);

      // Join class room for teachers
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        socket.on('join-class', (classId: string) => {
          socket.join(`class:${classId}`);
          console.log(`Teacher ${user.email} joined class ${classId}`);
        });
      }

      // Join student room
      if (user.role === 'STUDENT') {
        socket.join(`student:${user.userId}`);
        console.log(`Student ${user.email} joined their room`);
      }

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${user.email}`);
      });
    });
  }

  /**
   * Emit confusion alert to class room
   */
  async emitConfusionAlert(classId: string, concept: string, severity: AlertSeverity) {
    this.io.to(`class:${classId}`).emit('CONFUSION_ALERT', {
      type: 'CONFUSION_ALERT',
      concept,
      severity,
      timestamp: new Date()
    });
  }

  /**
   * Emit engagement drop alert
   */
  async emitEngagementDrop(classId: string, studentId: string, engagementIndex: number) {
    this.io.to(`class:${classId}`).emit('ENGAGEMENT_DROP', {
      type: 'ENGAGEMENT_DROP',
      studentId,
      engagementIndex,
      timestamp: new Date()
    });
  }

  /**
   * Emit mastery threshold crossing
   */
  async emitMasteryThreshold(studentId: string, conceptId: string, masteryScore: number) {
    this.io.to(`student:${studentId}`).emit('MASTERY_THRESHOLD', {
      type: 'MASTERY_THRESHOLD',
      conceptId,
      masteryScore,
      timestamp: new Date()
    });
  }

  /**
   * Monitor and emit real-time alerts
   */
  async startMonitoring() {
    setInterval(async () => {
      // Check for new alerts and emit them
      const recentAlerts = await Alert.find({
        resolved: false,
        createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
      }).populate('classId');

      for (const alert of recentAlerts) {
        const classData = alert.classId as any;
        if (classData) {
          this.io.to(`class:${classData._id.toString()}`).emit('ALERT', {
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            timestamp: alert.createdAt
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
