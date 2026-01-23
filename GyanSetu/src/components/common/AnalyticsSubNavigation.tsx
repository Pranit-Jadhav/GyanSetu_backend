'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface AnalyticsSubNavigationProps {
  className?: string;
}

const AnalyticsSubNavigation = ({
  className = '',
}: AnalyticsSubNavigationProps) => {
  const pathname = usePathname();

  const analyticsRoutes = [
    {
      label: 'Teacher Analytics',
      href: '/teacher-analytics-hub',
      icon: 'UserIcon',
      description: 'Individual class performance',
    },
    {
      label: 'Class Performance',
      href: '/class-performance-analytics',
      icon: 'UsersIcon',
      description: 'Comparative institutional metrics',
    },
  ];

  const isAnalyticsRoute =
    pathname === '/teacher-analytics-hub' ||
    pathname === '/class-performance-analytics';

  if (!isAnalyticsRoute) {
    return null;
  }

  return (
    <div
      className={`sticky top-16 z-[90] bg-card border-b border-border ${className}`}
    >
      <div className="px-6">
        <div className="flex items-center gap-1 py-3">
          <div className="hidden md:flex items-center gap-1">
            {analyticsRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                  pathname === route.href
                    ? 'bg-primary/10 text-primary border border-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={route.icon as any} size={16} />
                <span>{route.label}</span>
              </Link>
            ))}
          </div>

          <div className="md:hidden w-full">
            <select
              value={pathname}
              onChange={(e) => {
                window.location.href = e.target.value;
              }}
              className="w-full px-4 py-2 rounded-md bg-background border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth"
            >
              {analyticsRoutes.map((route) => (
                <option key={route.href} value={route.href}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSubNavigation;