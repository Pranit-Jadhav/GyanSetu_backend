'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ConnectionStatusIndicatorProps {
  isConnected?: boolean;
  lastUpdate?: Date;
  className?: string;
  showDetails?: boolean;
}

const ConnectionStatusIndicator = ({
  isConnected = true,
  lastUpdate,
  className = '',
  showDetails = false,
}: ConnectionStatusIndicatorProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Just now';

    const seconds = Math.floor(
      (currentTime.getTime() - lastUpdate.getTime()) / 1000
    );

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted cursor-pointer hover:bg-muted/80 transition-smooth"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="relative">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-success' : 'bg-error'
            }`}
          />
          {isConnected && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-pulse-warm" />
          )}
        </div>

        <span className="text-xs caption text-muted-foreground font-medium">
          {isConnected ? 'Live' : 'Offline'}
        </span>

        {showDetails && (
          <Icon
            name="InformationCircleIcon"
            size={14}
            className="text-muted-foreground"
          />
        )}
      </div>

      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-popover rounded-lg shadow-warm-lg border border-border z-[200] animate-scale-in p-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-success/10' : 'bg-error/10'
              }`}
            >
              <Icon
                name={isConnected ? 'CheckCircleIcon' : 'XCircleIcon'}
                size={18}
                className={isConnected ? 'text-success' : 'text-error'}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground mb-1">
                {isConnected ? 'System Connected' : 'Connection Lost'}
              </h4>
              <p className="text-xs caption text-muted-foreground mb-3">
                {isConnected
                  ? 'Real-time data streaming active. ML predictions and analytics are up to date.' :'Unable to connect to server. Some features may be unavailable.'}
              </p>
              {isConnected && lastUpdate && (
                <div className="flex items-center gap-2 text-xs caption text-muted-foreground">
                  <Icon name="ClockIcon" size={14} />
                  <span>Last update: {getTimeSinceUpdate()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;