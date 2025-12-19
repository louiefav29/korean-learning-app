const DAILY_DECK_SIZE = 20;
const STORAGE_KEYS = {
  date: "dailyDeckDate",
  deckIds: "dailyDeckIds",
  studiedIds: "dailyStudiedIds",
  statistics: "studyStatistics",
  cardPerformance: "cardPerformance",
  spacedRepetition: "spacedRepetitionCards",
};

// SM-2 Algorithm constants
const SM2_INTERVALS = {
  0: 1, // First review: 1 day
  1: 6, // Second review: 6 days
  2: 10, // Third review: 10 days
  3: 14, // Fourth review: 14 days
  4: 21, // Fifth review: 21 days
  5: 30, // Sixth review: 30 days
  6: 45, // Seventh review: 45 days
  7: 60, // Eighth review: 60 days
  8: 90, // Ninth review: 90 days
  9: 120, // Tenth review: 120 days
};

const DIFFICULTY_MULTIPLIER = {
  easy: 2.5, // Increase interval by 150%
  medium: 1.0, // Keep interval same
  hard: 0.5, // Decrease interval by 50%
};

const EASE_FACTOR_ADJUSTMENT = {
  easy: -0.2, // Decrease ease factor for faster progression
  medium: 0.0, // Keep ease factor same
  hard: 0.2, // Increase ease factor for slower progression
};

// State
let currentIndex = 0;
let isFlipped = false;
let dailyDeck = [];
let dailyDeckIds = [];
let studiedCardIds = new Set();
let studyStatistics = {
  currentStreak: 0,
  longestStreak: 0,
  totalCardsStudied: 0,
  studyDays: [],
  dailyStats: {},
  cardPerformance: {},
  totalStudyTime: 0,
};
let sessionStartTime = Date.now();
let sessionCardsStudied = 0;
let sessionCorrectAnswers = 0;
let spacedRepetitionCards = {}; // SM-2 card data

const AUTOPLAY_INTERVAL_MS = 10000;

const Autoplay = {
  timerId: null,
  koreanAudio: null,
  englishAudio: null,
  englishTimeout: null,

  start() {
    this.stop();
    this.playAudio();
    this.timerId = setInterval(() => {
      if (!document.hidden) {
        // Check if should stop autoplay before advancing
        if (studiedCardIds.size >= DAILY_DECK_SIZE) {
          this.stop();
          UI.playBtn.classList.add("paused");
          UI.playBtn.classList.remove("playing");
          UI.playBtn.querySelector("span").textContent = "Play";
          return;
        }
        DeckManager.next();
        this.playAudio();
      }
    }, AUTOPLAY_INTERVAL_MS);
  },

  stop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.stopAudio();
  },

  restart() {
    this.start();
  },

  playAudio() {
    const card = dailyDeck[currentIndex];
    if (!card) return;

    this.stopAudio();

    if (card.koreanAudio) {
      this.koreanAudio = new Audio(card.koreanAudio);

      this.koreanAudio.addEventListener("ended", () => {
        this.koreanAudio = null;
      });

      this.koreanAudio.play().catch((error) => {
        // ...existing code...
        this.koreanAudio = null;
      });

      this.englishTimeout = setTimeout(() => {
        if (card.englishAudio) {
          this.englishAudio = new Audio(card.englishAudio);

          this.englishAudio.addEventListener("ended", () => {
            this.englishAudio = null;
          });

          this.englishAudio.play().catch((error) => {
            // ...existing code...
            this.englishAudio = null;
          });
        }
      }, 1000);
    }
  },

  stopAudio() {
    // Stop Korean audio
    if (this.koreanAudio) {
      this.koreanAudio.pause();
      this.koreanAudio.currentTime = 0;
      this.koreanAudio = null;
    }

    // Stop English audio
    if (this.englishAudio) {
      this.englishAudio.pause();
      this.englishAudio.currentTime = 0;
      this.englishAudio = null;
    }

    // Clear English audio timeout
    if (this.englishTimeout) {
      clearTimeout(this.englishTimeout);
      this.englishTimeout = null;
    }
  },
};

function restartAutoplay() {
  if (Autoplay.timerId !== null) {
    Autoplay.start();
  }
}

function toggleAutoplay() {
  if (!UI.playBtn) return;

  if (Autoplay.timerId === null) {
    Autoplay.start();
    UI.playBtn.classList.add("playing");
    UI.playBtn.classList.remove("paused");
    UI.playBtn.querySelector("span").textContent = "Pause";
  } else {
    Autoplay.stop();
    UI.playBtn.classList.add("paused");
    UI.playBtn.classList.remove("playing");
    UI.playBtn.querySelector("span").textContent = "Play";
  }
}

const DeckManager = {
  getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  },

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  saveStudied() {
    localStorage.setItem(
      STORAGE_KEYS.studiedIds,
      JSON.stringify(Array.from(studiedCardIds))
    );
  },

  saveStatistics() {
    localStorage.setItem(
      STORAGE_KEYS.statistics,
      JSON.stringify(studyStatistics)
    );
  },

  loadStatistics() {
    const saved = this.loadJson(STORAGE_KEYS.statistics, {});
    studyStatistics = {
      currentStreak: saved.currentStreak || 0,
      longestStreak: saved.longestStreak || 0,
      totalCardsStudied: saved.totalCardsStudied || 0,
      studyDays: saved.studyDays || [],
      dailyStats: saved.dailyStats || {},
      cardPerformance: saved.cardPerformance || {},
      totalStudyTime: saved.totalStudyTime || 0,
    };
  },

  loadSpacedRepetition() {
    const saved = this.loadJson(STORAGE_KEYS.spacedRepetition, {});
    spacedRepetitionCards = saved;
  },

  saveSpacedRepetition() {
    localStorage.setItem(
      STORAGE_KEYS.spacedRepetition,
      JSON.stringify(spacedRepetitionCards)
    );
  },

  calculateNextReview(cardId, difficulty) {
    if (!spacedRepetitionCards[cardId]) {
      // New card
      spacedRepetitionCards[cardId] = {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: this.getTodayKey(),
        lastReview: null,
        streak: 0, // Track success streak for this card
        priority: "new", // Card priority classification
      };
    }

    const card = spacedRepetitionCards[cardId];

    // Update based on difficulty with enhanced algorithm
    card.repetitions++;
    card.lastReview = this.getTodayKey();

    if (difficulty === "easy") {
      card.easeFactor = Math.max(
        1.3,
        card.easeFactor + EASE_FACTOR_ADJUSTMENT.easy
      );
      card.interval = Math.round(card.interval * DIFFICULTY_MULTIPLIER.easy);
      card.streak++; // Increase success streak
      if (card.streak >= 3) {
        card.priority = "mastered";
      }
    } else if (difficulty === "hard") {
      card.easeFactor = Math.max(
        1.3,
        card.easeFactor + EASE_FACTOR_ADJUSTMENT.hard
      );
      card.interval = Math.max(
        1,
        Math.round(card.interval * DIFFICULTY_MULTIPLIER.hard)
      );
      card.streak = 0; // Reset success streak
      if (card.repetitions >= 3) {
        card.priority = "struggling";
      }
    } else {
      // Medium - use enhanced SM-2 progression
      card.easeFactor = Math.max(
        1.3,
        card.easeFactor + EASE_FACTOR_ADJUSTMENT.medium
      );
      if (card.repetitions <= 2) {
        card.interval = SM2_INTERVALS[card.repetitions];
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.streak++; // Medium still counts as success
    }

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);
    card.nextReview = nextDate.toISOString().slice(0, 10);

    // Adaptive difficulty adjustment based on overall performance
    this.adjustAdaptiveDifficulty();

    this.saveSpacedRepetition();
    return card;
  },

  adjustAdaptiveDifficulty() {
    // Analyze recent performance and adjust global difficulty
    const recentRatings = Object.values(spacedRepetitionCards)
      .filter((card) => card.lastReview)
      .slice(-20); // Last 20 cards

    if (recentRatings.length < 5) return; // Need sufficient data

    const easyCount = recentRatings.filter(
      (card) => card.priority === "mastered"
    ).length;
    const hardCount = recentRatings.filter(
      (card) => card.priority === "struggling"
    ).length;

    // If user is struggling, make intervals more conservative
    if (hardCount > easyCount) {
      // Slightly reduce future intervals to provide more practice
      Object.values(spacedRepetitionCards).forEach((card) => {
        if (card.interval > 7) {
          card.interval = Math.round(card.interval * 0.9);
        }
      });
    }
    // If user is doing well, allow more aggressive progression
    else if (easyCount > hardCount * 2) {
      // Slightly increase intervals for faster progression
      Object.values(spacedRepetitionCards).forEach((card) => {
        if (card.interval < 30) {
          card.interval = Math.round(card.interval * 1.1);
        }
      });
    }
  },

  isCardDue(cardId) {
    if (!spacedRepetitionCards[cardId]) {
      return true; // New cards are always due
    }

    const card = spacedRepetitionCards[cardId];
    const today = this.getTodayKey();
    return card.nextReview <= today;
  },

  getDueCards() {
    const byId = new Map(flashcardData.map((c) => [c.id, c]));
    return flashcardData
      .filter((card) => this.isCardDue(card.id))
      .map((card) => ({
        ...card,
        spacedData: spacedRepetitionCards[card.id],
      }));
  },

  updateDailyStreak() {
    const today = this.getTodayKey();
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    if (!studyStatistics.studyDays.includes(today)) {
      studyStatistics.studyDays.push(today);

      if (studyStatistics.studyDays.includes(yesterday)) {
        studyStatistics.currentStreak++;
      } else {
        studyStatistics.currentStreak = 1;
      }

      if (studyStatistics.currentStreak > studyStatistics.longestStreak) {
        studyStatistics.longestStreak = studyStatistics.currentStreak;
      }

      this.saveStatistics();
    }
  },

  recordCardStudy(cardId, isCorrect = true) {
    const today = this.getTodayKey();

    // Update daily stats
    if (!studyStatistics.dailyStats[today]) {
      studyStatistics.dailyStats[today] = {
        cardsStudied: 0,
        correctAnswers: 0,
        studyTime: 0,
        accuracy: 0,
      };
    }

    studyStatistics.dailyStats[today].cardsStudied++;
    if (isCorrect) {
      studyStatistics.dailyStats[today].correctAnswers++;
      sessionCorrectAnswers++;
    }

    studyStatistics.dailyStats[today].accuracy =
      (studyStatistics.dailyStats[today].correctAnswers /
        studyStatistics.dailyStats[today].cardsStudied) *
      100;

    // Update card performance
    if (!studyStatistics.cardPerformance[cardId]) {
      studyStatistics.cardPerformance[cardId] = {
        timesStudied: 0,
        correctAnswers: 0,
        lastStudied: null,
        accuracy: 0,
      };
    }

    studyStatistics.cardPerformance[cardId].timesStudied++;
    if (isCorrect) {
      studyStatistics.cardPerformance[cardId].correctAnswers++;
    }
    studyStatistics.cardPerformance[cardId].lastStudied = today;
    studyStatistics.cardPerformance[cardId].accuracy =
      (studyStatistics.cardPerformance[cardId].correctAnswers /
        studyStatistics.cardPerformance[cardId].timesStudied) *
      100;

    studyStatistics.totalCardsStudied++;
    sessionCardsStudied++;

    this.saveStatistics();
  },

  createNew(todayKey = this.getTodayKey()) {
    const ids = flashcardData.map((c) => c.id);
    this.shuffleArray(ids);
    dailyDeckIds = ids.slice(0, Math.min(DAILY_DECK_SIZE, ids.length));
    localStorage.setItem(STORAGE_KEYS.date, todayKey);
    localStorage.setItem(STORAGE_KEYS.deckIds, JSON.stringify(dailyDeckIds));
    studiedCardIds = new Set();
    this.saveStudied();
  },

  loadOrCreate() {
    const todayKey = this.getTodayKey();
    const savedDate = localStorage.getItem(STORAGE_KEYS.date);

    // Load statistics and spaced repetition data
    this.loadStatistics();
    this.loadSpacedRepetition();
    this.updateDailyStreak();

    // Get due cards for today
    const dueCards = this.getDueCards();

    if (dueCards.length === 0) {
      // No cards due, get some for review
      dailyDeck = flashcardData.slice(
        0,
        Math.min(DAILY_DECK_SIZE, flashcardData.length)
      );
    } else {
      // Use due cards, limit to daily deck size
      dailyDeck = dueCards.slice(0, Math.min(DAILY_DECK_SIZE, dueCards.length));
    }

    // Initialize studied cards for this session
    dailyDeckIds = dailyDeck.map((card) => card.id);
    studiedCardIds = new Set();

    currentIndex = 0;
    isFlipped = false;
    UI.flashcard.classList.remove("flipped");
    UI.flipBtn.textContent = "Show English";
  },

  next() {
    if (!dailyDeck.length) return;
    isFlipped = false;
    UI.flashcard.classList.remove("flipped");

    if (dailyDeck[currentIndex]) {
      // Only record as studied if card was actually viewed/rated
      if (studiedCardIds.has(dailyDeck[currentIndex].id)) {
        this.recordCardStudy(dailyDeck[currentIndex].id, true);
        this.saveStudied();
      }
    }

    currentIndex = (currentIndex + 1) % dailyDeck.length;
    updateCard();
    updateProgress();
    UI.flipBtn.textContent = "Show English";

    // Stop autoplay if all cards studied
    if (studiedCardIds.size >= DAILY_DECK_SIZE) {
      Autoplay.stop();
      UI.playBtn.classList.add("paused");
      UI.playBtn.classList.remove("playing");
      UI.playBtn.querySelector("span").textContent = "Play";
    }
  },

  prev() {
    if (!dailyDeck.length) return;
    isFlipped = false;
    UI.flashcard.classList.remove("flipped");

    currentIndex = (currentIndex - 1 + dailyDeck.length) % dailyDeck.length;
    updateCard();
    UI.flipBtn.textContent = "Show English";
    Autoplay.restart();
  },
};

