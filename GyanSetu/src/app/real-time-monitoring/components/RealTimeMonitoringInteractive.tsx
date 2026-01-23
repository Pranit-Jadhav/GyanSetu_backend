'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import SessionHeader from './SessionHeader';
import ConfusionHeatmap from './ConfusionHeatmap';
import QuickActionPanel from './QuickActionPanel';
import LiveActivityFeed from './LiveActivityFeed';
import RealTimeAnalytics from './RealTimeAnalytics';
import AlertsPanel from './AlertsPanel';

interface Student {
  id: string;
  name: string;
  avatar: string;
  avatarAlt: string;
  confusionScore: number;
  confusionLevel: 'low' | 'medium' | 'high';
  currentActivity: string;
  interventionStrategy: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

interface Activity {
  id: string;
  studentName: string;
  activityType: 'quiz' | 'milestone' | 'peer_review' | 'submission';
  description: string;
  timestamp: Date;
  engagementScore: number;
}

interface EngagementData {
  time: string;
  engagement: number;
  timeOnTask: number;
}

interface Alert {
  id: string;
  type: 'failure_prediction' | 'intervention_needed' | 'milestone_delay';
  studentName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  recommendedAction: string;
}

const RealTimeMonitoringInteractive = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const sessionStartTime = new Date(Date.now() - 3600000);

  // Real-time state
  const [students, setStudents] = useState<Student[]>([]);
  const [confusionUpdate, setConfusionUpdate] = useState<{
    totalSignals: number;
    confusedPercentage: number;
  } | null>(null);
  const [engagementUpdate, setEngagementUpdate] = useState<{
    avgEngagement: number;
    lowEngagementCount: number;
  } | null>(null);
  const [connectedStudents, setConnectedStudents] = useState(28);
  const [isConnected, setIsConnected] = useState(false);

