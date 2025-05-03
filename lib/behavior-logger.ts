import { 
  trackMouseMovements, 
  trackKeyPresses, 
  trackClickEvents, 
  trackSignificantEvents,
  generateEnhancedBehavioralProfile,
  SignificantEvent,
  EnhancedBehavioralProfile
} from './behavior-tracker';

export class BehaviorLogger {
  private static instance: BehaviorLogger;
  private userId: string;
  private element: HTMLElement;
  private intervalId: NodeJS.Timeout | null = null;
  private lastLogTime: number = 0;
  private significantEvents: SignificantEvent[] = [];
  private isLogging: boolean = false;
  private isProcessing: boolean = false;
  private lastProfile: EnhancedBehavioralProfile | null = null;
  private historicalProfiles: EnhancedBehavioralProfile[] = [];

  private constructor(userId: string, element: HTMLElement) {
    this.userId = userId;
    this.element = element;
  }

  public static getInstance(userId: string, element: HTMLElement): BehaviorLogger {
    if (!BehaviorLogger.instance) {
      BehaviorLogger.instance = new BehaviorLogger(userId, element);
    }
    return BehaviorLogger.instance;
  }

  public async startLogging() {
    if (this.isLogging) return;
    this.isLogging = true;

    // Start tracking significant events
    const cleanup = await trackSignificantEvents(this.element);
    
    // Set up 30-second interval for periodic logging (increased frequency)
    this.intervalId = setInterval(async () => {
      await this.logBehavior();
    }, 30000);

    // Initial log
    await this.logBehavior();
  }

  public stopLogging() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isLogging = false;
  }

  public addSignificantEvent(event: SignificantEvent) {
    this.significantEvents.push(event);
    // Trigger immediate logging for significant events
    this.logBehavior();
  }

  private async logBehavior() {
    // Prevent concurrent processing
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = Date.now();
      
      // Only log if 30 seconds have passed or if there are significant events
      if (now - this.lastLogTime < 30000 && this.significantEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Collect behavioral data with increased precision
      const [mouseMovements, keyPresses, clickEvents] = await Promise.all([
        trackMouseMovements(this.element, 2000), // Increased tracking duration
        trackKeyPresses(this.element, 2000),
        trackClickEvents(this.element, 2000)
      ]);

      // Generate enhanced behavioral profile
      const profile = generateEnhancedBehavioralProfile(keyPresses, mouseMovements, clickEvents);

      // Store profile for anomaly detection
      this.lastProfile = profile;
      this.historicalProfiles.push(profile);
      
      // Keep only last 100 profiles for historical comparison
      if (this.historicalProfiles.length > 100) {
        this.historicalProfiles.shift();
      }

      // Prepare data for API
      const userIdInt = parseInt(this.userId, 10);
      if (isNaN(userIdInt)) {
        console.error('BehaviorLogger: userId is not a valid integer:', this.userId);
        this.isProcessing = false;
        return;
      }
      const profileData: any = {
        typingSpeed: profile.typingSpeed || 0,
        typingRhythm: profile.typingRhythm || [],
        mouseMovementPattern: profile.mouseMovementPattern || [],
        clickPattern: profile.clickPattern || [],
        mouseSpeed: profile.mouseSpeed || 0,
        clickFrequency: profile.clickFrequency || 0,
        idleTime: profile.idleTime || 0,
        sessionDuration: profile.sessionDuration || 0,
        focusTime: profile.focusTime || 0,
        dataCollectionType: this.significantEvents.length > 0 ? 'activity' : 'periodic'
      };
      const data = {
        userId: userIdInt,
        profile: profileData,
        significantEvents: this.significantEvents || [],
        timestamp: now
      };

      // Validate required fields
      if (!data.userId || !data.profile || !data.timestamp) {
        console.error('Missing required fields:', data);
        return;
      }

      // Validate profile structure
      if (
        typeof data.profile.typingSpeed !== 'number' ||
        typeof data.profile.mouseSpeed !== 'number' ||
        typeof data.profile.clickFrequency !== 'number' ||
        typeof data.profile.focusTime !== 'number'
      ) {
        console.error('Invalid profile structure:', data.profile);
        return;
      }

      // Send to API
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to log behavior:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return;
      }

      // Reset tracking
      this.lastLogTime = now;
      this.significantEvents = [];

    } catch (error) {
      console.error('Error logging behavior:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  public getLastProfile(): EnhancedBehavioralProfile | null {
    return this.lastProfile;
  }

  public getHistoricalProfiles(): EnhancedBehavioralProfile[] {
    return [...this.historicalProfiles];
  }
} 