// UI Elements
const UI = {
  flashcard: document.getElementById("flashcard"),
  koreanText: document.getElementById("korean-text"),
  englishText: document.getElementById("english-text"),
  romanizationBack: document.getElementById("romanization-back"),
  cardCounter: document.getElementById("card-counter"),
  progressFill: document.getElementById("progress-fill"),
  progressText: document.getElementById("progress-text"),
  flipBtn: document.getElementById("flip-btn"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  newDeckBtn: document.getElementById("new-deck-btn"),
  backToMenuBtn: document.getElementById("back-to-menu"),
  themeToggle: document.getElementById("theme-toggle"),
  playBtn: document.getElementById("play-btn"),
  koreanAudioBtn: document.getElementById("korean-audio-btn"),
  englishAudioBtn: document.getElementById("english-audio-btn"),
  statsBtn: document.getElementById("stats-btn"),
  statsModal: document.getElementById("stats-modal"),
  statsClose: document.getElementById("stats-close"),
  difficultySection: document.getElementById("difficulty-section"),
  easyBtn: document.getElementById("easy-btn"),
  mediumBtn: document.getElementById("medium-btn"),
  hardBtn: document.getElementById("hard-btn"),
  nextReview: document.getElementById("next-review"),
  nextReviewDate: document.getElementById("next-review-date"),
  calendarBtn: document.getElementById("calendar-btn"),
  calendarModal: document.getElementById("calendar-modal"),
  calendarClose: document.getElementById("calendar-close"),
  currentMonth: document.getElementById("current-month"),
  calendarGrid: document.getElementById("calendar-grid"),
  prevMonth: document.getElementById("prev-month"),
  nextMonth: document.getElementById("next-month"),
  analyticsBtn: document.getElementById("analytics-btn"),
  analyticsDropdown: document.getElementById("analytics-dropdown"),
};

// Calendar Functions
let currentCalendarDate = new Date();

function openCalendar() {
  updateCalendarDisplay();
  UI.calendarModal.style.display = "block";
}

function closeCalendar() {
  UI.calendarModal.style.display = "none";
}

function updateCalendarDisplay() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // Update month header
  UI.currentMonth.textContent = currentCalendarDate.toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  // Clear calendar grid
  UI.calendarGrid.innerHTML = "";

  // Add day headers
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day;
    UI.calendarGrid.appendChild(header);
  });

  // Get first day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();

  // Add empty cells for start padding
  for (let i = 0; i < startPadding; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    UI.calendarGrid.appendChild(emptyDay);
  }

  // Add days of the month
  const today = new Date();
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const dateKey = currentDate.toISOString().slice(0, 10);

    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.textContent = day;

    // Check if it's today
    if (currentDate.toDateString() === today.toDateString()) {
      dayElement.classList.add("today");
    }

    // Count cards due on this date
    const cardCount = getCardCountForDate(dateKey);
    if (cardCount > 0) {
      const countBadge = document.createElement("div");
      countBadge.className = "card-count";
      countBadge.textContent = cardCount;
      dayElement.appendChild(countBadge);

      // Color code based on load
      if (cardCount <= 5) {
        dayElement.classList.add("light");
      } else if (cardCount <= 15) {
        dayElement.classList.add("medium");
      } else {
        dayElement.classList.add("heavy");
      }
    }

    // Add click handler
    dayElement.addEventListener("click", () => showDayDetails(dateKey));

    UI.calendarGrid.appendChild(dayElement);
  }
}

