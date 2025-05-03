"use client"

import { useEffect } from "react"
import { BehaviorLogger } from "@/lib/behavior-logger"

export default function ContinuousBehaviorMonitor() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;
    // Get userId from localStorage (or replace with your auth context)
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    // Attach to body or main app element
    const element = document.body;
    const logger = BehaviorLogger.getInstance(userId, element);
    logger.startLogging();
    return () => logger.stopLogging();
  }, []);
  return null;
} 