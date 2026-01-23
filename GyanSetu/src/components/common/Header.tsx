'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionStatus {
  isConnected: boolean;
  lastUpdate?: Date;
}

interface HeaderProps {
  connectionStatus?: ConnectionStatus;
  onClassChange?: (classId: string) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
}

const Header = ({
  connectionStatus = { isConnected: true },
  onClassChange,
  onDateRangeChange,
}: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigationItems = [
    {
      label: 'Live Classroom',
      href: '/real-time-monitoring',
      icon: 'SignalIcon',
      roles: ['teacher', 'admin'],
    },
    {
      label: 'Analytics Dashboard',
      href: '/teacher-analytics-hub',
      icon: 'ChartBarIcon',
      roles: ['teacher', 'admin'],
    },
    {
      label: 'Student Portal',
      href: '/student-progress-portal',
      icon: 'AcademicCapIcon',
      roles: ['student', 'teacher', 'admin'],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const isActive = (href: string) => {
    if (href === '/teacher-analytics-hub') {
      return pathname === href || pathname === '/class-performance-analytics';
    }
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] bg-card transition-smooth ${
        isScrolled ? 'shadow-warm-md' : 'shadow-warm-sm'
      }`}
    >
      <nav className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-smooth group-hover:scale-105"
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
              <span className="text-lg font-heading font-semibold text-foreground leading-none">
                GyanSetu
              </span>
              <span className="text-xs caption text-muted-foreground mt-0.5">
                Educational Analytics
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-warm-sm'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name={item.icon as any} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted cursor-pointer"
            title={
              connectionStatus.isConnected
                ? 'System Connected' :'Connection Lost'
            }
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus.isConnected
                  ? 'bg-success animate-pulse-warm' :'bg-error'
              }`}
            />
            <span className="text-xs caption text-muted-foreground">
              {connectionStatus.isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

         
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-smooth"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground leading-none">
                    {user.name}
                  </span>
                  <span className="text-xs caption text-muted-foreground mt-0.5 capitalize">
                    {user.role}
                  </span>
                </div>
                <Icon
                  name="ChevronDownIcon"
                  size={16}
                  className={`hidden md:block text-muted-foreground transition-smooth ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[45]"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-lg shadow-warm-lg border border-border z-[50] animate-scale-in overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs caption text-muted-foreground mt-1 capitalize">
                      {user.role} Account
                    </p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-smooth text-left">
                      <Icon name="UserCircleIcon" size={18} />
                      <span className="text-sm text-foreground">Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-smooth text-left">
                      <Icon name="Cog6ToothIcon" size={18} />
                      <span className="text-sm text-foreground">Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-smooth text-left">
                      <Icon name="QuestionMarkCircleIcon" size={18} />
                      <span className="text-sm text-foreground">Help</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-border">
                    <button
                      onClick={() => {
                        logout();
                        router.push('/');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-smooth text-left"
                    >
                      <Icon name="ArrowRightOnRectangleIcon" size={18} />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-smooth text-sm"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-smooth"
            aria-label="Toggle menu"
          >
            <Icon
              name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
              size={24}
            />
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-background z-[90] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-card z-[95] lg:hidden animate-slide-in-right overflow-y-auto">
            <div className="p-6 space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-smooth ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-warm-sm'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item.icon as any} size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus.isConnected
                      ? 'bg-success animate-pulse-warm' :'bg-error'
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {connectionStatus.isConnected
                    ? 'System Connected' :'Connection Lost'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;