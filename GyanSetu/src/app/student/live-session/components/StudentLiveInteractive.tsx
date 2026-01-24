'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface Poll {
  pollId: string;
  question: string;
  options: string[];
}

export default function StudentLiveInteractive() {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  // Ref to track joined state inside socket closures/intervals without triggering reconnects
  const isJoinedRef = useRef(false);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [confusionLevel, setConfusionLevel] = useState(0);

  // Sync ref with state
  useEffect(() => {
    isJoinedRef.current = isJoined;
  }, [isJoined]);

  useEffect(() => {
    if (!token) return;

    // Ensure we connect to the /classroom namespace
    const baseUrl = (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001').replace(/\/$/, '');
    const socketUrl = `${baseUrl}/classroom`;
    
    console.log('Connecting to socket URL:', socketUrl);

    socketRef.current = io(socketUrl, {
       auth: { token },
       transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Student connected to socket');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsJoined(false);
    });

    socket.on('JOINED_SESSION', (data: any) => {
       console.log('Joined session:', data);
       setIsJoined(true);
    });

    socket.on('JOIN_SESSION_FAILED', (msg: any) => {
       alert('Failed to join: ' + JSON.stringify(msg));
       setIsJoined(false);
    });

    socket.on('POLL_LAUNCHED', (poll: Poll) => {
       console.log('Poll received:', poll);
       setActivePoll(poll);
       setPollSubmitted(false);
    });
    
    // Auto-engagement simulation
    const interval = setInterval(() => {
      if (isJoinedRef.current && socket.connected) {
         socket.emit('ENGAGEMENT_SIGNAL', {
            idleTime: 0,
            scrollSpeed: 0.5,
            tabFocus: 100
         });
      }
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [token]);

  const handleJoin = () => {
    if (!sessionId.trim() || !socketRef.current) return;
    // Normalize to lowercase to match teacher's generated ID
    socketRef.current.emit('JOIN_SESSION', { sessionId: sessionId.trim().toLowerCase() });
  };

  const submitPoll = (index: number) => {
    if (!socketRef.current || !activePoll) return;
    socketRef.current.emit('POLL_RESPONSE', { 
       pollId: activePoll.pollId, 
       optionIndex: index 
    });
    setPollSubmitted(true);
  };
  
  const sendConfusion = () => {
     if (!socketRef.current) return;
     socketRef.current.emit('CONFUSION_SIGNAL', { level: 1 });
     setConfusionLevel(prev => prev + 1);
     setTimeout(() => setConfusionLevel(prev => Math.max(0, prev - 1)), 3000);
  };

  if (!isConnected) return <div className="text-muted-foreground p-4">Connecting to live server...</div>;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
       {!isJoined ? (
         <div className="bg-card p-6 rounded-lg border border-border">
           <h2 className="text-xl font-semibold mb-4">Join Live Session</h2>
           <p className="text-sm text-muted-foreground mb-4">
              Enter the Session ID provided by your teacher (e.g. sess_abc123)
           </p>
           <div className="flex gap-2">
             <input 
               type="text" 
               className="flex-1 p-2 border rounded bg-background"
               placeholder="sess_..."
               value={sessionId}
               onChange={e => setSessionId(e.target.value)}
             />
             <button onClick={handleJoin} className="bg-primary text-primary-foreground px-4 py-2 rounded">
                Join
             </button>
           </div>
         </div>
       ) : (
         <div className="space-y-6">
            <div className="bg-success/10 text-success p-4 rounded-lg flex items-center gap-2">
               <Icon name="check-circle" size={20} />
               <span>Connected to Session: {sessionId}</span>
            </div>

            {/* Poll Section */}
            {activePoll ? (
               <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase">Live Poll</span>
                     <h3 className="text-lg font-bold">{activePoll.question}</h3>
                  </div>
                  
                  {pollSubmitted ? (
                     <div className="text-center py-6 text-muted-foreground">
                        <Icon name="check" size={32} className="mx-auto mb-2 text-primary" />
                        <p>Response Submitted!</p>
                        <p className="text-sm">Waiting for teacher to reveal results.</p>
                     </div>
                  ) : (
                     <div className="grid gap-3">
                        {activePoll.options.map((opt, idx) => (
                           <button 
                             key={idx}
                             onClick={() => submitPoll(idx)}
                             className="w-full text-left p-3 rounded border border-border hover:bg-muted transition-colors"
                           >
                              {opt}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            ) : (
               <div className="bg-card p-6 rounded-lg border border-border text-center text-muted-foreground">
                  <p>Waiting for next activity...</p>
               </div>
            )}
            
            {/* Feedback Controls */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={sendConfusion}
                 className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${confusionLevel > 0 ? 'bg-error text-error-foreground border-error' : 'bg-card hover:bg-muted'}`}
               >
                  <Icon name="question-mark-circle" size={24} />
                  <span>I'm Confused</span>
               </button>
               <div className="p-4 rounded-lg border bg-card flex flex-col items-center gap-2 text-muted-foreground">
                  <Icon name="eye" size={24} />
                  <span>Engagement Active</span>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