function getCardCountForDate(dateKey) {
  return studyStatistics.dailyStats[dateKey]?.cardsStudied || 0;
}

function showDayDetails(dateKey) {
  const stats = studyStatistics.dailyStats[dateKey];
  if (!stats) {
    // ...existing code...
    return;
  }
  // ...existing code...
  // Example: display details in a modal or alert
  alert(
    `On ${dateKey}: ${stats.cardsStudied} cards studied, ${Math.round(
      stats.accuracy
    )}% accuracy, ${stats.studyTime || 0} min studied`
  );
}

function navigateMonth(direction) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
  updateCalendarDisplay();
}
function playKoreanAudio(event) {
  event.stopPropagation();
  const card = dailyDeck[currentIndex];
  if (card?.koreanAudio) {
    new Audio(card.koreanAudio).play();
  }
}

function playEnglishAudio(event) {
  event.stopPropagation();
  const card = dailyDeck[currentIndex];
  if (card?.englishAudio) {
    new Audio(card.englishAudio).play();
  }
}

// Functions
function updateCard() {
  if (!dailyDeck.length) return;

  const card = dailyDeck[currentIndex];
  UI.koreanText.textContent = card.korean;
  UI.englishText.textContent = card.english;
  UI.romanizationBack.textContent = card.romanization;
  UI.cardCounter.textContent = `Card ${currentIndex + 1} of ${
    dailyDeck.length
  }`;

  // Update next review date
  const spacedData = spacedRepetitionCards[card.id];
  if (spacedData && spacedData.nextReview) {
    const nextDate = new Date(spacedData.nextReview);
    const today = new Date();
    const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil === 0) {
      UI.nextReviewDate.textContent = "Today";
    } else if (daysUntil === 1) {
      UI.nextReviewDate.textContent = "Tomorrow";
    } else if (daysUntil <= 7) {
      UI.nextReviewDate.textContent = `In ${daysUntil} days`;
    } else {
      const options = { month: "short", day: "numeric" };
      UI.nextReviewDate.textContent = nextDate.toLocaleDateString(
        "en-US",
        options
      );
    }

    UI.nextReview.style.display = "block";
  } else {
    UI.nextReview.style.display = "none";
  }
}

