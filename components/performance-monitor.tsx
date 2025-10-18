'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    // Measure initial load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Estimate bundle size (this would be more accurate with webpack bundle analyzer)
      const bundleSize = document.querySelectorAll('script').length * 50; // Rough estimate
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(performance.now() - startTime),
        memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
        bundleSize: Math.round(bundleSize),
      });
    };

    // Measure after initial render
    const timer = setTimeout(measureLoadTime, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!metrics || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            <Badge variant="secondary" className="text-xs">
              Dev
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Load Time
            </div>
            <span className="font-mono">{metrics.loadTime}ms</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Render Time
            </div>
            <span className="font-mono">{metrics.renderTime}ms</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Memory
            </div>
            <span className="font-mono">{metrics.memoryUsage}MB</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Bundle Size
            </div>
            <span className="font-mono">{metrics.bundleSize}KB</span>
          </div>
          
          <div className="pt-2 text-xs text-gray-400">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
