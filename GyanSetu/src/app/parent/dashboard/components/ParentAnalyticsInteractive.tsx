import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';

// --- Types ---
interface AttendanceRecord {
   _id: string;
   date: string;
   status: 'PRESENT' | 'ABSENT' | 'INCOMPLETE';
   joinTime: string;
   leaveTime?: string;
   durationMinutes: number;
   sessionId: string;
   classId: {
       _id: string;
       className: string;
       subject: string;
   };
}

interface WeeklyReport {
   weekStartDate: string;
   attendanceRate: number;
   averageMastery: number;
   assessmentsTaken: number;
   sessionsAttended: number;
   totalSessions: number;
}

interface ParentDashboardMetrics {
  studentId: string;
  studentName: string;
  averageMastery: number;
  averageEngagement: number;
  engagementLevel: 'Low' | 'Medium' | 'High';
  masteryTrend: number[];
  subjectMastery: { subject: string; score: number }[];
  weakSubjects: string[];
  attendanceRate: number;
  riskStatus: 'At Risk' | 'Stable' | 'Improving';
  recentAssessments: any[];
  attendanceHistory: AttendanceRecord[];
  weeklyReports: WeeklyReport[];
}

const ParentAnalyticsInteractive = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<ParentDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'reports'>('overview');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/parent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        
        if (data.children && data.children.length === 0) {
           setError('No children linked.');
           setMetrics(null);
        } else {
           setMetrics(data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  // Fetch detailed attendance once basic metrics (with studentId) are loaded
  useEffect(() => {
    const fetchAttendance = async () => {
        if (!token || !metrics?.studentId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/attendance/student/${metrics.studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.attendance) {
                    // Calculate "This Month" Attendance Rate
                    const now = new Date();
                    const currentMonthRecords = data.attendance.filter((r: AttendanceRecord) => {
                        const d = new Date(r.date);
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    });
                    
                    const totalSessions = currentMonthRecords.length;
                    const presentSessions = currentMonthRecords.filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
                    const calculatedRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

                    setMetrics(prev => prev ? ({
                        ...prev,
                        attendanceHistory: data.attendance,
                        attendanceRate: calculatedRate // Override with real calculation
                    }) : null);
                }
            }
        } catch (err) {
            console.error("Failed to fetch detailed attendance", err);
        }
    };

    if (metrics?.studentId) {
        fetchAttendance();
    }
  }, [metrics?.studentId, token]);

  // --- Components ---

  const KPICard = ({ title, value, sub, icon, status }: any) => {
      const colors = {
          success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          warning: 'bg-amber-50 text-amber-700 border-amber-200',
          error: 'bg-rose-50 text-rose-700 border-rose-200',
          neutral: 'bg-card text-foreground border-border'
      };
      const statusColor = colors[status as keyof typeof colors] || colors.neutral;

      return (
          <div className={`p-6 rounded-xl border ${statusColor} shadow-sm transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <Icon name={icon} size={24} />
                  </div>
                  {status !== 'neutral' && (
                     <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-full uppercase tracking-wider">
                        {status}
                     </span>
                  )}
              </div>
              <div className="mt-4">
                  <h3 className="text-sm font-medium opacity-80">{title}</h3>
                  <div className="text-3xl font-bold mt-1">{value}</div>
                  <p className="text-xs mt-2 opacity-70 font-medium">{sub}</p>
              </div>
          </div>
      );
  };

  const CalendarView = () => {
      if (!metrics) return null;
      
      const today = new Date();
      const [currentMonth, setCurrentMonth] = useState(today);

      const getDaysInMonth = (date: Date) => {
         const year = date.getFullYear();
         const month = date.getMonth();
         const days = new Date(year, month + 1, 0).getDate();
         return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
      };

      const days = getDaysInMonth(currentMonth);

      const getRecordsForDate = (calendarDate: Date) => {
          return metrics.attendanceHistory.filter(r => {
              const recordDate = new Date(r.date); // Parse ISO string to local date object
              return recordDate.getDate() === calendarDate.getDate() &&
                     recordDate.getMonth() === calendarDate.getMonth() &&
                     recordDate.getFullYear() === calendarDate.getFullYear();
          });
      };

      return (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Attendance Calendar</h2>
                  <div className="flex gap-2">
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-muted rounded"><Icon name="arrow-left" size={16}/></button>
                      <span className="font-medium p-2">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-muted rounded"><Icon name="arrow-right" size={16}/></button>
                  </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-sm font-bold text-muted-foreground py-2">{d}</div>
                  ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                  {Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                  
                  {days.map(date => {
                      const records = getRecordsForDate(date);
                      const isPresent = records.some(r => r.status === 'PRESENT');
                      const isIncomplete = records.some(r => r.status === 'INCOMPLETE');
                      const hasRecords = records.length > 0;

                      let bg = 'bg-muted/30 hover:bg-muted';
                      if (hasRecords) {
                          if (isPresent) bg = 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
                          else if (isIncomplete) bg = 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
                          else bg = 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200';
                      }

                      return (
                          <button 
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(hasRecords ? date : null)}
                            className={`h-20 rounded-lg border border-transparent p-2 flex flex-col items-center justify-between transition-all ${bg}`}
                          >
                              <span className="text-sm font-medium">{date.getDate()}</span>
                              {hasRecords && (
                                  <div className="text-xs font-bold text-center">
                                      {isPresent ? <Icon name="CheckCircleIcon" size={16} className="mx-auto mb-1"/> : null}
                                      {records.length > 1 ? `${records.length} Sessions` : (records[0].durationMinutes > 0 ? `${records[0].durationMinutes}m` : records[0].status)}
                                  </div>
                              )}
                          </button>
                      );
                  })}
              </div>

              {/* Detail Modal/Popover for Calendar - List of Sessions */}
              {selectedDate && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
                      <div className="bg-card p-6 rounded-xl max-w-md w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-between items-center mb-4 border-b pb-2">
                              <h3 className="text-lg font-bold">Sessions on {selectedDate.toLocaleDateString()}</h3>
                              <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-muted rounded-full"><Icon name="x" size={20}/></button>
                          </div>
                          
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                              {getRecordsForDate(selectedDate).length > 0 ? (
                                  getRecordsForDate(selectedDate).map((record, idx) => (
                                     <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border">
                                         <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold flex items-center gap-2">
                                                {record.status === 'PRESENT' ? (
                                                    <span className="text-emerald-600 flex items-center gap-1"><Icon name="CheckCircleIcon" size={16} /> Present</span>
                                                ) : record.status === 'ABSENT' ? (
                                                    <span className="text-rose-600 flex items-center gap-1"><Icon name="XCircleIcon" size={16} /> Absent</span>
                                                ) : (
                                                    <span className="text-amber-600 flex items-center gap-1"><Icon name="ExclamationTriangleIcon" size={16} /> Incomplete</span>
                                                )}
                                            </span>
                                            <span className="text-xs bg-white/50 px-2 py-1 rounded border">{record.durationMinutes} mins</span>
                                         </div>
                                         <div className="grid grid-cols-2 gap-2 text-sm">
                                             <div className="text-muted-foreground">Subject:</div>
                                             <div className="font-medium">{(record.classId as any)?.subject || 'General'}</div>
                                             <div className="text-muted-foreground">Class:</div>
                                             <div className="font-medium">{(record.classId as any)?.className || 'N/A'}</div>
                                             <div className="text-muted-foreground">Join Time:</div>
                                             <div>{new Date(record.joinTime).toLocaleTimeString()}</div>
                                         </div>
                                     </div>
                                  ))
                              ) : (
                                  <p className="text-muted-foreground py-4 text-center">No class records found for this date.</p>
                              )}
                          </div>

                          <button onClick={() => setSelectedDate(null)} className="w-full mt-6 bg-primary text-primary-foreground py-2 rounded-lg">Close</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const ReportsView = () => (
      <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Weekly Progress Reports</h2>
          <div className="grid gap-4">
              {metrics?.weeklyReports.map((report, idx) => (
                  <div key={idx} className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedReport(report)}>
                      <div className="flex justify-between items-center">
                          <div>
                              <div className="text-sm text-muted-foreground mb-1">Week of</div>
                              <div className="text-lg font-bold">{new Date(report.weekStartDate).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-8 text-right">
                              <div>
                                  <div className="text-xs text-muted-foreground">Attendance</div>
                                  <div className={`font-bold ${report.attendanceRate >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {report.attendanceRate}%
                                  </div>
                              </div>
                              <div>
                                  <div className="text-xs text-muted-foreground">Avg Mastery</div>
                                  <div className="font-bold text-primary">{report.averageMastery}%</div>
                              </div>
                              <Icon name="chevron-right" size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </div>
                      </div>
                  </div>
              ))}
              {metrics?.weeklyReports.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-xl">
                      No weekly reports generated yet.
                  </div>
              )}
          </div>

          {/* Report Detail Modal */}
          {selectedReport && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
                  <div className="bg-card p-8 rounded-xl max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-start mb-6">
                           <div>
                              <h2 className="text-2xl font-bold">Weekly Report</h2>
                              <p className="text-muted-foreground">Week of {new Date(selectedReport.weekStartDate).toLocaleDateString()}</p>
                           </div>
                           <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-muted rounded-full">
                               <Icon name="x" size={20} />
                           </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-muted/30 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-primary">{selectedReport.averageMastery}%</div>
                              <div className="text-sm text-muted-foreground">Mastery Score</div>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg text-center">
                               <div className="text-2xl font-bold text-foreground">{selectedReport.attendanceRate}%</div>
                              <div className="text-sm text-muted-foreground">Attendance</div>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg text-center">
                               <div className="text-2xl font-bold text-foreground">{selectedReport.sessionsAttended}/{selectedReport.totalSessions}</div>
                              <div className="text-sm text-muted-foreground">Sessions Attended</div>
                          </div>
                           <div className="bg-muted/30 p-4 rounded-lg text-center">
                               <div className="text-2xl font-bold text-foreground">{selectedReport.assessmentsTaken}</div>
                              <div className="text-sm text-muted-foreground">Assessments Taken</div>
                          </div>
                      </div>

                      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-6">
                          <strong>Summary:</strong> The student attended {selectedReport.attendanceRate}% of sessions and achieved an average mastery of {selectedReport.averageMastery}% in assessments this week.
                      </div>

                      <button onClick={() => window.print()} className="w-full border border-border hover:bg-muted py-2 rounded-lg mb-2">Download PDF (Print)</button>
                      <button onClick={() => setSelectedReport(null)} className="w-full bg-primary text-primary-foreground py-2 rounded-lg">Close Report</button>
                  </div>
              </div>
          )}
      </div>
  );

  // --- Main Render ---

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading dashboard...</div>;
  if (error || !metrics) return <div className="p-12 text-center text-error">{error || 'No data available'}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Parent Dashboard</h1>
            <p className="text-muted-foreground">Monitoring {metrics.studentName}</p>
         </div>
         <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
             {['overview', 'attendance', 'reports'].map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === tab ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                 >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                 </button>
             ))}
         </div>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <KPICard 
                    title="Avg. Mastery" value={`${metrics.averageMastery}%`} sub="Overall performance" 
                    icon="AcademicCapIcon" status={metrics.averageMastery > 70 ? 'success' : 'warning'} 
                  />
                  <KPICard 
                    title="Attendance" value={`${metrics.attendanceRate}%`} sub="This month" 
                    icon="ClockIcon" status={metrics.attendanceRate > 85 ? 'success' : 'error'} 
                  />
                  <KPICard 
                    title="Engagement" value={metrics.engagementLevel} sub={`Score: ${metrics.averageEngagement}`} 
                    icon="FireIcon" status={metrics.engagementLevel === 'High' ? 'success' : 'neutral'} 
                  />
                  <KPICard 
                    title="Risk Status" value={metrics.riskStatus} sub="Based on recent activity" 
                    icon="ShieldCheckIcon" status={metrics.riskStatus === 'Stable' ? 'success' : metrics.riskStatus === 'Improving' ? 'success' : 'error'} 
                  />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Col: Charts */}
                  <div className="lg:col-span-2 space-y-6">
                      {/* Subject Mastery */}
                      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold mb-4">Subject-wise Mastery</h3>
                          <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={metrics.subjectMastery} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                  <XAxis type="number" domain={[0, 100]} hide />
                                  <YAxis dataKey="subject" type="category" width={100} tick={{fontSize: 12}} />
                                  <Tooltip cursor={{fill: 'transparent'}} />
                                  <Bar dataKey="score" fill="#0F766E" barSize={20} radius={[0, 4, 4, 0]}>
                                    {metrics.subjectMastery.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score < 60 ? '#ef4444' : '#0f766e'} />
                                    ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>

                      {/* Recent Activities/Assessments */}
                      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold mb-4">Recent Assessments</h3>
                           <div className="space-y-3">
                               {metrics.recentAssessments.map(acc => (
                                   <div key={acc.id} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-lg border border-border/50">
                                       <div>
                                           <div className="font-medium">{acc.title}</div>
                                           <div className="text-xs text-muted-foreground">{new Date(acc.date).toLocaleDateString()}</div>
                                       </div>
                                       <div className="text-right">
                                           <div className={`font-bold ${acc.percentage >= 60 ? 'text-primary' : 'text-error'}`}>{acc.percentage}%</div>
                                           <div className="text-xs text-muted-foreground">Score</div>
                                       </div>
                                   </div>
                               ))}
                               {metrics.recentAssessments.length === 0 && <p className="text-muted-foreground text-sm">No recent assessments.</p>}
                           </div>
                      </div>
                  </div>

                  {/* Right Col: Weaknesses & Insights */}
                  <div className="space-y-6">
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
                             <Icon name="ExclamationTriangleIcon" size={20} />
                             Attention Required
                          </h3>
                          <p className="text-sm text-rose-700 mb-4">The following subjects or topics need improvement:</p>
                          <div className="flex flex-wrap gap-2">
                              {metrics.weakSubjects.map(sub => (
                                  <span key={sub} className="px-3 py-1 bg-white text-rose-600 rounded-full text-xs font-bold border border-rose-100 shadow-sm">
                                      {sub}
                                  </span>
                              ))}
                              {metrics.weakSubjects.length === 0 && (
                                  <span className="text-sm text-emerald-600 font-medium">None! Great job.</span>
                              )}
                          </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-indigo-800 mb-2">Parent Tip</h3>
                          <p className="text-sm text-indigo-700 leading-relaxed">
                              Consistent attendance correlates strongly with mastery. Try to ensure {metrics.studentName} attends all scheduled sessions next week to boost their engagement score.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'attendance' && <CalendarView />}
      {activeTab === 'reports' && <ReportsView />}

    </div>
  );
};

export default ParentAnalyticsInteractive;