function updateProgress() {
  const total = dailyDeck.length || 1;
  const progress = (studiedCardIds.size / total) * 100;
  UI.progressFill.style.width = `${progress}%`;
  UI.progressText.textContent = `${studiedCardIds.size} / ${total} cards studied`;
}

function flipCard() {
  isFlipped = !isFlipped;
  UI.flashcard.classList.toggle("flipped");

  if (isFlipped) {
    // Show difficulty rating when card is flipped
    UI.difficultySection.style.display = "block";
    UI.flipBtn.textContent = "Rate Difficulty";
  } else {
    // Hide difficulty rating when showing Korean
    UI.difficultySection.style.display = "none";
    UI.flipBtn.textContent = "Show English";
  }

  Autoplay.restart();
}

function rateDifficulty(difficulty) {
  const card = dailyDeck[currentIndex];
  if (!card) return;

  // Update spaced repetition data
  DeckManager.calculateNextReview(card.id, difficulty);

  // Record study for statistics
  DeckManager.recordCardStudy(card.id, difficulty !== "hard");

  // Mark as studied
  studiedCardIds.add(card.id);
  DeckManager.saveStudied();

  // Hide difficulty section and move to next card
  UI.difficultySection.style.display = "none";
  DeckManager.next();
}

function resetApp() {
  currentIndex = 0;
  isFlipped = false;
  studiedCardIds = new Set();
  DeckManager.saveStudied();
  UI.flashcard.classList.remove("flipped");
  updateCard();
  updateProgress();
  UI.flipBtn.textContent = "Show English";
  Autoplay.restart();
}

