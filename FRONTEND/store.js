/**
 * CAMPUSLINK - Central Frontend State & Store
 * 
 * Single source of truth for frontend authentication and application state.
 * Eliminates all mock/fabricated operational datasets in favor of real API models
 * and resilient empty states.
 */

const CampusLinkStore = {
  // -------------------------------------------------------------
  // 1. AUTHORITATIVE AUTHENTICATION STATE
  // -------------------------------------------------------------
  auth: {
    user: null,
    role: null,
    token: null,
    isAuthenticated: false
  },

  // Role Metadata for unified Application Shell
  roles: {
    student: {
      roleLabel: "Student Portal",
      title: "Candidate Aspirant",
      color: "#2563eb",
      defaultAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    recruiter: {
      roleLabel: "Corporate Recruiter",
      title: "Talent Acquisition",
      color: "#7c3aed",
      defaultAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    officer: {
      roleLabel: "Placement Officer",
      title: "Placement Directorate",
      color: "#10b981",
      defaultAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    }
  },

  // -------------------------------------------------------------
  // 2. OPERATIONAL DATA COLLECTIONS (INITIALIZED EMPTY)
  // No fake or fabricated records. Dashboards render realistic empty states.
  // -------------------------------------------------------------
  data: {
    jobs: [],
    applications: [],
    interviews: [],
    offers: [],
    students: [],
    candidates: [],
    recruiters: [],
    drives: [],
    notifications: [],
    documents: [],
    assessments: [],
    aiMatchingPool: [],
    studentsDirectory: [],
    recruitersDirectory: [],
    documentVerificationQueue: [],
    schedulerState: {
      drives: [],
      conflicts: [],
      hasConflict: false
    },
    readinessData: {
      overallScore: 0,
      status: "Not Evaluated",
      breakdown: [],
      recommendations: []
    },
    skillGapProfiles: {
      "Full Stack Engineer": { matchScore: 0, skills: [], aiRoadmap: [] },
      "Data Scientist / AI Engineer": { matchScore: 0, skills: [], aiRoadmap: [] },
      "DevOps & SRE": { matchScore: 0, skills: [], aiRoadmap: [] }
    },
    riskPrediction: {
      highRisk: []
    },
    branchConversion: [],
    analytics: null,
    compliance: null,
    auditLogs: []
  },

  // -------------------------------------------------------------
  // 3. UI STATE & INTENDED DESTINATION
  // -------------------------------------------------------------
  ui: {
    intendedDestination: null,
    isLoading: false,
    activeFilters: {}
  },

  /**
   * Initialize and synchronize store from client storage
   */
  init: () => {
    try {
      const token = localStorage.getItem('campuslink_jwt_token');
      const savedUser = localStorage.getItem('campuslink_auth_user');
      if (token && savedUser) {
        const user = JSON.parse(savedUser);
        CampusLinkStore.auth = {
          user,
          role: user.role,
          token,
          isAuthenticated: true
        };
      } else {
        CampusLinkStore.clearSession();
      }
    } catch (e) {
      CampusLinkStore.clearSession();
    }
  },

  // Session Management
  setSession: (user, token) => {
    if (!user || !token) return;
    CampusLinkStore.auth = {
      user,
      role: user.role,
      token,
      isAuthenticated: true
    };
    try {
      localStorage.setItem('campuslink_jwt_token', token);
      localStorage.setItem('campuslink_auth_user', JSON.stringify(user));
      localStorage.setItem('campuslink_active_role', user.role);
    } catch (e) {
      console.warn('Unable to persist session to localStorage', e);
    }
  },

  clearSession: () => {
    CampusLinkStore.auth = {
      user: null,
      role: null,
      token: null,
      isAuthenticated: false
    };
    try {
      localStorage.removeItem('campuslink_jwt_token');
      localStorage.removeItem('campuslink_auth_user');
      localStorage.removeItem('campuslink_active_role');
      sessionStorage.removeItem('campuslink_intended_dest');
    } catch (e) {
      // Ignore storage errors
    }
  },

  getAuthToken: () => {
    return CampusLinkStore.auth.token || localStorage.getItem('campuslink_jwt_token') || null;
  },

  getCurrentUser: () => {
    if (CampusLinkStore.auth.user) return CampusLinkStore.auth.user;
    try {
      const saved = localStorage.getItem('campuslink_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        CampusLinkStore.auth.user = parsed;
        CampusLinkStore.auth.role = parsed.role;
        CampusLinkStore.auth.isAuthenticated = true;
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  },

  setRole: (role) => {
    if (CampusLinkStore.auth.user) {
      CampusLinkStore.auth.role = role;
    }
  },

  // Intended Destination handling for smooth post-login redirection
  setIntendedDestination: (route) => {
    if (!route || route === '#login' || route === '#landing') return;
    try {
      sessionStorage.setItem('campuslink_intended_dest', route);
      CampusLinkStore.ui.intendedDestination = route;
    } catch (e) {
      CampusLinkStore.ui.intendedDestination = route;
    }
  },

  getIntendedDestination: () => {
    try {
      return sessionStorage.getItem('campuslink_intended_dest') || CampusLinkStore.ui.intendedDestination;
    } catch (e) {
      return CampusLinkStore.ui.intendedDestination;
    }
  },

  clearIntendedDestination: () => {
    try {
      sessionStorage.removeItem('campuslink_intended_dest');
    } catch (e) {}
    CampusLinkStore.ui.intendedDestination = null;
  },

  // Session validation against backend API
  validateSession: async () => {
    const token = CampusLinkStore.getAuthToken();
    if (!token) {
      CampusLinkStore.clearSession();
      return { valid: false, reason: 'no_token' };
    }

    try {
      if (window.CampusLinkAPI) {
        const res = await window.CampusLinkAPI.getCurrentUser();
        if (res.success && res.data && res.data.user) {
          CampusLinkStore.setSession(res.data.user, token);
          return { valid: true, user: res.data.user };
        } else if (res.status === 401) {
          CampusLinkStore.clearSession();
          return { valid: false, reason: 'expired', message: res.error || 'Session expired. Please sign in again.' };
        }
      }

      // If network is offline or API unavailable during refresh, check if local token exists
      const savedUser = CampusLinkStore.getCurrentUser();
      if (savedUser) {
        return { valid: true, user: savedUser, offlineWarning: true };
      }

      CampusLinkStore.clearSession();
      return { valid: false, reason: 'unreachable', message: 'Unable to connect to authentication service.' };
    } catch (e) {
      console.warn('[Session Validation Exception]:', e);
      CampusLinkStore.clearSession();
      return { valid: false, reason: 'error', message: 'Session validation error.' };
    }
  },

  logout: async () => {
    try {
      if (window.CampusLinkAPI) {
        await window.CampusLinkAPI.logout();
      }
    } catch (e) {
      console.warn('[Logout Notice]: Server unreachable, proceeding with local logout.');
    }
    CampusLinkStore.clearSession();
  },

  logoutLocal: () => {
    CampusLinkStore.clearSession();
  },

  authenticate: async (email, password) => {
    if (!window.CampusLinkAPI) {
      return { success: false, message: 'Unable to connect to the authentication service.' };
    }
    const res = await window.CampusLinkAPI.login(email, password);
    if (res.success && res.data && res.data.token && res.data.user) {
      CampusLinkStore.setSession(res.data.user, res.data.token);
      return { success: true, user: res.data.user, role: res.data.user.role };
    }
    return {
      success: false,
      status: res.status,
      message: res.error || (res.status === 0 ? 'Unable to connect to the authentication service.' : 'Invalid credentials.')
    };
  },

  registerUser: async (userData) => {
    if (!window.CampusLinkAPI) {
      return { success: false, message: 'Unable to connect to the authentication service.' };
    }
    const res = await window.CampusLinkAPI.register(userData);
    if (res.success && res.data && res.data.user && res.data.token) {
      CampusLinkStore.setSession(res.data.user, res.data.token);
      return { success: true, user: res.data.user, role: res.data.user.role };
    } else if (res.success) {
      return { success: true, data: res.data };
    }
    return {
      success: false,
      status: res.status,
      message: res.error || 'Registration failed. Please check your details.'
    };
  },

  /**
   * Comprehensive get() method returning application state.
   * Collections default to empty arrays so components render empty states gracefully.
   */
  get: () => {
    const user = CampusLinkStore.getCurrentUser();
    const activeRole = user ? user.role : 'student';

    return {
      currentUser: user || {
        id: '',
        name: 'Guest User',
        email: '',
        role: 'student',
        avatar: CampusLinkStore.roles.student.defaultAvatar
      },
      roles: CampusLinkStore.roles,
      jobs: CampusLinkStore.data.jobs,
      applications: CampusLinkStore.data.applications,
      interviews: CampusLinkStore.data.interviews,
      drives: CampusLinkStore.data.drives,
      students: CampusLinkStore.data.students,
      recruiters: CampusLinkStore.data.recruiters,
      offers: CampusLinkStore.data.offers,
      notifications: CampusLinkStore.data.notifications,
      documents: CampusLinkStore.data.documents,
      assessments: CampusLinkStore.data.assessments,
      aiMatchingPool: CampusLinkStore.data.aiMatchingPool,
      studentsDirectory: CampusLinkStore.data.studentsDirectory,
      recruitersDirectory: CampusLinkStore.data.recruitersDirectory,
      documentVerificationQueue: CampusLinkStore.data.documentVerificationQueue,
      schedulerState: CampusLinkStore.data.schedulerState,
      readinessData: CampusLinkStore.data.readinessData,
      skillGapProfiles: CampusLinkStore.data.skillGapProfiles,
      riskPrediction: CampusLinkStore.data.riskPrediction,
      branchConversion: CampusLinkStore.data.branchConversion,
      analytics: CampusLinkStore.data.analytics,
      compliance: CampusLinkStore.data.compliance,
      auditLogs: CampusLinkStore.data.auditLogs,
      studentProfile: {
        personal: {
          fullName: user ? user.name : '',
          email: user ? user.email : '',
          phone: '',
          address: '',
          city: '',
          state: '',
          linkedin: '',
          github: '',
          portfolio: ''
        },
        academic: {
          degree: 'Bachelor of Technology (B.Tech)',
          branch: user?.branch || 'Computer Science & Engineering',
          currentSemester: '8th Semester',
          cgpa: 0,
          standingBacklogs: 0,
          historyOfBacklogs: 0,
          tenthPercentage: '—',
          twelfthPercentage: '—',
          collegeRollNo: user?.usn || '—',
          universityRegNo: user?.usn || '—'
        },
        skills: [],
        projects: [],
        certifications: []
      }
    };
  },

  // Operational action helpers that update local state cleanly
  applyForJob: (jobId) => {
    const job = CampusLinkStore.data.jobs.find(j => j.id === jobId);
    if (job && !job.applied) {
      job.applied = true;
      job.applicationStatus = "Application Submitted";
      CampusLinkStore.data.applications.unshift({
        id: "app_" + Date.now(),
        jobId: job.id,
        company: job.company,
        role: job.title,
        ctc: job.ctc,
        appliedDate: "Just now",
        status: "Application Submitted",
        statusType: "info"
      });
      return true;
    }
    return false;
  },

  resolveConflict: (conflictId) => {
    const idx = CampusLinkStore.data.schedulerState.conflicts.findIndex(c => c.id === conflictId);
    if (idx !== -1) {
      CampusLinkStore.data.schedulerState.conflicts.splice(idx, 1);
      if (CampusLinkStore.data.schedulerState.conflicts.length === 0) {
        CampusLinkStore.data.schedulerState.hasConflict = false;
      }
      return true;
    }
    return false;
  },

  shortlistCandidate: (candidateId, shortlist = true) => {
    const cand = CampusLinkStore.data.aiMatchingPool.find(c => c.candidateId === candidateId);
    if (cand) {
      cand.shortlisted = shortlist;
      return true;
    }
    return false;
  },

  updateDocumentStatus: (docId, newStatus, remarks = "") => {
    const doc = CampusLinkStore.data.documentVerificationQueue.find(d => d.id === docId);
    if (doc) {
      doc.status = newStatus;
      if (remarks) doc.reason = remarks;
      return true;
    }
    return false;
  }
};

// Initialize immediately
CampusLinkStore.init();

window.CampusLinkStore = CampusLinkStore;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CampusLinkStore;
}
