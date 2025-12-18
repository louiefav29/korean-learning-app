// Calendar Module - Handles study planning, scheduling, and progress tracking
class CalendarManager {
  constructor() {
    this.STORAGE_KEYS = {
      studySessions: "studySessions",
      dailyGoals: "dailyGoals",
      studyStreaks: "studyStreaks",
      monthlyStats: "monthlyStats",
      milestones: "learningMilestones",
      reminders: "studyReminders",
      timeTracking: "timeTracking",
    };

    this.studySessions = this.loadStudySessions();
    this.dailyGoals = this.loadDailyGoals();
    this.studyStreaks = this.loadStudyStreaks();
    this.monthlyStats = this.loadMonthlyStats();
    this.milestones = this.loadMilestones();
    this.reminders = this.loadReminders();
    this.timeTracking = this.loadTimeTracking();
  }

  // Storage helpers
  loadJson(key, fallback = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      if (window.logger) {
        window.logger.error(`Error loading ${key}:`, error);
      }
      return fallback;
    }
  }

  saveJson(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      if (window.logger) {
        window.logger.error(`Error saving ${key}:`, error);
      }
      return false;
    }
  }

  // Study Sessions Management
  loadStudySessions() {
    return this.loadJson(this.STORAGE_KEYS.studySessions, {});
  }

  saveStudySession(date, sessionData) {
    if (!this.studySessions[date]) {
      this.studySessions[date] = [];
    }
    this.studySessions[date].push({
      ...sessionData,
      timestamp: Date.now(),
    });
    return this.saveJson(this.STORAGE_KEYS.studySessions, this.studySessions);
  }

  getStudySessions(date) {
    return this.studySessions[date] || [];
  }

  getStudySessionsInMonth(year, month) {
    const sessions = {};
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    Object.keys(this.studySessions).forEach((date) => {
      if (date >= startDate && date <= endDate) {
        sessions[date] = this.studySessions[date];
      }
    });
    return sessions;
  }

  // Daily Goals Management
  loadDailyGoals() {
    return this.loadJson(this.STORAGE_KEYS.dailyGoals, {});
  }

  setDailyGoal(date, goal) {
    this.dailyGoals[date] = {
      cardsToStudy: goal.cardsToStudy || 20,
      timeToStudy: goal.timeToStudy || 30, // minutes
      accuracyTarget: goal.accuracyTarget || 80,
      ...goal,
      createdAt: Date.now(),
    };
    return this.saveJson(this.STORAGE_KEYS.dailyGoals, this.dailyGoals);
  }

  getDailyGoal(date) {
    return this.dailyGoals[date] || this.getDefaultDailyGoal();
  }

  getDefaultDailyGoal() {
    return {
      cardsToStudy: 20,
      timeToStudy: 30,
      accuracyTarget: 80,
    };
  }

  markDailyGoalCompleted(date, completionData) {
    const goal = this.getDailyGoal(date);
    goal.completed = true;
    goal.completedAt = Date.now();
    goal.completionData = completionData;
    return this.saveJson(this.STORAGE_KEYS.dailyGoals, this.dailyGoals);
  }

  // Study Streaks Tracking
  loadStudyStreaks() {
    return this.loadJson(this.STORAGE_KEYS.studyStreaks, {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      streakHistory: [],
    });
  }

  updateStudyStreak(date) {
    const today = new Date(date);
    const lastStudyDate = this.studyStreaks.lastStudyDate
      ? new Date(this.studyStreaks.lastStudyDate)
      : null;

    if (!lastStudyDate) {
      // First study session
      this.studyStreaks.currentStreak = 1;
      this.studyStreaks.longestStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (today - lastStudyDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        this.studyStreaks.currentStreak++;
        this.studyStreaks.longestStreak = Math.max(
          this.studyStreaks.longestStreak,
          this.studyStreaks.currentStreak
        );
      } else if (daysDiff > 1) {
        // Streak broken
        if (this.studyStreaks.currentStreak > 0) {
          this.studyStreaks.streakHistory.push({
            startDate: this.getStreakStartDate(
              lastStudyDate,
              this.studyStreaks.currentStreak
            ),
            endDate: this.studyStreaks.lastStudyDate,
            length: this.studyStreaks.currentStreak,
          });
        }
        this.studyStreaks.currentStreak = 1;
      }
      // If daysDiff === 0, studying same day, don't change streak
    }

    this.studyStreaks.lastStudyDate = date;
    return this.saveJson(this.STORAGE_KEYS.studyStreaks, this.studyStreaks);
  }

  getStreakStartDate(lastDate, streakLength) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() - streakLength + 1);
    return date.toISOString().split("T")[0];
  }

  getCurrentStreak() {
    return this.studyStreaks.currentStreak;
  }

  getLongestStreak() {
    return this.studyStreaks.longestStreak;
  }

  // Monthly Statistics
  loadMonthlyStats() {
    return this.loadJson(this.STORAGE_KEYS.monthlyStats, {});
  }

  updateMonthlyStats(year, month, sessionData) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    if (!this.monthlyStats[monthKey]) {
      this.monthlyStats[monthKey] = {
        totalSessions: 0,
        totalTimeStudied: 0,
        totalCardsStudied: 0,
        averageAccuracy: 0,
        goalsCompleted: 0,
        daysStudied: new Set(),
        dailyData: {},
      };
    }

    const stats = this.monthlyStats[monthKey];
    stats.totalSessions++;
    stats.totalTimeStudied += sessionData.timeSpent || 0;
    stats.totalCardsStudied += sessionData.cardsStudied || 0;
    stats.daysStudied.add(sessionData.date);

    // Update daily data
    if (!stats.dailyData[sessionData.date]) {
      stats.dailyData[sessionData.date] = {
        sessions: 0,
        timeSpent: 0,
        cardsStudied: 0,
        accuracy: 0,
      };
    }
    stats.dailyData[sessionData.date].sessions++;
    stats.dailyData[sessionData.date].timeSpent += sessionData.timeSpent || 0;
    stats.dailyData[sessionData.date].cardsStudied +=
      sessionData.cardsStudied || 0;
    stats.dailyData[sessionData.date].accuracy = sessionData.accuracy || 0;

    // Calculate average accuracy
    const totalAccuracy = Object.values(stats.dailyData).reduce(
      (sum, day) => sum + day.accuracy,
      0
    );
    stats.averageAccuracy = totalAccuracy / Object.keys(stats.dailyData).length;

    return this.saveJson(this.STORAGE_KEYS.monthlyStats, this.monthlyStats);
  }

  getMonthlyStats(year, month) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const stats = this.monthlyStats[monthKey];

    if (!stats) return null;

    return {
      ...stats,
      daysStudied: stats.daysStudied.size,
      monthKey,
      year,
      month,
    };
  }

  // Performance Heatmap Data
  getHeatmapData(year, month) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const stats = this.monthlyStats[monthKey];
    const heatmapData = {};

    // Get all days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayData = stats?.dailyData[date] || {
        sessions: 0,
        timeSpent: 0,
        cardsStudied: 0,
      };

      heatmapData[date] = {
        intensity: this.calculateIntensity(dayData),
        sessions: dayData.sessions,
        timeSpent: dayData.timeSpent,
        cardsStudied: dayData.cardsStudied,
        hasGoal: !!this.dailyGoals[date],
        goalCompleted: this.dailyGoals[date]?.completed || false,
      };
    }

    return heatmapData;
  }

  calculateIntensity(dayData) {
    if (dayData.sessions === 0) return 0;

    // Calculate intensity based on time spent (0-4 scale)
    const timeSpent = dayData.timeSpent || 0;
    if (timeSpent < 10) return 1;
    if (timeSpent < 20) return 2;
    if (timeSpent < 30) return 3;
    return 4;
  }

  // Learning Milestones
  loadMilestones() {
    return this.loadJson(this.STORAGE_KEYS.milestones, []);
  }

  addMilestone(milestone) {
    const newMilestone = {
      id: Date.now(),
      title: milestone.title,
      description: milestone.description,
      target: milestone.target,
      current: milestone.current || 0,
      category: milestone.category, // 'cards', 'streak', 'time', 'accuracy'
      unit: milestone.unit,
      achieved: false,
      achievedAt: null,
      createdAt: Date.now(),
      ...milestone,
    };

    this.milestones.push(newMilestone);
    this.saveJson(this.STORAGE_KEYS.milestones, this.milestones);
    return newMilestone;
  }

  updateMilestoneProgress(milestoneId, progress) {
    const milestone = this.milestones.find((m) => m.id === milestoneId);
    if (milestone) {
      milestone.current = progress;
      if (progress >= milestone.target && !milestone.achieved) {
        milestone.achieved = true;
        milestone.achievedAt = Date.now();
      }
      this.saveJson(this.STORAGE_KEYS.milestones, this.milestones);
    }
    return milestone;
  }

  getMilestones() {
    return this.milestones;
  }

  getAchievedMilestones() {
    return this.milestones.filter((m) => m.achieved);
  }

  // Reminders
  loadReminders() {
    return this.loadJson(this.STORAGE_KEYS.reminders, []);
  }

  addReminder(reminder) {
    const newReminder = {
      id: Date.now(),
      title: reminder.title,
      time: reminder.time, // HH:MM format
      days: reminder.days, // [0,1,2,3,4,5,6] where 0 = Sunday
      enabled: reminder.enabled !== false,
      type: reminder.type || "study", // 'study', 'review', 'goal'
      createdAt: Date.now(),
      ...reminder,
    };

    this.reminders.push(newReminder);
    this.saveJson(this.STORAGE_KEYS.reminders, this.reminders);
    return newReminder;
  }

  getActiveReminders() {
    return this.reminders.filter((r) => r.enabled);
  }

  // Time Management
  loadTimeTracking() {
    return this.loadJson(this.STORAGE_KEYS.timeTracking, {});
  }

  startTimeTracking(sessionId) {
    this.timeTracking[sessionId] = {
      startTime: Date.now(),
      endTime: null,
      duration: null,
      paused: false,
      pausedTime: 0,
    };
    return this.saveJson(this.STORAGE_KEYS.timeTracking, this.timeTracking);
  }

  stopTimeTracking(sessionId) {
    const tracking = this.timeTracking[sessionId];
    if (tracking) {
      tracking.endTime = Date.now();
      tracking.duration =
        tracking.endTime - tracking.startTime - tracking.pausedTime;
      return this.saveJson(this.STORAGE_KEYS.timeTracking, this.timeTracking);
    }
    return null;
  }

  pauseTimeTracking(sessionId) {
    const tracking = this.timeTracking[sessionId];
    if (tracking && !tracking.paused) {
      tracking.paused = true;
      tracking.pausedAt = Date.now();
      return this.saveJson(this.STORAGE_KEYS.timeTracking, this.timeTracking);
    }
    return null;
  }

  resumeTimeTracking(sessionId) {
    const tracking = this.timeTracking[sessionId];
    if (tracking && tracking.paused) {
      tracking.paused = false;
      tracking.pausedTime += Date.now() - tracking.pausedAt;
      return this.saveJson(this.STORAGE_KEYS.timeTracking, this.timeTracking);
    }
    return null;
  }

  // Utility Methods
  getTodayKey() {
    return new Date().toISOString().split("T")[0];
  }

  getCurrentMonth() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  }

  getStudyDaysInMonth(year, month) {
    const sessions = this.getStudySessionsInMonth(year, month);
    return Object.keys(sessions).length;
  }

  getTotalStudyTimeInMonth(year, month) {
    const sessions = this.getStudySessionsInMonth(year, month);
    let totalTime = 0;

    Object.values(sessions).forEach((daySessions) => {
      daySessions.forEach((session) => {
        totalTime += session.timeSpent || 0;
      });
    });

    return totalTime;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CalendarManager;
} else {
  window.CalendarManager = CalendarManager;
}