function rerollTodayDeck() {
  DeckManager.createNew();
  const byId = new Map(flashcardData.map((c) => [c.id, c]));
  dailyDeck = dailyDeckIds.map((id) => byId.get(id)).filter(Boolean);
  currentIndex = 0;
  isFlipped = false;
  UI.flashcard.classList.remove("flipped");
  UI.flipBtn.textContent = "Show English";
  updateCard();
  updateProgress();
  Autoplay.restart();
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLightMode = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
}

function backToMenu() {
  // Save current progress before leaving
  DeckManager.saveStudied();
  DeckManager.saveStatistics();

  // Navigate back to main menu
  window.location.href = "main-menu.html";
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
}

// Statistics Functions
function openStatistics() {
  updateStatisticsDisplay();
  UI.statsModal.style.display = "block";
}

function closeStatistics() {
  UI.statsModal.style.display = "none";
}

function updateStatisticsDisplay() {
  // Update streak information
  document.getElementById("current-streak").textContent =
    studyStatistics.currentStreak;
  document.getElementById("longest-streak").textContent =
    studyStatistics.longestStreak;
  document.getElementById("study-days").textContent =
    studyStatistics.studyDays.length;

  // Update progress information
  document.getElementById("total-cards").textContent =
    studyStatistics.totalCardsStudied;
  document.getElementById("session-cards").textContent = sessionCardsStudied;

  const sessionAccuracy =
    sessionCardsStudied > 0
      ? Math.round((sessionCorrectAnswers / sessionCardsStudied) * 100)
      : 0;
  document.getElementById(
    "session-accuracy"
  ).textContent = `${sessionAccuracy}%`;

  // Update time tracking
  document.getElementById("total-study-time").textContent = Math.round(
    studyStatistics.totalStudyTime
  );
  const avgSessionTime =
    studyStatistics.studyDays.length > 0
      ? Math.round(
          studyStatistics.totalStudyTime / studyStatistics.studyDays.length
        )
      : 0;
  document.getElementById("avg-session-time").textContent = avgSessionTime;

  // Update learning curve chart
  drawLearningCurve();

  // Update recent performance
  updateRecentPerformance();

  // Update weakness analysis
  updateWeaknessAnalysis();
}

