import React, { useEffect } from 'react';

interface GoogleAnalyticsProps {
  trackingId: string;
}

export default function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [trackingId]);

  return null;
}

// Custom hook for tracking events
export function useGoogleAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID, {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  };

  const trackBooking = (bookingDetails: any) => {
    trackEvent('booking_completed', {
      value: bookingDetails.price,
      currency: 'SAR',
      package: bookingDetails.package,
    });
  };

  const trackGalleryView = (galleryId: string, galleryName: string) => {
    trackEvent('gallery_view', {
      gallery_id: galleryId,
      gallery_name: galleryName,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackBooking,
    trackGalleryView,
  };
}

// Extend window interface
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
