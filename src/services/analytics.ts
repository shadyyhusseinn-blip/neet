// Google Analytics Integration Service

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface AnalyticsPageView {
  page: string;
  title: string;
  location?: string;
}

export interface AnalyticsUser {
  userId?: string;
  clientId: string;
  sessionId: string;
  firstVisit: number;
  lastVisit: number;
  visitCount: number;
}

export class AnalyticsService {
  private static trackingId: string;
  private static initialized: boolean = false;
  private static user: AnalyticsUser;

  // Initialize Google Analytics
  static initialize(trackingId: string): void {
    this.trackingId = trackingId;

    if (typeof window === 'undefined') return;

    // Load Google Analytics script
    this.loadGAScript();

    // Initialize user
    this.initializeUser();

    this.initialized = true;
  }

  // Load Google Analytics script
  private static loadGAScript(): void {
    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    // Configure GA
    window.gtag('js', new Date());
    window.gtag('config', this.trackingId);
  }

  // Initialize user
  private static initializeUser(): void {
    const clientId = this.getClientId();
    const sessionId = this.getSessionId();
    const storedUser = localStorage.getItem('analytics_user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.user.sessionId = sessionId;
      this.user.lastVisit = Date.now();
      this.user.visitCount++;
    } else {
      this.user = {
        clientId,
        sessionId,
        firstVisit: Date.now(),
        lastVisit: Date.now(),
        visitCount: 1,
      };
    }

    localStorage.setItem('analytics_user', JSON.stringify(this.user));

    // Set user ID in GA
    if (this.user.userId) {
      window.gtag('config', this.trackingId, {
        user_id: this.user.userId,
      });
    }
  }

  // Get client ID
  private static getClientId(): string {
    let clientId = localStorage.getItem('ga_client_id');
    if (!clientId) {
      clientId = this.generateClientId();
      localStorage.setItem('ga_client_id', clientId);
    }
    return clientId;
  }

  // Get session ID
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('ga_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('ga_session_id', sessionId);
    }
    return sessionId;
  }

  // Generate client ID
  private static generateClientId(): string {
    return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate session ID
  private static generateSessionId(): string {
    return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track page view
  static trackPageView(page: AnalyticsPageView): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('event', 'page_view', {
      page_title: page.title,
      page_location: page.location || window.location.href,
      page_path: page.page,
    });
  }

  // Track event
  static trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }

  // Track custom event
  static trackCustomEvent(eventName: string, parameters: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('event', eventName, parameters);
  }

  // Set user ID
  static setUserId(userId: string): void {
    if (!this.initialized || typeof window === 'undefined') return;

    this.user.userId = userId;
    localStorage.setItem('analytics_user', JSON.stringify(this.user));

    window.gtag('config', this.trackingId, {
      user_id: userId,
    });
  }

  // Set user properties
  static setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('set', 'user_properties', properties);
  }

  // Track conversion
  static trackConversion(conversionId: string, value: number): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('event', 'conversion', {
      send_to: `${this.trackingId}/${conversionId}`,
      value: value,
      currency: 'EGP',
    });
  }

  // Track booking
  static trackBooking(bookingId: string, value: number): void {
    this.trackEvent({
      category: 'Booking',
      action: 'create',
      label: bookingId,
      value: value,
    });
  }

  // Track payment
  static trackPayment(paymentId: string, value: number): void {
    this.trackEvent({
      category: 'Payment',
      action: 'complete',
      label: paymentId,
      value: value,
    });
  }

  // Track contact form submission
  static trackContactForm(): void {
    this.trackEvent({
      category: 'Contact',
      action: 'submit',
    });
  }

  // Track file download
  static trackDownload(fileName: string): void {
    this.trackEvent({
      category: 'Download',
      action: 'file',
      label: fileName,
    });
  }

  // Track search
  static trackSearch(query: string, resultsCount: number): void {
    this.trackEvent({
      category: 'Search',
      action: 'query',
      label: query,
      value: resultsCount,
    });
  }

  // Track error
  static trackError(error: string, fatal: boolean = false): void {
    this.trackCustomEvent('exception', {
      description: error,
      fatal: fatal,
    });
  }

  // Track timing
  static trackTiming(category: string, variable: string, value: number, label?: string): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('event', 'timing_complete', {
      name: variable,
      value: value,
      event_category: category,
      event_label: label,
    });
  }

  // Get analytics data (from GA API)
  static async getAnalyticsData(
    startDate: Date,
    endDate: Date,
    metrics: string[],
    dimensions: string[] = []
  ): Promise<any> {
    // In production, this would call the Google Analytics Reporting API
    // This requires server-side implementation with proper authentication

    console.log('Fetching analytics data:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metrics,
      dimensions,
    });

    return {};
  }

  // Get real-time data
  static async getRealTimeData(): Promise<{
    activeUsers: number;
    pageViews: number;
  }> {
    // In production, this would call the Google Analytics Realtime API
    return {
      activeUsers: 0,
      pageViews: 0,
    };
  }

  // Disable tracking
  static disableTracking(): void {
    if (typeof window === 'undefined') return;

    window.gtag('config', this.trackingId, {
      send_page_view: false,
    });

    localStorage.setItem('ga_disable_tracking', 'true');
  }

  // Enable tracking
  static enableTracking(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('ga_disable_tracking');

    window.gtag('config', this.trackingId, {
      send_page_view: true,
    });
  }

  // Check if tracking is disabled
  static isTrackingDisabled(): boolean {
    return localStorage.getItem('ga_disable_tracking') === 'true';
  }

  // Get user data
  static getUserData(): AnalyticsUser {
    return { ...this.user };
  }

  // Reset user data
  static resetUserData(): void {
    localStorage.removeItem('analytics_user');
    this.initializeUser();
  }

  // Track custom dimension
  static setCustomDimension(index: number, value: string): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('set', `dimension${index}`, value);
  }

  // Track custom metric
  static setCustomMetric(index: number, value: number): void {
    if (!this.initialized || typeof window === 'undefined') return;

    window.gtag('set', `metric${index}`, value);
  }

  // Track social interaction
  static trackSocial(network: string, action: string, target: string): void {
    this.trackEvent({
      category: 'Social',
      action: action,
      label: `${network} - ${target}`,
    });
  }

  // Track outbound link
  static trackOutboundLink(url: string): void {
    this.trackEvent({
      category: 'Outbound',
      action: 'click',
      label: url,
    });
  }

  // Track video play
  static trackVideoPlay(videoTitle: string, _videoUrl: string): void {
    this.trackEvent({
      category: 'Video',
      action: 'play',
      label: videoTitle,
    });
  }

  // Track video complete
  static trackVideoComplete(videoTitle: string, _videoUrl: string): void {
    this.trackEvent({
      category: 'Video',
      action: 'complete',
      label: videoTitle,
    });
  }

  // Track scroll depth
  static trackScrollDepth(depth: number): void {
    this.trackEvent({
      category: 'Scroll',
      action: 'depth',
      label: `${depth}%`,
    });
  }
}

export const analyticsService = AnalyticsService;