function drawLearningCurve() {
  const canvas = document.getElementById("learning-curve-chart");
  const ctx = canvas.getContext("2d");

  // Get last 7 days of data
  const today = new Date();
  const last7Days = [];
  const performanceData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    const dayName = date.toLocaleDateString("en", { weekday: "short" });

    last7Days.push(dayName);

    const dayStats = studyStatistics.dailyStats[dateKey];
    performanceData.push(dayStats ? dayStats.cardsStudied : 0);
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set up chart dimensions
  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  // Find max value for scaling
  const maxValue = Math.max(...performanceData, 10);

  // Draw axes
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue(
    "--text-secondary"
  );
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Draw data points and lines
  if (performanceData.some((v) => v > 0)) {
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue(
      "--header-color"
    );
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue(
      "--header-color"
    );
    ctx.lineWidth = 2;
    ctx.beginPath();

    performanceData.forEach((value, index) => {
      const x = padding + (index / (performanceData.length - 1)) * chartWidth;
      const y = canvas.height - padding - (value / maxValue) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    performanceData.forEach((value, index) => {
      const x = padding + (index / (performanceData.length - 1)) * chartWidth;
      const y = canvas.height - padding - (value / maxValue) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  // Draw labels
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue(
    "--text-secondary"
  );
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";

  last7Days.forEach((day, index) => {
    const x = padding + (index / (last7Days.length - 1)) * chartWidth;
    ctx.fillText(day, x, canvas.height - padding + 20);
  });
}

function updateRecentPerformance() {
  const container = document.getElementById("recent-performance");
  const today = new Date();
  const recentDays = [];

  // Get last 5 days with data
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);

    if (studyStatistics.dailyStats[dateKey]) {
      recentDays.push({
        date: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
        ...studyStatistics.dailyStats[dateKey],
      });
    }
  }

  if (recentDays.length === 0) {
    container.innerHTML =
      '<div style="color: var(--text-secondary); text-align: center;">No study data available yet</div>';
    return;
  }

  container.innerHTML = recentDays
    .map(
      (day) => `
    <div class="performance-item">
      <span class="performance-date">${day.date}</span>
      <div class="performance-stats">
        <span class="performance-cards">${day.cardsStudied} cards</span>
        <span class="performance-accuracy">${Math.round(
          day.accuracy
        )}% accuracy</span>
      </div>
    </div>
  `
    )
    .join("");
}

function updateWeaknessAnalysis() {
  const container = document.getElementById("weakness-analysis");
  const weakCards = Object.entries(studyStatistics.cardPerformance)
    .filter(([id, perf]) => perf.timesStudied >= 3)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 5);

  if (weakCards.length === 0) {
    container.innerHTML =
      '<div style="color: var(--text-secondary); text-align: center;">No weak cards identified yet</div>';
    return;
  }

  container.innerHTML = weakCards
    .map(([id, perf]) => {
      const card = flashcardData.find((c) => c.id === parseInt(id));
      return `
      <div class="weak-card">
        <div class="weak-card-text">
          <span class="korean">${
            card?.korean || "Unknown"
          }</span> - <span class="english">${card?.english || "Unknown"}</span>
        </div>
        <div class="weak-card-stats">
          <span>Accuracy: ${Math.round(perf.accuracy)}%</span>
          <span>Times studied: ${perf.timesStudied}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

// Dropdown Functions
function toggleDropdown() {
  const dropdown = UI.analyticsBtn.closest(".dropdown");
  dropdown.classList.toggle("active");
}

function closeDropdown() {
  const dropdown = UI.analyticsBtn.closest(".dropdown");
  dropdown.classList.remove("active");
}

// Event Listeners
UI.flashcard.addEventListener("click", flipCard);
UI.flipBtn.addEventListener("click", flipCard);
UI.prevBtn.addEventListener("click", () => DeckManager.prev());
UI.nextBtn.addEventListener("click", () => DeckManager.next());
UI.newDeckBtn.addEventListener("click", rerollTodayDeck);
UI.backToMenuBtn.addEventListener("click", backToMenu);
UI.themeToggle.addEventListener("click", toggleTheme);
UI.playBtn.addEventListener("click", toggleAutoplay);
UI.koreanAudioBtn.addEventListener("click", playKoreanAudio);
UI.englishAudioBtn.addEventListener("click", playEnglishAudio);
UI.statsBtn.addEventListener("click", openStatistics);
UI.statsClose.addEventListener("click", closeStatistics);
UI.analyticsBtn.addEventListener("click", toggleDropdown);

// Calendar event listeners
UI.calendarBtn.addEventListener("click", openCalendar);
UI.calendarClose.addEventListener("click", closeCalendar);
UI.prevMonth.addEventListener("click", () => navigateMonth(-1));
UI.nextMonth.addEventListener("click", () => navigateMonth(1));

// Difficulty rating event listeners
UI.easyBtn.addEventListener("click", () => rateDifficulty("easy"));
UI.mediumBtn.addEventListener("click", () => rateDifficulty("medium"));
UI.hardBtn.addEventListener("click", () => rateDifficulty("hard"));

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === UI.statsModal) {
    closeStatistics();
  }
  if (event.target === UI.calendarModal) {
    closeCalendar();
  }

  // Close dropdown when clicking outside
  const dropdown = UI.analyticsBtn.closest(".dropdown");
  if (!dropdown.contains(event.target)) {
    closeDropdown();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    Autoplay.stop();
  } else {
    Autoplay.start();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    DeckManager.next();
    Autoplay.restart();
  } else if (e.key === "ArrowLeft") {
    DeckManager.prev();
  } else if (e.key === " ") {
    e.preventDefault();
    flipCard();
  }
});

// Study time tracking
setInterval(() => {
  if (!document.hidden) {
    const today = DeckManager.getTodayKey();
    if (!studyStatistics.dailyStats[today]) {
      studyStatistics.dailyStats[today] = {
        cardsStudied: 0,
        correctAnswers: 0,
        studyTime: 0,
        accuracy: 0,
      };
    }
    studyStatistics.dailyStats[today].studyTime =
      (studyStatistics.dailyStats[today].studyTime || 0) + 1;
    studyStatistics.totalStudyTime = (studyStatistics.totalStudyTime || 0) + 1;
    DeckManager.saveStatistics();
  }
}, 60000);

// Initialize
loadTheme();
DeckManager.loadOrCreate();
updateCard();
updateProgress();
// Autoplay should only start when user explicitly clicks the play button
// toggleAutoplay();
