// Supabase Database Operations for Korean Learning App
class SupabaseDatabase {
  constructor() {
    this.supabase = window.supabaseClient;
  }

  // User Profile Operations
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await this.supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          display_name:
            profileData.displayName || profileData.email?.split("@")[0],
          study_streak: 0,
          total_cards_studied: 0,
          study_time_minutes: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Flashcard Operations
  async getFlashcards(category = "all") {
    try {
      let query = this.supabase
        .from("flashcards")
        .select("*")
        .eq("is_active", true);

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("created_at", {
        ascending: true,
      });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addFlashcard(cardData) {
    try {
      const { data, error } = await this.supabase
        .from("flashcards")
        .insert({
          korean_text: cardData.korean,
          english_text: cardData.english,
          romanization: cardData.romanization,
          category: cardData.category || "general",
          difficulty: cardData.difficulty || "beginner",
          audio_url_korean: cardData.audioKorean || null,
          audio_url_english: cardData.audioEnglish || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // User Progress Operations
  async getUserProgress(userId) {
    try {
      const { data, error } = await this.supabase
        .from("user_progress")
        .select(
          `
          *,
          flashcards:korean_text,
          flashcards:english_text
        `
        )
        .eq("user_id", userId)
        .order("last_studied", { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateCardProgress(userId, flashcardId, progressData) {
    try {
      const { data, error } = await this.supabase
        .from("user_progress")
        .upsert({
          user_id: userId,
          flashcard_id: flashcardId,
          times_reviewed: progressData.timesReviewed || 1,
          correct_answers: progressData.correctAnswers || 0,
          difficulty_rating: progressData.difficultyRating,
          last_studied: new Date().toISOString(),
          next_review: this.calculateNextReview(progressData.difficultyRating),
          mastery_level: progressData.masteryLevel || 0,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Study Session Operations
  async startStudySession(userId) {
    try {
      const { data, error } = await this.supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          start_time: new Date().toISOString(),
          cards_studied: 0,
          correct_answers: 0,
          session_duration_minutes: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async endStudySession(sessionId, sessionData) {
    try {
      const endTime = new Date().toISOString();
      const { data, error } = await this.supabase
        .from("study_sessions")
        .update({
          end_time: endTime,
          cards_studied: sessionData.cardsStudied || 0,
          correct_answers: sessionData.correctAnswers || 0,
          session_duration_minutes: sessionData.duration || 0,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Analytics Operations
  async getUserStats(userId) {
    try {
      const { data: profile } = await this.getUserProfile(userId);
      const { data: progress } = await this.getUserProgress(userId);
      const { data: sessions } = await this.supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte(
          "start_time",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      const stats = {
        profile: profile,
        totalCardsStudied: progress?.length || 0,
        averageAccuracy: this.calculateAccuracy(progress),
        studyStreak: profile?.study_streak || 0,
        totalStudyTime: profile?.study_time_minutes || 0,
        recentSessions: sessions || [],
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper Methods
  calculateNextReview(difficultyRating) {
    const now = new Date();
    let hoursToAdd = 24; // Default: 1 day

    switch (difficultyRating) {
      case "easy":
        hoursToAdd = 72; // 3 days
        break;
      case "medium":
        hoursToAdd = 48; // 2 days
        break;
      case "hard":
        hoursToAdd = 12; // 12 hours
        break;
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();
  }

  calculateAccuracy(progress) {
    if (!progress || progress.length === 0) return 0;

    const totalCorrect = progress.reduce(
      (sum, p) => sum + (p.correct_answers || 0),
      0
    );
    const totalAttempts = progress.reduce(
      (sum, p) => sum + (p.times_reviewed || 0),
      0
    );

    return totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 100)
      : 0;
  }

  // Initialize default flashcards if none exist
  async initializeDefaultFlashcards() {
    try {
      const { data: existingCards } = await this.getFlashcards();

      if (existingCards.length === 0) {
        const defaultCards = [
          {
            korean: "안녕하세요",
            english: "Hello",
            romanization: "annyeonghaseyo",
            category: "greetings",
            difficulty: "beginner",
          },
          {
            korean: "감사합니다",
            english: "Thank you",
            romanization: "gamsahamnida",
            category: "greetings",
            difficulty: "beginner",
          },
          {
            korean: "사랑해",
            english: "I love you",
            romanization: "saranghae",
            category: "emotions",
            difficulty: "beginner",
          },
          {
            korean: "학교",
            english: "School",
            romanization: "hakgyo",
            category: "places",
            difficulty: "beginner",
          },
          {
            korean: "음식",
            english: "Food",
            romanization: "eumsik",
            category: "food",
            difficulty: "beginner",
          },
        ];

        for (const card of defaultCards) {
          await this.addFlashcard(card);
        }

        console.log("Default flashcards initialized");
      }
    } catch (error) {
      console.error("Error initializing default flashcards:", error);
    }
  }
}

// Create global database instance
const db = new SupabaseDatabase();
