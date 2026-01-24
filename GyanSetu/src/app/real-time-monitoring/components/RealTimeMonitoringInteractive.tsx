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
  warnings?: number;
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
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Session management
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string;
    classId: string;
    topic: string;
  } | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'none' | 'creating' | 'active'>('none');

  // Poll State
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Yes', 'No']);
  const [activePollStats, setActivePollStats] = useState<any>(null);

  // Mock data initialization


  // WebSocket connection effect
  useEffect(() => {
    if (!token || !user) return;

    // Fixed Namespace: /classroom
    const socket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}/classroom`, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket /classroom');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });
    
    socket.on('POLL_RESULTS', (data) => {
       console.log('Poll Results:', data);
       setActivePollStats(data);
    });

    // Listen for Student Warnings (Anti-Cheating)
    socket.on('STUDENT_WARNING', (data: { studentId: string; studentName: string; warningCount: number }) => {
       // Show alert (using native alert for now or you could use a toast library)
       // For better UX, we'd use a toast, but sticking to console/alert or UI update
       console.warn(`WARNING: ${data.studentName} switched tabs! (Count: ${data.warningCount})`);
       
       // Update student state
       setStudents(prev => prev.map(s => {
          if (s.id === data.studentId) {
             return { ...s, warnings: data.warningCount };
          }
          return s;
       }));
       
       // Add to Alerts Panel dynamically (optional, but good for persistence)
       // This would require managing alerts state which is currently static mock in this file
       // For now, we rely on the visual indicator in the student list (which we need to add)
    });

    socket.on('CONFUSION_UPDATE', (data: { totalSignals: number; confusedPercentage: number }) => {
      console.log('Confusion update received:', data);
      setConfusionUpdate(data);

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
    
    socket.on('SESSION_CREATED', (data: { sessionId: string }) => {
      console.log('Session created:', data);
      setCurrentSession({
        sessionId: data.sessionId,
        classId: '65f2d6549a09b8e123456789',
        topic: 'Real-time Monitoring Demo'
      });
      setSessionStatus('active');
    });
    
    socket.on('SESSION_STATS', (data: { sessionId: string; totalStudents: number; students: any[] }) => {
       console.log('Session stats:', data);
       setConnectedStudents(data.totalStudents);
       
       if (data.students) {
         setStudents(prev => {
            // Merge new list with previous state to preserve local simulation data (confusion/activity)
            return data.students.map((s) => {
               const existing = prev.find(p => p.id === s.id);
               return {
                  id: s.id,
                  name: s.name,
                  avatar: existing?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`,
                  avatarAlt: s.name,
                  confusionScore: existing?.confusionScore || 0,
                  confusionLevel: existing?.confusionLevel || 'low',
                  currentActivity: existing?.currentActivity || 'Active in Session',
                  interventionStrategy: existing?.interventionStrategy || 'Monitor progress.',
                  warnings: s.warnings || existing?.warnings || 0 // Map warnings
               };
            });
         });
       }
    });

    socket.on('SESSION_ENDED', (data: { sessionId: string; message: string }) => {
      console.log('Session ended:', data);
      setCurrentSession(null);
      setSessionStatus('none');
      setStudents([]); // Clear students on remote end
    });

    socket.on('SESSION_ENDED_CONFIRM', (data: { sessionId: string; message: string; students?: any[] }) => {
        console.log('Session ended confirmation:', data);
        if (data.students && data.students.length > 0) {
           const names = data.students.map(s => s.name).join(', ');
           // Use a more subtle notification or just log
           console.log(`Session Ended. Final Participants: ${names}`);
        }
        setCurrentSession(null);
        setSessionStatus('none');
        setStudents([]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  const createSession = () => {
    if (!socketRef.current || !isConnected) {
      alert('Please wait for WebSocket connection');
      return;
    }
    setSessionStatus('creating');
    // Use a valid 24-char hex string for demo classId to satisfy MongoDB ObjectId requirements
    socketRef.current.emit('CREATE_SESSION', { classId: '65f2d6549a09b8e123456789', topic: 'Real-time Monitoring Demo' });
  };

  const endSession = () => {
    if (!socketRef.current || !currentSession) return;
    socketRef.current.emit('END_SESSION', { sessionId: currentSession.sessionId });
    setCurrentSession(null);
    setSessionStatus('none');
  };

  const launchPoll = () => {
     if (!socketRef.current || !currentSession) return;
     if (!pollQuestion || pollOptions.length < 2) return alert('Invalid poll');
     
     socketRef.current.emit('LAUNCH_POLL', {
        sessionId: currentSession.sessionId,
        question: pollQuestion,
        options: pollOptions
     });
     
     setShowPollCreator(false);
     setActivePollStats({ question: pollQuestion, results: {}, totalResponses: 0 });
     alert('Poll Launched!');
  };

  const handleEmergencyAlert = () => {
    alert('Emergency alert broadcast to all connected students');
  };

  const handleStudentSelect = (studentId: string) => {
    console.log('Selected student:', studentId);
  };

  const handleActionClick = (actionId: string) => {
    console.log('Action clicked:', actionId);
  };

  const handleAlertAction = (alertId: string) => {
    console.log('Alert action:', alertId);
  };

  return (
    <div className="space-y-6">
      {/* Session Control Panel (Teachers Only) */}
      {user?.role === 'teacher' && (
        <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
           <div className="flex items-center justify-between mb-6">
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
                 <div className="text-muted-foreground text-sm">Creating...</div>
              )}

              {sessionStatus === 'active' && currentSession && (
                <>
                  <button
                    onClick={() => setShowPollCreator(!showPollCreator)}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-smooth text-sm font-medium"
                  >
                    <Icon name="chart-bar" size={16} />
                    Create Poll
                  </button>
                  <div className="px-3 py-1 rounded-md bg-success/10 text-success text-xs font-medium select-all font-mono">
                    Session: {currentSession.sessionId}
                  </div>
                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-error text-error-foreground hover:bg-error/90 transition-smooth text-sm font-medium"
                  >
                    <Icon name="StopIcon" size={16} />
                    End Session
                  </button>
                </>
              )}
            </div>
           </div>

           {/* Poll Creator */}
           {showPollCreator && (
             <div className="mb-4 p-4 border rounded bg-muted/20">
                <h4 className="font-semibold mb-2">New Poll</h4>
                <input 
                  className="w-full p-2 mb-2 border rounded" 
                  placeholder="Question" 
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                />
                <input 
                   className="w-full p-2 mb-2 border rounded" 
                   placeholder="Options (comma separated)" 
                   value={pollOptions.join(', ')} 
                   onChange={e => setPollOptions(e.target.value.split(',').map(s => s.trim()))} 
                />
                <button onClick={launchPoll} className="bg-primary text-white px-3 py-1 rounded text-sm">Launch</button>
             </div>
           )}

           {/* Active Poll Results */}
           {activePollStats && (
              <div className="mt-4 p-4 border rounded bg-blue-50">
                 <h4 className="font-bold">Live Poll Results</h4>
                 <p className="text-sm mb-2">Total Responses: {activePollStats.totalResponses || 0}</p>
                 <pre className="text-xs">{JSON.stringify(activePollStats.results, null, 2)}</pre>
              </div>
           )}

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
  }
];

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
  }
];

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
  }
];

const mockEngagementData: EngagementData[] = [
  { time: '10:00', engagement: 75, timeOnTask: 45 },
  { time: '10:15', engagement: 82, timeOnTask: 52 },
  { time: '10:30', engagement: 78, timeOnTask: 48 },
  { time: '10:45', engagement: 85, timeOnTask: 55 },
  { time: '11:00', engagement: 88, timeOnTask: 58 },
  { time: '11:15', engagement: 83, timeOnTask: 51 },
  { time: '11:30', engagement: 90, timeOnTask: 62 },
  { time: '11:45', engagement: 86, timeOnTask: 56 }
];

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
  }
];