'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
}

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('gyansetu_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Store token and user data
      localStorage.setItem('gyansetu_token', data.token);
      localStorage.setItem('gyansetu_user', JSON.stringify(data.user));

      // Redirect to appropriate dashboard
      if (data.user.role === 'teacher') {
        router.push('/teacher-analytics-hub');
      } else {
        router.push('/student-progress-portal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <svg
                width="48"
                height="48"
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
              <span className="text-2xl font-heading font-bold text-foreground leading-none">
                GyanSetu
              </span>
              <span className="text-sm caption text-muted-foreground mt-0.5">
                Educational Analytics
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Join GyanSetu to start your learning journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pl-11 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Enter your full name"
                />
                <Icon
                  name="UserIcon"
                  size={20}
                  className="absolute left-3 top-3.5 text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pl-11 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Enter your email"
                />
                <Icon
                  name="EnvelopeIcon"
                  size={20}
                  className="absolute left-3 top-3.5 text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                Account Type
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-11 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <Icon
                  name="AcademicCapIcon"
                  size={20}
                  className="absolute left-3 top-3.5 text-muted-foreground"
                />
                <Icon
                  name="ChevronDownIcon"
                  size={16}
                  className="absolute right-3 top-3.5 text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pl-11 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Create a password"
                />
                <Icon
                  name="LockClosedIcon"
                  size={20}
                  className="absolute left-3 top-3.5 text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pl-11 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="Confirm your password"
                />
                <Icon
                  name="LockClosedIcon"
                  size={20}
                  className="absolute left-3 top-3.5 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/70 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-smooth flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Icon name="UserPlusIcon" size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}