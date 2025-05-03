import throttle from 'lodash/throttle';

interface BehaviorData {
  timestamp: number;
  eventType: string;
  data: any;
}

class BehaviorMonitor {
  private static instance: BehaviorMonitor;
  private behaviors: BehaviorData[] = [];
  private userId: string | null = null;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): BehaviorMonitor {
    if (!BehaviorMonitor.instance) {
      BehaviorMonitor.instance = new BehaviorMonitor();
    }
    return BehaviorMonitor.instance;
  }

  public setUserId(id: string) {
    this.userId = id;
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Mouse movement monitoring
    window.addEventListener('mousemove', throttle((e: MouseEvent) => {
      this.recordBehavior('mousemove', {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
    }, 100));

    // Click monitoring
    window.addEventListener('click', (e: MouseEvent) => {
      this.recordBehavior('click', {
        x: e.clientX,
        y: e.clientY,
        target: (e.target as HTMLElement).tagName,
        timestamp: Date.now()
      });
    });

    // Keyboard monitoring
    window.addEventListener('keypress', (e: KeyboardEvent) => {
      this.recordBehavior('keypress', {
        key: e.key,
        timestamp: Date.now()
      });
    });
  }

  private async recordBehavior(eventType: string, data: any) {
    if (!this.userId) return;

    this.behaviors.push({
      timestamp: Date.now(),
      eventType,
      data
    });

    // Send data to server every 10 events
    if (this.behaviors.length >= 10) {
      await this.sendToServer();
    }
  }

  private async sendToServer() {
    if (!this.behaviors.length) return;

    // Process behaviors to create a profile
    const keypresses = this.behaviors
      .filter(b => b.eventType === 'keypress')
      .map(b => b.data);
    
    const mousemoves = this.behaviors
      .filter(b => b.eventType === 'mousemove')
      .map(b => b.data);
    
    const clicks = this.behaviors
      .filter(b => b.eventType === 'click')
      .map(b => b.data);

    // Calculate metrics
    const typingSpeed = this.calculateTypingSpeed(keypresses);
    const mouseSpeed = this.calculateMouseSpeed(mousemoves);
    const clickFrequency = this.calculateClickFrequency(clicks);
    const focusTime = this.calculateFocusTime();

    const profile = {
      typingSpeed,
      mouseSpeed,
      clickFrequency,
      focusTime,
      typingRhythm: keypresses,
      mouseMovementPattern: mousemoves,
      clickPattern: clicks,
      mouseAcceleration: [], // Not implemented
      scrollPattern: [],     // Not implemented
      idleTime: 0,           // Not implemented
      sessionDuration: focusTime // Use focusTime as a proxy
    };

    const timestamp = Date.now();

    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          profile,
          timestamp
        }),
      });

      if (response.ok) {
        this.behaviors = [];
      }
    } catch (error) {
      console.error('Failed to send behavior data:', error);
    }
  }

  public async getCurrentProfile() {
    // Process behaviors to create a profile
    const keypresses = this.behaviors
      .filter(b => b.eventType === 'keypress')
      .map(b => b.data);
    
    const mousemoves = this.behaviors
      .filter(b => b.eventType === 'mousemove')
      .map(b => b.data);
    
    const clicks = this.behaviors
      .filter(b => b.eventType === 'click')
      .map(b => b.data);

    // Calculate metrics
    const typingSpeed = this.calculateTypingSpeed(keypresses);
    const mouseSpeed = this.calculateMouseSpeed(mousemoves);
    const clickFrequency = this.calculateClickFrequency(clicks);
    const focusTime = this.calculateFocusTime();

    return {
      typingSpeed,
      mouseSpeed,
      clickFrequency,
      focusTime,
      typingRhythm: keypresses,
      mouseMovementPattern: mousemoves,
      clickPattern: clicks,
      mouseAcceleration: [], // Not implemented
      scrollPattern: [],     // Not implemented
      idleTime: 0,           // Not implemented
      sessionDuration: focusTime // Use focusTime as a proxy
    };
  }

  private calculateTypingSpeed(keypresses: any[]): number {
    if (keypresses.length <= 1) return 0;
    
    const times = keypresses.map(k => k.timestamp).sort();
    const durationMin = (times[times.length - 1] - times[0]) / 60000;
    return durationMin > 0 ? Math.round(keypresses.length / durationMin) : keypresses.length;
  }

  private calculateMouseSpeed(mousemoves: any[]): number {
    if (mousemoves.length <= 1) return 0;
    
    const times = mousemoves.map(m => m.timestamp).sort();
    const durationSec = (times[times.length - 1] - times[0]) / 1000;
    return durationSec > 0 ? Math.round(mousemoves.length / durationSec) : mousemoves.length;
  }

  private calculateClickFrequency(clicks: any[]): number {
    if (clicks.length <= 1) return 0;
    
    const times = clicks.map(c => c.timestamp).sort();
    const durationMin = (times[times.length - 1] - times[0]) / 60000;
    return durationMin > 0 ? Math.round(clicks.length / durationMin) : clicks.length;
  }

  private calculateFocusTime(): number {
    if (this.behaviors.length <= 1) return 0;
    
    const allTimes = this.behaviors.map(b => b.timestamp).sort();
    return Math.round((allTimes[allTimes.length - 1] - allTimes[0]) / 1000); // in seconds
  }
}

export const behaviorMonitor = BehaviorMonitor.getInstance(); 