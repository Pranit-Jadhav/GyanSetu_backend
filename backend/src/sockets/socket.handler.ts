import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { Alert, AlertSeverity } from '../models/Alert';
import { AlertsService } from '../modules/alerts/alerts.service';
import { Attendance, AttendanceStatus } from '../models/Attendance';
import mongoose from 'mongoose';

export class SocketHandler {
  private io: SocketIOServer;
  private alertsService: AlertsService;

  private sessions = new Map<
    string,
    {
      sessionId: string;
      classId: string;
      topic: string;
      teacherSocketId: string;
      students: Set<string>; 
      studentInfos: Map<string, { 
        id: string; 
        name: string; 
        email: string;
        startTime: number;
        warnings: number;
        attendanceId?: string; // To track DB record ID
      }>; 
      anonBySocketId: Map<string, string>; 
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
    void this.alertsService;
    this.setupNamespace();
  }

  private setupNamespace() {
    const nsp = this.io.of('/classroom');

    nsp.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) return next(new Error('Authentication error: No token provided'));
        const decoded = verifyToken(token);
        (socket as unknown as { user: JWTPayload }).user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    nsp.on('connection', (socket) => {
      const user = (socket as unknown as { user: any }).user;
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
          studentInfos: new Map<string, { 
            id: string; 
            name: string; 
            email: string;
            startTime: number;
            warnings: number;
          }>(),
          anonBySocketId: new Map<string, string>(),
          confusionSignals: 0,
          engagementSignals: []
        };

        this.sessions.set(sessionId, session);
        socket.join(`session:${sessionId}:teacher`);
        socket.emit('SESSION_CREATED', { sessionId, classId: session.classId, topic: session.topic });
      });

      // 2) Student joins session
      socket.on('JOIN_SESSION', async (payload: { sessionId: string }) => {
        if (!payload?.sessionId) return;
        const session = this.sessions.get(payload.sessionId);
        if (!session) {
          socket.emit('JOIN_SESSION_FAILED', { error: 'Session not found' });
          return;
        }

        const anonId = `anon_${Math.random().toString(36).slice(2, 6)}`;
        session.students.add(socket.id);
        session.anonBySocketId.set(socket.id, anonId);
        
        const startTime = Date.now();

        // Create initial Attendance record
        let attendanceId = '';
        try {
          if (mongoose.Types.ObjectId.isValid(user.userId) && mongoose.Types.ObjectId.isValid(session.classId)) {
            const attendance = await Attendance.create({
                studentId: new mongoose.Types.ObjectId(user.userId),
                sessionId: session.sessionId,
                classId: new mongoose.Types.ObjectId(session.classId),
                date: new Date(), 
                joinTime: new Date(startTime),
                status: AttendanceStatus.INCOMPLETE,
                warnings: 0
            });
            attendanceId = attendance._id.toString();
          } else {
             console.warn('Invalid ObjectId for studentId or classId, skipping attendance record.');
          }
        } catch (err) {
          console.error('Error creating attendance record:', err);
        }

        session.studentInfos.set(socket.id, {
            id: user.userId,
            name: user.name || user.email.split('@')[0], 
            email: user.email,
            startTime,
            warnings: 0,
            attendanceId
        });

        socket.join(`session:${session.sessionId}:students`);
        socket.emit('JOINED_SESSION', { anonymousId: anonId, sessionId: session.sessionId });

        // Normalize student list for stats
        const studentList = Array.from(session.studentInfos.values()).map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            warnings: s.warnings // expose warnings to teacher
        }));
        
        nsp.to(`session:${session.sessionId}:teacher`).emit('SESSION_STATS', {
          sessionId: session.sessionId,
          totalStudents: session.students.size,
          students: studentList
        });
      });

      // 3) Tab Switch Event (Anti-Cheating)
      socket.on('TAB_SWITCH', async () => {
         const session = this.findSessionByStudentSocketId(socket.id);
         if (!session) return;
         
         const studentInfo = session.studentInfos.get(socket.id);
         if (!studentInfo) return;

         // Increment warnings
         studentInfo.warnings += 1;

         // Update DB
         if (studentInfo.attendanceId) {
            await Attendance.findByIdAndUpdate(studentInfo.attendanceId, { warnings: studentInfo.warnings });
         }

         // Notify Teacher
         nsp.to(`session:${session.sessionId}:teacher`).emit('STUDENT_WARNING', {
            sessionId: session.sessionId,
            studentId: studentInfo.id,
            studentName: studentInfo.name,
            warningCount: studentInfo.warnings
         });

         // Notify Student (Personal Warning)
         if (studentInfo.warnings < 3) {
             socket.emit('WARNING_RECEIVED', {
                 count: studentInfo.warnings,
                 message: `Warning ${studentInfo.warnings}/3: Tab switching detected. Please stay on this tab.`
             });
         }

         // Check Limit (3 warnings)
         if (studentInfo.warnings >= 3) {
             // Force Leave
             const durationMinutes = (Date.now() - studentInfo.startTime) / 1000 / 60;
             const passed = durationMinutes >= 1;

             if (studentInfo.attendanceId) {
                await Attendance.findByIdAndUpdate(studentInfo.attendanceId, {
                    leaveTime: new Date(),
                    durationMinutes: Math.ceil(durationMinutes),
                    status: passed ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT // or failed?
                });
             }

             // Emit to Student to force disconnect/redirect
             socket.emit('FORCE_DISCONNECT', { reason: 'Excessive tab switching (3/3 warnings)' });
             
             // Disconnect socket (cleanup happens in disconnect handler)
             socket.disconnect(); 
         }
      });

      // Other handlers... (Confusion, Engagement, Polls - mostly unchanged but careful with context)
      socket.on('CONFUSION_SIGNAL', (payload: { level: number }) => {
        const session = this.findSessionByStudentSocketId(socket.id);
        if (!session) return;
        const level = payload?.level ?? 1;
        if (level >= 1) session.confusionSignals += 1;
        const totalSignals = session.confusionSignals;
        const totalStudents = Math.max(session.students.size, 1);
        const confusedPercentage = Math.min(100, Math.round((totalSignals / totalStudents) * 10) * 10);
        nsp.to(`session:${session.sessionId}:teacher`).emit('CONFUSION_UPDATE', { sessionId: session.sessionId, totalSignals, confusedPercentage });
      });

      socket.on('ENGAGEMENT_SIGNAL', (payload: { idleTime: number; scrollSpeed: number; tabFocus: number }) => {
        const session = this.findSessionByStudentSocketId(socket.id);
        if (!session) return;
        session.engagementSignals.push({ ...payload, idleTime: Number(payload.idleTime||0), scrollSpeed: Number(payload.scrollSpeed||0), tabFocus: Number(payload.tabFocus||100) });
        if (session.engagementSignals.length > 200) session.engagementSignals.shift();
        
        // Simpler calculation
        const recent = session.engagementSignals.slice(-30);
        const avg = recent.reduce((sum, s) => sum + (s.tabFocus/100), 0) / Math.max(1, recent.length); 
        
        nsp.to(`session:${session.sessionId}:teacher`).emit('ENGAGEMENT_UPDATE', {
          sessionId: session.sessionId,
          avgEngagement: Number(avg.toFixed(2)),
          lowEngagementCount: recent.filter(s => s.tabFocus < 50).length
        });
      });

      // Poll handlers (Launch, Response) - reuse logic
       socket.on('LAUNCH_POLL', (payload) => {
        // ... (reuse existing logic from lines 185-212)
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') return;
        if (!payload?.sessionId) return;
        const session = this.sessions.get(payload.sessionId);
        if (!session || session.teacherSocketId !== socket.id) return;
        const options = Array.isArray(payload.options) ? payload.options : [];
        if (!payload.question || options.length < 2) return;
        const pollId = `poll_${Math.random().toString(36).slice(2, 8)}`;
        session.activePoll = { pollId, question: payload.question, options, counts: new Array(options.length).fill(0), respondedByAnonId: new Set<string>() };
        nsp.to(`session:${session.sessionId}:students`).emit('POLL_LAUNCHED', { sessionId: session.sessionId, pollId, question: payload.question, options });
        socket.emit('POLL_LAUNCHED_ACK', { sessionId: session.sessionId, pollId });
      });

      socket.on('POLL_RESPONSE', (payload) => {
         // ... (reuse existing logic from lines 215-242)
         const session = this.findSessionByStudentSocketId(socket.id);
         if (!session?.activePoll) return;
         if (payload?.pollId !== session.activePoll.pollId) return;
         const anonId = session.anonBySocketId.get(socket.id);
         if (!anonId || session.activePoll.respondedByAnonId.has(anonId)) return;
         const idx = Number(payload.optionIndex);
         if (Number.isNaN(idx) || idx < 0 || idx >= session.activePoll.counts.length) return;
         session.activePoll.respondedByAnonId.add(anonId);
         session.activePoll.counts[idx] += 1;
         const result: Record<string, number> = {};
         session.activePoll.options.forEach((opt, i) => { result[opt] = session.activePoll!.counts[i]; });
         nsp.to(`session:${session.sessionId}:teacher`).emit('POLL_RESULTS', { sessionId: session.sessionId, pollId: session.activePoll.pollId, results: result, totalResponses: session.activePoll.respondedByAnonId.size });
      });

      // 7) Student leaves session voluntarily
      socket.on('LEAVE_SESSION', (payload: { sessionId: string }) => {
        this.handleStudentLeave(socket, payload?.sessionId);
        nsp.to(socket.id).emit('LEFT_SESSION', { message: 'You have left the session' });
      });

      // 8) Teacher ends session
      socket.on('END_SESSION', async (payload: { sessionId: string }) => {
         if (user.role !== 'TEACHER' && user.role !== 'ADMIN') return;
         if (!payload?.sessionId) return;
         const session = this.sessions.get(payload.sessionId);
         if (!session || session.teacherSocketId !== socket.id) return;
         
         const finalStudentList = Array.from(session.studentInfos.values());
         const endTime = Date.now();

         // Finalize attendance for all students
         const updatePromises = Array.from(session.studentInfos.values()).map(async (studentInfo) => {
            if (studentInfo.attendanceId) {
                const durationMinutes = (endTime - studentInfo.startTime) / 1000 / 60;
                // Use default threshold 1 min for testing as per user request, typically 45
                const passed = durationMinutes >= 1; 
                try {
                    await Attendance.findByIdAndUpdate(studentInfo.attendanceId, {
                        leaveTime: new Date(endTime),
                        durationMinutes: Math.ceil(durationMinutes),
                        status: passed ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT
                    });
                } catch (err) {
                    console.error(`Error finalizing attendance for ${studentInfo.email}:`, err);
                }
            }
         });

         await Promise.all(updatePromises);

         // Notify all students that session ended
         nsp.to(`session:${session.sessionId}:students`).emit('SESSION_ENDED', { sessionId: session.sessionId, message: 'Teacher has ended the session' });

         // Clean up session
         this.sessions.delete(session.sessionId);

         nsp.to(socket.id).emit('SESSION_ENDED_CONFIRM', {
           sessionId: session.sessionId,
           message: 'Session ended successfully',
           students: finalStudentList
         });
      });

      socket.on('disconnect', async () => {
        // Remove from sessions
        for (const session of this.sessions.values()) {
          if (session.teacherSocketId === socket.id) {
            nsp.to(`session:${session.sessionId}:students`).emit('SESSION_ENDED', { sessionId: session.sessionId });
            this.sessions.delete(session.sessionId);
            continue;
          }
          if (session && session.students.has(socket.id)) {
             await this.handleStudentLeave(socket, session.sessionId);
          }
        }
        console.log(`[socket] disconnected: ${user.email}`);
      });
    });
  }

  private findSessionByStudentSocketId(socketId: string) {
    for (const session of this.sessions.values()) {
      if (session.students.has(socketId)) return session;
    }
    return undefined;
  }

  private async handleStudentLeave(socket: any, sessionId: string) {
      if (!sessionId) return;
      const session = this.sessions.get(sessionId);
      if (!session) return;

      if (session.students.has(socket.id)) {
          const studentInfo = session.studentInfos.get(socket.id);
          
          // Calculate Duration & Save Attendance
          if (studentInfo && studentInfo.attendanceId) {
             const durationMinutes = (Date.now() - studentInfo.startTime) / 1000 / 60;
             const passed = durationMinutes >= 1; 
             try {
                // Only update if not already final (e.g. from force disconnect)
                const currentRecord = await Attendance.findById(studentInfo.attendanceId);
                // If status is INCOMPLETE, update it. If PRESENT/ABSENT, assume already handled.
                if (currentRecord && currentRecord.status === AttendanceStatus.INCOMPLETE) {
                    await Attendance.findByIdAndUpdate(studentInfo.attendanceId, {
                        leaveTime: new Date(),
                        durationMinutes: Math.ceil(durationMinutes), // Use ceil to ensure non-zero for short sessions
                        status: passed ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT
                    });
                }
             } catch(err) {
                 console.error('Error updating attendance on leave:', err);
             }
          }

          session.students.delete(socket.id);
          session.anonBySocketId.delete(socket.id);
          session.studentInfos.delete(socket.id);
          
          const studentList = Array.from(session.studentInfos.values()).map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            warnings: s.warnings
          }));

          this.getIO().of('/classroom').to(`session:${session.sessionId}:teacher`).emit('SESSION_STATS', {
            sessionId: session.sessionId,
            totalStudents: session.students.size,
            students: studentList,
            event: 'STUDENT_LEFT'
          });
      }
  }

  // ... (Keep existing Emit methods: emitConfusionAlert, etc.)
  async emitConfusionAlert(classId: string, concept: string, severity: AlertSeverity) {
    this.io.of('/classroom').to(`class:${classId}`).emit('CONFUSION_ALERT', { type: 'CONFUSION_ALERT', concept, severity, timestamp: new Date() });
  }
  async emitEngagementDrop(classId: string, studentId: string, engagementIndex: number) {
    this.io.of('/classroom').to(`class:${classId}`).emit('ENGAGEMENT_DROP', { type: 'ENGAGEMENT_DROP', studentId, engagementIndex, timestamp: new Date() });
  }
  async emitMasteryThreshold(studentId: string, conceptId: string, masteryScore: number) {
    this.io.of('/classroom').to(`student:${studentId}`).emit('MASTERY_THRESHOLD', { type: 'MASTERY_THRESHOLD', conceptId, masteryScore, timestamp: new Date() });
  }
  async startMonitoring() {
      // ... keep existing monitoring logic
  }
  getIO(): SocketIOServer { return this.io; }
}

