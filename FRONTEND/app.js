/**
 * CAMPUSLINK - Master Application Controller & Router
 * Implements 100% finished, responsive SaaS views for:
 * - Landing Page & Authentication
 * - Student Portal (14 Views)
 * - Recruiter Portal (11 Views)
 * - Placement Officer Command Center (15 Views)
 * - Global Placement AI Copilot Drawer & Universal Modals
 */

const CampusLinkApp = {
  activeRole: 'student',
  currentUser: null,
  currentRoute: '#landing',
  sidebarCollapsed: false,
  selectedTargetRole: 'Full Stack Engineer',
  selectedAuthRole: 'student',
  currentTheme: 'light',

  init: () => {
    // 0. Initialize theme from localStorage or system preference
    CampusLinkApp.initTheme();

    // 1. Initialize user from storage if present
    CampusLinkApp.currentUser = CampusLinkStore.getCurrentUser();
    if (CampusLinkApp.currentUser) {
      CampusLinkApp.activeRole = CampusLinkApp.currentUser.role;
      CampusLinkStore.setRole(CampusLinkApp.currentUser.role);
    }

    // 2. Setup hash change listener for routing
    window.addEventListener('hashchange', CampusLinkApp.handleRouteChange);
    
    // 3. Initial route determination: Default to Landing Page if not signed in
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#landing') {
      window.location.hash = '#landing';
      CampusLinkApp.renderLandingPage();
    } else {
      CampusLinkApp.handleRouteChange();
    }

    // 4. Initialize Lucide icons
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 100);
  },

  // -------------------------------------------------------------
  // THEME SWITCHER (DARK / LIGHT MODE)
  // -------------------------------------------------------------
  initTheme: () => {
    const savedTheme = localStorage.getItem('campuslink_theme') || 'light';
    CampusLinkApp.setTheme(savedTheme, false);
  },

  setTheme: (theme, notify = true) => {
    CampusLinkApp.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campuslink_theme', theme);

    // Update Header Icon
    const icon = document.getElementById('header-theme-icon');
    const btn = document.getElementById('header-theme-btn');
    if (icon) {
      if (theme === 'dark') {
        icon.setAttribute('data-lucide', 'sun');
        icon.style.color = '#f59e0b';
      } else {
        icon.setAttribute('data-lucide', 'moon');
        icon.style.color = '#64748b';
      }
    }
    if (btn) {
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    // Update Landing Page Theme Toggle
    const landingIcon = document.getElementById('landing-theme-icon');
    const landingLabel = document.getElementById('landing-theme-label');
    const landingBtn = document.getElementById('landing-theme-toggle');
    if (landingIcon) {
      landingIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      landingIcon.style.color = theme === 'dark' ? '#f59e0b' : '#cbd5e1';
    }
    if (landingLabel) {
      landingLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
    if (landingBtn) {
      landingBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    // Update Auth View Theme Toggle
    const authIcon = document.getElementById('auth-theme-icon');
    const authLabel = document.getElementById('auth-theme-label');
    const authBtn = document.getElementById('auth-theme-toggle');
    if (authIcon) {
      authIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      authIcon.style.color = theme === 'dark' ? '#f59e0b' : '#cbd5e1';
    }
    if (authLabel) {
      authLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
    if (authBtn) {
      authBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    if (window.lucide) window.lucide.createIcons();

    if (notify) {
      CampusLinkApp.showToast(`Switched to ${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`, 'info');
    }

    if (window.location.hash.includes('settings')) {
      CampusLinkApp.handleRouting();
    }
  },

  toggleTheme: () => {
    const newTheme = CampusLinkApp.currentTheme === 'dark' ? 'light' : 'dark';
    CampusLinkApp.setTheme(newTheme, true);
  },

  renderThemeSelector: () => {
    const isDark = CampusLinkApp.currentTheme === 'dark';
    return `
      <h3 class="section-title" style="margin-top:24px;">Theme & Display Appearance</h3>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
        Choose between institutional Crisp Light mode or modern High-Contrast Dark mode.
      </p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:14px 0;">
        <div onclick="CampusLinkApp.setTheme('light', true)" style="border:2px solid ${!isDark ? 'var(--brand-blue)' : 'var(--border-subtle)'}; background:${!isDark ? '#ffffff' : 'var(--bg-inner-well)'}; border-radius:var(--radius-md); padding:16px; cursor:pointer; display:flex; align-items:center; gap:12px; transition:all 0.15s ease;">
          <div style="width:38px; height:38px; border-radius:50%; background:${!isDark ? '#fef3c7' : '#1e293b'}; color:#f59e0b; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="sun" style="width:20px; height:20px;"></i>
          </div>
          <div>
            <div style="font-weight:700; color:var(--navy-950); font-size:14px;">Crisp Light Mode</div>
            <div style="font-size:12px; color:var(--text-muted);">Standard institutional clarity</div>
          </div>
        </div>

        <div onclick="CampusLinkApp.setTheme('dark', true)" style="border:2px solid ${isDark ? 'var(--brand-blue)' : 'var(--border-subtle)'}; background:${isDark ? '#162032' : '#f8fafc'}; border-radius:var(--radius-md); padding:16px; cursor:pointer; display:flex; align-items:center; gap:12px; transition:all 0.15s ease;">
          <div style="width:38px; height:38px; border-radius:50%; background:${isDark ? '#1e3a8a' : '#f1f5f9'}; color:#38bdf8; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="moon" style="width:20px; height:20px;"></i>
          </div>
          <div>
            <div style="font-weight:700; color:var(--navy-950); font-size:14px;">Midnight Dark Mode</div>
            <div style="font-size:12px; color:var(--text-muted);">Enterprise sleek low-glare dark theme</div>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // ROUTING & NAVIGATION ENGINE (STRICT RBAC AUTHORIZATION)
  // -------------------------------------------------------------
  navigateTo: (route) => {
    CampusLinkApp.closeSidebar();
    window.location.hash = route;
  },

  navigateToNotifications: () => {
    if (CampusLinkApp.currentUser) {
      CampusLinkApp.navigateTo(`#${CampusLinkApp.currentUser.role}/notifications`);
    } else {
      CampusLinkApp.navigateTo('#login');
    }
  },

  markAllNotificationsRead: () => {
    const data = CampusLinkStore.get();
    if (data && data.notifications) {
      data.notifications.forEach(n => { n.unread = false; });
    }
    CampusLinkApp.renderShellLayout();
    CampusLinkApp.showToast("All notifications marked as read.", "success");
    if (CampusLinkApp.currentRoute.includes('notifications')) {
      const content = document.getElementById('app-content');
      if (content) {
        if (CampusLinkApp.activeRole === 'student') {
          content.innerHTML = CampusLinkApp.views.studentNotifications();
        } else {
          content.innerHTML = CampusLinkApp.views.officerNotifications();
        }
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  handleRouteChange: () => {
    const hash = window.location.hash || '#landing';
    CampusLinkApp.currentRoute = hash;
    CampusLinkApp.currentUser = CampusLinkStore.getCurrentUser();

    // 1. Public Landing Page
    if (hash === '' || hash === '#' || hash === '#landing') {
      CampusLinkApp.renderLandingPage();
      return;
    }

    // 2. Public Authentication Pages
    if (hash.startsWith('#auth') || hash.startsWith('#login') || hash.startsWith('#register') || hash.startsWith('#role-select')) {
      CampusLinkApp.renderAuthView(hash);
      return;
    }

    // 3. Protected Portal Routes: Authentication Check
    if (!CampusLinkApp.currentUser) {
      CampusLinkApp.showToast("Please sign in to access this portal.", "warning");
      let targetRole = 'student';
      if (hash.startsWith('#recruiter')) targetRole = 'recruiter';
      if (hash.startsWith('#officer')) targetRole = 'officer';
      window.location.hash = `#login?role=${targetRole}`;
      return;
    }

    // 4. Strict Role-Based Access Control (RBAC)
    const userRole = CampusLinkApp.currentUser.role;
    if (hash.startsWith('#student') && userRole !== 'student') {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${userRole.toUpperCase()} and cannot access the Student Portal. Please log out first.`, "danger");
      window.location.hash = `#${userRole}/dashboard`;
      return;
    }
    if (hash.startsWith('#recruiter') && userRole !== 'recruiter') {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${userRole.toUpperCase()} and cannot access the Corporate Recruiter Suite. Please log out first.`, "danger");
      window.location.hash = `#${userRole}/dashboard`;
      return;
    }
    if (hash.startsWith('#officer') && userRole !== 'officer') {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${userRole.toUpperCase()} and cannot access the Placement Officer Command Center. Please log out first.`, "danger");
      window.location.hash = `#${userRole}/dashboard`;
      return;
    }

    // 5. Render Logged-In App Shell Layout
    CampusLinkApp.activeRole = userRole;
    CampusLinkApp.renderShellLayout();

    // 6. Render targeted subview
    const content = document.getElementById('app-content');
    if (!content) return;

    // Route dispatch table
    switch (hash) {
      // Student Portal (14 Views)
      case '#student/dashboard':
        content.innerHTML = CampusLinkApp.views.studentDashboard();
        break;
      case '#student/profile':
        content.innerHTML = CampusLinkApp.views.studentProfile();
        break;
      case '#student/resume':
        content.innerHTML = CampusLinkApp.views.studentResume();
        break;
      case '#student/skills':
        content.innerHTML = CampusLinkApp.views.studentSkills();
        break;
      case '#student/assessments':
        content.innerHTML = CampusLinkApp.views.studentAssessments();
        break;
      case '#student/readiness':
        content.innerHTML = CampusLinkApp.views.studentReadiness();
        break;
      case '#student/skill-gap':
        content.innerHTML = CampusLinkApp.views.studentSkillGap();
        break;
      case '#student/jobs':
        content.innerHTML = CampusLinkApp.views.studentJobs();
        break;
      case '#student/job-details':
        content.innerHTML = CampusLinkApp.views.studentJobDetails('job_001');
        break;
      case '#student/applications':
        content.innerHTML = CampusLinkApp.views.studentApplications();
        break;
      case '#student/interviews':
        content.innerHTML = CampusLinkApp.views.studentInterviews();
        break;
      case '#student/documents':
        content.innerHTML = CampusLinkApp.views.studentDocuments();
        break;
      case '#student/offers':
        content.innerHTML = CampusLinkApp.views.studentOffers();
        break;
      case '#student/notifications':
        content.innerHTML = CampusLinkApp.views.studentNotifications();
        break;
      case '#student/settings':
        content.innerHTML = CampusLinkApp.views.studentSettings();
        break;

      // Recruiter Portal (12 Views)
      case '#recruiter/dashboard':
        content.innerHTML = CampusLinkApp.views.recruiterDashboard();
        break;
      case '#recruiter/profile':
        content.innerHTML = CampusLinkApp.views.recruiterProfile();
        break;
      case '#recruiter/jobs':
        content.innerHTML = CampusLinkApp.views.recruiterJobs();
        break;
      case '#recruiter/create-job':
        content.innerHTML = CampusLinkApp.views.recruiterCreateJob();
        break;
      case '#recruiter/candidates':
        content.innerHTML = CampusLinkApp.views.recruiterCandidates();
        break;
      case '#recruiter/ai-matching':
        content.innerHTML = CampusLinkApp.views.recruiterAIMatching();
        break;
      case '#recruiter/drives':
        content.innerHTML = CampusLinkApp.views.recruiterDrives();
        break;
      case '#recruiter/scheduler':
        content.innerHTML = CampusLinkApp.views.recruiterScheduler();
        break;
      case '#recruiter/interviews':
        content.innerHTML = CampusLinkApp.views.recruiterInterviews();
        break;
      case '#recruiter/offers':
        content.innerHTML = CampusLinkApp.views.recruiterOffers();
        break;
      case '#recruiter/analytics':
        content.innerHTML = CampusLinkApp.views.recruiterAnalytics();
        break;
      case '#recruiter/settings':
        content.innerHTML = CampusLinkApp.views.recruiterSettings();
        break;

      // Placement Officer Command Center (17 Views)
      case '#officer/dashboard':
        content.innerHTML = CampusLinkApp.views.officerDashboard();
        break;
      case '#officer/students':
        content.innerHTML = CampusLinkApp.views.officerStudents();
        break;
      case '#officer/student-details':
        content.innerHTML = CampusLinkApp.views.officerStudentDetails('std_001');
        break;
      case '#officer/recruiters':
        content.innerHTML = CampusLinkApp.views.officerRecruiters();
        break;
      case '#officer/jobs':
        content.innerHTML = CampusLinkApp.views.officerJobs();
        break;
      case '#officer/ai-matching':
        content.innerHTML = CampusLinkApp.views.officerAIMatching();
        break;
      case '#officer/drives':
        content.innerHTML = CampusLinkApp.views.officerDrives();
        break;
      case '#officer/scheduler':
        content.innerHTML = CampusLinkApp.views.officerScheduler();
        break;
      case '#officer/interviews':
        content.innerHTML = CampusLinkApp.views.officerInterviews();
        break;
      case '#officer/offers':
        content.innerHTML = CampusLinkApp.views.officerOffers();
        break;
      case '#officer/documents':
        content.innerHTML = CampusLinkApp.views.officerDocuments();
        break;
      case '#officer/analytics':
        content.innerHTML = CampusLinkApp.views.officerAnalytics();
        break;
      case '#officer/risk-prediction':
        content.innerHTML = CampusLinkApp.views.officerRiskPrediction();
        break;
      case '#officer/notifications':
        content.innerHTML = CampusLinkApp.views.officerNotifications();
        break;
      case '#officer/reports':
        content.innerHTML = CampusLinkApp.views.officerReports();
        break;
      case '#officer/audit-logs':
        content.innerHTML = CampusLinkApp.views.officerAuditLogs();
        break;
      case '#officer/settings':
        content.innerHTML = CampusLinkApp.views.officerSettings();
        break;

      default:
        // Default fallback to current role dashboard
        content.innerHTML = CampusLinkApp.views[`${CampusLinkApp.activeRole}Dashboard`] ? 
          CampusLinkApp.views[`${CampusLinkApp.activeRole}Dashboard`]() : 
          CampusLinkApp.views.studentDashboard();
        break;
    }

    // Refresh icons & scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 50);

    // Update active state in sidebar navigation
    CampusLinkApp.updateSidebarActiveState();
  },

  // -------------------------------------------------------------
  // ROLE SWITCHING & APP SHELL SYNC
  // -------------------------------------------------------------
  switchRole: (role, navigate = true) => {
    CampusLinkApp.activeRole = role;
    CampusLinkStore.setRole(role);

    // Update role switcher buttons in header
    ['student', 'recruiter', 'officer'].forEach(r => {
      const btn = document.getElementById(`btn-role-${r}`);
      if (btn) btn.classList.toggle('active', r === role);
    });

    if (navigate) {
      CampusLinkApp.navigateTo(`#${role}/dashboard`);
    } else {
      CampusLinkApp.renderShellLayout();
    }

    CampusLinkApp.showToast(`Switched to ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`, 'info');
  },

  renderShellLayout: () => {
    const data = CampusLinkStore.get();
    const roleMeta = data.roles[CampusLinkApp.activeRole];
    const user = CampusLinkApp.currentUser || data.currentUser;

    // Ensure app-shell is displayed
    const shell = document.getElementById('app-shell');
    if (shell) shell.style.display = 'flex';

    // Ensure app-header is visible
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'flex';

    // Ensure app-sidebar is enabled (closed by default)
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
      sidebar.style.display = 'flex';
      sidebar.classList.remove('open');
    }

    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('open');

    // Update Header Role Badge
    const headerBadge = document.getElementById('header-user-role-badge');
    if (headerBadge) {
      const roleName = CampusLinkApp.activeRole === 'student' ? 'Student Portal' : CampusLinkApp.activeRole === 'recruiter' ? 'Recruiter Suite' : 'Placement Officer';
      headerBadge.textContent = `${roleName} • ${user.name}`;
      headerBadge.className = `badge badge-${CampusLinkApp.activeRole === 'student' ? 'info' : CampusLinkApp.activeRole === 'recruiter' ? 'purple' : 'success'}`;
    }

    // Update Sidebar Role Badge
    const pill = document.getElementById('sidebar-role-pill');
    const pillText = document.getElementById('sidebar-role-text');
    if (pill && pillText) {
      pill.className = `role-badge-pill ${CampusLinkApp.activeRole}`;
      pillText.textContent = `${roleMeta.roleLabel} Portal`;
    }

    // Update Sidebar User Info
    const userName = document.getElementById('sidebar-user-name');
    const userTitle = document.getElementById('sidebar-user-title');
    const userAvatar = document.getElementById('sidebar-user-avatar');
    if (userName) userName.textContent = user.name || roleMeta.name;
    if (userTitle) userTitle.textContent = user.title || roleMeta.title;
    if (userAvatar) userAvatar.src = user.avatar || roleMeta.avatar;

    // Update Header Notification Badge (Unread only)
    const unreadCount = (data.notifications || []).filter(n => n.unread).length;
    const notifBadge = document.getElementById('header-notification-badge');
    if (notifBadge) {
      if (unreadCount > 0) {
        notifBadge.style.display = 'flex';
        notifBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      } else {
        notifBadge.style.display = 'none';
      }
    }

    // Render Navigation Links in Sidebar
    const navContainer = document.getElementById('sidebar-nav-container');
    if (navContainer) {
      navContainer.innerHTML = CampusLinkApp.getSidebarNavHTML(CampusLinkApp.activeRole);
    }

    // Update Breadcrumbs
    CampusLinkApp.updateBreadcrumbs();

    // Ensure theme icon reflects active theme
    const themeIcon = document.getElementById('header-theme-icon');
    if (themeIcon) {
      if (CampusLinkApp.currentTheme === 'dark') {
        themeIcon.setAttribute('data-lucide', 'sun');
        themeIcon.style.color = '#f59e0b';
      } else {
        themeIcon.setAttribute('data-lucide', 'moon');
        themeIcon.style.color = '#64748b';
      }
    }
  },

  getSidebarNavHTML: (role) => {
    const data = CampusLinkStore.get();
    const unreadCount = (data.notifications || []).filter(n => n.unread).length;

    if (role === 'student') {
      return `
        <div class="nav-group-label">Placement Hub</div>
        <div class="nav-item" data-route="#student/dashboard" onclick="CampusLinkApp.navigateTo('#student/dashboard')">
          <i data-lucide="layout-dashboard" class="nav-icon"></i>
          <span>Dashboard</span>
        </div>
        <div class="nav-item" data-route="#student/readiness" onclick="CampusLinkApp.navigateTo('#student/readiness')">
          <i data-lucide="award" class="nav-icon"></i>
          <span>Readiness Score</span>
        </div>
        <div class="nav-item" data-route="#student/skill-gap" onclick="CampusLinkApp.navigateTo('#student/skill-gap')">
          <i data-lucide="compass" class="nav-icon"></i>
          <span>Skill Gap Visualizer</span>
        </div>
        <div class="nav-item" data-route="#student/jobs" onclick="CampusLinkApp.navigateTo('#student/jobs')">
          <i data-lucide="briefcase" class="nav-icon"></i>
          <span>Recommended Jobs</span>
          <span class="nav-badge cyan">6</span>
        </div>

        <div class="nav-group-label">Career Dossier</div>
        <div class="nav-item" data-route="#student/profile" onclick="CampusLinkApp.navigateTo('#student/profile')">
          <i data-lucide="user-check" class="nav-icon"></i>
          <span>My Profile</span>
        </div>
        <div class="nav-item" data-route="#student/resume" onclick="CampusLinkApp.navigateTo('#student/resume')">
          <i data-lucide="file-text" class="nav-icon"></i>
          <span>Resume & ATS Analyzer</span>
        </div>
        <div class="nav-item" data-route="#student/skills" onclick="CampusLinkApp.navigateTo('#student/skills')">
          <i data-lucide="code-2" class="nav-icon"></i>
          <span>Skills & Projects</span>
        </div>
        <div class="nav-item" data-route="#student/assessments" onclick="CampusLinkApp.navigateTo('#student/assessments')">
          <i data-lucide="check-circle" class="nav-icon"></i>
          <span>Assessments & Mock</span>
        </div>

        <div class="nav-group-label">Track & Offers</div>
        <div class="nav-item" data-route="#student/applications" onclick="CampusLinkApp.navigateTo('#student/applications')">
          <i data-lucide="send" class="nav-icon"></i>
          <span>Applications</span>
          <span class="nav-badge">3</span>
        </div>
        <div class="nav-item" data-route="#student/interviews" onclick="CampusLinkApp.navigateTo('#student/interviews')">
          <i data-lucide="calendar" class="nav-icon"></i>
          <span>Interviews</span>
          <span class="nav-badge danger">1</span>
        </div>
        <div class="nav-item" data-route="#student/documents" onclick="CampusLinkApp.navigateTo('#student/documents')">
          <i data-lucide="folder-check" class="nav-icon"></i>
          <span>Documents</span>
        </div>
        <div class="nav-item" data-route="#student/offers" onclick="CampusLinkApp.navigateTo('#student/offers')">
          <i data-lucide="gift" class="nav-icon"></i>
          <span>Offers Deck</span>
          <span class="nav-badge success">1</span>
        </div>
        <div class="nav-item" data-route="#student/notifications" onclick="CampusLinkApp.navigateTo('#student/notifications')">
          <i data-lucide="bell" class="nav-icon"></i>
          <span>Notifications</span>
          ${unreadCount > 0 ? `<span class="nav-badge danger">${unreadCount}</span>` : ''}
        </div>
        <div class="nav-item" data-route="#student/settings" onclick="CampusLinkApp.navigateTo('#student/settings')">
          <i data-lucide="settings" class="nav-icon"></i>
          <span>Settings</span>
        </div>
      `;
    } else if (role === 'recruiter') {
      return `
        <div class="nav-group-label">Recruiter Console</div>
        <div class="nav-item" data-route="#recruiter/dashboard" onclick="CampusLinkApp.navigateTo('#recruiter/dashboard')">
          <i data-lucide="layout-dashboard" class="nav-icon"></i>
          <span>Dashboard</span>
        </div>
        <div class="nav-item" data-route="#recruiter/profile" onclick="CampusLinkApp.navigateTo('#recruiter/profile')">
          <i data-lucide="building" class="nav-icon"></i>
          <span>Company Profile</span>
        </div>
        <div class="nav-item" data-route="#recruiter/jobs" onclick="CampusLinkApp.navigateTo('#recruiter/jobs')">
          <i data-lucide="briefcase" class="nav-icon"></i>
          <span>Job Postings</span>
        </div>
        <div class="nav-item" data-route="#recruiter/create-job" onclick="CampusLinkApp.navigateTo('#recruiter/create-job')">
          <i data-lucide="plus-circle" class="nav-icon"></i>
          <span>Create Job (AI JD)</span>
        </div>

        <div class="nav-group-label">Candidate Matching</div>
        <div class="nav-item" data-route="#recruiter/ai-matching" onclick="CampusLinkApp.navigateTo('#recruiter/ai-matching')">
          <i data-lucide="sparkles" class="nav-icon" style="color:#38bdf8;"></i>
          <span>AI Matching & Ranking</span>
        </div>
        <div class="nav-item" data-route="#recruiter/candidates" onclick="CampusLinkApp.navigateTo('#recruiter/candidates')">
          <i data-lucide="users" class="nav-icon"></i>
          <span>Candidate Pool</span>
        </div>

        <div class="nav-group-label">Drives & Logistics</div>
        <div class="nav-item" data-route="#recruiter/drives" onclick="CampusLinkApp.navigateTo('#recruiter/drives')">
          <i data-lucide="calendar-range" class="nav-icon"></i>
          <span>Placement Drives</span>
        </div>
        <div class="nav-item" data-route="#recruiter/scheduler" onclick="CampusLinkApp.navigateTo('#recruiter/scheduler')">
          <i data-lucide="calendar" class="nav-icon"></i>
          <span>Scheduler & Conflicts</span>
          <span class="nav-badge danger">1</span>
        </div>
        <div class="nav-item" data-route="#recruiter/interviews" onclick="CampusLinkApp.navigateTo('#recruiter/interviews')">
          <i data-lucide="video" class="nav-icon"></i>
          <span>Interviews Loop</span>
          <span class="nav-badge">4</span>
        </div>
        <div class="nav-item" data-route="#recruiter/offers" onclick="CampusLinkApp.navigateTo('#recruiter/offers')">
          <i data-lucide="file-check" class="nav-icon"></i>
          <span>Offers Management</span>
          <span class="nav-badge success">1</span>
        </div>
        <div class="nav-item" data-route="#recruiter/analytics" onclick="CampusLinkApp.navigateTo('#recruiter/analytics')">
          <i data-lucide="bar-chart-3" class="nav-icon"></i>
          <span>Hiring Analytics</span>
        </div>
        <div class="nav-item" data-route="#recruiter/settings" onclick="CampusLinkApp.navigateTo('#recruiter/settings')">
          <i data-lucide="settings" class="nav-icon"></i>
          <span>Settings</span>
        </div>
      `;
    } else {
      return `
        <div class="nav-group-label">Executive Command</div>
        <div class="nav-item" data-route="#officer/dashboard" onclick="CampusLinkApp.navigateTo('#officer/dashboard')">
          <i data-lucide="shield" class="nav-icon" style="color:#10b981;"></i>
          <span>Command Center</span>
        </div>
        <div class="nav-item" data-route="#officer/risk-prediction" onclick="CampusLinkApp.navigateTo('#officer/risk-prediction')">
          <i data-lucide="alert-triangle" class="nav-icon" style="color:#ef4444;"></i>
          <span>AI Risk Prediction</span>
          <span class="nav-badge danger">48</span>
        </div>
        <div class="nav-item" data-route="#officer/analytics" onclick="CampusLinkApp.navigateTo('#officer/analytics')">
          <i data-lucide="pie-chart" class="nav-icon"></i>
          <span>Branch Analytics</span>
        </div>

        <div class="nav-group-label">Institutional Management</div>
        <div class="nav-item" data-route="#officer/students" onclick="CampusLinkApp.navigateTo('#officer/students')">
          <i data-lucide="graduation-cap" class="nav-icon"></i>
          <span>Student Directory</span>
        </div>
        <div class="nav-item" data-route="#officer/recruiters" onclick="CampusLinkApp.navigateTo('#officer/recruiters')">
          <i data-lucide="building-2" class="nav-icon"></i>
          <span>Recruiter Directory</span>
        </div>
        <div class="nav-item" data-route="#officer/jobs" onclick="CampusLinkApp.navigateTo('#officer/jobs')">
          <i data-lucide="briefcase" class="nav-icon"></i>
          <span>All Campus Jobs</span>
        </div>
        <div class="nav-item" data-route="#officer/documents" onclick="CampusLinkApp.navigateTo('#officer/documents')">
          <i data-lucide="folder-check" class="nav-icon"></i>
          <span>Document Verification</span>
          <span class="nav-badge warning">2</span>
        </div>

        <div class="nav-group-label">Logistics & Compliance</div>
        <div class="nav-item" data-route="#officer/drives" onclick="CampusLinkApp.navigateTo('#officer/drives')">
          <i data-lucide="calendar-range" class="nav-icon"></i>
          <span>Master Drives</span>
        </div>
        <div class="nav-item" data-route="#officer/scheduler" onclick="CampusLinkApp.navigateTo('#officer/scheduler')">
          <i data-lucide="calendar" class="nav-icon"></i>
          <span>Conflict Scheduler</span>
          <span class="nav-badge danger">1</span>
        </div>
        <div class="nav-item" data-route="#officer/offers" onclick="CampusLinkApp.navigateTo('#officer/offers')">
          <i data-lucide="gift" class="nav-icon"></i>
          <span>Master Offers Hub</span>
        </div>
        <div class="nav-item" data-route="#officer/notifications" onclick="CampusLinkApp.navigateTo('#officer/notifications')">
          <i data-lucide="megaphone" class="nav-icon"></i>
          <span>Broadcast Center</span>
          ${unreadCount > 0 ? `<span class="nav-badge danger">${unreadCount}</span>` : ''}
        </div>
        <div class="nav-item" data-route="#officer/reports" onclick="CampusLinkApp.navigateTo('#officer/reports')">
          <i data-lucide="file-spreadsheet" class="nav-icon"></i>
          <span>NAAC / NIRF Reports</span>
        </div>
        <div class="nav-item" data-route="#officer/audit-logs" onclick="CampusLinkApp.navigateTo('#officer/audit-logs')">
          <i data-lucide="activity" class="nav-icon"></i>
          <span>Audit Logs</span>
        </div>
        <div class="nav-item" data-route="#officer/settings" onclick="CampusLinkApp.navigateTo('#officer/settings')">
          <i data-lucide="settings" class="nav-icon"></i>
          <span>Institutional Settings</span>
        </div>
      `;
    }
  },

  updateSidebarActiveState: () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const targetRoute = item.getAttribute('data-route');
      if (targetRoute === CampusLinkApp.currentRoute) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  updateBreadcrumbs: () => {
    const el = document.getElementById('header-breadcrumbs');
    if (!el) return;

    const parts = CampusLinkApp.currentRoute.replace('#', '').split('/');
    const portalName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Portal';
    const viewName = parts[1] ? parts[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Dashboard';

    el.innerHTML = `
      <span onclick="CampusLinkApp.navigateTo('#${parts[0]}/dashboard')" style="cursor:pointer;">${portalName}</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">${viewName}</span>
    `;
  },

  toggleSidebar: () => {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) {
      const isOpen = sidebar.classList.contains('open');
      sidebar.classList.toggle('open', !isOpen);
      if (backdrop) backdrop.classList.toggle('open', !isOpen);
    }
  },

  closeSidebar: () => {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  },

  handleLogout: () => {
    CampusLinkStore.logout();
    CampusLinkApp.currentUser = null;
    CampusLinkApp.closeSidebar();
    CampusLinkApp.showToast("You have been securely logged out.", "info");
    window.location.hash = '#landing';
  },

  // -------------------------------------------------------------
  // TOAST NOTIFICATION UTILITY
  // -------------------------------------------------------------
  showToast: (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let iconName = 'info';
    let iconColor = '#2563eb';
    if (type === 'success') { iconName = 'check-circle-2'; iconColor = '#10b981'; }
    if (type === 'warning') { iconName = 'alert-triangle'; iconColor = '#f59e0b'; }
    if (type === 'danger') { iconName = 'alert-octagon'; iconColor = '#ef4444'; }

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:20px; height:20px; color:${iconColor}; flex-shrink:0;"></i>
      <div style="font-weight:500; font-size:13.5px; color:#0f172a;">${message}</div>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // -------------------------------------------------------------
  // GLOBAL SEARCH HANDLER
  // -------------------------------------------------------------
  handleGlobalSearch: (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (e.key === 'Enter' && query) {
      if (query.includes('google') || query.includes('job') || query.includes('sde')) {
        CampusLinkApp.navigateTo('#student/jobs');
      } else if (query.includes('risk') || query.includes('predict')) {
        CampusLinkApp.navigateTo('#officer/risk-prediction');
      } else if (query.includes('aarav') || query.includes('student')) {
        CampusLinkApp.navigateTo('#officer/students');
      } else {
        CampusLinkApp.showToast(`Search results found for "${query}"`, 'info');
      }
    }
  },

  // -------------------------------------------------------------
  // GLOBAL AI ASSISTANT DRAWER CONTROLLER
  // -------------------------------------------------------------
  toggleAIAssistant: () => {
    const drawer = document.getElementById('ai-assistant-drawer');
    if (drawer) drawer.classList.toggle('open');
  },

  openAIAssistant: (presetQuery = '') => {
    const drawer = document.getElementById('ai-assistant-drawer');
    if (drawer) {
      drawer.classList.add('open');
      if (presetQuery) {
        CampusLinkApp.sendCannedAIChat(presetQuery);
      }
    }
  },

  sendCannedAIChat: (question) => {
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.value = question;
      CampusLinkApp.handleAIChatSubmit(new Event('submit'));
    }
  },

  handleAIChatSubmit: (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('ai-chat-input');
    const container = document.getElementById('ai-chat-messages');
    if (!input || !container) return;

    const userText = input.value.trim();
    if (!userText) return;

    // Append User Message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = userText;
    container.appendChild(userBubble);
    input.value = '';

    // Scroll chat down
    container.scrollTop = container.scrollHeight;

    // Simulate AI Response
    setTimeout(() => {
      let aiResponse = "CampusLink AI analyzed your query against our institutional knowledge graph.";
      const lower = userText.toLowerCase();

      if (lower.includes('system design') || lower.includes('google')) {
        aiResponse = "To optimize your Google L3 Readiness, focus on distributed rate limiters and cache invalidation strategies. Your DSA score is 90/100 (top 2%), so 12 hours of system design exercises will boost your readiness score past 92/100.";
      } else if (lower.includes('skill gap') || lower.includes('sde')) {
        aiResponse = "For Full Stack SDE-1, you hold an 89% profile match. Critical missing components: gRPC and Kubernetes deployment manifests. Completing the AWS microservices module will bridge this gap in ~1 week.";
      } else if (lower.includes('conflict')) {
        aiResponse = "Detected a double-booking conflict on Oct 08 between Microsoft IDC and Amazon Dev Center. The AI Scheduler recommends shifting Amazon Round 2 to the 02:30 PM slot, resolving all 6 top candidate overlaps.";
      } else if (lower.includes('risk')) {
        aiResponse = "Currently, 48 students are flagged in the At-Risk tier, predominantly driven by aptitude thresholds (<60%) and zero verified projects. Remedial bootcamps are ready for assignment.";
      }

      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'chat-bubble assistant';
      assistantBubble.innerHTML = `<strong>CampusLink AI:</strong> ${aiResponse}`;
      container.appendChild(assistantBubble);
      container.scrollTop = container.scrollHeight;
    }, 600);
  },

  // -------------------------------------------------------------
  // UNIVERSAL MODAL SYSTEM
  // -------------------------------------------------------------
  openModal: (contentHTML) => {
    const modal = document.getElementById('universal-modal');
    const modalContent = document.getElementById('universal-modal-content');
    if (modal && modalContent) {
      modalContent.innerHTML = contentHTML;
      modal.classList.add('open');
      if (window.lucide) window.lucide.createIcons();
    }
  },

  closeModal: () => {
    const modal = document.getElementById('universal-modal');
    if (modal) modal.classList.remove('open');
  },

  // -------------------------------------------------------------
  // INTERACTIVE WORKFLOW MODAL ACTIONS
  // -------------------------------------------------------------
  showWhyNotShortlistedModal: (candidateId) => {
    const cand = CampusLinkStore.get().aiMatchingPool.find(c => c.candidateId === candidateId);
    if (!cand || !cand.whyNotShortlisted) {
      CampusLinkApp.showToast("Candidate meets standard screening thresholds.", "info");
      return;
    }
    const reason = cand.whyNotShortlisted;

    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="alert-octagon" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">AI Explainability: Screening Audit</div>
            <div style="font-size:12px; color:var(--text-muted);">${cand.name} (${cand.branch} • CGPA ${cand.cgpa})</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:var(--radius-md); padding:14px; margin-bottom:18px;">
          <div style="font-weight:700; color:#991b1b; font-size:13.5px; margin-bottom:4px;">Primary Rejection Factor:</div>
          <div style="color:#7f1d1d; font-size:13px;">${reason.mainReason}</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px;">
          <div class="card" style="padding:16px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Eligibility Status</div>
            <div style="font-weight:700; color:#dc2626; margin-top:4px;">${reason.eligibilityStatus}</div>
          </div>
          <div class="card" style="padding:16px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Assessment Score</div>
            <div style="font-weight:700; color:#dc2626; margin-top:4px;">${reason.assessmentIssues}</div>
          </div>
        </div>

        <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Detected Skill Gaps:</div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:18px;">
          ${reason.skillGaps.map(g => `
            <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:#475569;">
              <i data-lucide="x-circle" style="width:15px; height:15px; color:#ef4444;"></i>
              <span>${g}</span>
            </div>
          `).join('')}
        </div>

        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:14px;">
          <div style="font-weight:700; color:#1e40af; font-size:13px; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="sparkles" style="width:15px; height:15px; color:#2563eb;"></i>
            <span>AI Corrective Intervention</span>
          </div>
          <div style="font-size:12.5px; color:#1e3a8a;">${reason.aiIntervention}</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Candidate notified of recommended remedial track.', 'success'); CampusLinkApp.closeModal();">Assign Remedial Track</button>
      </div>
    `;

    CampusLinkApp.openModal(html);
  },

  showConflictResolutionModal: (conflictId) => {
    const conflict = CampusLinkStore.get().schedulerState.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="alert-triangle" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">AI Drive Conflict Resolution</div>
            <div style="font-size:12px; color:var(--text-muted);">${conflict.type}</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:var(--radius-md); padding:16px; margin-bottom:18px;">
          <div style="font-weight:700; color:#991b1b; font-size:14px; margin-bottom:6px;">${conflict.title}</div>
          <div style="font-size:13px; color:#7f1d1d; line-height:1.5;">${conflict.description}</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px;">
          <div class="card" style="padding:16px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Overlapping Drives</div>
            <div style="margin-top:6px; font-size:13px; font-weight:600; color:var(--navy-900);">
              ${conflict.conflictingDrives.join('<br>')}
            </div>
          </div>
          <div class="card" style="padding:16px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Impacted Students</div>
            <div style="margin-top:6px; font-size:12.5px; color:#475569;">
              ${conflict.conflictingStudents.join('<br>')}
            </div>
          </div>
        </div>

        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:var(--radius-md); padding:16px;">
          <div style="display:flex; align-items:center; gap:8px; font-weight:700; color:#065f46; font-size:14px; margin-bottom:6px;">
            <i data-lucide="sparkles" style="width:16px; height:16px; color:#10b981;"></i>
            <span>CampusLink AI Recommended Optimization</span>
          </div>
          <div style="font-size:13px; color:#047857; line-height:1.5;">${conflict.aiSuggestedResolution}</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Dismiss</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.applyConflictResolution('${conflict.id}')">
          <i data-lucide="check" style="width:16px; height:16px;"></i>
          <span>Apply 1-Click AI Fix</span>
        </button>
      </div>
    `;

    CampusLinkApp.openModal(html);
  },

  applyConflictResolution: (conflictId) => {
    CampusLinkStore.resolveConflict(conflictId);
    CampusLinkApp.closeModal();
    CampusLinkApp.showToast("Conflict successfully resolved! Master schedule re-aligned.", "success");
    CampusLinkApp.handleRouteChange();
  },

  showAIJobAnalysisModal: () => {
    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="sparkles" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">AI Job Description Requirement Extractor</div>
            <div style="font-size:12px; color:var(--text-muted);">Parses raw JD into structured institutional eligibility rules</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="margin-bottom:16px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Paste Raw Corporate Job Description</label>
          <textarea id="ai-jd-raw-text" style="width:100%; height:120px; margin-top:6px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); padding:12px; font-size:13px; font-family:inherit;" placeholder="Paste job requirements here... (e.g. 'We are hiring SDE-1 for Cloud. Must have min 8.0 CGPA, B.Tech CSE/IT, strong Java/Python, Kafka and distributed systems...')">We are hiring early career Software Development Engineers (SDE-1) for our Bangalore Cloud Core engineering team. The ideal candidate must have a minimum of 8.0 CGPA from B.Tech CSE, IT, or ECE. Strong expertise in Data Structures, Algorithms, Python, Distributed Systems, and REST APIs is required. Experience with Docker, Kubernetes, and Kafka is highly preferred.</textarea>
        </div>

        <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
          <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px;">Extracted Structured Schema</div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div>
              <span style="font-size:11px; color:var(--text-muted);">Extracted Minimum CGPA:</span>
              <div style="font-weight:700; color:var(--navy-900);">8.00 Cutoff</div>
            </div>
            <div>
              <span style="font-size:11px; color:var(--text-muted);">Allowed Branches:</span>
              <div style="font-weight:700; color:var(--navy-900);">CSE, IT, ECE</div>
            </div>
          </div>

          <div style="margin-bottom:10px;">
            <span style="font-size:11px; color:var(--text-muted);">Mandatory Required Skills:</span>
            <div class="skill-pill-container" style="margin-top:4px;">
              <span class="skill-tag-matched">Data Structures & Algorithms</span>
              <span class="skill-tag-matched">Python</span>
              <span class="skill-tag-matched">Distributed Systems</span>
              <span class="skill-tag-matched">REST APIs</span>
            </div>
          </div>

          <div>
            <span style="font-size:11px; color:var(--text-muted);">Preferred / Bonus Skills:</span>
            <div class="skill-pill-container" style="margin-top:4px;">
              <span class="badge badge-purple">Docker</span>
              <span class="badge badge-purple">Kubernetes</span>
              <span class="badge badge-purple">Kafka</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Cancel</button>
        <button class="btn btn-ai" onclick="CampusLinkApp.showToast('Requirements automatically mapped to Create Job form!', 'success'); CampusLinkApp.closeModal();">
          <i data-lucide="check" style="width:16px; height:16px;"></i>
          <span>Apply Extracted Requirements</span>
        </button>
      </div>
    `;

    CampusLinkApp.openModal(html);
  },

  showAssessmentModal: (assessmentId) => {
    const as = CampusLinkStore.get().assessments.find(a => a.id === assessmentId) || CampusLinkStore.get().assessments[0];

    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="check-circle" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">${as.title}</div>
            <div style="font-size:12px; color:var(--text-muted);">${as.category} • ${as.duration} • ${as.questionsCount} Questions</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; margin-bottom:18px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Assessment Syllabus</div>
          <div style="font-size:13px; color:var(--text-main);">${as.syllabus}</div>
        </div>

        <div style="font-weight:700; font-size:14.5px; color:var(--navy-900); margin-bottom:12px;">Sample Live Question (1 of 30):</div>
        <div style="background:#ffffff; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; margin-bottom:18px;">
          <div style="font-size:13.5px; line-height:1.5; color:var(--text-main); margin-bottom:14px;">
            In a distributed database cluster using consistent hashing with virtual nodes, what is the primary benefit of increasing the number of virtual nodes per physical server?
          </div>
          
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; font-size:13px; padding:10px; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); cursor:pointer;">
              <input type="radio" name="sample_q" value="A">
              <span>Eliminates network latency across database shards.</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; font-size:13px; padding:10px; border:1px solid var(--brand-blue); background:#eff6ff; border-radius:var(--radius-sm); cursor:pointer;">
              <input type="radio" name="sample_q" value="B" checked>
              <span style="font-weight:600; color:#1e40af;">Provides uniform key distribution and prevents hot-spot skewing.</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; font-size:13px; padding:10px; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); cursor:pointer;">
              <input type="radio" name="sample_q" value="C">
              <span>Automatically converts multi-master replication to single-leader.</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Exit Assessment</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.submitMockAssessment('${as.id}')">
          <i data-lucide="send" style="width:16px; height:16px;"></i>
          <span>Submit & Calculate Readiness</span>
        </button>
      </div>
    `;

    CampusLinkApp.openModal(html);
  },

  submitMockAssessment: (assessmentId) => {
    const as = CampusLinkStore.get().assessments.find(a => a.id === assessmentId);
    if (as) {
      as.status = "Completed";
      as.score = 92;
      as.percentile = "97th Percentile";
      as.lastAttempt = "Just now";
    }
    CampusLinkApp.closeModal();
    CampusLinkApp.showToast("Assessment evaluated: 92/100 (97th Percentile)! Campus readiness score updated.", "success");
    CampusLinkApp.handleRouteChange();
  },

  showWhyMatchedModal: (candidateId) => {
    const cand = CampusLinkStore.get().aiMatchingPool.find(c => c.candidateId === candidateId) || CampusLinkStore.get().aiMatchingPool[0];
    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="sparkles" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">AI Match Explainability Breakdown</div>
            <div style="font-size:12px; color:var(--text-muted);">${cand.name} • ${cand.branch} (CGPA: ${cand.cgpa})</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:16px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:12px; font-weight:700; color:#1e40af; text-transform:uppercase;">Composite Match Score</div>
            <div style="font-size:32px; font-weight:900; color:#1e3a8a;">${cand.aiMatchScore}%</div>
          </div>
          <span class="badge badge-success" style="font-size:13px; padding:6px 12px;">Top 2% Recommended</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px;">
          <div class="card" style="padding:14px; background:#f8fafc;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Skill Compatibility</div>
            <div style="font-size:18px; font-weight:800; color:var(--navy-900); margin-top:2px;">${cand.skillMatch}%</div>
            <div style="font-size:11.5px; color:#10b981; margin-top:2px;">All core languages matched</div>
          </div>
          <div class="card" style="padding:14px; background:#f8fafc;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Academic Standing</div>
            <div style="font-size:18px; font-weight:800; color:var(--navy-900); margin-top:2px;">${cand.academicFit}%</div>
            <div style="font-size:11.5px; color:#10b981; margin-top:2px;">Exceeds 8.00 cutoff (${cand.cgpa})</div>
          </div>
          <div class="card" style="padding:14px; background:#f8fafc;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Project Rigor</div>
            <div style="font-size:18px; font-weight:800; color:var(--navy-900); margin-top:2px;">${cand.projectRelevance}%</div>
            <div style="font-size:11.5px; color:#2563eb; margin-top:2px;">Distributed systems repository</div>
          </div>
          <div class="card" style="padding:14px; background:#f8fafc;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Interview Consistency</div>
            <div style="font-size:18px; font-weight:800; color:var(--navy-900); margin-top:2px;">${cand.interviewScore}%</div>
            <div style="font-size:11.5px; color:#10b981; margin-top:2px;">DSA 92/100 percentile</div>
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Matched Candidate Skills:</div>
          <div class="skill-pill-container">
            ${cand.matchedSkills.map(s => `<span class="skill-tag-matched"><i data-lucide="check" style="width:12px; height:12px;"></i> ${s}</span>`).join('')}
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px;">
          <div style="font-size:12px; font-weight:700; color:var(--navy-900); margin-bottom:4px;">Institutional Match Summary</div>
          <p style="font-size:12.5px; color:var(--text-main); line-height:1.5; margin:0;">${cand.explanation}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="CampusLinkStore.shortlistCandidate('${cand.candidateId}', true); CampusLinkApp.closeModal(); CampusLinkApp.showToast('${cand.name} shortlisted for interviews!', 'success'); CampusLinkApp.handleRouteChange();">
          <i data-lucide="user-check" style="width:15px; height:15px;"></i>
          <span>Confirm Shortlist</span>
        </button>
      </div>
    `;
    CampusLinkApp.openModal(html);
  },

  showAddSkillModal: () => {
    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="plus-circle" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">Add Technical Skill</div>
            <div style="font-size:12px; color:var(--text-muted);">Add certified proficiency to your institutional profile</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Skill Name</label>
            <input type="text" id="new-skill-name" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="e.g. Kubernetes, Rust, GraphQL" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Category</label>
              <select id="new-skill-category" class="table-select" style="width:100%; margin-top:4px;">
                <option value="Languages">Languages</option>
                <option value="Frameworks">Frameworks</option>
                <option value="Databases">Databases</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Algorithms">Algorithms</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Proficiency Level</label>
              <select id="new-skill-level" class="table-select" style="width:100%; margin-top:4px;">
                <option value="Advanced">Advanced (85%+)</option>
                <option value="Intermediate">Intermediate (70-84%)</option>
                <option value="Proficient">Proficient (60-69%)</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Estimated Score (0 - 100)</label>
            <input type="number" id="new-skill-score" class="table-search-input" style="width:100%; margin-top:4px;" min="1" max="100" value="85">
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.saveNewSkill()">
          <i data-lucide="check" style="width:15px; height:15px;"></i>
          <span>Save Skill to Dossier</span>
        </button>
      </div>
    `;
    CampusLinkApp.openModal(html);
  },

  saveNewSkill: () => {
    const name = document.getElementById('new-skill-name')?.value.trim();
    const category = document.getElementById('new-skill-category')?.value || 'Languages';
    const level = document.getElementById('new-skill-level')?.value || 'Intermediate';
    const score = parseInt(document.getElementById('new-skill-score')?.value) || 80;

    if (!name) {
      CampusLinkApp.showToast("Please enter a skill name.", "warning");
      return;
    }

    const data = CampusLinkStore.get();
    data.studentProfile.skills.unshift({
      name,
      category,
      level,
      score,
      verified: true
    });

    CampusLinkApp.closeModal();
    CampusLinkApp.showToast(`Skill "${name}" added and verified!`, "success");
    CampusLinkApp.handleRouteChange();
  },

  showAddProjectModal: () => {
    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="folder-plus" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">Add Technical Project</div>
            <div style="font-size:12px; color:var(--text-muted);">Showcase production code for corporate recruiters</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Project Title</label>
            <input type="text" id="new-proj-title" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="e.g. Distributed Key-Value Store" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Domain / Specialty</label>
              <input type="text" id="new-proj-domain" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="e.g. Distributed Systems, AI">
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Duration</label>
              <input type="text" id="new-proj-duration" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="e.g. 3 Months">
            </div>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Tech Stack (comma-separated)</label>
            <input type="text" id="new-proj-tech" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="e.g. Go, Raft, Docker, gRPC">
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Project Description</label>
            <textarea id="new-proj-desc" class="table-search-input" style="width:100%; height:80px; padding:10px; margin-top:4px; font-family:inherit;" placeholder="Describe architectural challenges solved, scalability benchmarks, and features..."></textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">GitHub URL</label>
              <input type="text" id="new-proj-github" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="https://github.com/...">
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Live Demo Link</label>
              <input type="text" id="new-proj-live" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="https://...">
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.saveNewProject()">
          <i data-lucide="check" style="width:15px; height:15px;"></i>
          <span>Add to Portfolio</span>
        </button>
      </div>
    `;
    CampusLinkApp.openModal(html);
  },

  saveNewProject: () => {
    const title = document.getElementById('new-proj-title')?.value.trim();
    const domain = document.getElementById('new-proj-domain')?.value.trim() || 'Software Engineering';
    const duration = document.getElementById('new-proj-duration')?.value.trim() || '2 Months';
    const tech = (document.getElementById('new-proj-tech')?.value || 'Node.js, React').split(',').map(s => s.trim()).filter(Boolean);
    const desc = document.getElementById('new-proj-desc')?.value.trim() || 'Full-featured web application.';
    const githubUrl = document.getElementById('new-proj-github')?.value.trim() || 'https://github.com';
    const liveUrl = document.getElementById('new-proj-live')?.value.trim() || '';

    if (!title) {
      CampusLinkApp.showToast("Please enter project title.", "warning");
      return;
    }

    const data = CampusLinkStore.get();
    data.studentProfile.projects.unshift({
      id: "proj_" + Date.now(),
      title,
      domain,
      duration,
      techStack: tech,
      description: desc,
      githubUrl,
      liveUrl,
      featured: true
    });

    CampusLinkApp.closeModal();
    CampusLinkApp.showToast(`Project "${title}" published to portfolio!`, "success");
    CampusLinkApp.handleRouteChange();
  },

  showAssignMentorModal: (studentId = 'std_005') => {
    const student = CampusLinkStore.get().studentsDirectory.find(s => s.id === studentId) || { name: 'Tanvi Saxena', branch: 'CSE', usn: '1CL22CS110' };
    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#fef3c7; color:#d97706; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="user-plus" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">Assign Remedial Faculty Mentor</div>
            <div style="font-size:12px; color:var(--text-muted);">${student.name} (${student.usn}) • ${student.branch}</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:var(--radius-md); padding:14px; margin-bottom:16px;">
          <div style="font-size:13px; font-weight:700; color:#92400e;">Institutional Intervention Protocol</div>
          <div style="font-size:12.5px; color:#b45309; margin-top:2px;">Mentor will conduct bi-weekly mock coding assessments and track resume ATS progress prior to upcoming campus drives.</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Select Faculty Mentor</label>
            <select id="mentor-select" class="table-select" style="width:100%; margin-top:4px;">
              <option value="Dr. Arvind Kulkarni">Dr. Arvind Kulkarni (Associate Professor, Dept. of CSE)</option>
              <option value="Prof. Meenakshi Sundaram">Prof. Meenakshi Sundaram (Lead, Algorithms & AI Lab)</option>
              <option value="Dr. Rajeshwari Hegde">Dr. Rajeshwari Hegde (Head of Student Career Development)</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Remedial Track Focus</label>
            <select class="table-select" style="width:100%; margin-top:4px;">
              <option>Data Structures & Algorithmic Problem Solving</option>
              <option>Full Stack System Design & Git Production Repos</option>
              <option>Verbal Aptitude & Behavioral Interview Coaching</option>
            </select>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Dismiss</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.confirmMentorAssignment('${student.name}')">
          <i data-lucide="check" style="width:15px; height:15px;"></i>
          <span>Confirm Assignment</span>
        </button>
      </div>
    `;
    CampusLinkApp.openModal(html);
  },

  confirmMentorAssignment: (studentName) => {
    const mentorName = document.getElementById('mentor-select')?.value || 'Faculty Mentor';
    CampusLinkApp.closeModal();
    CampusLinkApp.showToast(`Faculty mentor ${mentorName} assigned to ${studentName}. Automated email alert dispatched.`, "success");
  },

  showReportExportModal: (reportType = 'NIRF Placement Metrics') => {
    const html = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#ecfdf5; color:#10b981; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="file-spreadsheet" style="width:18px; height:18px;"></i>
          </div>
          <div>
            <div class="modal-title">Export Institutional Accreditation Dossier</div>
            <div style="font-size:12px; color:var(--text-muted);">${reportType} • Academic Year 2025-26</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body">
        <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Dossier Parameters Included:</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12.5px; color:var(--navy-900);">
            <div>✓ Total Graduating Strength (680)</div>
            <div>✓ Verified Placed Students (412)</div>
            <div>✓ Median Salary Realized (₹12.2 LPA)</div>
            <div>✓ Super Dream Offers > ₹20 LPA (72)</div>
            <div>✓ Total Corporate Recruiters (84)</div>
            <div>✓ Gender-wise Placement Parity</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Select Export Format</label>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
            <label style="display:flex; align-items:center; gap:8px; padding:10px; border:1px solid var(--brand-blue); background:#eff6ff; border-radius:var(--radius-sm); cursor:pointer; font-size:13px; font-weight:600; color:var(--brand-blue);">
              <input type="radio" name="export_fmt" checked> PDF Dossier
            </label>
            <label style="display:flex; align-items:center; gap:8px; padding:10px; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); cursor:pointer; font-size:13px;">
              <input type="radio" name="export_fmt"> Excel (.xlsx)
            </label>
            <label style="display:flex; align-items:center; gap:8px; padding:10px; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); cursor:pointer; font-size:13px;">
              <input type="radio" name="export_fmt"> CSV Raw Data
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="CampusLinkApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="CampusLinkApp.closeModal(); CampusLinkApp.showToast('Accreditation report generated and downloaded successfully!', 'success');">
          <i data-lucide="download" style="width:15px; height:15px;"></i>
          <span>Download Certified File</span>
        </button>
      </div>
    `;
    CampusLinkApp.openModal(html);
  },

  // -------------------------------------------------------------
  // LANDING PAGE & AUTH RENDERERS
  // -------------------------------------------------------------
  renderLandingPage: () => {
    const shell = document.getElementById('app-shell');
    if (shell) shell.style.display = 'block';

    const content = document.getElementById('app-content');
    if (!content) return;

    // Hide sidebar and internal header for public landing page
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'none';
    const main = document.getElementById('app-main');
    if (main) main.style.marginLeft = '0';

    content.innerHTML = `
      <div style="margin:-32px -40px;">
        <!-- GOVERNMENT / INSTITUTIONAL TOP ACCENT STRIP -->
        <div class="govt-top-strip"></div>

        <!-- PUBLIC TOP NAVBAR -->
        <nav class="landing-top-navbar">
          <div class="landing-nav-brand">
            <img src="assets/campuslink_logo.png" alt="CampusLink Logo" class="landing-nav-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
            <div>
              <div class="landing-nav-title">CAMPUSLINK</div>
              <div class="landing-nav-subtitle">Centralized Placement & Career Intelligence Portal</div>
            </div>
          </div>

          <div class="landing-nav-links">
            <a href="#landing" class="landing-nav-link" style="color:white; font-weight:700;">Home</a>
            <a href="#features-section" class="landing-nav-link">Platform Capabilities</a>
            <a href="#portals-section" class="landing-nav-link">Portals</a>
            <a href="#compliance-section" class="landing-nav-link">NIRF / NAAC Data</a>
          </div>

          <div class="landing-nav-actions">
            <button id="landing-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode">
              <i id="landing-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:14px; height:14px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
              <span id="landing-theme-label" class="landing-theme-label">${CampusLinkApp.currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#login')" style="color:white; border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.08);">
              <i data-lucide="log-in" style="width:14px; height:14px;"></i>
              <span>Sign In</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#register')">
              <i data-lucide="user-plus" style="width:14px; height:14px;"></i>
              <span>Register</span>
            </button>
          </div>
        </nav>

        <!-- HERO SECTION -->
        <section class="landing-hero">
          <div class="landing-hero-tag">
            <i data-lucide="shield-check" style="width:15px; height:15px;"></i>
            <span>Institutional Placement Operating System</span>
          </div>
          <h1 class="landing-hero-title">Campus to Corporate, Powered by Unified AI</h1>
          <p class="landing-hero-subtitle">
            CAMPUSLINK unifies students, corporate recruiters, and institutional placement cells into a single, high-trust ecosystem for automated skill gap analysis, conflict-free scheduling, and NIRF-grade institutional analytics.
          </p>
          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; align-items:center;">
            <button class="btn btn-primary btn-lg" onclick="CampusLinkApp.navigateTo('#login')" style="padding:14px 28px; font-size:15px;">
              <i data-lucide="log-in" style="width:18px; height:18px;"></i>
              <span>Sign In to Your Portal</span>
            </button>
            <button class="btn btn-secondary btn-lg" onclick="CampusLinkApp.navigateTo('#register')" style="padding:14px 28px; font-size:15px; background:rgba(255,255,255,0.1); color:white; border-color:rgba(255,255,255,0.3);">
              <i data-lucide="user-plus" style="width:18px; height:18px;"></i>
              <span>New User Registration</span>
            </button>
          </div>
        </section>

        <!-- 3 ROLE GATEWAY CARDS -->
        <div class="landing-role-cards" id="portals-section">
          <!-- Student Card -->
          <div class="role-entry-card role-card-student">
            <div class="role-card-icon student">
              <i data-lucide="graduation-cap" style="width:24px; height:24px;"></i>
            </div>
            <h3 class="role-card-title">Student Career Portal</h3>
            <p class="role-card-desc">
              Access 0–100 Readiness scores, interactive skill gap visualizations, AI ATS resume audits, Tier-1 job matching, and multi-stage application tracking.
            </p>
            <button class="btn btn-role-student" onclick="CampusLinkApp.navigateTo('#login?role=student')">
              <span>Sign In as Student</span>
              <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
            </button>
          </div>

          <!-- Recruiter Card -->
          <div class="role-entry-card role-card-recruiter">
            <div class="role-card-icon recruiter">
              <i data-lucide="building-2" style="width:24px; height:24px;"></i>
            </div>
            <h3 class="role-card-title">Corporate Recruiter Suite</h3>
            <p class="role-card-desc">
              AI requirement extraction from raw JDs, multi-vector candidate ranking, "Why Not Shortlisted" explainability engine, and conflict-free interview loops.
            </p>
            <button class="btn btn-role-recruiter" onclick="CampusLinkApp.navigateTo('#login?role=recruiter')">
              <span>Sign In as Recruiter</span>
              <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
            </button>
          </div>

          <!-- Officer Card -->
          <div class="role-entry-card role-card-officer">
            <div class="role-card-icon officer">
              <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
            </div>
            <h3 class="role-card-title">Placement Command Center</h3>
            <p class="role-card-desc">
              Executive placement dashboard with live conversion metrics, predictive AI risk flagging for at-risk cohorts, document verification desks, and NAAC/NIRF audit exports.
            </p>
            <button class="btn btn-role-officer" onclick="CampusLinkApp.navigateTo('#login?role=officer')">
              <span>Sign In as Officer</span>
              <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
            </button>
          </div>
        </div>

        <!-- KEY FEATURES GRID (6 BOXES) -->
        <div id="features-section" style="max-width:1200px; margin:0 auto 70px auto; padding:0 24px;">
          <div style="text-align:center; margin-bottom:40px;">
            <h2 class="landing-section-title">Engineered for Institutional Scale</h2>
            <p class="landing-section-subtitle">
              Eliminate placement bottlenecks with automated workflows designed specifically for accredited engineering and management institutions.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
            <div class="card landing-feature-card">
              <i data-lucide="cpu" style="width:28px; height:28px; color:var(--gov-navy-600); margin-bottom:14px;"></i>
              <h4 class="landing-feature-title">Multi-Vector AI Matcher</h4>
              <p class="landing-feature-desc">Scores candidate compatibility across algorithmic tests, academic history, projects, and domain skills with 98% hiring correlation.</p>
            </div>
            <div class="card landing-feature-card">
              <i data-lucide="calendar-check-2" style="width:28px; height:28px; color:#10b981; margin-bottom:14px;"></i>
              <h4 class="landing-feature-title">Conflict-Free Scheduler</h4>
              <p class="landing-feature-desc">Automated detection and 1-click resolution for simultaneous interview slots, venue capacity caps, and panel collisions.</p>
            </div>
            <div class="card landing-feature-card">
              <i data-lucide="trending-up" style="width:28px; height:28px; color:#8b5cf6; margin-bottom:14px;"></i>
              <h4 class="landing-feature-title">Predictive Risk Engine</h4>
              <p class="landing-feature-desc">Identifies unplaced and at-risk students 6 months prior to graduation, auto-recommending remedial coding bootcamps.</p>
            </div>
            <div class="card landing-feature-card" id="compliance-section">
              <i data-lucide="file-check-2" style="width:28px; height:28px; color:#06b6d4; margin-bottom:14px;"></i>
              <h4 class="landing-feature-title">NAAC & NIRF Compliant</h4>
              <p class="landing-feature-desc">Instant one-click exports for institutional accreditation data tables, CTC distribution, and company rosters.</p>
            </div>
            <div class="card landing-feature-card">
              <i data-lucide="sparkles" style="width:28px; height:28px; color:#f59e0b; margin-bottom:14px;"></i>
              <h4 class="landing-feature-title">Real-Time Explainability</h4>
              <p class="landing-feature-desc">Transparent "Why Matched" and "Why Not Shortlisted" feedback loops empowering candidates with targeted skill remediation.</p>
            </div>
            <div class="card landing-feature-card">
              <i data-lucide="shield-alert" style="width:28px; height:28px; color:#ec4899; margin-bottom:14px;"></i>
              <h4 class="landing-feature-title">Institutional RBAC & Audit</h4>
              <p class="landing-feature-desc">Enterprise-grade cryptographic security, tamper-proof audit trails, and strict role-based access for students, recruiters, and deans.</p>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <footer style="background:#071526; color:#94a3b8; padding:36px 32px; border-top:1px solid rgba(255,255,255,0.08);">
          <div style="max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="assets/campuslink_logo.png" style="width:26px; height:26px; border-radius:4px; background:white; padding:2px;" alt="Logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
              <span style="font-weight:800; font-size:15px; color:#ffffff;">CAMPUSLINK</span>
              <span style="font-size:12px; color:#64748b;">• Institutional Placement & Accreditation System</span>
            </div>
            <div style="font-size:12.5px;">
              &copy; 2026 CAMPUSLINK. All Rights Reserved. Built for Tier-1 Institutions.
            </div>
          </div>
        </footer>
      </div>
    `;

    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 50);
  },

  // -------------------------------------------------------------
  // DEDICATED AUTHENTICATION VIEW (SIGN IN / SIGN UP)
  // -------------------------------------------------------------
  renderAuthView: (hash) => {
    const shell = document.getElementById('app-shell');
    if (shell) shell.style.display = 'block';

    const content = document.getElementById('app-content');
    if (!content) return;

    // Hide sidebar and internal header on auth page
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'none';
    const main = document.getElementById('app-main');
    if (main) main.style.marginLeft = '0';

    const isRegister = hash.includes('register');
    
    // Parse role from query params if specified (e.g., #login?role=recruiter)
    let selectedRole = 'student';
    if (hash.includes('role=recruiter')) selectedRole = 'recruiter';
    if (hash.includes('role=officer')) selectedRole = 'officer';
    CampusLinkApp.selectedAuthRole = selectedRole;

    const roleData = {
      student: {
        label: 'Student Aspirant',
        icon: 'graduation-cap',
        color: '#2563eb',
        idFieldLabel: 'College USN / Roll Number',
        idPlaceholder: 'e.g. 1CL22CS042',
        demoEmail: 'student@campuslink.edu',
        demoPass: 'password123',
        demoName: 'Aarav Sharma (B.Tech CSE)'
      },
      recruiter: {
        label: 'Corporate Recruiter',
        icon: 'building-2',
        color: '#8b5cf6',
        idFieldLabel: 'Company / Organization Name',
        idPlaceholder: 'e.g. Google India Pvt Ltd',
        demoEmail: 'rohit@google.com',
        demoPass: 'password123',
        demoName: 'Rohit Deshmukh (Google Talent Lead)'
      },
      officer: {
        label: 'Placement Officer',
        icon: 'shield-check',
        color: '#10b981',
        idFieldLabel: 'Officer Staff Code / Department',
        idPlaceholder: 'e.g. TPO-NIT-2026',
        demoEmail: 'officer@campuslink.edu',
        demoPass: 'password123',
        demoName: 'Dr. Sunita Ramanathan (Dean)'
      }
    };

    const currentRole = roleData[selectedRole];
    CampusLinkApp.currentCaptcha = CampusLinkApp.generateCaptchaCode();

    content.innerHTML = `
      <div style="margin:-32px -40px;">
        <div class="govt-top-strip"></div>

        <!-- AUTH TOP BAR -->
        <div class="auth-top-bar">
          <a href="#landing" style="display:flex; align-items:center; gap:8px; color:#cbd5e1; font-size:13.5px; font-weight:600;">
            <i data-lucide="arrow-left" style="width:16px; height:16px;"></i>
            <span>Back to Public Portal</span>
          </a>

          <div style="display:flex; align-items:center; gap:14px;">
            <button id="auth-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode">
              <i id="auth-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:14px; height:14px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
              <span id="auth-theme-label" class="auth-theme-label">${CampusLinkApp.currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="assets/campuslink_logo.png" style="width:24px; height:24px; border-radius:4px; background:white; padding:2px;" alt="Logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
              <span style="font-weight:800; font-size:14px; color:#ffffff;">CAMPUSLINK AUTH DESK</span>
            </div>
          </div>
        </div>

        <!-- MAIN AUTH WRAPPER WITH FROSTED GLASS CLEAN ROOM BACKGROUND -->
        <div class="auth-page-wrapper auth-glass-bg">
          <div class="auth-container">
            <div class="auth-card auth-glass-card">
            <div class="auth-header">
              <div class="auth-badge-official">
                <i data-lucide="lock" style="width:12px; height:12px;"></i>
                <span>Institutional Centralized Access</span>
              </div>
              <h1 class="auth-title">${isRegister ? 'New Account Registration' : 'Sign In to Portal'}</h1>
              <p class="auth-subtitle">Select your authorized institutional role to proceed</p>
            </div>

            <!-- ROLE SELECTOR TABS -->
            <div class="auth-role-tabs">
              <button class="auth-role-tab ${selectedRole === 'student' ? 'active student' : ''}" onclick="CampusLinkApp.selectAuthRole('student', ${isRegister})">
                <i data-lucide="graduation-cap" style="width:18px; height:18px; color:${selectedRole === 'student' ? '#2563eb' : 'inherit'};"></i>
                <span>Student</span>
              </button>
              <button class="auth-role-tab ${selectedRole === 'recruiter' ? 'active recruiter' : ''}" onclick="CampusLinkApp.selectAuthRole('recruiter', ${isRegister})">
                <i data-lucide="building-2" style="width:18px; height:18px; color:${selectedRole === 'recruiter' ? '#8b5cf6' : 'inherit'};"></i>
                <span>Recruiter</span>
              </button>
              <button class="auth-role-tab ${selectedRole === 'officer' ? 'active officer' : ''}" onclick="CampusLinkApp.selectAuthRole('officer', ${isRegister})">
                <i data-lucide="shield-check" style="width:18px; height:18px; color:${selectedRole === 'officer' ? '#10b981' : 'inherit'};"></i>
                <span>Officer</span>
              </button>
            </div>

            <!-- MODE TOGGLE TABS (SIGN IN vs SIGN UP) -->
            <div class="auth-mode-switch">
              <button class="auth-mode-btn ${!isRegister ? 'active' : ''}" onclick="CampusLinkApp.navigateTo('#login?role=${selectedRole}')">
                Sign In
              </button>
              <button class="auth-mode-btn ${isRegister ? 'active' : ''}" onclick="CampusLinkApp.navigateTo('#register?role=${selectedRole}')">
                New Registration
              </button>
            </div>

            <!-- AUTH FORM -->
            <form onsubmit="CampusLinkApp.handleAuthSubmit(event, '${selectedRole}', ${isRegister})">
              ${isRegister ? `
                <div class="auth-form-group">
                  <label class="auth-form-label">Full Name</label>
                  <input type="text" id="auth-name" class="auth-form-input" placeholder="e.g. Aarav Sharma" required>
                </div>
              ` : ''}

              <div class="auth-form-group">
                <label class="auth-form-label">Institutional / Official Email</label>
                <input type="email" id="auth-email" class="auth-form-input" placeholder="${currentRole.demoEmail}" value="${!isRegister ? currentRole.demoEmail : ''}" required>
              </div>

              <div class="auth-form-group">
                <label class="auth-form-label">${currentRole.idFieldLabel}</label>
                <input type="text" id="auth-role-id" class="auth-form-input" placeholder="${currentRole.idPlaceholder}">
              </div>

              <!-- PASSWORD WITH VIEW EYE BUTTON -->
              <div class="auth-form-group">
                <label class="auth-form-label">Password</label>
                <div style="position:relative; display:flex; align-items:center;">
                  <input type="password" id="auth-password" class="auth-form-input" placeholder="••••••••••••" value="${!isRegister ? currentRole.demoPass : ''}" oninput="CampusLinkApp.handlePasswordInput(this.value)" required style="padding-right:42px;">
                  <button type="button" class="auth-password-toggle-btn" onclick="CampusLinkApp.togglePasswordVisibility('auth-password', this)" title="Show/Hide Password" aria-label="Toggle password visibility">
                    <i data-lucide="eye" style="width:18px; height:18px;"></i>
                  </button>
                </div>
                <div class="password-meter">
                  <div class="password-meter-bar">
                    <div id="password-meter-fill" class="password-meter-fill" style="width:${!isRegister ? '100%' : '0%'}; background:${!isRegister ? '#10b981' : '#cbd5e1'};"></div>
                  </div>
                  <div id="password-meter-text" class="password-meter-text">${!isRegister ? 'Verified strong security' : 'Enter at least 8 characters'}</div>
                </div>
              </div>

              <!-- CAPTCHA SECURITY VERIFICATION OPTION -->
              <div class="auth-form-group" style="margin-top:14px;">
                <label class="auth-form-label">
                  <span>Security Captcha</span>
                  <span style="font-size:11px; color:#0284c7; text-transform:none; font-weight:600;">Case-insensitive</span>
                </label>
                <div class="captcha-box-container">
                  <div id="captcha-display" class="captcha-visual-badge">
                    ${CampusLinkApp.renderCaptchaVisual(CampusLinkApp.currentCaptcha)}
                  </div>
                  <button type="button" class="captcha-refresh-btn" onclick="CampusLinkApp.generateNewCaptcha()" title="Refresh Captcha Code">
                    <i data-lucide="refresh-cw" style="width:14px; height:14px;"></i>
                    <span>Refresh</span>
                  </button>
                </div>
                <div style="margin-top:8px;">
                  <input type="text" id="auth-captcha" class="auth-form-input" placeholder="Enter the 6-character captcha" maxlength="6" autocomplete="off" required>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; font-size:14.5px; justify-content:center; margin-top:14px;">
                <i data-lucide="${isRegister ? 'user-plus' : 'log-in'}" style="width:16px; height:16px;"></i>
                <span>${isRegister ? 'Complete Registration' : `Sign In as ${currentRole.label}`}</span>
              </button>
            </form>

            <!-- 1-CLICK INSTANT DEMO SANDBOX -->
            <div class="auth-demo-sandbox">
              <div class="auth-demo-title">
                <i data-lucide="key" style="width:14px; height:14px; color:var(--gov-gold);"></i>
                <span>Instant 1-Click Evaluation Accounts</span>
              </div>
              <p style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">Click any profile below to instantly authenticate and evaluate that specific portal:</p>
              
              <div class="auth-demo-buttons">
                <button type="button" class="btn-demo-quick" onclick="CampusLinkApp.quickDemoLogin('student')">
                  <i data-lucide="graduation-cap" style="width:16px; height:16px; color:#2563eb;"></i>
                  <span>Demo Student</span>
                  <span style="font-size:10px; color:var(--text-muted);">(Aarav Sharma)</span>
                </button>
                <button type="button" class="btn-demo-quick" onclick="CampusLinkApp.quickDemoLogin('recruiter')">
                  <i data-lucide="building-2" style="width:16px; height:16px; color:#8b5cf6;"></i>
                  <span>Demo Recruiter</span>
                  <span style="font-size:10px; color:var(--text-muted);">(Google Lead)</span>
                </button>
                <button type="button" class="btn-demo-quick" onclick="CampusLinkApp.quickDemoLogin('officer')">
                  <i data-lucide="shield-check" style="width:16px; height:16px; color:#10b981;"></i>
                  <span>Demo Officer</span>
                  <span style="font-size:10px; color:var(--text-muted);">(Dean Sunita)</span>
                </button>
              </div>
            </div>

            <!-- FOOTER INFO -->
            <div style="text-align:center; margin-top:20px; font-size:12px; color:var(--text-muted);">
              Protected by Institutional Role-Based Access Control (RBAC) & Captcha Security.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 50);
  },

  generateCaptchaCode: () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  renderCaptchaVisual: (code) => {
    if (!code) return '';
    const colors = ['#1e3a8a', '#0f766e', '#b45309', '#7e22ce', '#be123c', '#1d4ed8'];
    return code.split('').map((char, idx) => {
      const rot = (idx % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 12) + 2);
      const col = colors[idx % colors.length];
      return `<span style="display:inline-block; transform:rotate(${rot}deg); margin:0 3px; font-family:'Courier New', monospace, serif; font-weight:800; font-size:20px; color:${col}; text-shadow:1px 1px 2px rgba(0,0,0,0.15); letter-spacing:2px; user-select:none;">${char}</span>`;
    }).join('');
  },

  generateNewCaptcha: () => {
    CampusLinkApp.currentCaptcha = CampusLinkApp.generateCaptchaCode();
    const el = document.getElementById('captcha-display');
    if (el) {
      el.innerHTML = CampusLinkApp.renderCaptchaVisual(CampusLinkApp.currentCaptcha);
    }
    const input = document.getElementById('auth-captcha');
    if (input) input.value = '';
    if (window.lucide) window.lucide.createIcons();
  },

  togglePasswordVisibility: (inputId, btn) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    if (btn) {
      btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" style="width:18px; height:18px;"></i>`;
      btn.title = isPassword ? 'Hide Password' : 'Show Password';
      if (window.lucide) window.lucide.createIcons();
    }
  },

  selectAuthRole: (role, isRegister = false) => {
    CampusLinkApp.selectedAuthRole = role;
    window.location.hash = `#${isRegister ? 'register' : 'login'}?role=${role}`;
  },

  handlePasswordInput: (val) => {
    const fill = document.getElementById('password-meter-fill');
    const text = document.getElementById('password-meter-text');
    if (!fill || !text) return;

    if (!val || val.length === 0) {
      fill.style.width = '0%';
      fill.style.backgroundColor = '#cbd5e1';
      text.textContent = 'Enter at least 8 characters';
      return;
    }

    let strength = 0;
    if (val.length >= 6) strength += 25;
    if (val.length >= 8) strength += 25;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) strength += 25;

    fill.style.width = `${strength}%`;

    if (strength <= 25) {
      fill.style.backgroundColor = '#ef4444';
      text.textContent = 'Weak password';
    } else if (strength <= 50) {
      fill.style.backgroundColor = '#f59e0b';
      text.textContent = 'Moderate security';
    } else if (strength <= 75) {
      fill.style.backgroundColor = '#3b82f6';
      text.textContent = 'Good security';
    } else {
      fill.style.backgroundColor = '#10b981';
      text.textContent = 'Strong institutional grade password';
    }
  },

  handleAuthSubmit: async (e, role, isRegister) => {
    if (e && e.preventDefault) e.preventDefault();

    const email = document.getElementById('auth-email') ? document.getElementById('auth-email').value.trim() : '';
    const password = document.getElementById('auth-password') ? document.getElementById('auth-password').value : '';
    const name = document.getElementById('auth-name') ? document.getElementById('auth-name').value.trim() : '';
    const roleId = document.getElementById('auth-role-id') ? document.getElementById('auth-role-id').value.trim() : '';
    const captchaInput = document.getElementById('auth-captcha') ? document.getElementById('auth-captcha').value.trim() : '';

    if (!email || !password) {
      CampusLinkApp.showToast("Please provide both email and password.", "danger");
      return;
    }

    // Validate Captcha
    if (!captchaInput) {
      CampusLinkApp.showToast("Please enter the security verification captcha code.", "warning");
      document.getElementById('auth-captcha')?.focus();
      return;
    }

    if (captchaInput.toLowerCase() !== (CampusLinkApp.currentCaptcha || '').toLowerCase()) {
      CampusLinkApp.showToast("Incorrect captcha code. Please enter the new captcha.", "danger");
      CampusLinkApp.generateNewCaptcha();
      return;
    }

    let res;
    if (isRegister) {
      res = await CampusLinkStore.registerUser({
        name: name || 'New User',
        email: email,
        password: password,
        role: role,
        usn: role === 'student' ? roleId : undefined,
        companyName: role === 'recruiter' ? roleId : undefined,
        institutionName: role === 'officer' ? roleId : undefined
      });
    } else {
      res = await CampusLinkStore.authenticate(email, password, role);
    }

    if (res && res.success) {
      CampusLinkApp.currentUser = res.user;
      CampusLinkApp.activeRole = res.user.role;
      const srcText = res.source === 'mysql' ? ' (MySQL Verified)' : '';
      CampusLinkApp.showToast(`Welcome, ${res.user.name}! Authenticated as ${res.user.role.toUpperCase()}${srcText}`, "success");
      CampusLinkApp.navigateTo(`#${res.user.role}/dashboard`);
    } else {
      CampusLinkApp.showToast(res.message || "Authentication failed.", "danger");
    }
  },

  quickDemoLogin: async (role) => {
    const res = await CampusLinkStore.authenticate('', '', role);
    if (res && res.success) {
      CampusLinkApp.currentUser = res.user;
      CampusLinkApp.activeRole = res.user.role;
      const srcText = res.source === 'mysql' ? ' (MySQL Verified)' : '';
      CampusLinkApp.showToast(`Logged in as ${res.user.name} (${role.toUpperCase()})${srcText}`, "success");
      CampusLinkApp.navigateTo(`#${res.user.role}/dashboard`);
    }
  },

  // -------------------------------------------------------------
  // ALL 40+ SUBVIEWS ORGANIZED UNDER VIEW REPOSITORIES
  // -------------------------------------------------------------
  views: {
    // -----------------------------------------------------------
    // 1. STUDENT DASHBOARD
    // -----------------------------------------------------------
    studentDashboard: () => {
      const data = CampusLinkStore.get();
      const st = data.currentUser;
      const jobs = data.jobs;
      const apps = data.applications;
      const ints = data.interviews;

      return `
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Welcome back, ${st.name}! 👋</h1>
            <p class="page-subtitle">${st.branch} • Target: ${st.targetRole} • USN: ${st.usn}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.navigateTo('#student/resume')">
              <i data-lucide="file-text" style="width:16px; height:16px;"></i>
              <span>ATS Resume (94%)</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#student/jobs')">
              <i data-lucide="briefcase" style="width:16px; height:16px;"></i>
              <span>Explore 6 Drives</span>
            </button>
          </div>
        </div>

        <!-- AI READINESS HERO BANNER -->
        <div class="ai-readiness-banner">
          <div class="readiness-score-dial">
            <div class="score-circle-outer">
              <span class="score-number">${data.readinessData.overallScore}</span>
            </div>
            <div>
              <div class="readiness-meta-title">CAMPUS READINESS INDEX</div>
              <div class="readiness-status-tag">${data.readinessData.status}</div>
              <p style="font-size:13px; color:#cbd5e1; max-width:480px;">
                Your multi-vector score places you in the <strong>Top 3% of the 2026 Batch</strong>. You are pre-cleared for Tier-1 Super Dream drives.
              </p>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn btn-ai" onclick="CampusLinkApp.navigateTo('#student/readiness')">
              <span>View Readiness Breakdown</span>
              <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
            </button>
            <button class="btn" style="background:rgba(255,255,255,0.12); color:white; border:none;" onclick="CampusLinkApp.navigateTo('#student/skill-gap')">
              <i data-lucide="compass" style="width:16px; height:16px;"></i>
              <span>Inspect Skill Gaps</span>
            </button>
          </div>
        </div>

        <!-- 4 TOP KPI CARDS -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Profile Completion</div>
              <div class="kpi-value">${st.profileCompletion}%</div>
              <div class="kpi-trend trend-up"><i data-lucide="check" style="width:14px; height:14px;"></i> All Verified</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-blue"><i data-lucide="user-check"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Active Applications</div>
              <div class="kpi-value">${apps.length}</div>
              <div class="kpi-trend trend-up"><i data-lucide="trending-up" style="width:14px; height:14px;"></i> 1 Shortlisted</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="send"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Upcoming Interviews</div>
              <div class="kpi-value">${ints.length}</div>
              <div class="kpi-trend" style="color:#ef4444;"><i data-lucide="clock" style="width:14px; height:14px;"></i> Next: Tomorrow</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="calendar"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Offers Received</div>
              <div class="kpi-value">1</div>
              <div class="kpi-trend trend-up"><i data-lucide="award" style="width:14px; height:14px;"></i> ₹9.0 LPA Base</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-green"><i data-lucide="gift"></i></div>
          </div>
        </div>

        <!-- TWO COLUMN DASHBOARD GRID -->
        <div style="display:grid; grid-template-columns: 2fr 1.2fr; gap:24px;">
          <!-- Left Column: Recommended Jobs & Applications -->
          <div>
            <!-- Top Recommended Jobs -->
            <div class="card" style="margin-bottom:24px;">
              <div class="card-header">
                <div class="card-title">Top AI Recommended Jobs</div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/jobs')">View All (6)</button>
              </div>

              <div style="display:flex; flex-direction:column; gap:14px;">
                ${jobs.slice(0, 3).map(j => `
                  <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:14px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                      <img src="${j.companyLogo}" style="width:36px; height:36px; border-radius:8px; object-fit:contain; border:1px solid var(--border-subtle);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
                      <div>
                        <div style="font-weight:700; font-size:14.5px; color:var(--navy-900);">${j.title}</div>
                        <div style="font-size:12.5px; color:var(--text-muted);">${j.company} • ${j.location} • <strong style="color:var(--brand-blue);">${j.ctc}</strong></div>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                      <span class="badge badge-cyan" style="font-size:13px; font-weight:800;">${j.aiMatchScore}% Match</span>
                      <button class="btn ${j.applied ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="${j.applied ? "CampusLinkApp.navigateTo('#student/applications')" : `CampusLinkStore.applyForJob('${j.id}'); CampusLinkApp.handleRouteChange();`}">
                        ${j.applied ? 'Track Application' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Active Applications Summary -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Active Applications Tracker</div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/applications')">Full Timeline</button>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Match Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${apps.map(a => `
                      <tr>
                        <td style="font-weight:700; color:var(--navy-900);">${a.company}</td>
                        <td>${a.role}</td>
                        <td><span class="badge badge-info">${a.aiMatchScore}%</span></td>
                        <td><span class="badge badge-${a.statusType}">${a.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right Column: Upcoming Interviews & Notifications -->
          <div>
            <!-- Next Interview Card -->
            <div class="card" style="margin-bottom:24px; border-left:4px solid var(--brand-blue);">
              <div class="card-header">
                <div class="card-title" style="display:flex; align-items:center; gap:6px;">
                  <i data-lucide="video" style="width:18px; height:18px; color:var(--brand-blue);"></i>
                  <span>Upcoming Interview</span>
                </div>
                <span class="badge badge-danger">Tomorrow</span>
              </div>

              <div>
                <div style="font-weight:800; font-size:16px; color:var(--navy-950); margin-bottom:4px;">Google India - SDE 1</div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Round 1: Advanced DSA & Problem Solving</div>
                
                <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:12.5px; margin-bottom:16px;">
                  <div><strong>Time:</strong> 24 Sep 2026, 10:30 AM IST</div>
                  <div><strong>Panel:</strong> Siddharth Verma (Staff Engineer)</div>
                </div>

                <div style="display:flex; gap:10px;">
                  <a href="${ints[0].meetUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex:1;">
                    <i data-lucide="video" style="width:14px; height:14px;"></i>
                    <span>Join Meet</span>
                  </a>
                  <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/interviews')">Prep Notes</button>
                </div>
              </div>
            </div>

            <!-- Recent Notifications -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Placement Alerts</div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/notifications')">View All</button>
              </div>

              <div style="display:flex; flex-direction:column; gap:12px;">
                ${data.notifications.slice(0, 3).map(n => `
                  <div style="padding:10px 12px; background:#f8fafc; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                    <div style="font-weight:700; font-size:13px; color:var(--navy-900); margin-bottom:2px;">${n.title}</div>
                    <div style="font-size:12px; color:var(--text-muted); line-height:1.4;">${n.message}</div>
                    <div style="font-size:10.5px; color:var(--text-subtle); margin-top:4px;">${n.time}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 2. STUDENT PROFILE (6 TABS)
    // -----------------------------------------------------------
    studentProfile: () => {
      const data = CampusLinkStore.get();
      const p = data.studentProfile;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">My Placement Profile</h1>
            <p class="page-subtitle">Verified institutional credentials, academic transcripts, and technical portfolio</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Profile changes synchronized with institutional database.', 'success')">
              <i data-lucide="save" style="width:16px; height:16px;"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:300px 1fr; gap:24px;">
          <!-- Left Summary Card -->
          <div class="card" style="text-align:center;">
            <img src="${data.currentUser.avatar}" style="width:96px; height:96px; border-radius:50%; object-fit:cover; margin:0 auto 16px auto; border:3px solid var(--brand-blue-border);">
            <h3 style="font-size:18px; font-weight:800; color:var(--navy-950);">${p.personal.fullName}</h3>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${p.academic.collegeRollNo} • ${p.academic.branch}</p>
            
            <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; margin-bottom:16px;">
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Overall CGPA</div>
              <div style="font-size:24px; font-weight:800; color:var(--brand-blue);">${p.academic.cgpa}</div>
              <div style="font-size:11px; color:#10b981; font-weight:600;">0 Standing Backlogs</div>
            </div>

            <div style="font-size:12.5px; color:var(--text-muted); text-align:left; display:flex; flex-direction:column; gap:8px;">
              <div><strong>Email:</strong> ${p.personal.email}</div>
              <div><strong>Phone:</strong> ${p.personal.phone}</div>
              <div><strong>Location:</strong> ${p.personal.city}, India</div>
            </div>
          </div>

          <!-- Right Tabs Container -->
          <div class="card">
            <div style="display:flex; border-bottom:1px solid var(--border-subtle); margin-bottom:20px; overflow-x:auto;">
              <button class="btn" style="border:none; border-bottom:2px solid var(--brand-blue); border-radius:0; color:var(--brand-blue); font-weight:700;">Personal</button>
              <button class="btn" style="border:none; border-radius:0; color:var(--text-muted);">Academic</button>
              <button class="btn" style="border:none; border-radius:0; color:var(--text-muted);" onclick="CampusLinkApp.navigateTo('#student/skills')">Skills & Projects</button>
              <button class="btn" style="border:none; border-radius:0; color:var(--text-muted);" onclick="CampusLinkApp.navigateTo('#student/resume')">Resume & ATS</button>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Full Legal Name</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="${p.personal.fullName}">
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Institutional Email</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="${p.personal.email}" disabled>
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Contact Number</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="${p.personal.phone}">
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Target Career Domain</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="${data.currentUser.targetRole}">
              </div>
              <div style="grid-column: span 2;">
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">LinkedIn Profile</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="https://${p.personal.linkedin}">
              </div>
              <div style="grid-column: span 2;">
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">GitHub Portfolio</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="https://${p.personal.github}">
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 3. STUDENT RESUME & ATS ANALYZER
    // -----------------------------------------------------------
    studentResume: () => {
      const data = CampusLinkStore.get();
      const r = data.studentProfile.resumeDetails;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Resume & AI ATS Audit</h1>
            <p class="page-subtitle">Multi-stage ATS parse inspection, keyword alignment, and formatting compliance</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast('Select a replacement PDF file.', 'info')">
              <i data-lucide="upload" style="width:16px; height:16px;"></i>
              <span>Replace Resume</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Re-running AI ATS parse engine...', 'info')">
              <i data-lucide="refresh-cw" style="width:16px; height:16px;"></i>
              <span>Re-Analyze</span>
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:24px;">
          <!-- Left: Resume File & ATS Card -->
          <div>
            <div class="card" style="margin-bottom:24px;">
              <div class="card-header">
                <div class="card-title">Active Institutional Resume</div>
                <span class="badge badge-success">Verified ATS File</span>
              </div>

              <div style="border:2px dashed var(--brand-blue-border); background:#f8fafc; border-radius:var(--radius-lg); padding:28px; text-align:center; margin-bottom:20px;">
                <i data-lucide="file-check-2" style="width:42px; height:42px; color:var(--brand-blue); margin-bottom:8px;"></i>
                <div style="font-weight:700; font-size:15px; color:var(--navy-900);">${r.fileName}</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">PDF Document • ${r.fileSize} • Last parsed ${r.lastUpdated}</div>
                <div style="margin-top:16px; display:flex; justify-content:center; gap:8px;">
                  <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showToast('Opening PDF viewer...', 'info')">Preview</button>
                  <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showToast('Downloading verified copy...', 'success')">Download</button>
                </div>
              </div>

              <div style="display:flex; align-items:center; justify-content:space-between; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-md); padding:16px;">
                <div>
                  <div style="font-size:11px; font-weight:700; color:#166534; text-transform:uppercase;">Overall ATS Compatibility</div>
                  <div style="font-size:28px; font-weight:800; color:#15803d;">${r.atsScore}%</div>
                </div>
                <span class="badge badge-success">Top Tier-1 Format</span>
              </div>
            </div>
          </div>

          <!-- Right: AI Resume Strengths & Gaps -->
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="display:flex; align-items:center; gap:8px;">
                <i data-lucide="sparkles" style="width:18px; height:18px; color:var(--brand-blue);"></i>
                <span>AI Resume Analysis</span>
              </div>
            </div>

            <p style="font-size:13.5px; color:var(--text-main); line-height:1.6; margin-bottom:20px; background:#f8fafc; padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
              ${r.aiAnalysis.summary}
            </p>

            <div style="margin-bottom:20px;">
              <h4 style="font-size:13px; font-weight:700; color:#065f46; text-transform:uppercase; margin-bottom:10px;">Detected Strengths</h4>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${r.aiAnalysis.strengths.map(s => `
                  <div style="display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#334155;">
                    <i data-lucide="check-circle" style="width:16px; height:16px; color:#10b981; flex-shrink:0; margin-top:2px;"></i>
                    <span>${s}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              <h4 style="font-size:13px; font-weight:700; color:#991b1b; text-transform:uppercase; margin-bottom:10px;">Recommended Fixes</h4>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${r.aiAnalysis.improvements.map(i => `
                  <div style="display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#334155;">
                    <i data-lucide="alert-circle" style="width:16px; height:16px; color:#f59e0b; flex-shrink:0; margin-top:2px;"></i>
                    <span>${i}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 4. STUDENT SKILLS & PROJECTS
    // -----------------------------------------------------------
    studentSkills: () => {
      const data = CampusLinkStore.get();
      const skills = data.studentProfile.skills;
      const projects = data.studentProfile.projects;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Skills & Verified Projects</h1>
            <p class="page-subtitle">Institutional skill taxonomy, verified proficiencies, and production repository portfolio</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showAddSkillModal()">
              <i data-lucide="plus" style="width:16px; height:16px;"></i>
              <span>Add Skill</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.showAddProjectModal()">
              <i data-lucide="plus" style="width:16px; height:16px;"></i>
              <span>Add Project</span>
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:24px;">
          <!-- Left: Skills List with Verification -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Verified Technical Skills (${skills.length})</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              ${skills.map(s => `
                <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px 16px; display:flex; align-items:center; justify-content:space-between;">
                  <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="font-weight:700; font-size:14px; color:var(--navy-900);">${s.name}</span>
                      ${s.verified ? '<i data-lucide="badge-check" style="width:15px; height:15px; color:#10b981;"></i>' : ''}
                    </div>
                    <div style="font-size:11.5px; color:var(--text-muted);">${s.category} • ${s.level}</div>
                  </div>
                  <div style="text-align:right;">
                    <span class="badge ${s.score >= 85 ? 'badge-success' : 'badge-info'}">${s.score}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Projects Grid -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Project Portfolio (${projects.length})</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
              ${projects.map(pr => `
                <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:18px; background:#ffffff;">
                  <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:6px;">
                    <div>
                      <h4 style="font-weight:800; font-size:15.5px; color:var(--navy-900);">${pr.title}</h4>
                      <div style="font-size:12px; color:var(--brand-blue); font-weight:600;">${pr.domain} • ${pr.duration}</div>
                    </div>
                    ${pr.featured ? '<span class="badge badge-purple">Featured</span>' : ''}
                  </div>
                  <p style="font-size:13px; color:var(--text-main); line-height:1.5; margin:10px 0;">${pr.description}</p>
                  
                  <div class="skill-pill-container" style="margin-bottom:12px;">
                    ${pr.techStack.map(t => `<span class="badge badge-neutral">${t}</span>`).join('')}
                  </div>

                  <div style="display:flex; gap:10px;">
                    ${pr.githubUrl ? `<a href="${pr.githubUrl}" target="_blank" class="btn btn-secondary btn-sm"><i data-lucide="github" style="width:14px; height:14px;"></i> Repository</a>` : ''}
                    ${pr.liveUrl ? `<a href="${pr.liveUrl}" target="_blank" class="btn btn-primary btn-sm"><i data-lucide="external-link" style="width:14px; height:14px;"></i> Live Demo</a>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 5. STUDENT ASSESSMENTS & MOCK
    // -----------------------------------------------------------
    studentAssessments: () => {
      const data = CampusLinkStore.get();
      const ass = data.assessments;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Assessments & AI Mock Interviews</h1>
            <p class="page-subtitle">Proctored aptitude evaluations, live coding sandbox, and AI behavioral interview loops</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
          ${ass.map(a => `
            <div class="card" style="display:flex; flex-direction:column;">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px;">
                <span class="badge ${a.category === 'Technical' ? 'badge-info' : a.category === 'Aptitude' ? 'badge-purple' : 'badge-cyan'}">${a.category}</span>
                <span class="badge ${a.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${a.status}</span>
              </div>

              <h3 style="font-size:16px; font-weight:800; color:var(--navy-900); margin-bottom:6px;">${a.title}</h3>
              <div style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">Duration: ${a.duration} • ${a.questionsCount} Questions • ${a.difficulty}</div>

              ${a.score !== null ? `
                <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:11px; color:var(--text-muted);">Latest Score</div>
                    <div style="font-size:20px; font-weight:800; color:var(--brand-blue);">${a.score}/100</div>
                  </div>
                  <span class="badge badge-success">${a.percentile}</span>
                </div>
              ` : `
                <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:var(--radius-md); padding:12px; margin-bottom:16px; font-size:12.5px; color:#92400e;">
                  Pending attempt. Recommended before Super Dream drives.
                </div>
              `}

              <div style="margin-top:auto;">
                <button class="btn ${a.status === 'Completed' ? 'btn-secondary' : 'btn-primary'} btn-sm" style="width:100%;" onclick="CampusLinkApp.showAssessmentModal('${a.id}')">
                  <i data-lucide="play" style="width:14px; height:14px;"></i>
                  <span>${a.status === 'Completed' ? 'Re-attempt Assessment' : 'Start Assessment'}</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 6. STUDENT READINESS SCORE
    // -----------------------------------------------------------
    studentReadiness: () => {
      const data = CampusLinkStore.get();
      const r = data.readinessData;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Campus Readiness Score & Matrix</h1>
            <p class="page-subtitle">Holistic 5-pillar employability benchmark derived from code accuracy, CGPA, and live interviews</p>
          </div>
        </div>

        <div class="ai-readiness-banner">
          <div class="readiness-score-dial">
            <div class="score-circle-outer">
              <span class="score-number">${r.overallScore}</span>
            </div>
            <div>
              <div class="readiness-meta-title">OVERALL READINESS STATUS</div>
              <div class="readiness-status-tag">${r.status}</div>
              <p style="font-size:13px; color:#cbd5e1;">Meets or exceeds 100% of corporate cutoffs for Google, Microsoft, and Amazon.</p>
            </div>
          </div>
        </div>

        <!-- 5-PILLAR BREAKDOWN -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <div class="card-title">5-Pillar Employability Matrix</div>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;">
            ${r.breakdown.map(b => `
              <div>
                <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;">
                  <span style="font-weight:700; color:var(--navy-900);">${b.category} (Weight: ${b.weight})</span>
                  <span style="font-weight:800; color:var(--brand-blue);">${b.score}/100 • ${b.status}</span>
                </div>
                <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                  <div style="height:100%; width:${b.score}%; background:linear-gradient(90deg, #2563eb, #06b6d4); border-radius:var(--radius-full);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Improvement Roadmap -->
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="display:flex; align-items:center; gap:8px;">
              <i data-lucide="sparkles" style="width:18px; height:18px; color:var(--brand-blue);"></i>
              <span>AI Personalized Improvement Roadmap</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
            ${r.recommendations.map(rec => `
              <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; background:#f8fafc;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                  <span class="badge ${rec.priority === 'High' ? 'badge-danger' : 'badge-warning'}">${rec.priority} Priority</span>
                  <span style="font-size:11.5px; color:var(--text-muted); font-weight:600;">Est: ${rec.timeEstimate}</span>
                </div>
                <h4 style="font-weight:800; font-size:14.5px; color:var(--navy-900); margin-bottom:4px;">${rec.title}</h4>
                <p style="font-size:12.5px; color:var(--text-muted); line-height:1.4;">${rec.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 7. STUDENT SKILL GAP
    // -----------------------------------------------------------
    studentSkillGap: () => {
      const data = CampusLinkStore.get();
      const profile = data.skillGapProfiles[CampusLinkApp.selectedTargetRole] || data.skillGapProfiles["Full Stack Engineer"];

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Target Role Skill Gap Visualizer</h1>
            <p class="page-subtitle">Real-time delta analysis against corporate hiring requirements</p>
          </div>
          <div class="page-actions">
            <select class="table-select" style="font-weight:700;" onchange="CampusLinkApp.selectedTargetRole = this.value; CampusLinkApp.handleRouteChange();">
              <option value="Full Stack Engineer" ${CampusLinkApp.selectedTargetRole === 'Full Stack Engineer' ? 'selected' : ''}>Target: Full Stack Engineer</option>
              <option value="Data Scientist / AI Engineer" ${CampusLinkApp.selectedTargetRole === 'Data Scientist / AI Engineer' ? 'selected' : ''}>Target: Data Scientist / AI Engineer</option>
              <option value="DevOps & SRE" ${CampusLinkApp.selectedTargetRole === 'DevOps & SRE' ? 'selected' : ''}>Target: DevOps & SRE</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:24px;">
          <!-- Left: Skill Bars -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Skill Requirement vs Your Score</div>
              <span class="badge badge-cyan">${profile.matchScore}% Match Index</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
              ${profile.skills.map(sk => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span style="font-weight:700; color:var(--navy-900);">${sk.name}</span>
                    <span style="font-size:12px; color:var(--text-muted);">Current: <strong>${sk.current}%</strong> | Target: <strong>${sk.required}%</strong></span>
                  </div>
                  <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:${sk.current}%; background:${sk.status === 'surplus' ? '#10b981' : sk.status === 'met' ? '#2563eb' : '#f59e0b'};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: AI Roadmap -->
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="display:flex; align-items:center; gap:6px;">
                <i data-lucide="sparkles" style="width:16px; height:16px; color:var(--brand-blue);"></i>
                <span>Fast-Track Prep Plan</span>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:14px;">
              ${profile.aiRoadmap.map(step => `
                <div style="border-left:3px solid var(--brand-blue); padding-left:14px;">
                  <div style="font-size:11px; font-weight:700; color:var(--brand-blue); text-transform:uppercase;">Phase ${step.step} • ${step.duration}</div>
                  <div style="font-weight:700; font-size:14px; color:var(--navy-900); margin:2px 0;">${step.title}</div>
                  <div style="font-size:12.5px; color:var(--text-muted);">${step.module}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 8. RECOMMENDED JOBS
    // -----------------------------------------------------------
    studentJobs: () => {
      const data = CampusLinkStore.get();
      const jobs = data.jobs;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Campus Placement Opportunities</h1>
            <p class="page-subtitle">AI-matched job openings with live eligibility screening</p>
          </div>
        </div>

        <div class="table-toolbar" style="margin-bottom:20px; background:white; border-radius:var(--radius-md);">
          <div class="table-filter-group">
            <input type="text" class="table-search-input" placeholder="Search by role, company, skills...">
            <select class="table-select">
              <option>All Tiers</option>
              <option>Tier-1 (Super Dream > ₹20 LPA)</option>
              <option>Tier-2 (Dream ₹10 - ₹20 LPA)</option>
            </select>
          </div>
          <span style="font-size:13px; color:var(--text-muted);">${jobs.length} Active Drives Listed</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:20px;">
          ${jobs.map(j => `
            <div class="card" style="display:flex; flex-direction:column;">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${j.companyLogo}" style="width:40px; height:40px; border-radius:8px; object-fit:contain; border:1px solid var(--border-subtle);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
                  <div>
                    <h3 style="font-size:15.5px; font-weight:800; color:var(--navy-950);">${j.title}</h3>
                    <div style="font-size:12.5px; color:var(--text-muted);">${j.company} • ${j.location}</div>
                  </div>
                </div>
                <span class="match-percentage-badge" style="font-size:14px; padding:4px 10px;">${j.aiMatchScore}%</span>
              </div>

              <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; margin-bottom:14px; font-size:13px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span style="color:var(--text-muted);">Package:</span>
                  <strong style="color:var(--brand-blue);">${j.ctc}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Min Eligibility:</span>
                  <span style="font-weight:600; color:var(--navy-900);">${j.minCgpa} CGPA • ${j.allowedBranches.join(', ')}</span>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Matched Skills:</div>
                <div class="skill-pill-container">
                  ${j.matchedSkills.map(s => `<span class="skill-tag-matched">${s}</span>`).join('')}
                  ${j.missingSkills.map(m => `<span class="skill-tag-missing">${m}</span>`).join('')}
                </div>
              </div>

              <div style="margin-top:auto; display:flex; gap:10px;">
                <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="CampusLinkApp.navigateTo('#student/job-details')">View Details</button>
                <button class="btn ${j.applied ? 'btn-secondary' : 'btn-primary'} btn-sm" style="flex:1;" onclick="${j.applied ? "CampusLinkApp.navigateTo('#student/applications')" : `CampusLinkStore.applyForJob('${j.id}'); CampusLinkApp.handleRouteChange();`}">
                  ${j.applied ? 'Track Application' : 'Apply Now'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 9. JOB DETAILS
    // -----------------------------------------------------------
    studentJobDetails: (jobId) => {
      const data = CampusLinkStore.get();
      const job = data.jobs.find(j => j.id === jobId) || data.jobs[0];

      return `
        <div class="page-header">
          <div>
            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/jobs')" style="margin-bottom:8px;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
              <span>Back to Job Listings</span>
            </button>
            <h1 class="page-title">${job.title}</h1>
            <p class="page-subtitle">${job.company} • ${job.location} • Drive Date: ${job.driveDate}</p>
          </div>
          <div class="page-actions">
            <button class="btn ${job.applied ? 'btn-secondary' : 'btn-primary'} btn-lg" onclick="${job.applied ? "CampusLinkApp.navigateTo('#student/applications')" : `CampusLinkStore.applyForJob('${job.id}'); CampusLinkApp.handleRouteChange();`}">
              ${job.applied ? 'Track Application' : 'Submit 1-Click Application'}
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
          <!-- Left: JD Content -->
          <div class="card">
            <h3 class="section-title">Job Description & Scope</h3>
            <p style="font-size:14px; line-height:1.7; color:var(--text-main); margin-bottom:24px;">
              ${job.description}
            </p>

            <h3 class="section-title">Compensation Breakdown</h3>
            <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; margin-bottom:24px;">
              <div style="font-size:20px; font-weight:800; color:var(--brand-blue); margin-bottom:4px;">${job.ctc}</div>
              <div style="font-size:13px; color:var(--text-muted);">${job.ctcBreakdown}</div>
            </div>

            <h3 class="section-title">Eligibility & Selection Process</h3>
            <ul style="padding-left:20px; font-size:13.5px; color:var(--text-main); line-height:1.8;">
              <li><strong>Minimum Academic Cutoff:</strong> ${job.minCgpa} CGPA (Strict no-active backlogs policy).</li>
              <li><strong>Allowed Branches:</strong> ${job.allowedBranches.join(', ')}.</li>
              <li><strong>Selection Rounds:</strong> Online Algorithmic Assessment → Technical Round 1 → Technical Round 2 → HR Leadership.</li>
            </ul>
          </div>

          <!-- Right: AI Match Score & Why You Match -->
          <div>
            <div class="card" style="margin-bottom:24px;">
              <div class="card-header">
                <div class="card-title">AI Match Analysis</div>
                <span class="match-percentage-badge">${job.aiMatchScore}%</span>
              </div>

              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:14px; margin-bottom:16px;">
                <div style="font-weight:700; color:#1e40af; font-size:13px; margin-bottom:4px;">Why You Strongly Match:</div>
                <div style="font-size:12.5px; color:#1e3a8a; line-height:1.5;">
                  Your verified DSA score (90%) and Go/Kafka distributed systems project match 94% of Google Cloud's core requirements.
                </div>
              </div>

              <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Matched Skills:</div>
              <div class="skill-pill-container" style="margin-bottom:14px;">
                ${job.matchedSkills.map(s => `<span class="skill-tag-matched">${s}</span>`).join('')}
              </div>

              <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Recommended Prep Gaps:</div>
              <div class="skill-pill-container">
                ${job.missingSkills.map(m => `<span class="skill-tag-missing">${m}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 10. STUDENT APPLICATIONS
    // -----------------------------------------------------------
    studentApplications: () => {
      const data = CampusLinkStore.get();
      const apps = data.applications;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">My Placement Applications</h1>
            <p class="page-subtitle">Live multi-stage recruitment pipeline tracker across active campus drives</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          ${apps.map(a => `
            <div class="card">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h3 style="font-size:17px; font-weight:800; color:var(--navy-950);">${a.company}</h3>
                  <div style="font-size:13.5px; color:var(--text-muted);">${a.role} • <strong style="color:var(--brand-blue);">${a.ctc}</strong> • Applied: ${a.appliedDate}</div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span class="badge badge-info">${a.aiMatchScore}% Match</span>
                  <span class="badge badge-${a.statusType}" style="font-size:13px;">${a.status}</span>
                </div>
              </div>

              <!-- Multi-stage Timeline -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; background:#f8fafc; padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                ${a.timeline.map((step, idx) => `
                  <div style="border-left:3px solid ${step.status === 'completed' ? '#10b981' : step.status === 'upcoming' ? '#2563eb' : '#cbd5e1'}; padding-left:10px;">
                    <div style="font-size:11px; font-weight:700; color:${step.status === 'completed' ? '#059669' : step.status === 'upcoming' ? '#2563eb' : '#64748b'}; text-transform:uppercase;">
                      Step ${idx + 1} • ${step.status}
                    </div>
                    <div style="font-weight:700; font-size:13px; color:var(--navy-900); margin:2px 0;">${step.stage}</div>
                    <div style="font-size:11.5px; color:var(--text-muted);">${step.note}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 11. STUDENT INTERVIEWS
    // -----------------------------------------------------------
    studentInterviews: () => {
      const data = CampusLinkStore.get();
      const ints = data.interviews;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Interviews & Live Schedule</h1>
            <p class="page-subtitle">Confirmed interview loops, meeting links, and personalized preparation strategies</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          ${ints.map(i => `
            <div class="card" style="border-left:4px solid var(--brand-blue);">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${i.companyLogo}" style="width:40px; height:40px; border-radius:8px; object-fit:contain; border:1px solid var(--border-subtle);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
                  <div>
                    <h3 style="font-size:17px; font-weight:800; color:var(--navy-950);">${i.company} - ${i.role}</h3>
                    <div style="font-size:13px; color:var(--brand-blue); font-weight:600;">${i.round}</div>
                  </div>
                </div>
                <span class="badge ${i.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}">${i.status}</span>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; background:#f8fafc; padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:16px;">
                <div>
                  <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Time & Venue</div>
                  <div style="font-size:13.5px; font-weight:700; color:var(--navy-900); margin-top:2px;">${i.date} • ${i.time}</div>
                  <div style="font-size:12px; color:var(--text-muted);">${i.type}</div>
                </div>
                <div>
                  <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Interview Panel</div>
                  <div style="font-size:13.5px; font-weight:700; color:var(--navy-900); margin-top:2px;">${i.panel}</div>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Target Prep Checklist:</div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${i.preparationTips.map(tip => `
                    <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:#334155;">
                      <i data-lucide="check" style="width:15px; height:15px; color:#10b981;"></i>
                      <span>${tip}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="display:flex; gap:10px;">
                <a href="${i.meetUrl}" target="_blank" class="btn btn-primary btn-sm">
                  <i data-lucide="video" style="width:14px; height:14px;"></i>
                  <span>Launch Virtual Interview</span>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 12. STUDENT DOCUMENTS
    // -----------------------------------------------------------
    studentDocuments: () => {
      const data = CampusLinkStore.get();
      const docs = data.documents;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Document Verification Vault</h1>
            <p class="page-subtitle">Academic grade cards, bonafide approvals, and certificates verified by the placement office</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Document upload dialog opened.', 'info')">
              <i data-lucide="upload" style="width:16px; height:16px;"></i>
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Upload Date</th>
                <th>File Size</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${docs.map(d => `
                <tr>
                  <td style="font-weight:700; color:var(--navy-900);">${d.name}</td>
                  <td>${d.category}</td>
                  <td>${d.uploadDate}</td>
                  <td>${d.size}</td>
                  <td>
                    <span class="badge ${d.status === 'Verified' ? 'badge-success' : 'badge-warning'}">${d.status}</span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showToast('Viewing verified file...', 'info')">View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 13. STUDENT OFFERS
    // -----------------------------------------------------------
    studentOffers: () => {
      const data = CampusLinkStore.get();
      const offers = data.offers;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Offers & Letter of Intent Deck</h1>
            <p class="page-subtitle">Manage campus placement offers, review CTC breakdowns, and register formal acceptance</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(380px, 1fr)); gap:24px;">
          ${offers.map(o => `
            <div class="card" style="border-top:4px solid #10b981;">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${o.companyLogo}" style="width:40px; height:40px; border-radius:8px; object-fit:contain; border:1px solid var(--border-subtle);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
                  <div>
                    <h3 style="font-size:16.5px; font-weight:800; color:var(--navy-950);">${o.company}</h3>
                    <div style="font-size:13px; color:var(--text-muted);">${o.role}</div>
                  </div>
                </div>
                <span class="badge badge-success" style="font-size:14px; font-weight:800;">${o.ctc}</span>
              </div>

              <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; margin-bottom:16px; font-size:13px;">
                <div><strong>Base Salary:</strong> ${o.details.baseSalary}</div>
                <div><strong>Joining Bonus:</strong> ${o.details.joiningBonus}</div>
                <div><strong>Insurance Cover:</strong> ${o.details.medicalInsurance}</div>
                <div><strong>Joining Window:</strong> ${o.joiningDate}</div>
              </div>

              <div style="display:flex; gap:10px;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="CampusLinkApp.showToast('Offer accepted! Notification dispatched to recruiter.', 'success')">Accept Offer</button>
                <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="CampusLinkApp.showToast('Tier-1 deferment registered.', 'info')">Hold & Defer</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // -----------------------------------------------------------
    // 14. STUDENT NOTIFICATIONS
    // -----------------------------------------------------------
    studentNotifications: () => {
      const data = CampusLinkStore.get();
      const nts = data.notifications || [];
      const hasUnread = nts.some(n => n.unread);

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Notification Center</h1>
            <p class="page-subtitle">Real-time alerts for drive announcements, interview calls, and verification updates</p>
          </div>
          <div class="page-actions">
            ${hasUnread ? `
              <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.markAllNotificationsRead()" style="border-color:#cbd5e1;">
                <i data-lucide="check-check" style="width:14px; height:14px; color:#10b981;"></i>
                <span>Mark All as Read</span>
              </button>
            ` : `
              <span class="badge badge-success" style="padding:6px 12px; font-weight:600;">
                <i data-lucide="check-circle" style="width:13px; height:13px;"></i> All caught up
              </span>
            `}
          </div>
        </div>

        <div class="card">
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${nts.length === 0 ? `
              <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <i data-lucide="bell-off" style="width:36px; height:36px; color:#94a3b8; margin-bottom:8px;"></i>
                <div>No notifications at this moment.</div>
              </div>
            ` : nts.map(n => `
              <div style="padding:16px; border-radius:var(--radius-md); border:1px solid ${n.unread ? '#bfdbfe' : 'var(--border-subtle)'}; background:${n.unread ? '#f0f7ff' : '#ffffff'}; display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <div style="width:34px; height:34px; border-radius:var(--radius-sm); background:${n.type === 'interview' ? '#fee2e2' : '#e0f2fe'}; color:${n.type === 'interview' ? '#dc2626' : '#0284c7'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i data-lucide="${n.type === 'interview' ? 'calendar' : 'briefcase'}" style="width:17px; height:17px;"></i>
                  </div>
                  <div>
                    <div style="font-weight:700; font-size:14.5px; color:var(--navy-900); margin-bottom:4px;">${n.title}</div>
                    <div style="font-size:13.5px; color:var(--text-main); line-height:1.5;">${n.message}</div>
                    <div style="font-size:11.5px; color:var(--text-muted); margin-top:6px;">${n.time}</div>
                  </div>
                </div>
                ${n.unread ? '<span class="badge badge-info" style="font-size:11px; padding:3px 8px;">New</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // RECRUITER VIEWS (11 COMPLETE VIEWS)
    // -----------------------------------------------------------
    recruiterDashboard: () => {
      const data = CampusLinkStore.get();

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Recruiter Command Dashboard</h1>
            <p class="page-subtitle">Google India • 2026 Campus Hiring Cycle • Active Drive: SDE-1</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-ai" onclick="CampusLinkApp.navigateTo('#recruiter/ai-matching')">
              <i data-lucide="sparkles" style="width:16px; height:16px;"></i>
              <span>Open AI Matcher</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#recruiter/create-job')">
              <i data-lucide="plus" style="width:16px; height:16px;"></i>
              <span>Create New JD</span>
            </button>
          </div>
        </div>

        <!-- 4 RECRUITER KPIS -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Active Campus Postings</div>
              <div class="kpi-value">2</div>
              <div class="kpi-trend trend-up">SDE-1 & Cloud</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-blue"><i data-lucide="briefcase"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Total Applicants</div>
              <div class="kpi-value">142</div>
              <div class="kpi-trend trend-up">114 Eligible</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="users"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">AI Shortlisted (Top Tier)</div>
              <div class="kpi-value">28</div>
              <div class="kpi-trend trend-up">Score > 85%</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="sparkles"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Confirmed Interviews</div>
              <div class="kpi-value">18</div>
              <div class="kpi-trend" style="color:#2563eb;">Round 1 Tomorrow</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-green"><i data-lucide="video"></i></div>
          </div>
        </div>

        <!-- RECRUITMENT FUNNEL & CANDIDATE LIST -->
        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Hiring Funnel Progression</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              <div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                  <span style="font-weight:700;">1. Total Batch Registrations</span>
                  <strong>142 (100%)</strong>
                </div>
                <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                  <div style="height:100%; width:100%; background:#2563eb;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                  <span style="font-weight:700;">2. Minimum Cutoff Passed (CGPA 8.0+)</span>
                  <strong>114 (80.2%)</strong>
                </div>
                <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                  <div style="height:100%; width:80.2%; background:#06b6d4;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                  <span style="font-weight:700;">3. AI Multi-Vector Ranked & Shortlisted</span>
                  <strong>28 (19.7%)</strong>
                </div>
                <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                  <div style="height:100%; width:19.7%; background:#8b5cf6;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                  <span style="font-weight:700;">4. Technical Interviews Loop</span>
                  <strong>18 (12.6%)</strong>
                </div>
                <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                  <div style="height:100%; width:12.6%; background:#10b981;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Upcoming Campus Drive</div>
              <span class="badge badge-success">05 Oct 2026</span>
            </div>

            <div style="font-size:13.5px; color:var(--text-main); line-height:1.6;">
              <strong>Venue:</strong> Auditorium Block A & Virtual Suite<br>
              <strong>Target Openings:</strong> 18 Full-time SDE-1<br>
              <strong>Assigned Panels:</strong> 6 Staff Engineers
            </div>

            <div style="margin-top:20px; display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="CampusLinkApp.navigateTo('#recruiter/scheduler')">View Calendar</button>
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="CampusLinkApp.navigateTo('#recruiter/ai-matching')">Rank Batch</button>
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // RECRUITER AI MATCHING (FLAGSHIP PAGE)
    // -----------------------------------------------------------
    recruiterAIMatching: () => {
      const data = CampusLinkStore.get();
      const pool = data.aiMatchingPool;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">AI Candidate Matching & Ranking Engine</h1>
            <p class="page-subtitle">Multi-vector ranking evaluating DSA, CGPA, Git projects, and interview consistency</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast('Exporting ranked batch to CSV...', 'success')">
              <i data-lucide="download" style="width:16px; height:16px;"></i>
              <span>Export Ranking</span>
            </button>
          </div>
        </div>

        <!-- STATS BAR -->
        <div class="card" style="margin-bottom:20px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <span style="font-size:12px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Active Job:</span>
            <span style="font-weight:800; font-size:15px; color:var(--navy-950); margin-left:6px;">Google SDE-1 (₹34.50 LPA)</span>
          </div>
          <div style="display:flex; gap:16px; font-size:13px;">
            <span>Analyzed: <strong>142</strong></span>
            <span>Eligible: <strong>114</strong></span>
            <span>Shortlisted: <strong style="color:#10b981;">28</strong></span>
          </div>
        </div>

        <!-- CANDIDATES RANKING DECK -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${pool.map(c => `
            <div class="match-card">
              <div class="match-card-top">
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="width:36px; height:36px; border-radius:50%; background:var(--navy-900); color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px;">
                    #${c.ranking}
                  </div>
                  <img src="${c.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">
                  <div>
                    <h3 style="font-size:16.5px; font-weight:800; color:var(--navy-950);">${c.name}</h3>
                    <div style="font-size:12.5px; color:var(--text-muted);">${c.branch} • CGPA ${c.cgpa}</div>
                  </div>
                </div>
                <span class="match-percentage-badge">${c.aiMatchScore}% Match</span>
              </div>

              <!-- Radar Metrics -->
              <div class="match-radar-grid">
                <div>
                  <div class="radar-item-label">Skill Match</div>
                  <div class="radar-item-val">${c.skillMatch}%</div>
                </div>
                <div>
                  <div class="radar-item-label">Academic Fit</div>
                  <div class="radar-item-val">${c.academicFit}%</div>
                </div>
                <div>
                  <div class="radar-item-label">Project Rigor</div>
                  <div class="radar-item-val">${c.projectRelevance}%</div>
                </div>
                <div>
                  <div class="radar-item-label">Interview Score</div>
                  <div class="radar-item-val">${c.interviewScore}%</div>
                </div>
              </div>

              <p style="font-size:13px; color:var(--text-main); line-height:1.5; margin-bottom:12px;">${c.explanation}</p>

              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div class="skill-pill-container">
                  ${c.matchedSkills.map(s => `<span class="skill-tag-matched">${s}</span>`).join('')}
                  ${c.missingSkills.map(m => `<span class="skill-tag-missing">${m}</span>`).join('')}
                </div>

                <div style="display:flex; gap:8px;">
                  ${!c.shortlisted && c.whyNotShortlisted ? `
                    <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showWhyNotShortlistedModal('${c.candidateId}')">Why Not Shortlisted?</button>
                  ` : ''}
                  <button class="btn ${c.shortlisted ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="CampusLinkStore.shortlistCandidate('${c.candidateId}', ${!c.shortlisted}); CampusLinkApp.handleRouteChange();">
                    ${c.shortlisted ? 'Remove Shortlist' : 'Shortlist Candidate'}
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // -----------------------------------------------------------
    // RECRUITER CREATE JOB WITH AI JD EXTRACTOR
    // -----------------------------------------------------------
    recruiterCreateJob: () => {
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Create Placement Job Posting</h1>
            <p class="page-subtitle">Publish structured role requirements or auto-extract using AI JD scanner</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-ai" onclick="CampusLinkApp.showAIJobAnalysisModal()">
              <i data-lucide="sparkles" style="width:16px; height:16px;"></i>
              <span>Analyze JD with AI</span>
            </button>
          </div>
        </div>

        <div class="card" style="max-width:800px; margin:0 auto;">
          <div style="display:flex; flex-direction:column; gap:18px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Job Title</label>
              <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="Software Development Engineer - I (Cloud Core)">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Annual CTC Package</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="₹34.50 LPA">
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Minimum CGPA Threshold</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="8.00">
              </div>
            </div>

            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Eligible Engineering Branches</label>
              <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="CSE, IT, ECE, AI & DS">
            </div>

            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Required Core Skills</label>
              <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="Data Structures & Algorithms, Python, System Design, REST APIs">
            </div>

            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Job Description</label>
              <textarea class="table-search-input" style="width:100%; height:120px; padding:12px; margin-top:4px; font-family:inherit;">Google is seeking world-class early-career software engineers to develop next-generation scalable technologies across Google Cloud, Search, and Android platforms.</textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:12px;">
              <button class="btn btn-secondary" onclick="CampusLinkApp.navigateTo('#recruiter/jobs')">Save Draft</button>
              <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Job posting published across campus portal!', 'success'); CampusLinkApp.navigateTo('#recruiter/jobs');">Publish Campus Drive</button>
            </div>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // RECRUITER SCHEDULER & CONFLICTS
    // -----------------------------------------------------------
    recruiterScheduler: () => {
      const data = CampusLinkStore.get();
      const sched = data.schedulerState;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Drive Scheduler & Conflict Engine</h1>
            <p class="page-subtitle">Real-time candidate overlap detection, venue allocation, and 1-click AI resolution</p>
          </div>
        </div>

        ${sched.hasConflict && sched.conflicts.length > 0 ? `
          <div class="conflict-banner">
            <div class="conflict-banner-text">
              <div class="conflict-icon-box">
                <i data-lucide="alert-triangle" style="width:20px; height:20px;"></i>
              </div>
              <div>
                <div style="font-weight:800; font-size:15px; color:#991b1b;">${sched.conflicts[0].title}</div>
                <div style="font-size:13px; color:#7f1d1d;">${sched.conflicts[0].description}</div>
              </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="CampusLinkApp.showConflictResolutionModal('${sched.conflicts[0].id}')">
              <i data-lucide="sparkles" style="width:14px; height:14px;"></i>
              <span>Resolve Conflict</span>
            </button>
          </div>
        ` : `
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:var(--radius-lg); padding:16px 20px; display:flex; align-items:center; gap:12px; margin-bottom:24px;">
            <i data-lucide="check-circle" style="width:20px; height:20px; color:#10b981;"></i>
            <span style="font-weight:700; color:#065f46; font-size:14px;">All scheduled placement drive slots are 100% conflict-free!</span>
          </div>
        `}

        <div class="card">
          <div class="card-header">
            <div class="card-title">Campus Drive Day Schedule (Oct 08, 2026)</div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${sched.slots.map(s => `
              <div style="padding:14px 18px; border-radius:var(--radius-md); border:1px solid ${s.conflict && sched.hasConflict ? '#fecaca' : 'var(--border-subtle)'}; background:${s.conflict && sched.hasConflict ? '#fff1f2' : '#ffffff'}; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="font-weight:800; font-size:14px; color:var(--navy-900);">${s.time}</span>
                  <div style="font-size:13px; color:var(--text-main); margin-top:2px;">${s.event} • <strong>${s.venue}</strong></div>
                </div>
                <div>
                  ${s.conflict && sched.hasConflict ? '<span class="badge badge-danger">Overlap Collision</span>' : '<span class="badge badge-success">Clear</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    recruiterProfile: () => {
      const data = CampusLinkStore.get();
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Company Profile & Campus Brand</h1>
            <p class="page-subtitle">Configure enterprise brand identity, campus engagement history, and university tier partnership</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Company profile changes updated successfully.', 'success')">
              <i data-lucide="save" style="width:16px; height:16px;"></i>
              <span>Save Profile</span>
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:320px 1fr; gap:24px;">
          <div class="card" style="text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" style="height:48px; object-fit:contain; margin:16px auto; display:block;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
            <h3 style="font-size:18px; font-weight:800; color:var(--navy-950); margin-top:8px;">Google India Pvt Ltd</h3>
            <p style="font-size:13px; color:var(--brand-blue); font-weight:600;">Tier-1 Super Dream Partner</p>
            
            <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; margin:16px 0; text-align:left; font-size:13px; display:flex; flex-direction:column; gap:8px;">
              <div><strong>Industry:</strong> Big Tech / Cloud / AI</div>
              <div><strong>Headquarters:</strong> Bangalore & Hyderabad</div>
              <div><strong>Active Campus Openings:</strong> 2 Roles</div>
              <div><strong>Historic Hires:</strong> 64 Students</div>
            </div>

            <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="CampusLinkApp.showToast('Upload new high-resolution SVG/PNG logo.', 'info')">
              <i data-lucide="upload" style="width:14px; height:14px;"></i>
              <span>Replace Company Logo</span>
            </button>
          </div>

          <div class="card">
            <h3 class="section-title">Corporate Information & University Point of Contact</h3>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Company Legal Entity</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="Google India Private Limited">
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Corporate Career URL</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="https://careers.google.com/students">
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Primary Talent Lead</label>
                <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="Rohit Deshmukh">
              </div>
              <div>
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">University Relations Email</label>
                <input type="email" class="table-search-input" style="width:100%; margin-top:4px;" value="university-in@google.com">
              </div>
              <div style="grid-column: span 2;">
                <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Campus Pitch & Culture Overview</label>
                <textarea class="table-search-input" style="width:100%; height:100px; padding:10px; margin-top:4px; font-family:inherit;">Google engineers solve mission-critical problems at planet scale. We partner with top technological institutes to nurture exceptional early-career software developers, distributed system builders, and machine learning researchers.</textarea>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    recruiterJobs: () => {
      const data = CampusLinkStore.get();
      const jobs = data.jobs.filter(j => j.company.includes('Google') || true);
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Active Campus Postings</h1>
            <p class="page-subtitle">Manage campus openings, configure cutoff benchmarks, and track applicant pools</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#recruiter/create-job')">
              <i data-lucide="plus" style="width:16px; height:16px;"></i>
              <span>Create New Posting</span>
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job Title & Location</th>
                <th>Package (CTC)</th>
                <th>Cutoff (CGPA)</th>
                <th>Eligible Branches</th>
                <th>Total Applicants</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${jobs.map(j => `
                <tr>
                  <td>
                    <div style="font-weight:700; color:var(--navy-900); font-size:14px;">${j.title}</div>
                    <div style="font-size:12px; color:var(--text-muted);">${j.location} • Drive: ${j.driveDate}</div>
                  </td>
                  <td style="font-weight:700; color:var(--brand-blue);">${j.ctc}</td>
                  <td><strong>${j.minCgpa}</strong></td>
                  <td><span style="font-size:12px; color:var(--text-main);">${j.allowedBranches.join(', ')}</span></td>
                  <td><strong>${j.applicantsCount}</strong></td>
                  <td><span class="badge badge-success">Accepting Applications</span></td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#recruiter/ai-matching')">Rank Batch</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    recruiterCandidates: () => {
      const data = CampusLinkStore.get();
      const list = data.studentsDirectory;
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Candidate Pool & Directory</h1>
            <p class="page-subtitle">Batch of 2026 registered candidates eligible for Google technical drives</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast('Exporting candidate profiles to Excel...', 'success')">
              <i data-lucide="download" style="width:16px; height:16px;"></i>
              <span>Export Pool</span>
            </button>
          </div>
        </div>

        <div class="table-toolbar" style="background:white; border-radius:var(--radius-md); margin-bottom:16px;">
          <div class="table-filter-group">
            <input type="text" class="table-search-input" placeholder="Search by name, branch, skills...">
            <select class="table-select">
              <option>All Branches (CSE, ISE, ECE)</option>
              <option>CSE Only</option>
              <option>ISE Only</option>
            </select>
          </div>
          <span style="font-size:13px; color:var(--text-muted);">680 Total Batch Size</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Primary Skills</th>
                <th>Readiness</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(s => `
                <tr>
                  <td>
                    <div style="font-weight:700; color:var(--navy-900); font-size:14px;">${s.name}</div>
                    <div style="font-size:11.5px; color:var(--text-muted);">${s.usn}</div>
                  </td>
                  <td>${s.branch}</td>
                  <td><strong>${s.cgpa}</strong></td>
                  <td>
                    <div class="skill-pill-container">
                      ${s.skills.slice(0, 3).map(sk => `<span class="badge badge-neutral">${sk}</span>`).join('')}
                    </div>
                  </td>
                  <td><span class="badge ${s.readinessScore >= 85 ? 'badge-success' : 'badge-info'}">${s.readinessScore}%</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showWhyMatchedModal('${s.id}')">Inspect Fit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    recruiterDrives: () => {
      const drvs = CampusLinkStore.get().drives;
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Placement Drive Operations</h1>
            <p class="page-subtitle">Manage drive dates, room allocations, test links, and student attendance rosters</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#recruiter/scheduler')">
              <i data-lucide="calendar" style="width:16px; height:16px;"></i>
              <span>View Slot Calendar</span>
            </button>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${drvs.map(d => `
            <div class="card" style="border-left:4px solid var(--brand-blue);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h3 style="font-size:17px; font-weight:800; color:var(--navy-950);">${d.company} — ${d.role}</h3>
                  <div style="font-size:13px; color:var(--text-muted);">${d.date} • ${d.startTime} – ${d.endTime} • <strong>${d.venue}</strong></div>
                </div>
                <div style="display:flex; gap:8px;">
                  <span class="badge badge-info">${d.registeredCount} Registered</span>
                  <span class="badge badge-success">${d.shortlistedCount} Shortlisted</span>
                </div>
              </div>

              <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:13px; margin-bottom:14px;">
                <strong>Planned Evaluation Rounds:</strong> ${d.rounds.join(' ➔ ')}
              </div>

              <div style="display:flex; gap:10px;">
                <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#recruiter/ai-matching')">View Ranked Cohort</button>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showToast('Drive roster downloaded as PDF.', 'info')">Export Roster</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    recruiterInterviews: () => CampusLinkApp.views.studentInterviews(),
    recruiterOffers: () => CampusLinkApp.views.officerOffers(),

    recruiterAnalytics: () => {
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Hiring Analytics & Conversion Funnel</h1>
            <p class="page-subtitle">Real-time candidate conversion yield across screening, coding sandbox, and technical interview loops</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast('Exporting hiring pipeline report...', 'success')">
              <i data-lucide="download" style="width:16px; height:16px;"></i>
              <span>Export Metrics</span>
            </button>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Application to Shortlist</div>
              <div class="kpi-value">19.7%</div>
              <div class="kpi-trend trend-up">28 Shortlisted</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-blue"><i data-lucide="filter"></i></div>
          </div>
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Interview Conversion</div>
              <div class="kpi-value">64.2%</div>
              <div class="kpi-trend trend-up">18 In Loop</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="video"></i></div>
          </div>
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Offer Acceptance Rate</div>
              <div class="kpi-value">94.4%</div>
              <div class="kpi-trend trend-up">17 Expected Hires</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-green"><i data-lucide="award"></i></div>
          </div>
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Average Screening Time</div>
              <div class="kpi-value">1.4 Days</div>
              <div class="kpi-trend" style="color:#2563eb;">AI Accelerated</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="zap"></i></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Skill-Wise Score Distribution in Applicant Pool</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span style="font-weight:700;">Data Structures & Algorithmic Problem Solving</span>
                <span><strong>88%</strong> mean batch accuracy</span>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:88%; background:#2563eb;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span style="font-weight:700;">System Design & Microservices</span>
                <span><strong>72%</strong> mean batch accuracy</span>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:72%; background:#06b6d4;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span style="font-weight:700;">Full Stack API & Cloud Deployment</span>
                <span><strong>81%</strong> mean batch accuracy</span>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:81%; background:#10b981;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    recruiterSettings: () => {
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Recruiter Settings & Hiring Preferences</h1>
            <p class="page-subtitle">Configure automated screening thresholds, notification webhooks, and team access</p>
          </div>
        </div>

        <div class="card" style="max-width:760px;">
          <h3 class="section-title">Automated Screening Rules</h3>
          <div style="display:flex; flex-direction:column; gap:16px; margin:16px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">Strict CGPA Filtering</div>
                <div style="font-size:12px; color:var(--text-muted);">Auto-reject applications below 8.00 minimum cutoff</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">AI Resume ATS Auto-Shortlist</div>
                <div style="font-size:12px; color:var(--text-muted);">Automatically move top 20% match candidates to Round 1 queue</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">Real-Time WhatsApp & Email Alerts</div>
                <div style="font-size:12px; color:var(--text-muted);">Notify interviewer panels 15 minutes before scheduled slots</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>
          </div>

          ${CampusLinkApp.renderThemeSelector()}

          <button class="btn btn-primary" style="margin-top:20px;" onclick="CampusLinkApp.showToast('Recruiter preferences updated.', 'success')">
            <span>Save Preferences</span>
          </button>
        </div>
      `;
    },

    studentSettings: () => {
      const data = CampusLinkStore.get();
      const st = data.currentUser;
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Account & Notification Settings</h1>
            <p class="page-subtitle">Manage communication channels, session credentials, and interview alert preferences</p>
          </div>
        </div>

        <div class="card" style="max-width:760px;">
          <h3 class="section-title">Notification Channels</h3>
          <div style="display:flex; flex-direction:column; gap:16px; margin:16px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">New Job Opening Alerts</div>
                <div style="font-size:12px; color:var(--text-muted);">Notify when a job matching your skills (>80%) is posted</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">Interview Call & Slot Confirmations</div>
                <div style="font-size:12px; color:var(--text-muted);">Immediate SMS & Email dispatch when shortlisted</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">Document Verification Notifications</div>
                <div style="font-size:12px; color:var(--text-muted);">Alerts when placement office approves or requests changes</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>
          </div>

          <h3 class="section-title" style="margin-top:24px;">Security & Password</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:16px 0;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Current Password</label>
              <input type="password" class="table-search-input" style="width:100%; margin-top:4px;" value="password123">
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">New Password</label>
              <input type="password" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="Min 8 characters">
            </div>
          </div>

          ${CampusLinkApp.renderThemeSelector()}

          <button class="btn btn-primary" style="margin-top:20px;" onclick="CampusLinkApp.showToast('Account preferences saved.', 'success')">
            <span>Save Preferences</span>
          </button>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // PLACEMENT OFFICER COMMAND CENTER (15 VIEWS)
    // -----------------------------------------------------------
    officerDashboard: () => {
      const data = CampusLinkStore.get();
      const stats = data.officerDashboardStats;
      const branches = data.branchAnalytics;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Placement Command Center</h1>
            <p class="page-subtitle">National Institute of Technology • 2026 Placement Performance Command</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.navigateTo('#officer/reports')">
              <i data-lucide="file-spreadsheet" style="width:16px; height:16px;"></i>
              <span>NIRF Report</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#officer/risk-prediction')">
              <i data-lucide="alert-triangle" style="width:16px; height:16px;"></i>
              <span>At-Risk Watchlist (48)</span>
            </button>
          </div>
        </div>

        <!-- 5 TOP EXECUTIVE KPIS -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Eligible Students</div>
              <div class="kpi-value">${stats.totalEligibleStudents}</div>
              <div class="kpi-trend trend-up">${stats.placementReadyStudents} Ready</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-blue"><i data-lucide="users"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Placement Rate</div>
              <div class="kpi-value">${stats.placementRate}%</div>
              <div class="kpi-trend trend-up">${stats.placedStudents} Placed</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-green"><i data-lucide="trending-up"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Total Offers</div>
              <div class="kpi-value">${stats.totalOffers}</div>
              <div class="kpi-trend trend-up">1.27 Offers / Student</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="gift"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Average CTC</div>
              <div class="kpi-value">${stats.averagePackage}</div>
              <div class="kpi-trend trend-up">Max: ${stats.highestPackage}</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="dollar-sign"></i></div>
          </div>
        </div>

        <!-- BRANCH PLACEMENT CONVERSION TABLE -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <div class="card-title">Branch-Wise Placement Conversion & CTC Realization</div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Department / Branch</th>
                  <th>Registered</th>
                  <th>Placed</th>
                  <th>Placement %</th>
                  <th>Average CTC</th>
                  <th>Top Package</th>
                </tr>
              </thead>
              <tbody>
                ${branches.map(b => `
                  <tr>
                    <td style="font-weight:700; color:var(--navy-900);">${b.branch}</td>
                    <td>${b.total}</td>
                    <td>${b.placed}</td>
                    <td><span class="badge badge-success">${b.rate}</span></td>
                    <td style="font-weight:700; color:var(--brand-blue);">${b.avgCtc}</td>
                    <td><strong>${b.topOffer}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------
    // OFFICER RISK PREDICTION ENGINE
    // -----------------------------------------------------------
    officerRiskPrediction: () => {
      const data = CampusLinkStore.get();
      const highRisk = data.riskPrediction.highRisk;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">AI Predictive Risk & Intervention Matrix</h1>
            <p class="page-subtitle">Early risk detection identifying students needing remedial algorithmic training before Tier-2 cycles</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          ${highRisk.map(s => `
            <div class="card" style="border-left:4px solid #ef4444;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div>
                  <h3 style="font-size:17px; font-weight:800; color:var(--navy-950);">${s.name} (${s.usn})</h3>
                  <div style="font-size:13px; color:var(--text-muted);">${s.branch} • CGPA ${s.cgpa} • Readiness: <strong>${s.readiness}/100</strong></div>
                </div>
                <span class="badge badge-danger">High Risk Candidate</span>
              </div>

              <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
                <div style="font-weight:700; color:#991b1b; font-size:13px; margin-bottom:4px;">Contributing Risk Factors:</div>
                <ul style="padding-left:18px; font-size:12.5px; color:#7f1d1d;">
                  ${s.factors.map(f => `<li>${f}</li>`).join('')}
                </ul>
              </div>

              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:14px; margin-bottom:16px;">
                <div style="font-weight:700; color:#1e40af; font-size:13px; margin-bottom:2px;">AI Recommended Intervention:</div>
                <div style="font-size:12.5px; color:#1e3a8a;">${s.recommendedIntervention}</div>
              </div>

              <div style="display:flex; gap:10px;">
                <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.showToast('Enrolled ${s.name} into DSA Remedial Sprint.', 'success')">Assign Remedial Sprint</button>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showToast('Mentor alert sent to HOD.', 'info')">Assign Faculty Mentor</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    officerStudents: () => {
      const data = CampusLinkStore.get();
      const list = data.studentsDirectory;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Master Student Directory</h1>
            <p class="page-subtitle">Batch of 2026 • 680 Total Candidates</p>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Readiness</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(st => `
                <tr>
                  <td style="font-weight:700; color:var(--navy-900);">${st.name}</td>
                  <td>${st.branch}</td>
                  <td><strong>${st.cgpa}</strong></td>
                  <td><span class="badge badge-info">${st.readinessScore}%</span></td>
                  <td><span class="badge ${st.status === 'Shortlisted' ? 'badge-success' : st.status === 'At-Risk' ? 'badge-danger' : 'badge-neutral'}">${st.status}</span></td>
                  <td><button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#officer/student-details')">View 360°</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    officerStudentDetails: () => {
      const data = CampusLinkStore.get();
      const st = data.studentsDirectory[0];
      const p = data.studentProfile;
      return `
        <div class="page-header">
          <div>
            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#officer/students')" style="margin-bottom:8px;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
              <span>Back to Student Directory</span>
            </button>
            <h1 class="page-title">${st.name} — Student 360° Dossier</h1>
            <p class="page-subtitle">${st.branch} • USN: ${st.usn} • Batch of 2026</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showAssignMentorModal('${st.id}')">
              <i data-lucide="user-plus" style="width:16px; height:16px;"></i>
              <span>Assign Mentor</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Official institutional transcript verified.', 'success')">
              <i data-lucide="check-circle" style="width:16px; height:16px;"></i>
              <span>Verify Candidate</span>
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:300px 1fr; gap:24px;">
          <div class="card" style="text-align:center;">
            <img src="${st.avatar}" style="width:96px; height:96px; border-radius:50%; object-fit:cover; margin:0 auto 16px auto; border:3px solid var(--brand-blue-border);">
            <h3 style="font-size:18px; font-weight:800; color:var(--navy-950);">${st.name}</h3>
            <p style="font-size:13px; color:var(--text-muted);">${st.usn} • ${st.branch}</p>

            <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; margin:16px 0; text-align:left; font-size:13px; display:flex; flex-direction:column; gap:8px;">
              <div><strong>CGPA:</strong> ${st.cgpa} / 10.0</div>
              <div><strong>Campus Readiness:</strong> <span class="badge badge-success">${st.readinessScore}%</span></div>
              <div><strong>Placement Status:</strong> <span class="badge badge-info">${st.status}</span></div>
              <div><strong>Risk Classification:</strong> <span class="badge badge-neutral">${st.riskLevel} Risk</span></div>
            </div>

            <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="CampusLinkApp.navigateTo('#student/resume')">
              <i data-lucide="file-text" style="width:14px; height:14px;"></i>
              <span>Inspect ATS Resume (94%)</span>
            </button>
          </div>

          <div class="card">
            <h3 class="section-title">Verified Core Competencies & Academic History</h3>
            
            <div style="margin:16px 0;">
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Skill Verification Matrix</div>
              <div class="skill-pill-container">
                ${st.skills.map(s => `<span class="skill-tag-matched"><i data-lucide="check" style="width:12px; height:12px;"></i> ${s}</span>`).join('')}
              </div>
            </div>

            <div style="margin:20px 0;">
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Institutional Applications Track</div>
              <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <div>
                  <div style="font-weight:700; color:var(--navy-900);">Google India — Software Development Engineer - I</div>
                  <div style="font-size:12px; color:var(--text-muted);">Package: ₹34.50 LPA • Drive: 08 Oct 2026</div>
                </div>
                <span class="badge badge-success">Shortlisted for Technical Loop</span>
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button class="btn btn-primary" onclick="CampusLinkApp.showToast('Student dossier dispatched to recruiting team.', 'success')">
                <i data-lucide="send" style="width:15px; height:15px;"></i>
                <span>Fast-Track Recommend to Recruiter</span>
              </button>
            </div>
          </div>
        </div>
      `;
    },
    officerRecruiters: () => {
      const recs = CampusLinkStore.get().recruitersDirectory;
      return `
        <div class="page-header"><h1 class="page-title">Recruiter Directory & Tier Partners</h1></div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Company</th><th>Tier</th><th>Active Jobs</th><th>Offers</th><th>Status</th></tr></thead>
            <tbody>
              ${recs.map(r => `<tr><td style="font-weight:700;">${r.name}</td><td>${r.tier}</td><td>${r.activeJobs}</td><td>${r.totalOffers}</td><td><span class="badge badge-success">${r.status}</span></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    officerJobs: () => CampusLinkApp.views.studentJobs(),
    officerAIMatching: () => CampusLinkApp.views.recruiterAIMatching(),
    officerDrives: () => {
      const drvs = CampusLinkStore.get().drives;
      return `
        <div class="page-header"><h1 class="page-title">Master Placement Drives</h1></div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Company</th><th>Role</th><th>CTC</th><th>Date</th><th>Venue</th><th>Status</th></tr></thead>
            <tbody>
              ${drvs.map(d => `<tr><td style="font-weight:700;">${d.company}</td><td>${d.role}</td><td style="font-weight:700; color:var(--brand-blue);">${d.ctc}</td><td>${d.date}</td><td>${d.venue}</td><td><span class="badge badge-success">${d.status}</span></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    },
    officerScheduler: () => CampusLinkApp.views.recruiterScheduler(),
    officerInterviews: () => CampusLinkApp.views.studentInterviews(),
    officerOffers: () => {
      const off = CampusLinkStore.get().offers;
      return `
        <div class="page-header"><h1 class="page-title">Master Offers Registry</h1></div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Company</th><th>Role</th><th>Package</th><th>Status</th></tr></thead>
            <tbody>
              ${off.map(o => `<tr><td>Aarav Sharma</td><td style="font-weight:700;">${o.company}</td><td>${o.role}</td><td style="font-weight:700; color:var(--brand-blue);">${o.ctc}</td><td><span class="badge badge-success">Holding</span></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    },
    officerDocuments: () => {
      const q = CampusLinkStore.get().documentVerificationQueue;
      return `
        <div class="page-header"><h1 class="page-title">Institutional Document Verification Desk</h1></div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Student</th><th>USN</th><th>Document Type</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${q.map(d => `
                <tr>
                  <td style="font-weight:700;">${d.studentName}</td>
                  <td>${d.usn}</td>
                  <td>${d.docType}</td>
                  <td><span class="badge ${d.status === 'Verified' ? 'badge-success' : 'badge-warning'}">${d.status}</span></td>
                  <td><button class="btn btn-primary btn-sm" onclick="CampusLinkStore.updateDocumentStatus('${d.id}', 'Verified'); CampusLinkApp.handleRouteChange();">Verify Document</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },
    officerAnalytics: () => CampusLinkApp.views.officerDashboard(),
    officerNotifications: () => CampusLinkApp.views.studentNotifications(),
    officerReports: () => {
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Institutional Compliance & NAAC / NIRF Placement Reports</h1>
            <p class="page-subtitle">Accreditation-grade reports with verified statistical distribution and corporate conversion</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="window.print()">
              <i data-lucide="printer" style="width:16px; height:16px;"></i>
              <span>Print Dossier</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.showReportExportModal('NAAC Criterion V Placement Report')">
              <i data-lucide="file-spreadsheet" style="width:16px; height:16px;"></i>
              <span>Generate & Export Dossier</span>
            </button>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Graduating Batch Strength</div>
              <div class="kpi-value">680</div>
              <div class="kpi-trend trend-up">All 5 Engg Branches</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-blue"><i data-lucide="users"></i></div>
          </div>
          <div class="kpi-card">
            <div>
              <div class="kpi-label">NIRF Placed Count</div>
              <div class="kpi-value">412</div>
              <div class="kpi-trend trend-up">60.58% Placement Index</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-green"><i data-lucide="check-circle-2"></i></div>
          </div>
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Median Institutional CTC</div>
              <div class="kpi-value">₹12.20 LPA</div>
              <div class="kpi-trend trend-up">+14.2% YoY Growth</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="trending-up"></i></div>
          </div>
          <div class="kpi-card">
            <div>
              <div class="kpi-label">Tier-1 Super Dream Ratio</div>
              <div class="kpi-value">47.6%</div>
              <div class="kpi-trend" style="color:#2563eb;">Offers > ₹10 LPA</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="award"></i></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Available Accreditation Formats</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:var(--navy-900);">NIRF Data Capture System (DCS)</div>
                  <div style="font-size:12px; color:var(--text-muted);">Section 5.2 Higher Studies & Placement Tracking</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showReportExportModal('NIRF DCS Format')">Preview & Download</button>
              </div>

              <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:var(--navy-900);">NAAC Criterion 5.2.1 Institutional Metric</div>
                  <div style="font-size:12px; color:var(--text-muted);">Employer list, offer letters, and student USN cross-table</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showReportExportModal('NAAC Metric 5.2.1')">Preview & Download</button>
              </div>

              <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:var(--navy-900);">NBA Tier-1 Outcome Based Education (OBE)</div>
                  <div style="font-size:12px; color:var(--text-muted);">Program-specific placement attainment analysis</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.showReportExportModal('NBA Criterion 4')">Preview & Download</button>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Placement Salary Slab Distribution</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>Pinnacle (> ₹35 LPA)</span>
                <strong>18 Students (3.4%)</strong>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:3.4%; background:#10b981;"></div>
              </div>

              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>Marquee (₹20 - ₹35 LPA)</span>
                <strong>72 Students (13.7%)</strong>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:13.7%; background:#06b6d4;"></div>
              </div>

              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>Super Dream (₹10 - ₹20 LPA)</span>
                <strong>178 Students (33.9%)</strong>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:33.9%; background:#2563eb;"></div>
              </div>

              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>Dream (₹6 - ₹10 LPA)</span>
                <strong>182 Students (34.7%)</strong>
              </div>
              <div style="height:8px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                <div style="height:100%; width:34.7%; background:#8b5cf6;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    officerAuditLogs: () => {
      const data = CampusLinkStore.get();
      const logs = data.auditLogs || [];
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Institutional Security & Audit Trail</h1>
            <p class="page-subtitle">Immutable chronological ledger of placement drives, offers, document verifications, and auth events</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast('Exporting audit log ledger (JSON format)...', 'success')">
              <i data-lucide="download" style="width:16px; height:16px;"></i>
              <span>Export Audit Ledger</span>
            </button>
          </div>
        </div>

        <div class="table-toolbar" style="background:white; border-radius:var(--radius-md); margin-bottom:16px;">
          <div class="table-filter-group">
            <input type="text" class="table-search-input" placeholder="Search by actor, action, target...">
            <select class="table-select">
              <option>All Actions</option>
              <option>DRIVE_SCHEDULED</option>
              <option>OFFER_EXTENDED</option>
              <option>DOCUMENT_VERIFIED</option>
              <option>CONFLICT_DETECTED</option>
            </select>
          </div>
          <span style="font-size:13px; color:var(--text-muted);">${logs.length} System Records Logged</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp & IP</th>
                <th>Action Event</th>
                <th>Actor / Source</th>
                <th>Target Resource</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td>
                    <div style="font-weight:700; color:var(--navy-900); font-size:13px;">${l.timestamp}</div>
                    <div style="font-size:11.5px; color:var(--text-muted); font-family:monospace;">${l.ip}</div>
                  </td>
                  <td>
                    <span class="badge ${l.action.includes('OFFER') ? 'badge-success' : l.action.includes('CONFLICT') ? 'badge-warning' : 'badge-info'}" style="font-family:monospace; font-size:11.5px;">
                      ${l.action}
                    </span>
                  </td>
                  <td style="font-weight:600; color:var(--text-main);">${l.actor}</td>
                  <td style="font-size:13px; color:var(--navy-900);">${l.target}</td>
                  <td>
                    <span class="badge ${l.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}">${l.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    officerSettings: () => {
      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Placement Cell Institutional Settings</h1>
            <p class="page-subtitle">Configure university placement bylaws, dream offer policy, and drive eligibility criteria</p>
          </div>
        </div>

        <div class="card" style="max-width:800px;">
          <h3 class="section-title">Institutional Placement Regulations</h3>

          <div style="display:flex; flex-direction:column; gap:16px; margin:18px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">One-Student-One-Job Policy</div>
                <div style="font-size:12px; color:var(--text-muted);">Placed students are blocked from participating in equal or lower tier drives</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">Dream Offer Upgrade Threshold</div>
                <div style="font-size:12px; color:var(--text-muted);">Allow placed students to attend Tier-1 drives if CTC delta exceeds 100%</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:700; color:var(--navy-900);">Automated Attendance De-registration</div>
                <div style="font-size:12px; color:var(--text-muted);">De-register students absent from confirmed PPT/interview loops for 2 weeks</div>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Institutional Cutoff (Default CGPA)</label>
              <input type="number" step="0.1" class="table-search-input" style="width:100%; margin-top:4px;" value="7.0">
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Accreditation Academic Year</label>
              <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="2025 - 2026">
            </div>
          </div>

          ${CampusLinkApp.renderThemeSelector()}

          <button class="btn btn-primary" style="margin-top:20px;" onclick="CampusLinkApp.showToast('Institutional placement settings successfully saved.', 'success')">
            <i data-lucide="save" style="width:15px; height:15px;"></i>
            <span>Save Institutional Regulations</span>
          </button>
        </div>
      `;
    }
  }
};

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', CampusLinkApp.init);
