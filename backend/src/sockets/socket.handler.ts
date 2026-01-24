import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { Alert, AlertSeverity } from '../models/Alert';
import { AlertsService } from '../modules/alerts/alerts.service';

export class SocketHandler {
  private io: SocketIOServer;
  // Kept for future extension (e.g., generating alerts from live signals)
  private alertsService: AlertsService;

  // Namespace: /classroom
  // Sessions are stored in-memory for hackathon scope
  private sessions = new Map<
    string,
    {
      sessionId: string;
      classId: string;
      topic: string;
      teacherSocketId: string;
      students: Set<string>; // socket.id set
      studentInfos: Map<string, { id: string; name: string; email: string }>; // socket.id -> info
      anonBySocketId: Map<string, string>; // socket.id -> anonId
      confusionSignals: number;
      engagementSignals: Array<{ idleTime: number; scrollSpeed: number; tabFocus: number }>;
      activePoll?: {
        pollId: string;
        question: string;
        options: string[];
        counts: number[];
        respondedByAnonId: Set<string>;
      };
    }
  >();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    this.alertsService = new AlertsService();
    // Avoid unused warning while preserving future extensibility
    void this.alertsService;
    this.setupNamespace();
  }

  private setupNamespace() {
    const nsp = this.io.of('/classroom');

    // Auth middleware (JWT)
    nsp.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = verifyToken(token);
        (socket as unknown as { user: JWTPayload }).user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    nsp.on('connection', (socket) => {
      const user = (socket as unknown as { user: any }).user; // Type cast to any to access optional name
      console.log(`[socket] connected: ${user.email} (${user.role}) socket=${socket.id}`);

      // 1) Teacher creates live session
      socket.on('CREATE_SESSION', (payload: { classId: string; topic: string }) => {
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') return;
        if (!payload?.classId) return;

        const sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`;
        const session = {
          sessionId,
          classId: payload.classId,
          topic: payload.topic || 'Untitled Session',
          teacherSocketId: socket.id,
          students: new Set<string>(),
          studentInfos: new Map<string, { id: string; name: string; email: string }>(),
          anonBySocketId: new Map<string, string>(),
          confusionSignals: 0,
          engagementSignals: []
        };

        this.sessions.set(sessionId, session);
        socket.join(`session:${sessionId}:teacher`);

        socket.emit('SESSION_CREATED', { sessionId, classId: session.classId, topic: session.topic });
      });

      // 2) Student joins session
      socket.on('JOIN_SESSION', (payload: { sessionId: string }) => {
        if (!payload?.sessionId) return;
        const session = this.sessions.get(payload.sessionId);
        if (!session) {
          socket.emit('JOIN_SESSION_FAILED', { error: 'Session not found' });
          return;
        }

        // Assign anonymousId per session
        const anonId = `anon_${Math.random().toString(36).slice(2, 6)}`;
        session.students.add(socket.id);
        session.anonBySocketId.set(socket.id, anonId);
        
        // Store student info
        session.studentInfos.set(socket.id, {
            id: user.userId,
            name: user.name || user.email.split('@')[0], // Fallback to email prefix
            email: user.email
        });

        socket.join(`session:${session.sessionId}:students`);
        socket.emit('JOINED_SESSION', { anonymousId: anonId, sessionId: session.sessionId });

        // Notify teacher about join count and list
        const studentList = Array.from(session.studentInfos.values());
        
        nsp.to(`session:${session.sessionId}:teacher`).emit('SESSION_STATS', {
          sessionId: session.sessionId,
          totalStudents: session.students.size,
          students: studentList
        });
      });

      // 3) Confusion signal (student -> aggregated teacher update)
      socket.on('CONFUSION_SIGNAL', (payload: { level: number }) => {
        // Find session(s) this student belongs to by socket.id (hackathon scope: assume 1 active)
        const session = this.findSessionByStudentSocketId(socket.id);
        if (!session) return;

        const level = payload?.level ?? 1;
        if (level >= 1) session.confusionSignals += 1;

        const totalSignals = session.confusionSignals;
        const totalStudents = Math.max(session.students.size, 1);
        const confusedPercentage = Math.min(100, Math.round((totalSignals / totalStudents) * 10) * 10); // coarse for demo

        nsp.to(`session:${session.sessionId}:teacher`).emit('CONFUSION_UPDATE', {
          sessionId: session.sessionId,
          totalSignals,
          confusedPercentage
        });
      });

      // 4) Engagement signal (student -> aggregated teacher update)
      socket.on('ENGAGEMENT_SIGNAL', (payload: { idleTime: number; scrollSpeed: number; tabFocus: number }) => {
        const session = this.findSessionByStudentSocketId(socket.id);
        if (!session) return;

        const idleTime = Number(payload?.idleTime ?? 0);
        const scrollSpeed = Number(payload?.scrollSpeed ?? 0);
        const tabFocus = Number(payload?.tabFocus ?? 100);

        session.engagementSignals.push({ idleTime, scrollSpeed, tabFocus });
        if (session.engagementSignals.length > 200) session.engagementSignals.shift();

        // Very simple engagement metric for hackathon demo
        const calc = (s: { idleTime: number; scrollSpeed: number; tabFocus: number }) => {
          const idlePenalty = Math.min(1, s.idleTime / 60); // 0..1
          const focus = Math.max(0, Math.min(1, s.tabFocus / 100)); // 0..1
          const scroll = Math.max(0, Math.min(1, s.scrollSpeed)); // 0..1
          const score = 0.5 * focus + 0.3 * scroll + 0.2 * (1 - idlePenalty);
          return Math.max(0, Math.min(1, score));
        };

        const recent = session.engagementSignals.slice(-Math.min(session.engagementSignals.length, 30));
        const avgEngagement = recent.reduce((sum, s) => sum + calc(s), 0) / Math.max(1, recent.length);

        // Low engagement count (approx per latest signals)
        const lowEngagementCount = recent.filter((s) => calc(s) < 0.5).length;

        nsp.to(`session:${session.sessionId}:teacher`).emit('ENGAGEMENT_UPDATE', {
          sessionId: session.sessionId,
          avgEngagement: Number(avgEngagement.toFixed(2)),
          lowEngagementCount
        });
      });

      // 5) Teacher launches poll
      socket.on('LAUNCH_POLL', (payload: { sessionId: string; question: string; options: string[] }) => {
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') return;
        if (!payload?.sessionId) return;
        const session = this.sessions.get(payload.sessionId);
        if (!session) return;
        if (session.teacherSocketId !== socket.id) return; // Only session owner can launch poll

        const options = Array.isArray(payload.options) ? payload.options : [];
        if (!payload.question || options.length < 2) return;

        const pollId = `poll_${Math.random().toString(36).slice(2, 8)}`;
        session.activePoll = {
          pollId,
          question: payload.question,
          options,
          counts: new Array(options.length).fill(0),
          respondedByAnonId: new Set<string>()
        };

        nsp.to(`session:${session.sessionId}:students`).emit('POLL_LAUNCHED', {
          sessionId: session.sessionId,
          pollId,
          question: payload.question,
          options
        });

        socket.emit('POLL_LAUNCHED_ACK', { sessionId: session.sessionId, pollId });
      });

      // Student responds to poll
      socket.on('POLL_RESPONSE', (payload: { pollId: string; optionIndex: number }) => {
        const session = this.findSessionByStudentSocketId(socket.id);
        if (!session?.activePoll) return;
        if (payload?.pollId !== session.activePoll.pollId) return;

        const anonId = session.anonBySocketId.get(socket.id);
        if (!anonId) return;
        if (session.activePoll.respondedByAnonId.has(anonId)) return; // one response per student

        const idx = Number(payload.optionIndex);
        if (Number.isNaN(idx) || idx < 0 || idx >= session.activePoll.counts.length) return;

        session.activePoll.respondedByAnonId.add(anonId);
        session.activePoll.counts[idx] += 1;

        // Emit results to teacher as a map (label -> count)
        const result: Record<string, number> = {};
        session.activePoll.options.forEach((opt, i) => {
          result[opt] = session.activePoll!.counts[i];
        });

        nsp.to(`session:${session.sessionId}:teacher`).emit('POLL_RESULTS', {
          sessionId: session.sessionId,
          pollId: session.activePoll.pollId,
          results: result,
          totalResponses: session.activePoll.respondedByAnonId.size
        });
      });

      // 7) Student leaves session voluntarily
      socket.on('LEAVE_SESSION', (payload: { sessionId: string }) => {
        if (user.role !== 'STUDENT') return;
        if (!payload?.sessionId) return;
        const session = this.sessions.get(payload.sessionId);
        if (!session) return;

        if (session.students.has(socket.id)) {
          session.students.delete(socket.id);
          session.anonBySocketId.delete(socket.id);
          session.studentInfos.delete(socket.id);
          
          nsp.to(`session:${session.sessionId}:teacher`).emit('SESSION_STATS', {
            sessionId: session.sessionId,
            totalStudents: session.students.size,
            students: Array.from(session.studentInfos.values()),
            event: 'STUDENT_LEFT'
          });
        }

        nsp.to(socket.id).emit('LEFT_SESSION', {
          sessionId: session.sessionId,
          message: 'You have left the session'
        });
      });

      // 8) Teacher ends session voluntarily
      socket.on('END_SESSION', (payload: { sessionId: string }) => {
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') return;
        if (!payload?.sessionId) return;
        const session = this.sessions.get(payload.sessionId);
        if (!session || session.teacherSocketId !== socket.id) return;
        
        const finalStudentList = Array.from(session.studentInfos.values());

        // Notify all students that session ended
        nsp.to(`session:${session.sessionId}:students`).emit('SESSION_ENDED', {
          sessionId: session.sessionId,
          message: 'Teacher has ended the session'
        });

        // Clean up session
        this.sessions.delete(session.sessionId);

        nsp.to(socket.id).emit('SESSION_ENDED_CONFIRM', {
          sessionId: session.sessionId,
          message: 'Session ended successfully',
          students: finalStudentList
        });
      });

      socket.on('disconnect', () => {
        // Remove from sessions
        for (const session of this.sessions.values()) {
          if (session.teacherSocketId === socket.id) {
            // End session when teacher disconnects (hackathon scope)
            nsp.to(`session:${session.sessionId}:students`).emit('SESSION_ENDED', { sessionId: session.sessionId });
            this.sessions.delete(session.sessionId);
            continue;
          }

          if (session.students.has(socket.id)) {
            session.students.delete(socket.id);
            session.anonBySocketId.delete(socket.id);
            session.studentInfos.delete(socket.id);
            
            nsp.to(`session:${session.sessionId}:teacher`).emit('SESSION_STATS', {
              sessionId: session.sessionId,
              totalStudents: session.students.size,
              students: Array.from(session.studentInfos.values())
            });
          }
        }

        console.log(`[socket] disconnected: ${user.email} (${user.role}) socket=${socket.id}`);
      });
    });
  }

  private findSessionByStudentSocketId(socketId: string) {
    for (const session of this.sessions.values()) {
      if (session.students.has(socketId)) return session;
    }
    return undefined;
  }

  /**
   * Emit confusion alert to class room
   */
  async emitConfusionAlert(classId: string, concept: string, severity: AlertSeverity) {
    this.io.of('/classroom').to(`class:${classId}`).emit('CONFUSION_ALERT', {
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
    this.io.of('/classroom').to(`class:${classId}`).emit('ENGAGEMENT_DROP', {
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
    this.io.of('/classroom').to(`student:${studentId}`).emit('MASTERY_THRESHOLD', {
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
        const classData = alert.classId as unknown as { _id?: { toString: () => string } };
        const classId = classData?._id?.toString();
        if (classId) {
          this.io.of('/classroom').to(`class:${classId}`).emit('ALERT', {
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