  // Session management
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string;
    classId: string;
    topic: string;
  } | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'none' | 'creating' | 'active'>('none');

  // WebSocket connection effect
  useEffect(() => {
    if (!token || !user) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      path: '/socket.io',
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    socket.on('CONFUSION_UPDATE', (data: { totalSignals: number; confusedPercentage: number }) => {
      console.log('Confusion update received:', data);
      setConfusionUpdate(data);

      // Update student confusion scores based on real-time data
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          confusionScore: Math.min(100, student.confusionScore + Math.random() * 10 - 5), // Simulate some change
          confusionLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        }))
      );
    });

    socket.on('ENGAGEMENT_UPDATE', (data: { avgEngagement: number; lowEngagementCount: number }) => {
      console.log('Engagement update received:', data);
      setEngagementUpdate(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  // Initialize students with mock data
  useEffect(() => {
    setStudents(mockStudents);
  }, []);

  // Mock students data (keeping some for demo purposes)
  const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Aarav Sharma',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1476e5b5b-1763296926502.png",
    avatarAlt: 'Young Indian male student with short black hair wearing blue shirt',
    confusionScore: 15,
    confusionLevel: 'low',
    currentActivity: 'Completing Quiz Module 3',
    interventionStrategy: 'Student is performing well. Continue monitoring progress.'
  },
  {
    id: 'student-2',
    name: 'Priya Patel',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10120f91e-1763301853398.png",
    avatarAlt: 'Young Indian female student with long black hair wearing white top',
    confusionScore: 58,
    confusionLevel: 'medium',
    currentActivity: 'Working on PBL Milestone 2',
    interventionStrategy: 'Provide additional resources on current concept. Schedule check-in.'
  },
  {
    id: 'student-3',
    name: 'Rohan Gupta',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1eb975e7d-1763296862435.png",
    avatarAlt: 'Young Indian male student with glasses and black hair wearing gray shirt',
    confusionScore: 82,
    confusionLevel: 'high',
    currentActivity: 'Struggling with Assignment 4',
    interventionStrategy: 'Immediate intervention required. Assign peer mentor and provide simplified materials.'
  },
  {
    id: 'student-4',
    name: 'Ananya Singh',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17591a98c-1763295472530.png",
    avatarAlt: 'Young Indian female student with braided hair wearing pink top',
    confusionScore: 22,
    confusionLevel: 'low',
    currentActivity: 'Peer Review Session',
    interventionStrategy: 'Excellent progress. Consider advanced challenge tasks.'
  },
  {
    id: 'student-5',
    name: 'Kabir Mehta',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1eb975e7d-1763296862435.png",
    avatarAlt: 'Young Indian male student with short hair wearing green shirt',
    confusionScore: 45,
    confusionLevel: 'medium',
    currentActivity: 'Submitting Project Artifact',
    interventionStrategy: 'Monitor closely. Provide clarification on submission requirements.'
  },
  {
    id: 'student-6',
    name: 'Diya Reddy',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17591a98c-1763295472530.png",
    avatarAlt: 'Young Indian female student with long hair wearing yellow top',
    confusionScore: 12,
    confusionLevel: 'low',
    currentActivity: 'Completing Mastery Task',
    interventionStrategy: 'Outstanding performance. Encourage leadership role in group activities.'
  },
  {
    id: 'student-7',
    name: 'Arjun Kumar',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1476e5b5b-1763296926502.png",
    avatarAlt: 'Young Indian male student with short black hair wearing blue polo shirt',
    confusionScore: 68,
    confusionLevel: 'medium',
    currentActivity: 'Reviewing Feedback',
    interventionStrategy: 'Schedule one-on-one session to address specific confusion points.'
  },
  {
    id: 'student-8',
    name: 'Ishita Joshi',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17591a98c-1763295472530.png",
    avatarAlt: 'Young Indian female student with shoulder-length hair wearing purple top',
    confusionScore: 35,
    confusionLevel: 'medium',
    currentActivity: 'Collaborative Group Work',
    interventionStrategy: 'Provide additional scaffolding for current concept.'
  }];


  const mockQuickActions: QuickAction[] = [
  {
    id: 'action-1',
    label: 'Send Individual Message',
    icon: 'ChatBubbleLeftRightIcon',
    description: 'Direct communication with selected student',
    variant: 'primary'
  },
  {
    id: 'action-2',
    label: 'Form Study Groups',
    icon: 'UserGroupIcon',
    description: 'AI-suggested group formations',
    variant: 'secondary'
  },
  {
    id: 'action-3',
    label: 'Redistribute Tasks',
    icon: 'ArrowPathIcon',
    description: 'Adaptive task reassignment',
    variant: 'success'
  },
  {
    id: 'action-4',
    label: 'Schedule Intervention',
    icon: 'CalendarIcon',
    description: 'Book one-on-one session',
    variant: 'warning'
  }];


  const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    studentName: 'Aarav Sharma',
    activityType: 'quiz',
    description: 'Completed Quiz Module 3 with 92% accuracy',
    timestamp: new Date(Date.now() - 120000),
    engagementScore: 95
  },
  {
    id: 'activity-2',
    studentName: 'Priya Patel',
    activityType: 'milestone',
    description: 'Reached PBL Milestone 2 checkpoint',
    timestamp: new Date(Date.now() - 300000),
    engagementScore: 78
  },
  {
    id: 'activity-3',
    studentName: 'Ananya Singh',
    activityType: 'peer_review',
    description: 'Submitted peer review for 3 artifacts',
    timestamp: new Date(Date.now() - 480000),
    engagementScore: 88
  },
  {
    id: 'activity-4',
    studentName: 'Kabir Mehta',
    activityType: 'submission',
    description: 'Uploaded project artifact for review',
    timestamp: new Date(Date.now() - 600000),
    engagementScore: 82
  },
  {
    id: 'activity-5',
    studentName: 'Diya Reddy',
    activityType: 'quiz',
    description: 'Completed Mastery Task with perfect score',
    timestamp: new Date(Date.now() - 720000),
    engagementScore: 98
  }];


  const mockEngagementData: EngagementData[] = [
  { time: '10:00', engagement: 75, timeOnTask: 45 },
  { time: '10:15', engagement: 82, timeOnTask: 52 },
  { time: '10:30', engagement: 78, timeOnTask: 48 },
  { time: '10:45', engagement: 85, timeOnTask: 55 },
  { time: '11:00', engagement: 88, timeOnTask: 58 },
  { time: '11:15', engagement: 83, timeOnTask: 51 },
  { time: '11:30', engagement: 90, timeOnTask: 62 },
  { time: '11:45', engagement: 86, timeOnTask: 56 }];


  const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'failure_prediction',
    studentName: 'Rohan Gupta',
    message: 'ML model predicts 78% probability of assignment failure',
    severity: 'high',
    recommendedAction: 'Immediate intervention: Assign peer mentor, provide simplified learning materials, and schedule one-on-one tutoring session within 24 hours.'
  },
  {
    id: 'alert-2',
    type: 'intervention_needed',
    studentName: 'Arjun Kumar',
    message: 'Confusion score elevated for 15+ minutes on current concept',
    severity: 'medium',
    recommendedAction: 'Provide additional scaffolding resources and check understanding through formative assessment.'
  }];


  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const handleEmergencyAlert = () => {
    alert('Emergency alert broadcast to all connected students');
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    console.log('Selected student:', studentId);
  };

  const handleActionClick = (actionId: string) => {
    console.log('Action clicked:', actionId);
  };

  const handleAlertAction = (alertId: string) => {
    console.log('Alert action:', alertId);
  };

  // Session management functions
  const createSession = () => {
    if (!socketRef.current || !isConnected) {
      alert('Please wait for WebSocket connection');
      return;
    }

    setSessionStatus('creating');
    // For demo purposes, use a hardcoded classId - in real app this would come from user's classes
    const classId = 'demo-class-123';
    const topic = 'Real-time Monitoring Demo';

    socketRef.current.emit('CREATE_SESSION', { classId, topic });
  };

  const endSession = () => {
    if (!socketRef.current || !currentSession) return;

    socketRef.current.emit('END_SESSION', { sessionId: currentSession.sessionId });
    setCurrentSession(null);
    setSessionStatus('none');
  };

  // Add WebSocket event listeners for session management
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('SESSION_CREATED', (data: { sessionId: string }) => {
      console.log('Session created:', data);
      setCurrentSession({
        sessionId: data.sessionId,
        classId: 'demo-class-123',
        topic: 'Real-time Monitoring Demo'
      });
      setSessionStatus('active');
    });

    socket.on('SESSION_ENDED', (data: { sessionId: string; message: string }) => {
      console.log('Session ended:', data);
      setCurrentSession(null);
      setSessionStatus('none');
    });

    socket.on('SESSION_ENDED_CONFIRM', (data: { sessionId: string; message: string }) => {
      console.log('Session ended confirmation:', data);
      setCurrentSession(null);
      setSessionStatus('none');
    });

    return () => {
      socket.off('SESSION_CREATED');
      socket.off('SESSION_ENDED');
      socket.off('SESSION_ENDED_CONFIRM');
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Session Control Panel (Teachers Only) */}
      {user?.role === 'teacher' && (
        <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse-warm' : 'bg-error'}`} />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  WebSocket {isConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Real-time monitoring {isConnected ? 'active' : 'inactive'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sessionStatus === 'none' && (
                <button
                  onClick={createSession}
                  disabled={!isConnected}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/70 disabled:cursor-not-allowed transition-smooth text-sm font-medium"
                >
                  <Icon name="PlayIcon" size={16} />
                  Start Live Session
                </button>
              )}

              {sessionStatus === 'creating' && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Creating session...
                </div>
              )}

              {sessionStatus === 'active' && currentSession && (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-md bg-success/10 text-success text-xs font-medium">
                    Session Active: {currentSession.sessionId.slice(-8)}
                  </div>
                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-error text-error-foreground hover:bg-error/90 transition-smooth text-sm font-medium"
                  >
                    <Icon name="StopIcon" size={16} />
                    End Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Updates Display */}
          {(confusionUpdate || engagementUpdate) && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-4 text-sm">
                {confusionUpdate && (
                  <div className="flex items-center gap-2">
                    <Icon name="ExclamationTriangleIcon" size={16} className="text-warning" />
                    <span className="text-muted-foreground">
                      Confusion: {confusionUpdate.confusedPercentage.toFixed(1)}% ({confusionUpdate.totalSignals} signals)
                    </span>
                  </div>
                )}
                {engagementUpdate && (
                  <div className="flex items-center gap-2">
                    <Icon name="ChartBarIcon" size={16} className="text-primary" />
                    <span className="text-muted-foreground">
                      Engagement: {engagementUpdate.avgEngagement.toFixed(1)}% ({engagementUpdate.lowEngagementCount} low)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <SessionHeader
        sessionStartTime={sessionStartTime}
        connectedStudents={connectedStudents}
        totalStudents={30}
        onEmergencyAlert={handleEmergencyAlert} />


      <div className="grid grid-cols-1 lg:grid-cols-24 gap-6">
        <div className="lg:col-span-18 space-y-6">
          <ConfusionHeatmap
            students={students}
            onStudentSelect={handleStudentSelect} />


          <LiveActivityFeed activities={mockActivities} />

          <RealTimeAnalytics engagementData={mockEngagementData} />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <QuickActionPanel
            actions={mockQuickActions}
            onActionClick={handleActionClick} />


          <AlertsPanel alerts={mockAlerts} onAlertAction={handleAlertAction} />
        </div>
      </div>
    </div>);

};

export default RealTimeMonitoringInteractive;