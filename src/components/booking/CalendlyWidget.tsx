import React, { useEffect, useRef } from 'react';

interface CalendlyWidgetProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  styles?: {
    height?: number;
    width?: string;
  };
  onEventScheduled?: (data: any) => void;
}

export default function CalendlyWidget({
  url,
  prefill,
  styles = { height: 700, width: '100%' },
  onEventScheduled,
}: CalendlyWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);

    // Listen for Calendly events
    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      document.head.removeChild(script);
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  const handleCalendlyEvent = (e: MessageEvent) => {
    if (e.data.event && e.data.event.indexOf('calendly') === 0) {
      if (e.data.event === 'calendly.event_scheduled') {
        onEventScheduled?.(e.data.payload);
      }
    }
  };

  useEffect(() => {
    if (window.Calendly && containerRef.current) {
      window.Calendly.initInlineWidget({
        url: url,
        parentElement: containerRef.current,
        prefill: prefill,
        utm: {},
      });
    }
  }, [url, prefill]);

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget"
      style={{
        minWidth: '320px',
        height: `${styles.height}px`,
      }}
      data-url={url}
    />
  );
}

// Extend window interface
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}
