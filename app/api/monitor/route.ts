import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initializeDatabase } from '@/lib/init-db';

interface HistoricalProfile {
  typing_speed: number;
  mouse_speed: number;
  click_frequency: number;
  focus_time: number;
  mouse_acceleration: string;
  scroll_pattern: string;
}

interface CurrentProfile {
  typingSpeed: number;
  mouseSpeed: number;
  clickFrequency: number;
  focusTime: number;
  mouseAcceleration: number[];
  scrollPattern: number[];
}

export async function POST(request: Request) {
  try {
    console.log('Received request to /api/monitor');
    
    // Initialize database if needed
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database');
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }
    
    const data = await request.json();
    console.log('Parsed request data:', JSON.stringify(data, null, 2));
    
    const { userId, profile, significantEvents, timestamp } = data;

    // Validate required fields
    if (!userId || !profile || !timestamp) {
      console.error('Missing required fields:', { userId, profile, timestamp });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate profile structure
    if (
      profile.typingSpeed === undefined || profile.typingSpeed === null ||
      profile.mouseSpeed === undefined || profile.mouseSpeed === null ||
      profile.clickFrequency === undefined || profile.clickFrequency === null ||
      profile.focusTime === undefined || profile.focusTime === null
    ) {
      console.error('Invalid profile structure:', profile);
      return NextResponse.json(
        { error: 'Invalid profile structure' },
        { status: 400 }
      );
    }

    // Store behavioral profile
    try {
      await query(`
        INSERT INTO behavioral_profiles (
          user_id,
          typing_speed,
          typing_rhythm,
          mouse_movement_pattern,
          click_pattern,
          mouse_speed,
          click_frequency,
          idle_time,
          session_duration,
          focus_time,
          data_collection_type,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        profile.typingSpeed,
        JSON.stringify(profile.typingRhythm || []),
        JSON.stringify(profile.mouseMovementPattern || []),
        JSON.stringify(profile.clickPattern || []),
        profile.mouseSpeed,
        profile.clickFrequency,
        profile.idleTime || 0,
        profile.sessionDuration || 0,
        profile.focusTime,
        profile.dataCollectionType || 'periodic',
        new Date(timestamp).toISOString(),
        new Date(timestamp).toISOString()
      ]);
      console.log('Successfully stored behavioral profile');
    } catch (dbError) {
      console.error('Database error while storing profile:', dbError);
      return NextResponse.json(
        { error: 'Failed to store behavioral profile', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    // Store significant events if any
    if (significantEvents && significantEvents.length > 0) {
      try {
        for (const event of significantEvents) {
          await query(`
            INSERT INTO significant_events (
              user_id,
              event_type,
              element_id,
              details,
              timestamp
            ) VALUES (?, ?, ?, ?, ?)
          `, [
            userId,
            event.type,
            event.elementId || null,
            JSON.stringify(event.details || {}),
            new Date(event.timestamp).toISOString()
          ]);
        }
        console.log('Successfully stored significant events');
      } catch (dbError) {
        console.error('Database error while storing events:', dbError);
        // Continue execution even if events fail to store
      }
    }

    // Check for anomalies using historical data
    try {
      console.log('Fetching historical profiles for user:', userId);
      const historicalProfiles = await query(`
        SELECT * FROM behavioral_profiles 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 100
      `, [userId]) as HistoricalProfile[];

      console.log('Found historical profiles:', historicalProfiles.length);
      
      // Create current profile
      const currentProfile: CurrentProfile = {
        typingSpeed: profile.typingSpeed,
        mouseSpeed: profile.mouseSpeed,
        clickFrequency: profile.clickFrequency,
        focusTime: profile.focusTime,
        mouseAcceleration: profile.mouseAcceleration || [],
        scrollPattern: profile.scrollPattern || []
      };

      let isAnomaly = false;
      let totalZScore = 0;
      let anomalies = [];
      let anomalyCount = 0; // Count how many metrics are anomalous

      if (historicalProfiles.length > 0) {
        console.log('Processing historical data for anomaly detection');
        const historicalData = historicalProfiles.map((p: HistoricalProfile) => ({
          typingSpeed: p.typing_speed,
          mouseSpeed: p.mouse_speed,
          clickFrequency: p.click_frequency,
          focusTime: p.focus_time,
        }));

        // Calculate z-scores for each metric
        const metrics = ['typingSpeed', 'mouseSpeed', 'clickFrequency', 'focusTime'] as const;

        for (const metric of metrics) {
          const values = historicalData.map(p => p[metric]);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const stdDev = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
          );
          const zScore = Math.abs((currentProfile[metric] - mean) / stdDev);
          totalZScore += zScore;

          // Lowered threshold for higher sensitivity
          if (zScore > 1.0) {
            anomalyCount++;
            anomalies.push({
              metric,
              zScore,
              currentValue: currentProfile[metric],
              mean,
              stdDev
            });
          }
        }
        // If 2 or more metrics are anomalous, always flag as anomaly
        if (anomalyCount >= 2) {
          isAnomaly = true;
        }
      } else {
        console.log('No historical data found, logging first-time behavior');
      }

      // Always log to anomalies table, even for first-time users
      console.log('Inserting anomaly log with:', {
        userId,
        timestamp: new Date(timestamp).toISOString(),
        isAnomaly,
        confidenceScore: historicalProfiles.length > 0 ? Math.min((totalZScore / 4) * 20, 100) : 0,
        details: historicalProfiles.length > 0 
          ? (anomalies.length > 0 ? JSON.stringify(anomalies) : "No significant anomalies detected")
          : "First-time user behavior logged"
      });

      await query(`
        INSERT INTO anomalies (
          user_id,
          timestamp,
          is_anomaly,
          confidence_score,
          details
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        userId,
        new Date(timestamp).toISOString(),
        isAnomaly ? 1 : 0,
        historicalProfiles.length > 0 ? Math.min((totalZScore / 4) * 20, 100) : 0,
        historicalProfiles.length > 0 
          ? (anomalies.length > 0 ? JSON.stringify(anomalies) : "No significant anomalies detected")
          : "First-time user behavior logged"
      ]);
      console.log('Anomaly log inserted successfully');
    } catch (anomalyError) {
      console.error('Error processing anomalies:', anomalyError);
      // Continue execution even if anomaly detection fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing behavior data:', error);
    return NextResponse.json(
      { error: 'Failed to process behavior data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 