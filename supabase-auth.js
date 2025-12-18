// Supabase Authentication System
class SupabaseAuth {
  constructor() {
    this.user = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Check for existing session
      const {
        data: { session },
        error,
      } = await window.supabaseClient.auth.getSession();

      if (error) throw error;

      this.user = session?.user || null;
      this.initialized = true;

      // Listen for auth changes
      window.supabaseClient.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null;
        this.handleAuthChange(event, session);
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
    }
  }

  handleAuthChange(event, session) {
    switch (event) {
      case "SIGNED_IN":
        console.log("User signed in:", session.user);
        this.updateUIForSignedInUser();
        break;
      case "SIGNED_OUT":
        console.log("User signed out");
        this.updateUIForSignedOutUser();
        break;
      case "TOKEN_REFRESHED":
        console.log("Token refreshed");
        break;
    }
  }

  async signUp(email, password) {
    try {
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: email.split("@")[0], // Default display name
          },
          emailRedirectTo: window.location.origin + "/index.html", // Redirect to index after confirmation
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } =
        await window.supabaseClient.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/main-menu.html",
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await window.supabaseClient.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      const { data, error } =
        await window.supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password.html",
        });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateUIForSignedInUser() {
    // Update UI elements for signed-in user
    const authButtons = document.querySelector(".auth-buttons");
    const userInfo = document.querySelector(".user-info");

    if (authButtons) authButtons.style.display = "none";
    if (userInfo) {
      userInfo.style.display = "block";
      const userName = userInfo.querySelector(".user-name");
      if (userName && this.user) {
        userName.textContent =
          this.user.user_metadata?.display_name || this.user.email;
      }
    }
  }

  updateUIForSignedOutUser() {
    // Update UI elements for signed-out user
    const authButtons = document.querySelector(".auth-buttons");
    const userInfo = document.querySelector(".user-info");

    if (authButtons) authButtons.style.display = "flex";
    if (userInfo) userInfo.style.display = "none";
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.user;
  }
}

// Initialize auth when Supabase client is ready
window.auth = new SupabaseAuth();
