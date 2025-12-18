// Main Menu JavaScript
class KoreanLearningHub {
  constructor() {
    this.currentTheme = localStorage.getItem("theme") || "dark";
    this.stats = this.loadStats();
    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.setupToolCards();
    this.setupModal();
    this.setupAuthentication();
    this.updateStats();
    this.setupKeyboardNavigation();
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Apply saved theme
    if (this.currentTheme === "light") {
      body.classList.add("light-mode");
    }

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("light-mode");
      this.currentTheme = body.classList.contains("light-mode")
        ? "light"
        : "dark";
      localStorage.setItem("theme", this.currentTheme);
    });
  }

  setupToolCards() {
    const toolCards = document.querySelectorAll(".tool-card");

    toolCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        // Don't trigger if clicking on the button
        if (e.target.tagName === "BUTTON") return;

        const tool = card.dataset.tool;
        this.handleToolSelection(tool);
      });

      // Handle button clicks separately
      const button = card.querySelector(".btn");
      if (button) {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          const tool = card.dataset.tool;
          this.handleToolAction(tool);
        });
      }
    });
  }

  handleToolSelection(tool) {
    this.showToolModal(tool);
  }

  handleToolAction(tool) {
    switch (tool) {
      case "flashcards":
        this.launchFlashcards();
        break;
      case "quiz":
        this.launchQuiz();
        break;
      case "practice":
        this.launchPractice();
        break;
      case "listening":
        this.launchListening();
        break;
      case "progress":
        this.showProgress();
        break;
      case "settings":
        this.showSettings();
        break;
    }
  }

  showToolModal(tool) {
    const modal = document.getElementById("tool-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");

    const toolInfo = this.getToolInfo(tool);
    modalTitle.textContent = toolInfo.title;
    modalBody.innerHTML = toolInfo.description;

    modal.style.display = "block";
  }

  getToolInfo(tool) {
    const tools = {
      flashcards: {
        title: "Flashcards",
        description: `
          <div class="tool-description">
            <p>Practice Korean vocabulary with our interactive flashcard system. Features include:</p>
            <ul>
              <li>Flip cards to reveal English translations</li>
              <li>Audio pronunciation for both Korean and English</li>
              <li>Progress tracking and spaced repetition</li>
              <li>Difficulty ratings to optimize learning</li>
            </ul>
            <div class="tool-actions">
              <button class="btn btn-primary" onclick="hub.launchFlashcards()">Start Learning</button>
              <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
            </div>
          </div>
        `,
      },
      quiz: {
        title: "Quiz Mode",
        description: `
          <div class="tool-description">
            <p>Test your Korean knowledge with interactive quizzes:</p>
            <ul>
              <li>Multiple choice questions</li>
              <li>Timed challenges</li>
              <li>Instant feedback and explanations</li>
              <li>Score tracking and leaderboards</li>
            </ul>
            <div class="tool-actions">
              <button class="btn btn-primary" onclick="hub.launchQuiz()">Take Quiz</button>
              <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
            </div>
          </div>
        `,
      },
      practice: {
        title: "Writing Practice",
        description: `
          <div class="tool-description">
            <p>Master Korean writing with interactive exercises:</p>
            <ul>
              <li>Hangul character practice</li>
              <li>Stroke order guidance</li>
              <li>Word and sentence writing</li>
              <li>Handwriting recognition</li>
            </ul>
            <div class="tool-actions">
              <button class="btn btn-primary" onclick="hub.launchPractice()">Start Practice</button>
              <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
            </div>
          </div>
        `,
      },
      listening: {
        title: "Listening Practice",
        description: `
          <div class="tool-description">
            <p>Improve your Korean listening comprehension:</p>
            <ul>
              <li>Native speaker audio clips</li>
              <li>Variable speed playback</li>
              <li>Transcription exercises</li>
              <li>Conversation practice</li>
            </ul>
            <div class="tool-actions">
              <button class="btn btn-primary" onclick="hub.launchListening()">Start Listening</button>
              <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
            </div>
          </div>
        `,
      },
      progress: {
        title: "Progress Tracker",
        description: `
          <div class="tool-description">
            <p>Monitor your learning journey with detailed analytics:</p>
            <ul>
              <li>Study streaks and consistency</li>
              <li>Performance statistics</li>
              <li>Learning heatmaps</li>
              <li>Achievement badges</li>
            </ul>
            <div class="tool-actions">
              <button class="btn btn-primary" onclick="hub.showProgress()">View Progress</button>
              <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
            </div>
          </div>
        `,
      },
      settings: {
        title: "Settings",
        description: `
          <div class="tool-description">
            <p>Customize your learning experience:</p>
            <ul>
              <li>Learning goals and preferences</li>
              <li>Audio settings</li>
              <li>Theme customization</li>
              <li>Account management</li>
            </ul>
            <div class="tool-actions">
              <button class="btn btn-primary" onclick="hub.showSettings()">Open Settings</button>
              <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
            </div>
          </div>
        `,
      },
    };

    return (
      tools[tool] || {
        title: "Unknown Tool",
        description: "<p>Tool information not available.</p>",
      }
    );
  }

  setupModal() {
    const modal = document.getElementById("tool-modal");
    const closeBtn = document.getElementById("modal-close");

    closeBtn.addEventListener("click", () => this.closeModal());

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "block") {
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modal = document.getElementById("tool-modal");
    modal.style.display = "none";
  }

  setupAuthentication() {
    // Wait for auth to be initialized
    setTimeout(() => {
      this.setupAuthEventListeners();
      this.updateAuthUI();
    }, 100);
  }

  setupAuthEventListeners() {
    // Sign In button
    const signInBtn = document.getElementById("sign-in-btn");
    if (signInBtn) {
      signInBtn.addEventListener("click", () =>
        this.showModal("sign-in-modal")
      );
    }

    // Sign Up button
    const signUpBtn = document.getElementById("sign-up-btn");
    if (signUpBtn) {
      signUpBtn.addEventListener("click", () =>
        this.showModal("sign-up-modal")
      );
    }

    // Sign Out button
    const signOutBtn = document.getElementById("sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => this.handleSignOut());
    }

    // Modal close buttons
    const signInClose = document.getElementById("sign-in-close");
    if (signInClose) {
      signInClose.addEventListener("click", () =>
        this.hideModal("sign-in-modal")
      );
    }

    const signUpClose = document.getElementById("sign-up-close");
    if (signUpClose) {
      signUpClose.addEventListener("click", () =>
        this.hideModal("sign-up-modal")
      );
    }

    // Form submissions
    const signInForm = document.getElementById("sign-in-form");
    if (signInForm) {
      signInForm.addEventListener("submit", (e) => this.handleSignIn(e));
    }

    const signUpForm = document.getElementById("sign-up-form");
    if (signUpForm) {
      signUpForm.addEventListener("submit", (e) => this.handleSignUp(e));
    }

    // Google sign in/up
    const googleSignIn = document.getElementById("google-sign-in");
    if (googleSignIn) {
      googleSignIn.addEventListener("click", () => this.handleGoogleSignIn());
    }

    const googleSignUp = document.getElementById("google-sign-up");
    if (googleSignUp) {
      googleSignUp.addEventListener("click", () => this.handleGoogleSignIn());
    }

    // Switch between modals
    const switchToSignUp = document.getElementById("switch-to-sign-up");
    if (switchToSignUp) {
      switchToSignUp.addEventListener("click", (e) => {
        e.preventDefault();
        this.hideModal("sign-in-modal");
        this.showModal("sign-up-modal");
      });
    }

    const switchToSignIn = document.getElementById("switch-to-sign-in");
    if (switchToSignIn) {
      switchToSignIn.addEventListener("click", (e) => {
        e.preventDefault();
        this.hideModal("sign-up-modal");
        this.showModal("sign-in-modal");
      });
    }

    // Forgot password
    const forgotPassword = document.getElementById("forgot-password");
    if (forgotPassword) {
      forgotPassword.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
    }

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  updateAuthUI() {
    if (window.auth && window.auth.isAuthenticated()) {
      const user = window.auth.getCurrentUser();
      const userInfo = document.getElementById("user-info");
      const authButtons = document.getElementById("auth-buttons");
      const userName = document.getElementById("user-name");

      if (userInfo) userInfo.style.display = "flex";
      if (authButtons) authButtons.style.display = "none";
      if (userName) {
        userName.textContent =
          user?.user_metadata?.display_name ||
          user?.email?.split("@")[0] ||
          "User";
      }

      // Load user stats from Supabase
      this.loadUserStats();
    } else {
      const userInfo = document.getElementById("user-info");
      const authButtons = document.getElementById("auth-buttons");

      if (userInfo) userInfo.style.display = "none";
      if (authButtons) authButtons.style.display = "flex";
    }
  }

  async handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById("sign-in-email").value;
    const password = document.getElementById("sign-in-password").value;

    const result = await window.auth.signIn(email, password);

    if (result.success) {
      this.hideModal("sign-in-modal");
      this.showNotification("Successfully signed in!", "success");
      this.updateAuthUI();
    } else {
      this.showNotification(result.error, "error");
    }
  }

  async handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById("sign-up-email").value;
    const password = document.getElementById("sign-up-password").value;
    const confirmPassword = document.getElementById(
      "sign-up-confirm-password"
    ).value;

    if (password !== confirmPassword) {
      this.showNotification("Passwords do not match", "error");
      return;
    }

    const result = await window.auth.signUp(email, password);

    if (result.success) {
      this.hideModal("sign-up-modal");
      this.showNotification(
        "Account created! Please check your email to verify.",
        "success"
      );
    } else {
      this.showNotification(result.error, "error");
    }
  }

  async handleGoogleSignIn() {
    const result = await window.auth.signInWithGoogle();

    if (!result.success) {
      this.showNotification(result.error, "error");
    }
  }

  async handleSignOut() {
    const result = await window.auth.signOut();

    if (result.success) {
      this.showNotification("Successfully signed out", "success");
      // Redirect to index.html which will check auth and redirect to login if needed
      window.location.href = "index.html";
    } else {
      this.showNotification(result.error, "error");
    }
  }

  async handleForgotPassword() {
    const email = document.getElementById("sign-in-email").value;

    if (!email) {
      this.showNotification("Please enter your email address", "error");
      return;
    }

    const result = await window.auth.resetPassword(email);

    if (result.success) {
      this.showNotification("Password reset email sent!", "success");
    } else {
      this.showNotification(result.error, "error");
    }
  }

  async loadUserStats() {
    if (!window.db || !window.auth.isAuthenticated()) return;

    const user = window.auth.getCurrentUser();
    const result = await window.db.getUserStats(user.id);

    if (result.success) {
      const stats = result.data;
      this.updateStatsDisplay(stats);
    }
  }

  updateStatsDisplay(stats) {
    const totalStudied = document.getElementById("total-studied");
    const currentStreak = document.getElementById("current-streak");
    const accuracyRate = document.getElementById("accuracy-rate");
    const studyTime = document.getElementById("study-time");

    if (totalStudied) totalStudied.textContent = stats.totalCardsStudied || 0;
    if (currentStreak) currentStreak.textContent = stats.studyStreak || 0;
    if (accuracyRate)
      accuracyRate.textContent = stats.averageAccuracy || 0 + "%";
    if (studyTime) studyTime.textContent = stats.totalStudyTime || 0 + "m";
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    // Set background color based on type
    switch (type) {
      case "success":
        notification.style.backgroundColor = "#10b981";
        break;
      case "error":
        notification.style.backgroundColor = "#ef4444";
        break;
      default:
        notification.style.backgroundColor = "#3b82f6";
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  launchFlashcards() {
    this.closeModal();
    // Navigate to the existing flashcard application
    window.location.href = "flashcard.html";
  }

  launchQuiz() {
    this.closeModal();
    this.showComingSoon("Quiz Mode");
  }

  launchPractice() {
    this.closeModal();
    this.showComingSoon("Writing Practice");
  }

  launchListening() {
    this.closeModal();
    this.showComingSoon("Listening Practice");
  }

  showProgress() {
    this.closeModal();
    // Load progress from existing stats
    const progressHtml = `
      <div class="progress-details">
        <h3>📊 Your Learning Statistics</h3>
        <div class="progress-stats">
          <div class="progress-item">
            <strong>Total Cards Studied:</strong> ${
              this.stats.totalStudied || 0
            }
          </div>
          <div class="progress-item">
            <strong>Current Streak:</strong> ${
              this.stats.currentStreak || 0
            } days
          </div>
          <div class="progress-item">
            <strong>Accuracy Rate:</strong> ${this.stats.accuracy || 0}%
          </div>
          <div class="progress-item">
            <strong>Total Study Time:</strong> ${
              this.stats.studyTime || 0
            } minutes
          </div>
        </div>
        <div class="tool-actions">
          <button class="btn btn-secondary" onclick="hub.closeModal()">Close</button>
        </div>
      </div>
    `;

    document.getElementById("modal-title").textContent = "Progress Tracker";
    document.getElementById("modal-body").innerHTML = progressHtml;
    document.getElementById("tool-modal").style.display = "block";
  }

  showSettings() {
    this.closeModal();
    const settingsHtml = `
      <div class="settings-content">
        <h3>⚙️ Settings</h3>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="audio-enabled" checked>
            Enable Audio
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="auto-play" checked>
            Auto-play Audio
          </label>
        </div>
        <div class="setting-group">
          <label for="daily-goal">Daily Goal (cards):</label>
          <input type="number" id="daily-goal" value="20" min="1" max="100">
        </div>
        <div class="setting-group">
          <label for="difficulty">Difficulty Level:</label>
          <select id="difficulty">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" onclick="hub.saveSettings()">Save Settings</button>
          <button class="btn btn-secondary" onclick="hub.closeModal()">Cancel</button>
        </div>
      </div>
    `;

    document.getElementById("modal-title").textContent = "Settings";
    document.getElementById("modal-body").innerHTML = settingsHtml;
    document.getElementById("tool-modal").style.display = "block";
  }

  saveSettings() {
    // Save settings to localStorage
    const settings = {
      audioEnabled: document.getElementById("audio-enabled").checked,
      autoPlay: document.getElementById("auto-play").checked,
      dailyGoal: document.getElementById("daily-goal").value,
      difficulty: document.getElementById("difficulty").value,
    };

    localStorage.setItem("koreanSettings", JSON.stringify(settings));
    this.showToast("Settings saved successfully!");
    this.closeModal();
  }

  showComingSoon(feature) {
    const modal = document.getElementById("tool-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");

    modalTitle.textContent = feature;
    modalBody.innerHTML = `
      <div class="coming-soon">
        <div class="coming-soon-icon">🚧</div>
        <h3>Coming Soon!</h3>
        <p>${feature} is currently under development. Check back soon for this exciting new feature!</p>
        <div class="tool-actions">
          <button class="btn btn-secondary" onclick="hub.closeModal()">Got it!</button>
        </div>
      </div>
    `;

    modal.style.display = "block";
  }

  showToast(message) {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--header-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  loadStats() {
    const savedStats = localStorage.getItem("koreanLearningStats");
    return savedStats
      ? JSON.parse(savedStats)
      : {
          totalStudied: 0,
          currentStreak: 0,
          accuracy: 0,
          studyTime: 0,
          lastStudyDate: null,
        };
  }

  saveStats() {
    localStorage.setItem("koreanLearningStats", JSON.stringify(this.stats));
  }

  updateStats() {
    // Update the quick stats on the main menu
    document.getElementById("total-studied").textContent =
      this.stats.totalStudied || 0;
    document.getElementById("current-streak").textContent =
      this.stats.currentStreak || 0;
    document.getElementById("accuracy-rate").textContent =
      (this.stats.accuracy || 0) + "%";
    document.getElementById("study-time").textContent =
      (this.stats.studyTime || 0) + "m";
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Number keys to quickly select tools
      if (e.key >= "1" && e.key <= "6") {
        const toolIndex = parseInt(e.key) - 1;
        const toolCards = document.querySelectorAll(".tool-card");
        if (toolCards[toolIndex]) {
          toolCards[toolIndex].click();
        }
      }

      // 'F' for flashcards
      if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey) {
        this.launchFlashcards();
      }

      // 'S' for settings
      if (e.key.toLowerCase() === "s" && !e.ctrlKey && !e.metaKey) {
        this.showSettings();
      }

      // 'P' for progress
      if (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey) {
        this.showProgress();
      }
    });
  }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .tool-description ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .tool-description li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }

  .tool-actions {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
  }

  .coming-soon {
    text-align: center;
    padding: 2rem;
  }

  .coming-soon-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .coming-soon h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .coming-soon p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .progress-details {
    padding: 1rem;
  }

  .progress-stats {
    margin: 1.5rem 0;
  }

  .progress-item {
    padding: 0.75rem;
    background: var(--btn-bg);
    border: 1px solid var(--card-border);
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .settings-content {
    padding: 1rem;
  }

  .setting-group {
    margin-bottom: 1.5rem;
  }

  .setting-group label {
    display: block;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .setting-group input[type="checkbox"] {
    margin-right: 0.5rem;
  }

  .setting-group input[type="number"],
  .setting-group select {
    width: 100%;
    padding: 0.75rem;
    background: var(--btn-bg);
    border: 1px solid var(--card-border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 1rem;
    /* Remove scrollbar */
    -webkit-appearance: none;
    -moz-appearance: textfield;
    overflow: hidden;
  }

  /* Style select options to match brand */
  .setting-group select option {
    background: var(--btn-bg);
    color: var(--text-primary);
    padding: 0.75rem;
    border: none;
  }

  .setting-group select option[value="advanced"] {
    background: linear-gradient(135deg, #9333ea, #ec4899);
    color: #ffffff;
    font-weight: 600;
  }

  .setting-group select option[value="intermediate"] {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #ffffff;
    font-weight: 500;
  }

  .setting-group select option[value="beginner"] {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #ffffff;
    font-weight: 500;
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .setting-group input[type="number"]::-webkit-outer-spin-button,
  .setting-group input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
document.head.appendChild(style);

// Initialize the hub when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.hub = new KoreanLearningHub();
});
