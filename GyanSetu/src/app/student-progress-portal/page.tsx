'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import StudentProgressInteractive from './components/StudentProgressInteractive';

export default function StudentProgressPortalPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const hasAccess = user && user.role.toLowerCase() === 'student';
  const [masteryData, setMasteryData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch student mastery data
  useEffect(() => {
    const fetchMasteryData = async () => {
      if (!token || !user) return;

      try {
        setIsLoadingData(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mastery/student/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMasteryData(data);
        } else {
          console.log('Mastery API not available, using mock data');
        }
      } catch (err) {
        console.log('Error fetching mastery data, using mock data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (hasAccess) {
      fetchMasteryData();
    }
  }, [token, user, hasAccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to signin if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-smooth"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const mockStudentData = {
    name: user?.name || 'Student',
    currentProject: 'Sustainable Energy Solutions',
    achievementCount: masteryData?.totalAchievements || 24,
    recentBadges: [
      {
        id: 'badge-1',
        name: 'Critical Thinker',
        icon: 'LightBulbIcon',
        earnedDate: new Date('2025-12-20'),
      },
      {
        id: 'badge-2',
        name: 'Team Player',
        icon: 'UserGroupIcon',
        earnedDate: new Date('2025-12-18'),
      },
      {
        id: 'badge-3',
        name: 'Creative Innovator',
        icon: 'SparklesIcon',
        earnedDate: new Date('2025-12-15'),
      },
    ],
  };

  const mockSkillsData = [
    { skill: 'Communication', current: 78, target: 85, icon: 'ChatBubbleLeftRightIcon' },
    { skill: 'Creativity', current: 85, target: 90, icon: 'SparklesIcon' },
    { skill: 'Teamwork', current: 72, target: 80, icon: 'UserGroupIcon' },
    { skill: 'Logic', current: 88, target: 95, icon: 'CpuChipIcon' },
  ];

  const mockRecommendations = [
    {
      id: 'rec-1',
      title: 'Advanced Data Analysis Techniques',
      description: 'Master statistical methods and data visualization to strengthen your analytical skills for the energy project.',
      difficulty: 'Mastery' as const,
      estimatedTime: 45,
      skillsTargeted: ['Logic', 'Creativity'],
      priority: 'high' as const,
    },
    {
      id: 'rec-2',
      title: 'Effective Team Communication Workshop',
      description: 'Enhance your collaborative communication skills through interactive exercises and peer feedback sessions.',
      difficulty: 'Reinforcement' as const,
      estimatedTime: 30,
      skillsTargeted: ['Communication', 'Teamwork'],
      priority: 'high' as const,
    },
    {
      id: 'rec-3',
      title: 'Creative Problem-Solving Fundamentals',
      description: 'Learn design thinking methodologies to approach complex problems with innovative solutions.',
      difficulty: 'Foundation' as const,
      estimatedTime: 25,
      skillsTargeted: ['Creativity', 'Logic'],
      priority: 'medium' as const,
    },
    {
      id: 'rec-4',
      title: 'Research Methodology Basics',
      description: 'Build foundational research skills including literature review, hypothesis formation, and data collection.',
      difficulty: 'Foundation' as const,
      estimatedTime: 35,
      skillsTargeted: ['Logic', 'Communication'],
      priority: 'medium' as const,
    },
    {
      id: 'rec-5',
      title: 'Presentation Skills Enhancement',
      description: 'Develop compelling presentation techniques to effectively communicate your project findings.',
      difficulty: 'Reinforcement' as const,
      estimatedTime: 20,
      skillsTargeted: ['Communication', 'Creativity'],
      priority: 'low' as const,
    },
  ];

  const mockMilestones = [
    {
      id: 'milestone-1',
      title: 'Project Proposal Submission',
      description: 'Complete and submit comprehensive project proposal with research objectives and methodology.',
      status: 'completed' as const,
      completionDate: new Date('2025-11-15'),
      dueDate: new Date('2025-11-15'),
      artifactsSubmitted: 3,
      artifactsRequired: 3,
      masteryScore: 92,
    },
    {
      id: 'milestone-2',
      title: 'Literature Review & Research',
      description: 'Conduct thorough literature review on sustainable energy technologies and compile annotated bibliography.',
      status: 'completed' as const,
      completionDate: new Date('2025-12-01'),
      dueDate: new Date('2025-12-01'),
      artifactsSubmitted: 5,
      artifactsRequired: 5,
      masteryScore: 88,
    },
    {
      id: 'milestone-3',
      title: 'Prototype Development',
      description: 'Design and build working prototype of solar-powered water purification system with technical documentation.',
      status: 'in-progress' as const,
      dueDate: new Date('2025-12-28'),
      artifactsSubmitted: 2,
      artifactsRequired: 4,
      masteryScore: 65,
    },
    {
      id: 'milestone-4',
      title: 'Testing & Data Collection',
      description: 'Execute comprehensive testing protocols and collect performance data for analysis and optimization.',
      status: 'upcoming' as const,
      dueDate: new Date('2026-01-10'),
      artifactsSubmitted: 0,
      artifactsRequired: 3,
      masteryScore: 0,
    },
    {
      id: 'milestone-5',
      title: 'Final Presentation & Report',
      description: 'Prepare final project report and deliver comprehensive presentation to evaluation panel.',
      status: 'upcoming' as const,
      dueDate: new Date('2026-01-25'),
      artifactsSubmitted: 0,
      artifactsRequired: 2,
      masteryScore: 0,
    },
  ];

  const mockKanbanTasks = [
    {
      id: 'task-1',
      title: 'Complete Circuit Design',
      description: 'Finalize electrical circuit schematic for solar panel integration with water purification unit.',
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: new Date('2025-12-25'),
      peerReviews: 0,
      requiredReviews: 2,
    },
    {
      id: 'task-2',
      title: 'Build Prototype Frame',
      description: 'Construct physical frame structure using sustainable materials for prototype housing.',
      status: 'in-progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2025-12-26'),
      peerReviews: 0,
      requiredReviews: 2,
    },
    {
      id: 'task-3',
      title: 'Write Technical Documentation',
      description: 'Document all technical specifications, assembly instructions, and maintenance procedures.',
      status: 'in-progress' as const,
      priority: 'medium' as const,
      dueDate: new Date('2025-12-27'),
      peerReviews: 0,
      requiredReviews: 3,
    },
    {
      id: 'task-4',
      title: 'Literature Review Summary',
      description: 'Comprehensive summary of 15 peer-reviewed articles on sustainable energy technologies.',
      status: 'review' as const,
      priority: 'medium' as const,
      dueDate: new Date('2025-12-20'),
      peerReviews: 2,
      requiredReviews: 3,
    },
    {
      id: 'task-5',
      title: 'Project Proposal Draft',
      description: 'Initial project proposal outlining objectives, methodology, and expected outcomes.',
      status: 'completed' as const,
      priority: 'high' as const,
      dueDate: new Date('2025-11-10'),
      peerReviews: 3,
      requiredReviews: 3,
    },
    {
      id: 'task-6',
      title: 'Research Methodology Plan',
      description: 'Detailed plan for data collection, testing protocols, and analysis methods.',
      status: 'completed' as const,
      priority: 'medium' as const,
      dueDate: new Date('2025-11-20'),
      peerReviews: 3,
      requiredReviews: 3,
    },
  ];

  return (
    <>
      <Header
        connectionStatus={{ isConnected: true, lastUpdate: new Date() }}
      />

      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <StudentProgressInteractive
            studentData={mockStudentData}
            skillsData={mockSkillsData}
            overallProgress={masteryData?.overallMastery || 81}
            recommendations={mockRecommendations}
            milestones={mockMilestones}
            kanbanTasks={mockKanbanTasks}
          />
        </div>
      </main>
    </>
  );
}