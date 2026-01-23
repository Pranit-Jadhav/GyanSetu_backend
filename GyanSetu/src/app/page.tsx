'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'teacher' || user.role === 'admin') {
        router.push('/teacher-analytics-hub');
      } else if (user.role === 'student') {
        router.push('/student-progress-portal');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

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

  if (isAuthenticated && user) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="40"
                    height="40"
                    rx="10"
                    className="fill-primary"
                  />
                  <path
                    d="M20 10L28 16V24L20 30L12 24V16L20 10Z"
                    className="fill-primary-foreground"
                    opacity="0.9"
                  />
                  <path
                    d="M20 14L24 17V23L20 26L16 23V17L20 14Z"
                    className="fill-primary-foreground"
                    opacity="0.6"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="3"
                    className="fill-primary-foreground"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-heading font-bold text-foreground leading-none">
                  GyanSetu
                </span>
                <span className="text-lg caption text-muted-foreground mt-1">
                  Educational Analytics
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6">
              AI-Powered Learning
              <span className="block text-primary">Analytics Platform</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform education with real-time analytics, personalized learning paths,
              and data-driven insights for both teachers and students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/signup"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-smooth flex items-center justify-center gap-2"
              >
                <Icon name="UserPlusIcon" size={20} />
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="border border-border hover:bg-muted text-foreground font-medium py-3 px-8 rounded-lg transition-smooth flex items-center justify-center gap-2"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Choose GyanSetu?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for modern education with cutting-edge AI and real-time analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ChartBarIcon" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Real-Time Analytics
              </h3>
              <p className="text-muted-foreground">
                Monitor student engagement and performance with live dashboards and alerts
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CpuChipIcon" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                AI-Powered Learning
              </h3>
              <p className="text-muted-foreground">
                Personalized learning paths using Bayesian Knowledge Tracing and adaptive algorithms
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="SignalIcon" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Live Collaboration
              </h3>
              <p className="text-muted-foreground">
                Real-time classroom sessions with confusion detection and instant feedback
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="relative">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="40"
                    height="40"
                    rx="6"
                    className="fill-primary"
                  />
                  <path
                    d="M20 10L28 16V24L20 30L12 24V16L20 10Z"
                    className="fill-primary-foreground"
                    opacity="0.9"
                  />
                </svg>
              </div>
              <span className="font-heading font-semibold text-foreground">GyanSetu</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 GyanSetu. Built for the future of education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}