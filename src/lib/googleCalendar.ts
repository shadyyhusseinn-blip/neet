/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Google Calendar Integration
// Note: This requires Google Cloud Console setup and OAuth credentials

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
}

export class GoogleCalendarService {
  private apiKey: string;
  private calendarId: string;

  constructor(apiKey: string, calendarId: string = 'primary') {
    this.apiKey = apiKey;
    this.calendarId = calendarId;
  }

  /**
   * Create a new event in Google Calendar
   * Note: This requires proper OAuth setup in production
   * 
   * To enable this feature:
   * 1. Create a project in Google Cloud Console
   * 2. Enable Google Calendar API
   * 3. Create OAuth 2.0 credentials
   * 4. Add the OAuth flow to your app
   * 5. Pass the access token to this method
   */
  async createEvent(event: CalendarEvent, accessToken?: string): Promise<any> {
    try {
      console.log('Creating calendar event:', event);
      
      // For production use with OAuth:
      if (accessToken) {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );
        
        if (!response.ok) {
          throw new Error(`Google Calendar API error: ${response.statusText}`);
        }
        
        return await response.json();
      }
      
      // Placeholder for development without OAuth
      console.warn('⚠️ Google Calendar integration requires OAuth access token');
      return { 
        success: false, 
        message: 'OAuth access token required for Google Calendar API',
        calendarLink: this.generateCalendarLink(event)
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Generate a Google Calendar link for users to add event manually
   */
  generateCalendarLink(event: CalendarEvent): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.summary,
      dates: `${event.start.dateTime.replace(/[-:]/g, '')}/${event.end.dateTime.replace(/[-:]/g, '')}`,
      details: event.description || '',
    });

    return `${baseUrl}?${params.toString()}`;
  }
}

// Export singleton instance
export const googleCalendar = new GoogleCalendarService(
  process.env.VITE_GOOGLE_CALENDAR_API_KEY || '',
  process.env.VITE_GOOGLE_CALENDAR_ID || 'primary'
);
