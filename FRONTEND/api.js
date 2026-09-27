/**
 * CAMPUSLINK - Central Frontend API Layer
 * 
 * Centralized, production-ready HTTP client for all frontend API communication.
 * Handles authentication headers, standard status codes (401, 403, 404, 422, 500),
 * network failures, and session lifecycle.
 * Ready for future Python backend integration.
 */

const CampusLinkAPI = {
  // Configurable base URL (defaults to same-origin in development/production)
  BASE_URL: '',

  /**
   * Universal fetch wrapper with automatic JWT injection, error mapping,
   * and 401 session revocation.
   */
  request: async (endpoint, options = {}) => {
    const url = `${CampusLinkAPI.BASE_URL}${endpoint}`;
    const token = CampusLinkStore ? CampusLinkStore.getAuthToken() : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      let data = null;

      const contentType = response.headers && typeof response.headers.get === 'function' 
        ? response.headers.get('content-type') 
        : '';
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      // Handle HTTP Error Codes
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          if (CampusLinkStore) {
            CampusLinkStore.clearSession();
          }
          if (window.CampusLinkApp) {
            CampusLinkApp.currentUser = null;
            CampusLinkApp.sessionValidated = false;
          }
          return {
            success: false,
            status: 401,
            error: data.message || 'Session expired. Please sign in again.'
          };
        }

        if (response.status === 403) {
          return {
            success: false,
            status: 403,
            error: data.message || 'Access denied: You do not have permission to perform this action.'
          };
        }

        if (response.status === 404) {
          return {
            success: false,
            status: 404,
            error: data.message || 'The requested resource was not found.'
          };
        }

        if (response.status === 422) {
          return {
            success: false,
            status: 422,
            error: data.message || 'Validation error in submitted data.',
            validationErrors: data.errors || null
          };
        }

        if (response.status >= 500) {
          return {
            success: false,
            status: response.status,
            error: data.message || 'Internal server error. Please try again later.'
          };
        }

        return {
          success: false,
          status: response.status,
          error: data.message || `Request failed with status ${response.status}.`
        };
      }

      return {
        success: true,
        status: response.status,
        data: data.data !== undefined ? data.data : data,
        raw: data
      };
    } catch (networkError) {
      console.warn('[CampusLinkAPI Network Error]:', networkError.message);
      return {
        success: false,
        status: 0,
        networkError: true,
        error: 'Unable to connect to the authentication service. Please verify server connectivity.'
      };
    }
  },

  // -------------------------------------------------------------
  // AUTHENTICATION ENDPOINTS
  // -------------------------------------------------------------

  /**
   * Sign in with institutional credentials.
   * Note: The role is determined authoritative by the server response,
   * NOT requested by the frontend.
   */
  login: async (email, password) => {
    return await CampusLinkAPI.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  /**
   * Register a new user account.
   */
  register: async (userData) => {
    return await CampusLinkAPI.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Validate current session token and fetch authoritative user profile.
   */
  getCurrentUser: async () => {
    return await CampusLinkAPI.request('/api/auth/me', {
      method: 'GET'
    });
  },

  /**
   * Invalidate session token on server.
   */
  logout: async () => {
    return await CampusLinkAPI.request('/api/auth/logout', {
      method: 'POST'
    });
  },

  // -------------------------------------------------------------
  // CORE OPERATIONAL DATA ENDPOINTS
  // (Boundaries prepared for upcoming Python backend)
  // -------------------------------------------------------------

  getStudentProfile: async (studentId) => {
    return await CampusLinkAPI.request(`/api/students/${studentId || 'me'}`);
  },

  updateStudentProfile: async (profileData) => {
    return await CampusLinkAPI.request('/api/students/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  getJobs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return await CampusLinkAPI.request(`/api/jobs${query}`);
  },

  createJob: async (jobData) => {
    return await CampusLinkAPI.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },

  getRecruiters: async () => {
    return await CampusLinkAPI.request('/api/recruiters');
  },

  getDrives: async () => {
    return await CampusLinkAPI.request('/api/drives');
  },

  scheduleDrive: async (driveData) => {
    return await CampusLinkAPI.request('/api/drives', {
      method: 'POST',
      body: JSON.stringify(driveData)
    });
  },

  getApplications: async () => {
    return await CampusLinkAPI.request('/api/applications');
  },

  applyForJob: async (jobId) => {
    return await CampusLinkAPI.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId })
    });
  },

  getOffers: async () => {
    return await CampusLinkAPI.request('/api/offers');
  },

  getNotifications: async () => {
    return await CampusLinkAPI.request('/api/notifications');
  },

  markNotificationsRead: async () => {
    return await CampusLinkAPI.request('/api/notifications/read-all', {
      method: 'POST'
    });
  },

  getAnalytics: async () => {
    return await CampusLinkAPI.request('/api/analytics');
  },

  getComplianceReport: async (type = 'nirf') => {
    return await CampusLinkAPI.request(`/api/reports/compliance?type=${type}`);
  },

  // -------------------------------------------------------------
  // AI & INTELLIGENCE BOUNDARIES
  // (Pre-configured for future Python AI endpoints)
  // -------------------------------------------------------------

  getReadinessScore: async (studentId) => {
    return await CampusLinkAPI.request(`/api/ai/readiness/${studentId || 'me'}`);
  },

  getSkillGapAnalysis: async (targetRole) => {
    return await CampusLinkAPI.request(`/api/ai/skill-gap?role=${encodeURIComponent(targetRole || '')}`);
  },

  getCandidateMatches: async (jobId) => {
    return await CampusLinkAPI.request(`/api/ai/matching/${jobId}`);
  },

  getRiskPredictions: async () => {
    return await CampusLinkAPI.request('/api/ai/risk-predictions');
  },

  queryAIAssistant: async (prompt, context = {}) => {
    return await CampusLinkAPI.request('/api/ai/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, context })
    });
  }
};

window.CampusLinkAPI = CampusLinkAPI;
