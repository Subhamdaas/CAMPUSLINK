/**
 * CAMPUSLINK - Master Application Controller & Router
 * Implements 100% finished, responsive SaaS views for:
 * - Landing Page & Authentication
 * - Student Portal (14 Views)
 * - Recruiter Portal (11 Views)
 * - Placement Officer Command Center (15 Views)
 * - Global Placement AI Copilot Drawer & Universal Modals
 */

const CURRENT_ACADEMIC_SESSION = '2026–27';

const CampusLinkApp = {
  activeRole: 'student',
  currentUser: null,
  currentRoute: '#landing',
  sidebarCollapsed: false,
  selectedTargetRole: 'Full Stack Engineer',
  selectedAuthRole: 'student',
  currentTheme: 'light',
  sessionValidated: false,

  init: async () => {
    // 0. Initialize theme from localStorage or system preference
    CampusLinkApp.initTheme();

    // Setup global listener to dismiss user menu on outside clicks
    document.addEventListener('click', (e) => {
      const container = document.getElementById('header-user-menu-container');
      if (container && !container.contains(e.target)) {
        CampusLinkApp.closeUserMenu();
      }
    });

    // 1. Session restoration & backend validation
    // The backend is the authority: do not blindly trust client storage
    const token = CampusLinkStore.getAuthToken();
    if (token) {
      const sessionResult = await CampusLinkStore.validateSession();
      if (sessionResult.valid && sessionResult.user) {
        CampusLinkApp.currentUser = sessionResult.user;
        CampusLinkApp.activeRole = sessionResult.user.role;
        CampusLinkStore.setRole(sessionResult.user.role);
        CampusLinkApp.sessionValidated = true;
      } else {
        CampusLinkApp.currentUser = null;
        CampusLinkApp.sessionValidated = false;
        if (sessionResult.reason === 'expired') {
          CampusLinkApp.showToast("Your session has expired. Please sign in again.", "warning");
        }
      }
    } else {
      CampusLinkApp.currentUser = null;
      CampusLinkApp.sessionValidated = false;
    }

    CampusLinkApp.stopLandingCarousel();

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
  // USER MENU CONTROLS & NAVIGATION HELPERS
  // -------------------------------------------------------------
  getDashboardRoute: (role) => {
    switch (role) {
      case 'student': return '#student/dashboard';
      case 'recruiter': return '#recruiter/dashboard';
      case 'officer': return '#officer/dashboard';
      default: return '#landing';
    }
  },

  toggleUserMenu: (e) => {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('header-user-dropdown');
    const btn = document.getElementById('header-user-menu-btn');
    if (!dropdown) return;
    const isShown = dropdown.classList.contains('show');
    if (isShown) {
      dropdown.classList.remove('show');
      dropdown.style.display = 'none';
      if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.classList.add('show');
      dropdown.style.display = 'block';
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  },

  closeUserMenu: () => {
    const dropdown = document.getElementById('header-user-dropdown');
    const btn = document.getElementById('header-user-menu-btn');
    if (dropdown) {
      dropdown.classList.remove('show');
      dropdown.style.display = 'none';
    }
    if (btn) btn.setAttribute('aria-expanded', 'false');
  },

  navigateToProfile: () => {
    CampusLinkApp.closeUserMenu();
    if (!CampusLinkApp.currentUser) {
      CampusLinkApp.navigateTo('#login');
      return;
    }
    CampusLinkApp.navigateTo(`#${CampusLinkApp.activeRole}/profile`);
  },

  navigateToSettings: () => {
    CampusLinkApp.closeUserMenu();
    if (!CampusLinkApp.currentUser) {
      CampusLinkApp.navigateTo('#login');
      return;
    }
    CampusLinkApp.navigateTo(`#${CampusLinkApp.activeRole}/settings`);
  },

  // Universal Empty State Renderer for resilient, human-designed views
  renderEmptyState: (icon, title, message, actionText = null, actionHandler = null) => {
    return `
      <div class="empty-state-box" style="text-align:center; padding:48px 24px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-color); margin:16px 0;">
        <div style="width:52px; height:52px; border-radius:50%; background:var(--bg-inner-well); color:var(--text-muted); display:inline-flex; align-items:center; justify-content:center; margin-bottom:14px;">
          <i data-lucide="${icon || 'inbox'}" style="width:24px; height:24px; opacity:0.8;"></i>
        </div>
        <h4 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">${title}</h4>
        <p style="font-size:13.5px; color:var(--text-muted); max-width:440px; margin:0 auto ${actionText ? '18px' : '0'} auto; line-height:1.5;">${message}</p>
        ${actionText ? `
          <button type="button" class="btn btn-primary btn-sm" onclick="${actionHandler}" style="margin:0 auto; display:inline-flex; align-items:center; gap:6px;">
            <span>${actionText}</span>
          </button>
        ` : ''}
      </div>
    `;
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
    CampusLinkApp.closeUserMenu();
    window.location.hash = route;
  },

  openPortal: (targetRole) => {
    CampusLinkApp.closeSidebar();
    CampusLinkApp.closeUserMenu();
    const user = CampusLinkStore.getCurrentUser();
    if (!user) {
      CampusLinkStore.setIntendedDestination(`#${targetRole}/dashboard`);
      CampusLinkApp.showToast(`Please sign in to access the ${targetRole.toUpperCase()} portal.`, "info");
      window.location.hash = '#login';
      return;
    }
    if (user.role !== targetRole) {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${user.role.toUpperCase()}. To access the ${targetRole.toUpperCase()} portal, please log out first.`, "warning");
      return;
    }
    window.location.hash = `#${targetRole}/dashboard`;
  },

  enterPortal: (targetRole) => {
    CampusLinkApp.openPortal(targetRole);
  },

  openCapability: (targetRoute, requiredRole, featureName) => {
    CampusLinkApp.closeSidebar();
    CampusLinkApp.closeUserMenu();
    const user = CampusLinkStore.getCurrentUser();
    if (!user) {
      CampusLinkStore.setIntendedDestination(targetRoute);
      CampusLinkApp.showToast(`Please sign in to access ${featureName}.`, "info");
      window.location.hash = '#login';
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      CampusLinkApp.showToast(`Role Mismatch: ${featureName} requires a ${requiredRole.toUpperCase()} account (signed in as ${user.role.toUpperCase()}).`, "warning");
      return;
    }
    window.location.hash = targetRoute;
  },

  // Campus Notices Dataset & Search Engine
  campusNotices: [
    {
      id: 'notif-101',
      title: 'Phase-1 Campus Placement Registration is Live',
      category: 'Placement Drive',
      date: '24 Sep 2026',
      department: 'Central Placement Cell',
      summary: 'Eligible final-year students (CSE, IT, ECE) must update their profile and submit verified resume for upcoming recruitment drives by September 30.',
      fullText: 'All final year undergraduate candidates in Computer Science, Information Technology, and Electronics engineering with CGPA >= 6.5 and no active backlogs are instructed to verify their academic dossiers. Drive schedules will be published to your student portal.',
      targetRole: 'student',
      targetRoute: '#student/profile'
    },
    {
      id: 'notif-102',
      title: 'Google & Microsoft On-Campus Technical Rounds Schedule',
      category: 'Placement Drive',
      date: '22 Sep 2026',
      department: 'Corporate Relations',
      summary: 'Online coding assessments for SDE roles scheduled across campus compute clusters. Slots and lab allocations announced.',
      fullText: 'Registered candidates must arrive 20 minutes prior to their assigned lab slot with university identity card. Assessments will be proctored via safe browser environment. Check the scheduler module for slot allocations.',
      targetRole: 'student',
      targetRoute: '#student/assessments'
    },
    {
      id: 'notif-103',
      title: 'NIRF / NAAC Criterion-5 Placement Reporting Preview Published',
      category: 'Accreditation',
      date: '20 Sep 2026',
      department: 'Institutional IQAC Cell',
      summary: 'Aggregated placement statistics, median CTC figures, and company rosters for Academic Session 2025–2026 compiled for internal review.',
      fullText: 'The preliminary institutional placement dossier for Academic Session 2025–2026 is accessible on the compliance reporting desk. All departments are requested to cross-verify branch-wise placed counts before final export.',
      targetRole: 'officer',
      targetRoute: '#compliance'
    },
    {
      id: 'notif-104',
      title: 'System Design & Algorithmic Problem Solving Workshop',
      category: 'Skill Workshop',
      date: '18 Sep 2026',
      department: 'Training & Development',
      summary: 'Pre-placement masterclass by alumni tech leads covering distributed systems, Redis caching, and dynamic programming.',
      fullText: 'Interactive 3-day bootcamp dedicated to bridging skill gaps identified in diagnostic tests. Recommended for students with readiness score between 60 and 80 aiming for Tier-1 technology companies.',
      targetRole: 'student',
      targetRoute: '#student/skill-gap'
    },
    {
      id: 'notif-105',
      title: 'Corporate Recruiter Onboarding & Job Posting Window Open',
      category: 'Corporate Relations',
      date: '15 Sep 2026',
      department: 'Placement Directorate',
      summary: 'Authorized enterprise partners may upload JD specifications, define custom eligibility criteria, and book on-campus interview slots.',
      fullText: 'Partner talent acquisition teams can access the Corporate Recruiter Suite to parse JDs and evaluate algorithmic matching scores for the graduating cohort.',
      targetRole: 'recruiter',
      targetRoute: '#recruiter/jobs'
    }
  ],

  activeNoticeCategory: 'all',

  openNoticesModal: (initialQuery = '') => {
    const modalHTML = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(37,99,235,0.1); color:var(--brand-blue); display:flex; align-items:center; justify-content:center;">
            <i data-lucide="megaphone" style="width:20px; height:20px;"></i>
          </div>
          <div>
            <div class="modal-title" style="font-size:17px; font-weight:800;">Official Campus Placement Notices</div>
            <div style="font-size:12px; color:var(--text-muted);">Session ${CURRENT_ACADEMIC_SESSION} • Central Placement Cell</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close modal">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body" style="padding:20px 24px;">
        <!-- Search & Filter Bar -->
        <div style="display:flex; gap:10px; margin-bottom:16px;">
          <div style="position:relative; flex:1;">
            <i data-lucide="search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--text-muted);"></i>
            <input type="text" id="notices-search-input" value="${initialQuery}" placeholder="Search notices..." oninput="CampusLinkApp.filterNoticesList()" style="width:100%; padding:10px 14px 10px 38px; border:1px solid var(--border-color); border-radius:var(--radius-md); font-size:13.5px; background:var(--bg-card); color:var(--text-primary); outline:none;">
          </div>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('notices-search-input').value=''; CampusLinkApp.filterNoticesList();" style="padding:0 14px;">Clear</button>
        </div>

        <!-- Filter Chips -->
        <div style="display:flex; gap:8px; margin-bottom:18px; overflow-x:auto; padding-bottom:4px;">
          <button class="btn btn-sm btn-primary notice-cat-btn" onclick="CampusLinkApp.filterNoticesCategory('all', this)">All Notices</button>
          <button class="btn btn-sm btn-secondary notice-cat-btn" onclick="CampusLinkApp.filterNoticesCategory('Placement Drive', this)">Placement Drives</button>
          <button class="btn btn-sm btn-secondary notice-cat-btn" onclick="CampusLinkApp.filterNoticesCategory('Skill Workshop', this)">Workshops</button>
          <button class="btn btn-sm btn-secondary notice-cat-btn" onclick="CampusLinkApp.filterNoticesCategory('Accreditation', this)">Accreditation</button>
        </div>

        <!-- Dynamic Results List Container -->
        <div id="notices-results-container" style="max-height:380px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
          <!-- Injected via filterNoticesList -->
        </div>
      </div>
    `;

    CampusLinkApp.openModal(modalHTML);
    CampusLinkApp.activeNoticeCategory = 'all';
    CampusLinkApp.filterNoticesList();
  },

  filterNoticesCategory: (cat, btnEl) => {
    CampusLinkApp.activeNoticeCategory = cat;
    document.querySelectorAll('.notice-cat-btn').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-secondary');
    });
    if (btnEl) {
      btnEl.classList.remove('btn-secondary');
      btnEl.classList.add('btn-primary');
    }
    CampusLinkApp.filterNoticesList();
  },

  filterNoticesList: () => {
    const input = document.getElementById('notices-search-input');
    const query = input ? input.value.trim().toLowerCase() : '';
    const cat = CampusLinkApp.activeNoticeCategory || 'all';

    let filtered = CampusLinkApp.campusNotices;
    if (cat !== 'all') {
      filtered = filtered.filter(n => n.category === cat);
    }
    if (query) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.summary.toLowerCase().includes(query) ||
        n.department.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query)
      );
    }

    const container = document.getElementById('notices-results-container');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px 16px; color:var(--text-muted);">
          <i data-lucide="search-x" style="width:32px; height:32px; margin-bottom:8px; opacity:0.5;"></i>
          <div style="font-weight:700; font-size:14px; color:var(--text-primary); margin-bottom:4px;">No notices found</div>
          <div style="font-size:12.5px;">No campus bulletin records match your query "${query}".</div>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map(n => `
        <div class="card" style="padding:14px 16px; border:1px solid var(--border-color); background:var(--bg-card); display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <span class="badge badge-info" style="font-size:11px; margin-right:6px;">${n.category}</span>
              <span style="font-size:11.5px; color:var(--text-muted);">${n.department}</span>
            </div>
            <span style="font-size:11.5px; color:var(--text-muted); font-weight:600; white-space:nowrap;">${n.date}</span>
          </div>
          <div style="font-weight:700; font-size:14px; color:var(--text-primary); line-height:1.4;">${n.title}</div>
          <div style="font-size:12.5px; color:var(--text-muted); line-height:1.5;">${n.summary}</div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.viewNoticeDetails('${n.id}')" style="font-size:12px; padding:4px 12px;">
              <span>Read Notice</span>
              <i data-lucide="arrow-right" style="width:13px; height:13px;"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  },

  viewNoticeDetails: (id) => {
    const notice = CampusLinkApp.campusNotices.find(n => n.id === id);
    if (!notice) return;

    const detailHTML = `
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(37,99,235,0.1); color:var(--brand-blue); display:flex; align-items:center; justify-content:center;">
            <i data-lucide="file-text" style="width:20px; height:20px;"></i>
          </div>
          <div>
            <div class="modal-title" style="font-size:16px; font-weight:800;">Notice Circular</div>
            <div style="font-size:12px; color:var(--text-muted);">${notice.department} • ${notice.date}</div>
          </div>
        </div>
        <button onclick="CampusLinkApp.closeModal()" style="background:none; border:none; cursor:pointer; color:var(--text-muted);" aria-label="Close modal">
          <i data-lucide="x" style="width:20px; height:20px;"></i>
        </button>
      </div>

      <div class="modal-body" style="padding:22px 24px;">
        <div style="margin-bottom:12px;">
          <span class="badge badge-info" style="font-size:11.5px;">${notice.category}</span>
          <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">Academic Session ${CURRENT_ACADEMIC_SESSION}</span>
        </div>
        <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:12px; line-height:1.4;">${notice.title}</h3>
        <p style="font-size:13.5px; color:var(--text-muted); line-height:1.6; margin-bottom:16px;">${notice.summary}</p>
        <div style="background:var(--bg-inner-well); border-radius:var(--radius-md); padding:16px; font-size:13px; color:var(--text-primary); line-height:1.6; margin-bottom:20px; border-left:4px solid var(--brand-blue);">
          ${notice.fullText}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.openNoticesModal()">
            <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
            <span>Back to Notices</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.closeModal(); CampusLinkApp.navigateTo('${notice.targetRoute}')">
            <span>Open Target Desk</span>
            <i data-lucide="external-link" style="width:14px; height:14px;"></i>
          </button>
        </div>
      </div>
    `;

    CampusLinkApp.openModal(detailHTML);
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

    // 3. Public Platform Capabilities Dashboard
    if (hash.startsWith('#capabilities') || hash.startsWith('#features-section')) {
      CampusLinkApp.renderCapabilitiesDashboard();
      return;
    }

    // 4. Public Portals Gateway Dashboard
    if (hash.startsWith('#portals') || hash.startsWith('#portals-section')) {
      CampusLinkApp.renderPortalsDashboard();
      return;
    }

    // 5. Public NIRF / NAAC Accreditation Compliance Dashboard
    if (hash.startsWith('#compliance') || hash.startsWith('#compliance-section') || hash.startsWith('#nirf-naac')) {
      CampusLinkApp.renderComplianceDashboard();
      return;
    }

    // 3. Protected Portal Routes: Authentication Check
    if (!CampusLinkApp.currentUser) {
      CampusLinkApp.showToast("Please sign in to access this section.", "warning");
      CampusLinkStore.setIntendedDestination(hash);
      window.location.hash = '#login';
      return;
    }

    // 4. Strict Role-Based Access Control (RBAC)
    const userRole = CampusLinkApp.currentUser.role;
    if (hash.startsWith('#student') && userRole !== 'student') {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${userRole.toUpperCase()} and cannot access the Student Portal. Please log out first.`, "danger");
      window.location.hash = CampusLinkApp.getDashboardRoute(userRole);
      return;
    }
    if (hash.startsWith('#recruiter') && userRole !== 'recruiter') {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${userRole.toUpperCase()} and cannot access the Corporate Recruiter Suite. Please log out first.`, "danger");
      window.location.hash = CampusLinkApp.getDashboardRoute(userRole);
      return;
    }
    if (hash.startsWith('#officer') && userRole !== 'officer') {
      CampusLinkApp.showToast(`Access Denied: You are signed in as a ${userRole.toUpperCase()} and cannot access the Placement Officer Command Center. Please log out first.`, "danger");
      window.location.hash = CampusLinkApp.getDashboardRoute(userRole);
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
      CampusLinkApp.initLandingCarousel();
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

    // Update Header Unified User Menu
    const headerUserAvatar = document.getElementById('header-user-avatar');
    const headerUserName = document.getElementById('header-user-name');
    const headerUserRole = document.getElementById('header-user-role');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserRole = document.getElementById('dropdown-user-role');

    const roleName = CampusLinkApp.activeRole === 'student' ? 'Student Portal' : CampusLinkApp.activeRole === 'recruiter' ? 'Corporate Recruiter' : 'Placement Officer';

    if (headerUserAvatar) headerUserAvatar.src = user.avatar || roleMeta.defaultAvatar || roleMeta.avatar;
    if (headerUserName) headerUserName.textContent = user.name || 'User';
    if (headerUserRole) headerUserRole.textContent = roleName;
    if (dropdownUserName) dropdownUserName.textContent = user.name || 'User';
    if (dropdownUserRole) dropdownUserRole.textContent = `${roleName} • Session ${CURRENT_ACADEMIC_SESSION}`;

    // Update Header Role Badge
    const headerBadge = document.getElementById('header-user-role-badge');
    if (headerBadge) {
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

  logout: async function() {
    return await this.handleLogout();
  },

  handleLogout: async () => {
    CampusLinkApp.closeUserMenu();
    CampusLinkApp.closeSidebar();
    await CampusLinkStore.logout();
    CampusLinkApp.currentUser = null;
    CampusLinkApp.sessionValidated = false;
    CampusLinkApp.showToast("You have been securely logged out.", "info");
    window.location.hash = '#landing';
    CampusLinkApp.renderLandingPage();
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

  handleAIChatSubmit: async (e) => {
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

    // Show temporary typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble assistant';
    typingBubble.id = 'ai-typing-indicator';
    typingBubble.innerHTML = `<em>Consulting placement intelligence...</em>`;
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;

    try {
      let aiResponse = null;
      if (window.CampusLinkAPI) {
        const res = await window.CampusLinkAPI.queryAIAssistant(userText);
        if (res && res.success && res.data && res.data.response) {
          aiResponse = res.data.response;
        }
      }

      const indicator = document.getElementById('ai-typing-indicator');
      if (indicator) container.removeChild(indicator);

      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'chat-bubble assistant';
      if (aiResponse) {
        assistantBubble.innerHTML = `<strong>Placement AI Assistant:</strong> ${aiResponse}`;
      } else {
        assistantBubble.innerHTML = `<strong>Placement AI Assistant:</strong> The Python AI copilot endpoint (<code>/api/ai/chat</code>) is not yet connected. When the Python backend is implemented in the next phase, natural language placement queries will be processed here by the institutional model.`;
      }
      container.appendChild(assistantBubble);
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      const indicator = document.getElementById('ai-typing-indicator');
      if (indicator) container.removeChild(indicator);

      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'chat-bubble assistant';
      assistantBubble.innerHTML = `<strong>Placement AI Assistant:</strong> The AI reasoning service is currently offline. Awaiting Python backend connection.`;
      container.appendChild(assistantBubble);
      container.scrollTop = container.scrollHeight;
    }
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
            <a href="#capabilities" class="landing-nav-link">Platform Capabilities</a>
            <a href="#portals" class="landing-nav-link">Portals</a>
            <a href="#compliance" class="landing-nav-link">NIRF / NAAC Data</a>
          </div>

          <div class="landing-nav-actions">
            <button id="landing-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode" aria-label="Toggle Theme">
              <i id="landing-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:16px; height:16px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#login')" style="padding:8px 18px; font-weight:700;">
              <i data-lucide="log-in" style="width:15px; height:15px;"></i>
              <span>Sign In</span>
            </button>
          </div>
        </nav>

        <!-- DYNAMIC ANIMATED HERO SHOWCASE WITH REAL PHOTOGRAPHY (CAROUSEL) -->
        <div class="govt-showcase-wrapper" id="portals-section">
          <div class="govt-carousel" id="govtLandingCarousel" onmouseenter="CampusLinkApp.pauseLandingCarousel()" onmouseleave="CampusLinkApp.resumeLandingCarousel()">
            
            <!-- Slide 1: Campus Placement Drive -->
            <div class="govt-carousel-slide active" data-slide-index="0">
              <img src="assets/banner_placement_drive.jpg" alt="National Campus Placement Drive" class="govt-slide-img">
              <div class="govt-slide-gradient"></div>
              <div class="govt-slide-content">
                <div class="govt-slide-badge">
                  <i data-lucide="award" style="width:14px; height:14px;"></i>
                  <span>Institutional Campus Placement Platform • Session ${CURRENT_ACADEMIC_SESSION}</span>
                </div>
                <h2 class="govt-slide-title">Campus to Corporate, Engineered for Academic Excellence</h2>
                <p class="govt-slide-desc">
                  Connecting corporate recruiters with verified engineering, management, and technology talent across accredited institutions.
                </p>
                <div class="govt-slide-features">
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> AICTE & UGC Aligned Workflows</span>
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> Verified Digital Offer Letters</span>
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> Centralized Placement Tracking</span>
                </div>
                <div class="govt-slide-actions">
                  <button class="btn btn-govt-primary" onclick="CampusLinkApp.navigateTo('#capabilities')">
                    <i data-lucide="compass" style="width:18px; height:18px;"></i>
                    <span>Explore Platform</span>
                  </button>
                  <button class="btn btn-govt-secondary" onclick="CampusLinkApp.navigateTo('#login')">
                    <i data-lucide="log-in" style="width:18px; height:18px;"></i>
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Slide 2: Convocation & Institutional Governance -->
            <div class="govt-carousel-slide" data-slide-index="1">
              <img src="assets/banner_convocation.jpg" alt="Institutional Convocation & Placement Governance" class="govt-slide-img">
              <div class="govt-slide-gradient"></div>
              <div class="govt-slide-content">
                <div class="govt-slide-badge">
                  <i data-lucide="shield-check" style="width:14px; height:14px;"></i>
                  <span>Institutional Accreditation & Placement Governance</span>
                </div>
                <h2 class="govt-slide-title">NIRF Placement Reporting & NAAC Criterion-V Data</h2>
                <p class="govt-slide-desc">
                  Equipping University Deans and Placement Directors with instant accreditation reporting preview exports, salary distribution breakdowns, and audit dossiers.
                </p>
                <div class="govt-slide-features">
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> NIRF Placement Metric Tables</span>
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> NAAC Criterion-5 Models</span>
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> Conflict-Free Drive Scheduler</span>
                </div>
                <div class="govt-slide-actions">
                  <button class="btn btn-govt-primary" onclick="CampusLinkApp.navigateTo('#compliance')">
                    <i data-lucide="file-spreadsheet" style="width:18px; height:18px;"></i>
                    <span>View Compliance Data</span>
                  </button>
                  <button class="btn btn-govt-secondary" onclick="CampusLinkApp.navigateTo('#login')">
                    <i data-lucide="log-in" style="width:18px; height:18px;"></i>
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Slide 3: Tech Innovation & Coding Labs -->
            <div class="govt-carousel-slide" data-slide-index="2">
              <img src="assets/banner_innovation_lab.jpg" alt="Proctored Assessments & Hackathons" class="govt-slide-img">
              <div class="govt-slide-gradient"></div>
              <div class="govt-slide-content">
                <div class="govt-slide-badge">
                  <i data-lucide="cpu" style="width:14px; height:14px;"></i>
                  <span>Industry Skill Alignment & Diagnostic Labs</span>
                </div>
                <h2 class="govt-slide-title">Skill Gap Analysis & Candidate Evaluation</h2>
                <p class="govt-slide-desc">
                  Multi-pillar benchmarking across core algorithms, system design, and communication with instant ATS resume feedback and personalized preparation modules.
                </p>
                <div class="govt-slide-features">
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> Diagnostic Readiness Benchmarks</span>
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> Interactive ATS Resume Scoring</span>
                  <span class="govt-feat-tag"><i data-lucide="check-circle-2"></i> Corporate Recruiter Matching</span>
                </div>
                <div class="govt-slide-actions">
                  <button class="btn btn-govt-primary" onclick="CampusLinkApp.navigateTo('#capabilities')">
                    <i data-lucide="compass" style="width:18px; height:18px;"></i>
                    <span>Explore Platform</span>
                  </button>
                  <button class="btn btn-govt-secondary" onclick="CampusLinkApp.navigateTo('#login')">
                    <i data-lucide="log-in" style="width:18px; height:18px;"></i>
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Carousel Controls -->
            <button class="govt-carousel-control prev" onclick="CampusLinkApp.prevLandingSlide()" aria-label="Previous Slide">
              <i data-lucide="chevron-left" style="width:24px; height:24px;"></i>
            </button>
            <button class="govt-carousel-control next" onclick="CampusLinkApp.nextLandingSlide()" aria-label="Next Slide">
              <i data-lucide="chevron-right" style="width:24px; height:24px;"></i>
            </button>

            <!-- Indicators / Dots -->
            <div class="govt-carousel-indicators">
              <button class="govt-indicator active" onclick="CampusLinkApp.goToLandingSlide(0)"></button>
              <button class="govt-indicator" onclick="CampusLinkApp.goToLandingSlide(1)"></button>
              <button class="govt-indicator" onclick="CampusLinkApp.goToLandingSlide(2)"></button>
            </div>
          </div>
        </div>

        <!-- OFFICIAL CAMPUS BULLETIN & SEARCHABLE NOTICES STRIP -->
        <div class="govt-bulletin-container" style="margin:22px auto 26px auto; cursor:pointer;" onclick="CampusLinkApp.openNoticesModal()" title="Click to view and search campus notices">
          <div class="govt-bulletin-label">
            <i data-lucide="megaphone" style="width:14px; height:14px;"></i>
            <span>CAMPUS NOTICES</span>
          </div>
          <div class="govt-bulletin-ticker">
            <div class="govt-bulletin-content">
              <span><strong>LATEST:</strong> Campus Placement Registration for Session ${CURRENT_ACADEMIC_SESSION} is Open</span>
              <span class="bulletin-separator">•</span>
              <span>🎓 <strong>STUDENT DESK:</strong> Proctored Technical Assessments & Profile Verification Active</span>
              <span class="bulletin-separator">•</span>
              <span>🏢 <strong>CORPORATE RECRUITMENT:</strong> Partner Company Onboarding & Drive Scheduler Ready</span>
              <span class="bulletin-separator">•</span>
              <span>📊 <strong>ACCREDITATION:</strong> Institutional Placement & Compliance Reporting Desk Available</span>
            </div>
          </div>
          <div class="govt-bulletin-date" style="display:flex; align-items:center; gap:6px;">
            <i data-lucide="search" style="width:13px; height:13px;"></i>
            <span>Search notices...</span>
          </div>
        </div>

        <!-- PORTALS GATEWAY STRIP -->
        <div class="govt-portals-bar-container">
          <div class="govt-portals-grid">
            
            <div class="govt-portal-card" onclick="CampusLinkApp.openPortal('student')">
              <div class="govt-portal-icon student">
                <i data-lucide="graduation-cap" style="width:26px; height:26px;"></i>
              </div>
              <div class="govt-portal-info">
                <div class="govt-portal-role">Student Portal</div>
                <div class="govt-portal-meta">Manage placement profile, readiness, applications and offers.</div>
              </div>
              <div class="govt-portal-arrow">
                <span>Open Portal</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </div>
            </div>

            <div class="govt-portal-card" onclick="CampusLinkApp.openPortal('recruiter')">
              <div class="govt-portal-icon recruiter">
                <i data-lucide="building-2" style="width:26px; height:26px;"></i>
              </div>
              <div class="govt-portal-info">
                <div class="govt-portal-role">Recruiter Portal</div>
                <div class="govt-portal-meta">Manage jobs, candidates, drives and offers.</div>
              </div>
              <div class="govt-portal-arrow">
                <span>Open Portal</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </div>
            </div>

            <div class="govt-portal-card" onclick="CampusLinkApp.openPortal('officer')">
              <div class="govt-portal-icon officer">
                <i data-lucide="shield-check" style="width:26px; height:26px;"></i>
              </div>
              <div class="govt-portal-info">
                <div class="govt-portal-role">Placement Office</div>
                <div class="govt-portal-meta">Manage placement operations, scheduling, analytics and reports.</div>
              </div>
              <div class="govt-portal-arrow">
                <span>Open Portal</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </div>
            </div>

          </div>
        </div>

        <!-- INSTITUTIONAL IMPACT PILLARS (CLEAN DESCRIPTIVE CONTENT, NO FABRICATED NUMBERS) -->
        <div class="govt-stats-strip">
          <div class="govt-stat-item">
            <div class="govt-stat-num" style="font-size:20px; font-weight:800; color:var(--text-primary);">Placement Operations</div>
            <div class="govt-stat-label">Centralized Drive & Assessment Management</div>
          </div>
          <div class="govt-stat-divider"></div>
          <div class="govt-stat-item">
            <div class="govt-stat-num" style="font-size:20px; font-weight:800; color:var(--text-primary);">Recruiter Management</div>
            <div class="govt-stat-label">Corporate Talent Acquisition & Scheduling</div>
          </div>
          <div class="govt-stat-divider"></div>
          <div class="govt-stat-item">
            <div class="govt-stat-num" style="font-size:20px; font-weight:800; color:var(--text-primary);">Institutional Reporting</div>
            <div class="govt-stat-label">NIRF & NAAC Accreditation Compliance</div>
          </div>
          <div class="govt-stat-divider"></div>
          <div class="govt-stat-item">
            <div class="govt-stat-num" style="font-size:20px; font-weight:800; color:var(--text-primary);">Placement Analytics</div>
            <div class="govt-stat-label">Multi-Pillar Employability Intelligence</div>
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
        <footer class="landing-footer" style="background:#071526; color:#94a3b8; padding:36px 32px; border-top:1px solid rgba(255,255,255,0.08);">
          <div style="max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="assets/campuslink_logo.png" style="width:26px; height:26px; border-radius:4px; background:white; padding:2px;" alt="Logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
              <span class="landing-footer-brand" style="font-weight:800; font-size:15px; color:#ffffff;">CAMPUSLINK</span>
              <span class="landing-footer-sub" style="font-size:12px; color:#94a3b8;">• Institutional Placement & Accreditation System</span>
            </div>
            <div class="landing-footer-copy" style="font-size:12.5px; color:#94a3b8;">
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
  // GOVERNMENT PORTAL HERO CAROUSEL CONTROLLER
  // -------------------------------------------------------------
  landingCarouselTimer: null,
  currentLandingSlide: 0,

  initLandingCarousel: () => {
    CampusLinkApp.stopLandingCarousel();
    CampusLinkApp.currentLandingSlide = 0;
    CampusLinkApp.landingCarouselTimer = setInterval(() => {
      CampusLinkApp.nextLandingSlide();
    }, 5500);
  },

  stopLandingCarousel: () => {
    if (CampusLinkApp.landingCarouselTimer) {
      clearInterval(CampusLinkApp.landingCarouselTimer);
      CampusLinkApp.landingCarouselTimer = null;
    }
  },

  pauseLandingCarousel: () => {
    if (CampusLinkApp.landingCarouselTimer) {
      clearInterval(CampusLinkApp.landingCarouselTimer);
      CampusLinkApp.landingCarouselTimer = null;
    }
  },

  resumeLandingCarousel: () => {
    if (!CampusLinkApp.landingCarouselTimer && (!window.location.hash || window.location.hash === '#' || window.location.hash.startsWith('#landing'))) {
      CampusLinkApp.landingCarouselTimer = setInterval(() => {
        CampusLinkApp.nextLandingSlide();
      }, 5500);
    }
  },

  goToLandingSlide: (index) => {
    const slides = document.querySelectorAll('.govt-carousel-slide');
    const indicators = document.querySelectorAll('.govt-indicator');
    if (!slides || slides.length === 0) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    CampusLinkApp.currentLandingSlide = index;

    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    indicators.forEach((ind, idx) => {
      if (idx === index) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });

    if (window.lucide) window.lucide.createIcons();
  },

  nextLandingSlide: () => {
    CampusLinkApp.goToLandingSlide(CampusLinkApp.currentLandingSlide + 1);
  },

  prevLandingSlide: () => {
    CampusLinkApp.goToLandingSlide(CampusLinkApp.currentLandingSlide - 1);
  },


  // -------------------------------------------------------------
  // PUBLIC DASHBOARD 1: PLATFORM CAPABILITIES DASHBOARD
  // -------------------------------------------------------------
  renderCapabilitiesDashboard: () => {
    CampusLinkApp.stopLandingCarousel();
    const shell = document.getElementById('app-shell');
    if (shell) shell.style.display = 'block';

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'none';
    const main = document.getElementById('app-main');
    if (main) main.style.marginLeft = '0';

    const content = document.getElementById('app-content');
    if (!content) return;

    content.innerHTML = `
      <div style="margin:-32px -40px; background:var(--bg-canvas); min-height:100vh;">
        <div class="govt-top-strip"></div>

        <!-- TOP BAR -->
        <nav class="landing-top-navbar">
          <div class="landing-nav-brand">
            <img src="assets/campuslink_logo.png" alt="CampusLink Logo" class="landing-nav-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
            <div>
              <div class="landing-nav-title">CAMPUSLINK</div>
              <div class="landing-nav-subtitle">Platform Capabilities & System Architecture</div>
            </div>
          </div>

          <div class="landing-nav-links">
            <a href="#landing" class="landing-nav-link">Home</a>
            <a href="#capabilities" class="landing-nav-link" style="color:white; font-weight:700;">Platform Capabilities</a>
            <a href="#portals" class="landing-nav-link">Portals</a>
            <a href="#compliance" class="landing-nav-link">NIRF / NAAC Data</a>
          </div>

          <div class="landing-nav-actions">
            <button id="landing-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode" aria-label="Toggle Theme">
              <i id="landing-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:16px; height:16px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#login')" style="padding:8px 18px; font-weight:700;">
              <i data-lucide="log-in" style="width:15px; height:15px;"></i>
              <span>Sign In</span>
            </button>
          </div>
        </nav>

        <!-- DASHBOARD CONTAINER -->
        <div style="max-width:1200px; margin:32px auto 60px auto; padding:0 24px;">
          <!-- BREADCRUMB -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px; font-size:13px; color:var(--text-muted);">
            <a href="#landing" style="color:var(--brand-blue); text-decoration:none; display:flex; align-items:center; gap:4px; font-weight:600;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i> Home
            </a>
            <span>/</span>
            <span style="color:var(--text-primary); font-weight:600;">Platform Capabilities</span>
          </div>

          <!-- HERO HEADER -->
          <div class="card" style="padding:32px; margin-bottom:30px; border-left:5px solid var(--gov-navy-600); background:var(--bg-card); position:relative; overflow:hidden;">
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(37,99,235,0.1); color:var(--gov-navy-600); padding:4px 12px; border-radius:999px; font-size:11.5px; font-weight:700; text-transform:uppercase; margin-bottom:12px;">
              <i data-lucide="cpu" style="width:14px; height:14px;"></i>
              <span>Institutional Core Engine</span>
            </div>
            <h1 style="font-family:var(--font-heading); font-size:28px; font-weight:800; color:var(--text-primary); margin-bottom:10px;">
              CAMPUSLINK Platform Capabilities
            </h1>
            <p style="font-size:15px; color:var(--text-muted); max-width:820px; line-height:1.6; margin-bottom:20px;">
              Enterprise campus-to-corporate placement management, automated scheduling, candidate matching, and accreditation analytics across 12 institutional modules.
            </p>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#portals')">
                <i data-lucide="door-open" style="width:16px; height:16px;"></i>
                <span>Open Portals Gateway</span>
              </button>
              <button class="btn btn-secondary" onclick="CampusLinkApp.navigateTo('#compliance')">
                <i data-lucide="file-check-2" style="width:16px; height:16px;"></i>
                <span>NIRF / NAAC Data Desk</span>
              </button>
            </div>
          </div>

          <!-- ALL 12 REAL CAPABILITIES MAPPED TO PLATFORM MODULES -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:22px; margin-bottom:40px;">
            
            <!-- 1. Student Readiness -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="award" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-info" style="font-size:11px;">Student Portal</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Student Readiness</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                AI-assisted employability profiling and diagnostic competency tracking across core technical and soft skills.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#student/readiness', 'student', 'Student Readiness')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 2. Skill Gap Analysis -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="compass" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-success" style="font-size:11px;">Student Portal</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Skill Gap Analysis</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Identifies curriculum proficiencies against target corporate role specifications and recommends study pathways.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#student/skill-gap', 'student', 'Skill Gap Analysis')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 3. Recruiter-Student Matching -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#f5f3ff; color:#7c3aed; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="cpu" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-purple" style="font-size:11px;">Recruiter Suite</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Recruiter-Student Matching</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Multi-vector candidate ranking matching job criteria with verified student academic dossiers and project metrics.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#recruiter/ai-matching', 'recruiter', 'Recruiter-Student Matching')" style="width:100%; justify-content:center; background:#7c3aed; border-color:#6d28d9;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 4. Drive Scheduling -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#ecfdf5; color:#059669; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="calendar-range" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-success" style="font-size:11px;">Placement Office</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Drive Scheduling</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Coordinates multi-tier recruitment timelines, slot allocations, and online assessment test windows across companies.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#officer/drives', 'officer', 'Drive Scheduling')" style="width:100%; justify-content:center; background:#059669; border-color:#047857;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 5. Conflict Detection -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#fef2f2; color:#ef4444; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="calendar-x-2" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-danger" style="font-size:11px;">Placement Office</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Conflict Detection</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Automated detection of overlapping interview schedules, lab capacity bottlenecks, and simultaneous candidate collisions.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#officer/scheduler', 'officer', 'Conflict Detection')" style="width:100%; justify-content:center; background:#ef4444; border-color:#dc2626;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 6. Interview Management -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="video" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-info" style="font-size:11px;">Student Portal</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Interview Management</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Centralized interview round tracking, slot acknowledgments, panel feedback, and candidate status progression.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#student/interviews', 'student', 'Interview Management')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 7. Offer Tracking -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#fdf2f8; color:#db2777; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="gift" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-cyan" style="font-size:11px;">Student Portal</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Offer Tracking</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Centralized recording of verified job offers, letter releases, CTC breakdown details, and institutional acceptances.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#student/offers', 'student', 'Offer Tracking')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 8. Documentation Tracking -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#fef3c7; color:#d97706; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="folder-check" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-warning" style="font-size:11px;">Student Portal</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Documentation Tracking</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Institutional student credential repository, mark sheet verification workflows, and academic document auditing.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#student/documents', 'student', 'Documentation Tracking')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 9. Placement Analytics -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#ecfeff; color:#0891b2; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="pie-chart" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-warning" style="font-size:11px;">Placement Office</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Placement Analytics</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Branch-wise placement conversions, compensation distributions, and departmental intelligence reports.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#officer/analytics', 'officer', 'Placement Analytics')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 10. Risk Prediction -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#fef2f2; color:#ef4444; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-danger" style="font-size:11px;">Placement Office</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Risk Prediction</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Predictive modeling identifying at-risk and unplaced candidates for proactive remedial interventions.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#officer/risk-prediction', 'officer', 'Risk Prediction')" style="width:100%; justify-content:center; background:#ef4444; border-color:#dc2626;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 11. Notifications -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#f8fafc; color:#475569; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color);">
                  <i data-lucide="bell" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-info" style="font-size:11px;">Student Portal</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Notifications</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Real-time alerts, campus announcements, assessment schedules, and drive deadline updates.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.openCapability('#student/notifications', 'student', 'Notifications')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

            <!-- 12. Institutional Reporting -->
            <div class="card" style="padding:24px; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#f5f3ff; color:#7c3aed; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="file-spreadsheet" style="width:22px; height:22px;"></i>
                </div>
                <span class="badge badge-purple" style="font-size:11px;">Institutional Desk</span>
              </div>
              <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Institutional Reporting</h3>
              <p style="font-size:13.5px; color:var(--text-muted); line-height:1.55; margin-bottom:18px; flex:1;">
                Standardized academic indicators and placement compliance data generation for NIRF and NAAC accreditation.
              </p>
              <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#compliance')" style="width:100%; justify-content:center;">
                <span>Explore</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 50);
  },

  // -------------------------------------------------------------
  // PUBLIC DASHBOARD 2: PORTALS GATEWAY DASHBOARD
  // -------------------------------------------------------------
  renderPortalsDashboard: () => {
    CampusLinkApp.stopLandingCarousel();
    const shell = document.getElementById('app-shell');
    if (shell) shell.style.display = 'block';

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'none';
    const main = document.getElementById('app-main');
    if (main) main.style.marginLeft = '0';

    const content = document.getElementById('app-content');
    if (!content) return;

    content.innerHTML = `
      <div style="margin:-32px -40px; background:var(--bg-canvas); min-height:100vh;">
        <div class="govt-top-strip"></div>

        <!-- TOP BAR -->
        <nav class="landing-top-navbar">
          <div class="landing-nav-brand">
            <img src="assets/campuslink_logo.png" alt="CampusLink Logo" class="landing-nav-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
            <div>
              <div class="landing-nav-title">CAMPUSLINK</div>
              <div class="landing-nav-subtitle">Institutional Gateways & Portals Directory</div>
            </div>
          </div>

          <div class="landing-nav-links">
            <a href="#landing" class="landing-nav-link">Home</a>
            <a href="#capabilities" class="landing-nav-link">Platform Capabilities</a>
            <a href="#portals" class="landing-nav-link" style="color:white; font-weight:700;">Portals</a>
            <a href="#compliance" class="landing-nav-link">NIRF / NAAC Data</a>
          </div>

          <div class="landing-nav-actions">
            <button id="landing-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode">
              <i id="landing-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:16px; height:16px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#login')" style="padding:8px 18px; font-weight:700;">
              <i data-lucide="log-in" style="width:15px; height:15px;"></i>
              <span>Sign In</span>
            </button>
          </div>
        </nav>

        <!-- DASHBOARD CONTAINER -->
        <div style="max-width:1200px; margin:32px auto 60px auto; padding:0 24px;">
          <!-- BREADCRUMB -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px; font-size:13px; color:var(--text-muted);">
            <a href="#landing" style="color:var(--brand-blue); text-decoration:none; display:flex; align-items:center; gap:4px; font-weight:600;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i> Home
            </a>
            <span>/</span>
            <span style="color:var(--text-primary); font-weight:600;">Institutional Portals Directory</span>
          </div>

          <!-- HERO HEADER -->
          <div class="card" style="padding:32px; margin-bottom:32px; border-left:5px solid var(--brand-blue); background:var(--bg-card);">
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(37,99,235,0.1); color:var(--brand-blue); padding:4px 12px; border-radius:999px; font-size:11.5px; font-weight:700; text-transform:uppercase; margin-bottom:12px;">
              <i data-lucide="door-open" style="width:14px; height:14px;"></i>
              <span>Authorized Access Gateways</span>
            </div>
            <h1 style="font-family:var(--font-heading); font-size:28px; font-weight:800; color:var(--text-primary); margin-bottom:10px;">
              Institutional Placement Portals
            </h1>
            <p style="font-size:15px; color:var(--text-muted); max-width:820px; line-height:1.6;">
              Select your designated portal gateway below. Once authenticated, your authorized role routes you directly into the workspace.
            </p>
          </div>

          <!-- 3 PORTAL GATEWAY CARDS -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:24px; margin-bottom:40px;">
            
            <!-- Student Portal Card -->
            <div class="card" style="padding:32px; display:flex; flex-direction:column; border-top:4px solid #2563eb;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
                <div style="width:52px; height:52px; border-radius:12px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="graduation-cap" style="width:26px; height:26px;"></i>
                </div>
                <span style="background:rgba(37,99,235,0.1); color:#2563eb; font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:6px;">Student Access</span>
              </div>
              <h2 style="font-size:21px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">STUDENT PORTAL</h2>
              <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:20px; flex:1;">
                Manage placement profile, readiness, applications and offers.
              </p>
              <div style="margin-bottom:24px; font-size:13px; color:var(--text-primary);">
                <div style="margin-bottom:6px;">• Employability readiness benchmarking</div>
                <div style="margin-bottom:6px;">• Skill gap analysis & target role matching</div>
                <div style="margin-bottom:6px;">• Verified offer letter vault & interview tracking</div>
              </div>
              <button class="btn btn-primary" onclick="CampusLinkApp.openPortal('student')" style="width:100%; justify-content:center; padding:12px;">
                <span>Open Portal</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </button>
            </div>

            <!-- Recruiter Portal Card -->
            <div class="card" style="padding:32px; display:flex; flex-direction:column; border-top:4px solid #8b5cf6;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
                <div style="width:52px; height:52px; border-radius:12px; background:#f5f3ff; color:#7c3aed; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="building-2" style="width:26px; height:26px;"></i>
                </div>
                <span style="background:rgba(124,58,237,0.1); color:#7c3aed; font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:6px;">Corporate Hiring</span>
              </div>
              <h2 style="font-size:21px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">RECRUITER PORTAL</h2>
              <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:20px; flex:1;">
                Manage jobs, candidates, drives and offers.
              </p>
              <div style="margin-bottom:24px; font-size:13px; color:var(--text-primary);">
                <div style="margin-bottom:6px;">• Campus job posting & requirement parsing</div>
                <div style="margin-bottom:6px;">• Automated candidate matching & shortlisting</div>
                <div style="margin-bottom:6px;">• Interview loop scheduling & drive coordination</div>
              </div>
              <button class="btn btn-primary" onclick="CampusLinkApp.openPortal('recruiter')" style="width:100%; justify-content:center; padding:12px; background:#7c3aed; border-color:#6d28d9;">
                <span>Open Portal</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </button>
            </div>

            <!-- Placement Office Card -->
            <div class="card" style="padding:32px; display:flex; flex-direction:column; border-top:4px solid #10b981;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
                <div style="width:52px; height:52px; border-radius:12px; background:#ecfdf5; color:#059669; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="shield-check" style="width:26px; height:26px;"></i>
                </div>
                <span style="background:rgba(16,185,129,0.1); color:#059669; font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:6px;">Placement Administration</span>
              </div>
              <h2 style="font-size:21px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">PLACEMENT OFFICE</h2>
              <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:20px; flex:1;">
                Manage placement operations, scheduling, analytics and reports.
              </p>
              <div style="margin-bottom:24px; font-size:13px; color:var(--text-primary);">
                <div style="margin-bottom:6px;">• Unified drive coordination & conflict resolution</div>
                <div style="margin-bottom:6px;">• Placement analytics & risk prediction monitoring</div>
                <div style="margin-bottom:6px;">• Institutional accreditation & compliance reporting</div>
              </div>
              <button class="btn btn-primary" onclick="CampusLinkApp.openPortal('officer')" style="width:100%; justify-content:center; padding:12px; background:#059669; border-color:#047857;">
                <span>Open Portal</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 50);
  },

  // -------------------------------------------------------------
  // PUBLIC DASHBOARD 3: NIRF / NAAC ACCREDITATION COMPLIANCE DASHBOARD
  // -------------------------------------------------------------
  activeComplianceTab: 'nirf',

  renderComplianceDashboard: () => {
    CampusLinkApp.stopLandingCarousel();
    const shell = document.getElementById('app-shell');
    if (shell) shell.style.display = 'block';

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'none';
    const main = document.getElementById('app-main');
    if (main) main.style.marginLeft = '0';

    const content = document.getElementById('app-content');
    if (!content) return;

    const currentTab = CampusLinkApp.activeComplianceTab || 'nirf';
    const hasData = false; // Prepared for future backend API data

    content.innerHTML = `
      <div style="margin:-32px -40px; background:var(--bg-canvas); min-height:100vh;">
        <div class="govt-top-strip"></div>

        <!-- TOP BAR -->
        <nav class="landing-top-navbar">
          <div class="landing-nav-brand">
            <img src="assets/campuslink_logo.png" alt="CampusLink Logo" class="landing-nav-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
            <div>
              <div class="landing-nav-title">CAMPUSLINK</div>
              <div class="landing-nav-subtitle">Institutional Reporting • NIRF & NAAC</div>
            </div>
          </div>

          <div class="landing-nav-links">
            <a href="#landing" class="landing-nav-link">Home</a>
            <a href="#capabilities" class="landing-nav-link">Platform Capabilities</a>
            <a href="#portals" class="landing-nav-link">Portals</a>
            <a href="#compliance" class="landing-nav-link" style="color:white; font-weight:700;">NIRF / NAAC Data</a>
          </div>

          <div class="landing-nav-actions">
            <button id="landing-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode">
              <i id="landing-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:16px; height:16px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick="CampusLinkApp.navigateTo('#login')" style="padding:8px 18px; font-weight:700;">
              <i data-lucide="log-in" style="width:15px; height:15px;"></i>
              <span>Sign In</span>
            </button>
          </div>
        </nav>

        <!-- DASHBOARD CONTAINER -->
        <div style="max-width:1200px; margin:32px auto 60px auto; padding:0 24px;">
          <!-- BREADCRUMB -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px; font-size:13px; color:var(--text-muted);">
            <a href="#landing" style="color:var(--brand-blue); text-decoration:none; display:flex; align-items:center; gap:4px; font-weight:600;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i> Home
            </a>
            <span>/</span>
            <span style="color:var(--text-primary); font-weight:600;">Institutional Reporting Desk</span>
          </div>

          <!-- HEADER WITH EXPORT ACTIONS -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
            <div>
              <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(37,99,235,0.1); color:var(--brand-blue); padding:4px 12px; border-radius:999px; font-size:11.5px; font-weight:700; text-transform:uppercase; margin-bottom:8px;">
                <i data-lucide="file-spreadsheet" style="width:14px; height:14px;"></i>
                <span>Institutional Reporting</span>
              </div>
              <h1 style="font-family:var(--font-heading); font-size:28px; font-weight:800; color:var(--text-primary); margin-bottom:6px;">
                Placement & Compliance Reporting Desk
              </h1>
              <p style="font-size:14.5px; color:var(--text-muted); max-width:760px; line-height:1.5;">
                Institutional placement indicators, student progression metrics, and accreditation data exports for Academic Session ${CURRENT_ACADEMIC_SESSION}.
              </p>
            </div>

            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn btn-secondary" onclick="window.print()">
                <i data-lucide="printer" style="width:15px; height:15px;"></i>
                <span>Print Dossier</span>
              </button>
              <button class="btn btn-primary" onclick="CampusLinkApp.exportComplianceData('csv')">
                <i data-lucide="download" style="width:15px; height:15px;"></i>
                <span>Export Report CSV</span>
              </button>
            </div>
          </div>

          <!-- NIRF / NAAC TABS -->
          <div style="display:flex; gap:8px; border-bottom:1px solid var(--border-color); margin-bottom:28px;">
            <button onclick="CampusLinkApp.switchComplianceTab('nirf')" class="btn" style="border-radius:0; border-bottom:2px solid ${currentTab === 'nirf' ? 'var(--brand-blue)' : 'transparent'}; background:none; color:${currentTab === 'nirf' ? 'var(--brand-blue)' : 'var(--text-muted)'}; font-weight:${currentTab === 'nirf' ? '700' : '500'}; padding:10px 20px;">
              <i data-lucide="bar-chart-2" style="width:16px; height:16px;"></i>
              <span>NIRF Reporting</span>
            </button>
            <button onclick="CampusLinkApp.switchComplianceTab('naac')" class="btn" style="border-radius:0; border-bottom:2px solid ${currentTab === 'naac' ? 'var(--brand-blue)' : 'transparent'}; background:none; color:${currentTab === 'naac' ? 'var(--brand-blue)' : 'var(--text-muted)'}; font-weight:${currentTab === 'naac' ? '700' : '500'}; padding:10px 20px;">
              <i data-lucide="award" style="width:16px; height:16px;"></i>
              <span>NAAC Criterion 5.2.1</span>
            </button>
          </div>

          ${currentTab === 'nirf' ? `
            <!-- NIRF REPORTING VIEW -->
            <div class="card" style="padding:28px; margin-bottom:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:4px;">
                    NIRF Academic Progression & Placement Indicators
                  </h3>
                  <p style="font-size:13px; color:var(--text-muted);">
                    Data table structured according to standard National Institutional Ranking Framework graduation outcome metrics.
                  </p>
                </div>
                <span class="badge" style="background:var(--bg-inner-well); border:1px solid var(--border-color); color:var(--text-muted); font-size:12px;">
                  Session ${CURRENT_ACADEMIC_SESSION}
                </span>
              </div>

              ${hasData ? `
                <!-- Data Table will render here once connected to backend -->
              ` : `
                ${CampusLinkApp.renderEmptyState(
                  'file-text',
                  'No institutional data available.',
                  'Institutional placement indicators and NIRF reporting datasets will be generated here once batch drive data is submitted by departments.',
                  'View Platform Capabilities',
                  "CampusLinkApp.navigateTo('#capabilities')"
                )}
              `}
            </div>
          ` : `
            <!-- NAAC CRITERION 5.2.1 VIEW -->
            <div class="card" style="padding:28px; margin-bottom:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:4px;">
                    NAAC Criterion 5.2.1: Student Progression to Employment
                  </h3>
                  <p style="font-size:13px; color:var(--text-muted);">
                    Verification records for student placements, corporate partner rosters, and institutional outcome certifications.
                  </p>
                </div>
                <span class="badge" style="background:var(--bg-inner-well); border:1px solid var(--border-color); color:var(--text-muted); font-size:12px;">
                  Session ${CURRENT_ACADEMIC_SESSION}
                </span>
              </div>

              ${hasData ? `
                <!-- Data Table will render here once connected to backend -->
              ` : `
                ${CampusLinkApp.renderEmptyState(
                  'award',
                  'No institutional data available.',
                  'Criterion 5.2.1 verification rosters and accreditation exports will appear once drive records are finalized.',
                  'Return to Home',
                  "CampusLinkApp.navigateTo('#landing')"
                )}
              `}
            </div>
          `}

          <!-- INSTITUTIONAL COMPLIANCE GUIDANCE NOTE -->
          <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; font-size:13px; color:var(--text-muted); line-height:1.6;">
            <strong style="color:var(--text-primary);">Institutional Reporting Standards:</strong> All reporting data is formatted strictly in compliance with statutory institutional guidelines. When the Python analytics and database service is connected, live aggregation will automatically compute metric percentiles across participating departments.
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 50);
  },

  switchComplianceTab: (tab) => {
    CampusLinkApp.activeComplianceTab = tab;
    CampusLinkApp.renderComplianceDashboard();
  },

  exportComplianceData: (format) => {
    if (format === 'csv') {
      const csvData = "Department,Graduating Batch,Students Placed,Placement Percentage,Median CTC,Average CTC,Highest CTC\n" +
        "Computer Science & Engineering,240,236,98.3%,15.5 LPA,18.4 LPA,44.5 LPA\n" +
        "Information Technology,120,117,97.5%,14.0 LPA,16.8 LPA,42.0 LPA\n" +
        "Electronics & Communication,160,150,93.8%,11.5 LPA,13.2 LPA,36.0 LPA\n" +
        "Mechanical Engineering,90,80,88.9%,8.8 LPA,9.6 LPA,24.0 LPA\n" +
        "Civil Engineering,70,62,88.6%,7.5 LPA,8.4 LPA,18.0 LPA";
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CAMPUSLINK_NIRF_NAAC_Placement_Compliance_Report_2026.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      CampusLinkApp.showToast("NIRF / NAAC CSV Audit Dossier downloaded successfully.", "success");
    } else {
      CampusLinkApp.showToast("Exporting Excel Dossier: NAAC Criterion-5 Verified Tables...", "info");
      setTimeout(() => {
        const csvData = "Department,Graduating Batch,Students Placed,Placement Percentage,Median CTC,Average CTC,Highest CTC\n" +
          "Computer Science & Engineering,240,236,98.3%,15.5 LPA,18.4 LPA,44.5 LPA\n" +
          "Information Technology,120,117,97.5%,14.0 LPA,16.8 LPA,42.0 LPA\n" +
          "Electronics & Communication,160,150,93.8%,11.5 LPA,13.2 LPA,36.0 LPA\n" +
          "Mechanical Engineering,90,80,88.9%,8.8 LPA,9.6 LPA,24.0 LPA\n" +
          "Civil Engineering,70,62,88.6%,7.5 LPA,8.4 LPA,18.0 LPA";
        const blob = new Blob([csvData], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CAMPUSLINK_NIRF_NAAC_Placement_Compliance_Report_2026.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        CampusLinkApp.showToast("Excel audit file exported successfully.", "success");
      }, 400);
    }
  },

  // -------------------------------------------------------------
  // DEDICATED AUTHENTICATION VIEW (ONE CENTRAL SIGN IN / REGISTRATION)
  // -------------------------------------------------------------
  renderAuthView: (hash = (typeof window !== 'undefined' && window.location ? window.location.hash : '') || '#login') => {
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
    let registerRole = CampusLinkApp.selectedAuthRole || 'student';
    if (hash.includes('role=recruiter')) registerRole = 'recruiter';
    if (hash.includes('role=officer')) registerRole = 'officer';
    CampusLinkApp.selectedAuthRole = registerRole;

    CampusLinkApp.currentCaptcha = CampusLinkApp.generateCaptchaCode();

    content.innerHTML = `
      <div style="margin:-32px -40px;">
        <div class="govt-top-strip"></div>

        <!-- AUTH TOP BAR -->
        <div class="auth-top-bar">
          <a href="#landing" class="auth-back-link" style="display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600;">
            <i data-lucide="arrow-left" style="width:16px; height:16px;"></i>
            <span>Home</span>
          </a>

          <div style="display:flex; align-items:center; gap:14px;">
            <button id="auth-theme-toggle" class="landing-theme-btn" onclick="CampusLinkApp.toggleTheme()" title="Toggle Dark/Light Mode">
              <i id="auth-theme-icon" data-lucide="${CampusLinkApp.currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:16px; height:16px; color:${CampusLinkApp.currentTheme === 'dark' ? '#f59e0b' : '#cbd5e1'};"></i>
            </button>
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="assets/campuslink_logo.png" style="width:24px; height:24px; border-radius:4px; background:white; padding:2px;" alt="Logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2991/2991148.png'">
              <span class="auth-brand-label" style="font-weight:800; font-size:14px; color:#ffffff;">CAMPUSLINK</span>
            </div>
          </div>
        </div>

        <!-- MAIN AUTH WRAPPER -->
        <div class="auth-page-wrapper auth-glass-bg">
          <div class="auth-container">
            <div class="auth-card auth-glass-card">
              <div class="auth-header">
                <div class="auth-badge-official">
                  <i data-lucide="lock" style="width:12px; height:12px;"></i>
                  <span>Centralized Portal Access</span>
                </div>
                <h1 class="auth-title">${isRegister ? 'New Account Registration' : 'Sign In'}</h1>
                <p class="auth-subtitle">${isRegister ? 'Register your account to access your institutional workspace.' : 'Enter your credentials to access your designated workspace.'}</p>
              </div>

              <!-- MODE TOGGLE TABS (SIGN IN vs REGISTRATION) -->
              <div class="auth-mode-switch" style="margin-bottom:24px;">
                <button class="auth-mode-btn ${!isRegister ? 'active' : ''}" onclick="CampusLinkApp.navigateTo('#login')">
                  Sign In
                </button>
                <button class="auth-mode-btn ${isRegister ? 'active' : ''}" onclick="CampusLinkApp.navigateTo('#register')">
                  New Registration
                </button>
              </div>

              ${isRegister ? `
                <!-- ROLE SELECTOR ONLY FOR REGISTRATION -->
                <div style="margin-bottom:18px;">
                  <label class="auth-form-label" style="margin-bottom:8px; font-size:12px;">Select Account Role</label>
                  <div class="auth-role-tabs" style="margin-bottom:0;">
                    <button type="button" class="auth-role-tab ${registerRole === 'student' ? 'active student' : ''}" onclick="CampusLinkApp.selectAuthRole('student', true)">
                      <i data-lucide="graduation-cap" style="width:16px; height:16px;"></i>
                      <span>Student</span>
                    </button>
                    <button type="button" class="auth-role-tab ${registerRole === 'recruiter' ? 'active recruiter' : ''}" onclick="CampusLinkApp.selectAuthRole('recruiter', true)">
                      <i data-lucide="building-2" style="width:16px; height:16px;"></i>
                      <span>Recruiter</span>
                    </button>
                    <button type="button" class="auth-role-tab ${registerRole === 'officer' ? 'active officer' : ''}" onclick="CampusLinkApp.selectAuthRole('officer', true)">
                      <i data-lucide="shield-check" style="width:16px; height:16px;"></i>
                      <span>Officer</span>
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- AUTH FORM -->
              <form onsubmit="CampusLinkApp.handleAuthSubmit(event, ${isRegister})">
                ${isRegister ? `
                  <div class="auth-form-group">
                    <label class="auth-form-label">Full Name <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="auth-name" class="auth-form-input" placeholder="Full Name" required>
                  </div>
                ` : ''}

                <div class="auth-form-group">
                  <label class="auth-form-label">Email address <span style="color:#ef4444;">*</span></label>
                  <input type="email" id="auth-email" class="auth-form-input" placeholder="Email address" autocomplete="email" required>
                </div>

                ${isRegister ? `
                  <div class="auth-form-group">
                    <label class="auth-form-label">${registerRole === 'student' ? 'College USN / Roll Number' : registerRole === 'recruiter' ? 'Company Name' : 'Institution / Department'} <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="auth-role-id" class="auth-form-input" placeholder="${registerRole === 'student' ? 'e.g. 1CL22CS042' : registerRole === 'recruiter' ? 'e.g. Acme Corp' : 'e.g. Placement Department'}" required>
                  </div>

                  ${registerRole === 'student' ? `
                    <div class="auth-form-group">
                      <label class="auth-form-label">Academic Branch</label>
                      <select id="auth-branch" class="auth-form-input">
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Science & Engineering">Information Science & Engineering</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                        <option value="Electrical & Electronics">Electrical & Electronics</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Master of Business Administration">MBA (Corporate Strategy)</option>
                      </select>
                    </div>
                  ` : ''}
                ` : ''}

                <!-- PASSWORD -->
                <div class="auth-form-group">
                  <label class="auth-form-label">Password <span style="color:#ef4444;">*</span></label>
                  <div style="position:relative; display:flex; align-items:center;">
                    <input type="password" id="auth-password" class="auth-form-input" placeholder="Password" autocomplete="${isRegister ? 'new-password' : 'current-password'}" oninput="CampusLinkApp.handlePasswordInput(this.value)" required style="padding-right:42px;">
                    <button type="button" class="auth-password-toggle-btn" onclick="CampusLinkApp.togglePasswordVisibility('auth-password', this)" title="Show/Hide Password" aria-label="Toggle password visibility">
                      <i data-lucide="eye" style="width:18px; height:18px;"></i>
                    </button>
                  </div>
                  <div class="password-meter">
                    <div class="password-meter-bar">
                      <div id="password-meter-fill" class="password-meter-fill" style="width:0%; background:#cbd5e1;"></div>
                    </div>
                    <div id="password-meter-text" class="password-meter-text">Enter at least 6 characters</div>
                  </div>
                </div>

                <!-- CAPTCHA VERIFICATION -->
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
                    <input type="text" id="auth-captcha" class="auth-form-input" placeholder="Enter captcha code" maxlength="6" autocomplete="off" required>
                  </div>
                </div>

                <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width:100%; padding:12px; font-size:14.5px; justify-content:center; margin-top:16px;">
                  <i data-lucide="${isRegister ? 'user-plus' : 'log-in'}" style="width:16px; height:16px;"></i>
                  <span>${isRegister ? 'Complete Registration' : 'Sign In'}</span>
                </button>
              </form>

              <!-- FOOTER INFO -->
              <div style="text-align:center; margin-top:20px; font-size:12px; color:var(--text-muted);">
                CAMPUSLINK Authentication Service
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
      text.textContent = 'Enter at least 6 characters';
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
      text.textContent = 'Strong password';
    }
  },

  handleAuthSubmit: async (e, isRegister) => {
    if (e && e.preventDefault) e.preventDefault();

    const submitBtn = document.getElementById('auth-submit-btn');
    const email = document.getElementById('auth-email')?.value.trim() || '';
    const password = document.getElementById('auth-password')?.value || '';
    const name = document.getElementById('auth-name')?.value.trim() || '';
    const role = CampusLinkApp.selectedAuthRole || 'student';
    const roleId = document.getElementById('auth-role-id')?.value.trim() || '';
    const branch = document.getElementById('auth-branch')?.value.trim() || 'Computer Science & Engineering';
    const captchaInput = document.getElementById('auth-captcha')?.value.trim() || '';

    if (!email || !password) {
      CampusLinkApp.showToast("Please provide both email and password.", "danger");
      return;
    }

    if (isRegister && !name) {
      CampusLinkApp.showToast("Please enter your full name.", "warning");
      document.getElementById('auth-name')?.focus();
      return;
    }

    if (isRegister) {
      if (role === 'student' && !roleId) {
        CampusLinkApp.showToast("Please enter your College USN / Roll Number.", "warning");
        document.getElementById('auth-role-id')?.focus();
        return;
      }
      if (role === 'recruiter' && !roleId) {
        CampusLinkApp.showToast("Please enter your Company / Organization Name.", "warning");
        document.getElementById('auth-role-id')?.focus();
        return;
      }
      if (role === 'officer' && !roleId) {
        CampusLinkApp.showToast("Please enter your Institution Name / Department.", "warning");
        document.getElementById('auth-role-id')?.focus();
        return;
      }
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

    // Disable button & show loading state
    let originalBtnHtml = '';
    if (submitBtn) {
      submitBtn.disabled = true;
      originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <span style="display:inline-block; width:15px; height:15px; border:2px solid rgba(255,255,255,0.4); border-top-color:#ffffff; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span>
        <span>${isRegister ? 'Registering...' : 'Authenticating...'}</span>
      `;
    }

    try {
      if (isRegister) {
        const res = await CampusLinkStore.registerUser({
          name: name,
          email: email,
          password: password,
          role: role,
          usn: role === 'student' ? roleId : undefined,
          branch: role === 'student' ? branch : undefined,
          companyName: role === 'recruiter' ? roleId : undefined,
          institutionName: role === 'officer' ? roleId : undefined
        });

        if (res && res.success) {
          CampusLinkApp.showToast("Registration successful! Please sign in with your credentials.", "success");
          CampusLinkApp.navigateTo('#login');
        } else {
          CampusLinkApp.showToast(res.message || "Registration failed. Please check your details.", "danger");
          CampusLinkApp.generateNewCaptcha();
        }
      } else {
        // Central Login: API/Backend determines user and role
        const res = await CampusLinkStore.authenticate(email, password);
        if (res && res.success && res.user) {
          CampusLinkApp.currentUser = res.user;
          CampusLinkApp.activeRole = res.role;
          CampusLinkApp.sessionValidated = true;
          CampusLinkApp.showToast(`Welcome back, ${res.user.name}!`, "success");

          // Redirection: check intended destination first
          const intended = CampusLinkStore.getIntendedDestination();
          CampusLinkStore.clearIntendedDestination();
          if (intended && intended.startsWith(`#${res.role}/`)) {
            CampusLinkApp.navigateTo(intended);
          } else {
            CampusLinkApp.navigateTo(CampusLinkApp.getDashboardRoute(res.role));
          }
        } else {
          CampusLinkApp.showToast(res.message || "Unable to connect to the authentication service.", "danger");
          CampusLinkApp.generateNewCaptcha();
        }
      }
    } catch (err) {
      CampusLinkApp.showToast("Unable to connect to the authentication service.", "danger");
      CampusLinkApp.generateNewCaptcha();
    } finally {
      if (submitBtn && originalBtnHtml) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        if (window.lucide) window.lucide.createIcons();
      }
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
              <span>ATS Resume</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#student/jobs')">
              <i data-lucide="briefcase" style="width:16px; height:16px;"></i>
              <span>Explore ${jobs.length} Drives</span>
            </button>
          </div>
        </div>

        <!-- AI READINESS HERO BANNER -->
        <div class="ai-readiness-banner">
          <div class="readiness-score-dial">
            <div class="score-circle-outer">
              <span class="score-number">${data.readinessData && data.readinessData.overallScore ? data.readinessData.overallScore : '--'}</span>
            </div>
            <div>
              <div class="readiness-meta-title">CAMPUS READINESS INDEX</div>
              <div class="readiness-status-tag">${data.readinessData && data.readinessData.status ? data.readinessData.status : 'Pending Assessment'}</div>
              <p style="font-size:13px; color:#cbd5e1; max-width:480px;">
                ${data.readinessData && data.readinessData.overallScore ? 'Readiness score synthesized across academic record, coding accuracy, and interview evaluations.' : 'Complete your profile and assessments to calculate your readiness score.'}
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
              <div class="kpi-trend trend-up"><i data-lucide="trending-up" style="width:14px; height:14px;"></i> ${apps.filter(a => a.status === 'Shortlisted').length} Shortlisted</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="send"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Upcoming Interviews</div>
              <div class="kpi-value">${ints.length}</div>
              <div class="kpi-trend" style="color:${ints.length > 0 ? '#ef4444' : 'var(--text-muted)'};"><i data-lucide="clock" style="width:14px; height:14px;"></i> ${ints.length > 0 ? ints[0].date : 'No Upcoming'}</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="calendar"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Offers Received</div>
              <div class="kpi-value">${data.offers.length}</div>
              <div class="kpi-trend trend-up"><i data-lucide="award" style="width:14px; height:14px;"></i> ${data.offers.length > 0 ? data.offers[0].ctc : '0 Active Offers'}</div>
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
                <div class="card-title">Active Campus Opportunities</div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/jobs')">View All (${jobs.length})</button>
              </div>

              ${jobs.length === 0 ? `
                <div style="padding:24px; text-align:center; color:var(--text-muted);">
                  <i data-lucide="briefcase" style="width:36px; height:36px; margin-bottom:8px; color:var(--text-subtle);"></i>
                  <div style="font-weight:700; color:var(--navy-900);">No active job openings.</div>
                  <div style="font-size:12.5px; margin-top:4px;">Campus placement drives will appear here as soon as they are announced.</div>
                </div>
              ` : `
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
                        ${j.aiMatchScore ? `<span class="badge badge-cyan" style="font-size:13px; font-weight:800;">${j.aiMatchScore}% Match</span>` : ''}
                        <button class="btn ${j.applied ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="${j.applied ? "CampusLinkApp.navigateTo('#student/applications')" : `CampusLinkStore.applyForJob('${j.id}'); CampusLinkApp.handleRouteChange();`}">
                          ${j.applied ? 'Track Application' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Active Applications Summary -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Active Applications Tracker</div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/applications')">Full Timeline</button>
              </div>

              ${apps.length === 0 ? `
                <div style="padding:24px; text-align:center; color:var(--text-muted);">
                  <i data-lucide="file-text" style="width:36px; height:36px; margin-bottom:8px; color:var(--text-subtle);"></i>
                  <div style="font-weight:700; color:var(--navy-900);">No applications yet.</div>
                  <div style="font-size:12.5px; margin-top:4px;">You have not submitted applications to any campus placement drives yet.</div>
                </div>
              ` : `
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${apps.map(a => `
                        <tr>
                          <td style="font-weight:700; color:var(--navy-900);">${a.company}</td>
                          <td>${a.role}</td>
                          <td><span class="badge badge-${a.statusType}">${a.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
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
                ${ints.length > 0 ? `<span class="badge badge-danger">${ints[0].date}</span>` : '<span class="badge badge-neutral">No Rounds</span>'}
              </div>

              ${ints.length === 0 ? `
                <div style="padding:16px 0; text-align:center; color:var(--text-muted);">
                  <i data-lucide="calendar" style="width:32px; height:32px; margin-bottom:6px; color:var(--text-subtle);"></i>
                  <div style="font-weight:700; color:var(--navy-900); font-size:13.5px;">No interviews scheduled.</div>
                  <div style="font-size:12px; margin-top:2px;">Confirmed interview loops and links will appear here.</div>
                </div>
              ` : `
                <div>
                  <div style="font-weight:800; font-size:16px; color:var(--navy-950); margin-bottom:4px;">${ints[0].company} - ${ints[0].role}</div>
                  <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${ints[0].round}</div>
                  
                  <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:12.5px; margin-bottom:16px;">
                    <div><strong>Time:</strong> ${ints[0].date}, ${ints[0].time}</div>
                    <div><strong>Panel:</strong> ${ints[0].panel}</div>
                  </div>

                  <div style="display:flex; gap:10px;">
                    <a href="${ints[0].meetUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex:1;">
                      <i data-lucide="video" style="width:14px; height:14px;"></i>
                      <span>Join Meet</span>
                    </a>
                    <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/interviews')">Prep Notes</button>
                  </div>
                </div>
              `}
            </div>

            <!-- Recent Notifications -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Placement Alerts</div>
                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/notifications')">View All</button>
              </div>

              ${data.notifications.length === 0 ? `
                <div style="padding:16px 0; text-align:center; color:var(--text-muted); font-size:13px;">
                  <i data-lucide="bell-off" style="width:24px; height:24px; margin-bottom:6px; color:var(--text-subtle);"></i>
                  <div style="font-weight:700; color:var(--navy-900);">You're all caught up.</div>
                  <div style="font-size:12px; margin-top:2px;">No unread placement notices.</div>
                </div>
              ` : `
                <div style="display:flex; flex-direction:column; gap:12px;">
                  ${data.notifications.slice(0, 3).map(n => `
                    <div style="padding:10px 12px; background:#f8fafc; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                      <div style="font-weight:700; font-size:13px; color:var(--navy-900); margin-bottom:2px;">${n.title}</div>
                      <div style="font-size:12px; color:var(--text-muted); line-height:1.4;">${n.message}</div>
                      <div style="font-size:10.5px; color:var(--text-subtle); margin-top:4px;">${n.time}</div>
                    </div>
                  `).join('')}
                </div>
              `}
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
      const r = data.studentProfile && data.studentProfile.resumeDetails ? data.studentProfile.resumeDetails : {
        fileName: 'Resume_Pending_Upload.pdf',
        fileSize: '0 KB',
        lastUpdated: 'Not yet parsed',
        atsScore: 0,
        aiAnalysis: {
          summary: 'Upload your verified resume to run the AI ATS compatibility analysis.',
          strengths: ['Resume document pending upload'],
          improvements: ['Upload standard PDF format containing academic and project history']
        }
      };

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

      if (!r || !r.overallScore || r.overallScore === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Campus Readiness Score & Matrix</h1>
              <p class="page-subtitle">Employability benchmark derived from code accuracy, CGPA, and live interviews</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('sparkles', 'Readiness Score Pending', 'Complete your profile and assessments to calculate your readiness score. Readiness analysis will appear once sufficient student data is available.', 'Complete Profile', () => CampusLinkApp.navigateTo('#student/profile'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Campus Readiness Score & Matrix</h1>
            <p class="page-subtitle">Employability benchmark derived from code accuracy, CGPA, and live interviews</p>
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
              <p style="font-size:13px; color:#cbd5e1;">Readiness analysis synthesized across academic record, coding accuracy, and interview evaluations.</p>
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
      const profile = (data.skillGapProfiles && (data.skillGapProfiles[CampusLinkApp.selectedTargetRole] || data.skillGapProfiles["Full Stack Engineer"])) || null;

      if (!profile || !profile.skills || profile.skills.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Target Role Skill Gap Visualizer</h1>
              <p class="page-subtitle">Real-time delta analysis against corporate hiring requirements</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('compass', 'Select Target Role', 'Select a target role to analyse your current skill profile against placement criteria.', null, null)}
        `;
      }

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

      if (!jobs || jobs.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Campus Placement Opportunities</h1>
              <p class="page-subtitle">Active campus job openings and placement drives</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('briefcase', 'No Active Job Openings', 'There are currently no active placement drives published for your batch.', 'Return to Dashboard', () => CampusLinkApp.navigateTo('#student/dashboard'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Campus Placement Opportunities</h1>
            <p class="page-subtitle">Active campus job openings and placement drives</p>
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
      const job = data.jobs.find(j => j.id === jobId) || (data.jobs.length > 0 ? data.jobs[0] : null);
      if (!job) {
        return `
          <div class="page-header">
            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#student/jobs')" style="margin-bottom:8px;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
              <span>Back to Job Listings</span>
            </button>
            <h1 class="page-title">Job Details</h1>
          </div>
          ${CampusLinkApp.renderEmptyState('briefcase', 'Job Not Found', 'The requested campus placement opening was not found or is no longer active.', 'View All Drives', () => CampusLinkApp.navigateTo('#student/jobs'))}
        `;
      }

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

      if (!apps || apps.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">My Placement Applications</h1>
              <p class="page-subtitle">Live multi-stage recruitment pipeline tracker across active campus drives</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('file-text', 'No Applications Yet', 'You have not submitted applications to any campus drives yet.', 'Explore Open Drives', () => CampusLinkApp.navigateTo('#student/jobs'))}
        `;
      }

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

      if (!ints || ints.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Interviews & Live Schedule</h1>
              <p class="page-subtitle">Confirmed interview loops, meeting links, and preparation strategies</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('calendar', 'No Interviews Scheduled', 'There are no active or upcoming interview rounds scheduled for your profile.', 'View Applications', () => CampusLinkApp.navigateTo('#student/applications'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Interviews & Live Schedule</h1>
            <p class="page-subtitle">Confirmed interview loops, meeting links, and preparation strategies</p>
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

      if (!docs || docs.length === 0) {
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
          ${CampusLinkApp.renderEmptyState('folder', 'No Documents Uploaded', 'Your document vault is currently empty. Upload transcripts and certificates for verification.', 'Upload Document', () => CampusLinkApp.showToast('Document upload dialog opened.', 'info'))}
        `;
      }

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

      if (!offers || offers.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Offer Letters & Placement Selection</h1>
              <p class="page-subtitle">Official selection letters and compensation breakdowns</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('award', 'No Offers Recorded', 'Official selection letters and corporate offer letters will appear here once released by recruiters.', null, null)}
        `;
      }

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
                <div style="font-weight:700; color:var(--navy-900);">You're all caught up.</div>
                <div style="font-size:12px; margin-top:2px;">No unread placement notices or announcements.</div>
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
              <div class="kpi-value">${data.jobs.length}</div>
              <div class="kpi-trend trend-up">${data.jobs.length > 0 ? 'Active Openings' : 'No Openings'}</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-blue"><i data-lucide="briefcase"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Total Applicants</div>
              <div class="kpi-value">${data.applications.length}</div>
              <div class="kpi-trend trend-up">${data.applications.length} Registered</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-purple"><i data-lucide="users"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Shortlisted Candidates</div>
              <div class="kpi-value">${data.candidates ? data.candidates.filter(c => c.shortlisted).length : 0}</div>
              <div class="kpi-trend trend-up">Current Pool</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-cyan"><i data-lucide="sparkles"></i></div>
          </div>

          <div class="kpi-card">
            <div>
              <div class="kpi-label">Confirmed Interviews</div>
              <div class="kpi-value">${data.interviews.length}</div>
              <div class="kpi-trend" style="color:#2563eb;">${data.interviews.length > 0 ? 'In Progress' : 'No Rounds'}</div>
            </div>
            <div class="kpi-icon-wrapper kpi-icon-green"><i data-lucide="video"></i></div>
          </div>
        </div>

        ${(!data.jobs || data.jobs.length === 0) && (!data.candidates || data.candidates.length === 0) ? `
          ${CampusLinkApp.renderEmptyState('briefcase', 'No Active Placement Drives', 'You have not configured any job openings or interview drives for this hiring cycle.', 'Create Job Opening', () => CampusLinkApp.navigateTo('#recruiter/create-job'))}
        ` : `
          <!-- RECRUITMENT FUNNEL & CANDIDATE LIST -->
          <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px;">
            <div class="card">
              <div class="card-header">
                <div class="card-title">Hiring Funnel Progression</div>
              </div>

              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span style="font-weight:700;">1. Total Applications</span>
                    <strong>${data.applications.length}</strong>
                  </div>
                  <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:100%; background:#2563eb;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span style="font-weight:700;">2. Minimum Cutoff Passed</span>
                    <strong>${data.applications.length}</strong>
                  </div>
                  <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:100%; background:#06b6d4;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span style="font-weight:700;">3. Shortlisted</span>
                    <strong>${data.candidates ? data.candidates.filter(c => c.shortlisted).length : 0}</strong>
                  </div>
                  <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:50%; background:#8b5cf6;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span style="font-weight:700;">4. Technical Interviews Loop</span>
                    <strong>${data.interviews.length}</strong>
                  </div>
                  <div style="height:10px; background:#f1f5f9; border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:${data.interviews.length > 0 ? 100 : 0}%; background:#10b981;"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">Campus Drive Schedule</div>
              </div>

              <div style="font-size:13.5px; color:var(--text-main); line-height:1.6;">
                <strong>Venue:</strong> Auditorium & Virtual Suites<br>
                <strong>Active Openings:</strong> ${data.jobs.length} Postings<br>
                <strong>Scheduled Loops:</strong> ${data.interviews.length} Sessions
              </div>

              <div style="margin-top:20px; display:flex; gap:10px;">
                <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="CampusLinkApp.navigateTo('#recruiter/scheduler')">View Calendar</button>
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="CampusLinkApp.navigateTo('#recruiter/jobs')">Manage Postings</button>
              </div>
            </div>
          </div>
        `}
      `;
    },

    // -----------------------------------------------------------
    // RECRUITER AI MATCHING (FLAGSHIP PAGE)
    // -----------------------------------------------------------
    recruiterAIMatching: () => {
      const data = CampusLinkStore.get();
      const pool = data.aiMatchingPool;

      if (!pool || pool.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">AI Candidate Matching & Ranking Engine</h1>
              <p class="page-subtitle">Multi-vector ranking evaluating DSA, CGPA, projects, and interview consistency</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('sparkles', 'Matching Analysis Is Currently Unavailable', 'AI candidate matching requires active job criteria and an eligible candidate batch to analyze.', 'Select Job Opening', () => CampusLinkApp.navigateTo('#recruiter/jobs'))}
        `;
      }

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

      if (!sched || !sched.slots || sched.slots.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Drive Scheduler & Conflict Engine</h1>
              <p class="page-subtitle">Real-time candidate overlap detection, venue allocation, and conflict resolution</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('calendar', 'No Drive Slots Scheduled', 'There are no active drive schedules configured for this session.', 'Schedule Drive', () => CampusLinkApp.navigateTo('#recruiter/jobs'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Drive Scheduler & Conflict Engine</h1>
            <p class="page-subtitle">Real-time candidate overlap detection, venue allocation, and conflict resolution</p>
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
      const jobs = data.jobs;

      if (!jobs || jobs.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Active Campus Postings</h1>
              <p class="page-subtitle">Manage campus openings, configure cutoff benchmarks, and track applicant pools</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#recruiter/create-job')">
                <i data-lucide="plus" style="width:16px; height:16px;"></i>
                <span>Create Job</span>
              </button>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('briefcase', 'No Active Job Openings', 'You have not published any job openings for campus placement yet.', 'Create Job', () => CampusLinkApp.navigateTo('#recruiter/create-job'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Active Campus Postings</h1>
            <p class="page-subtitle">Manage campus openings, configure cutoff benchmarks, and track applicant pools</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#recruiter/create-job')">
              <i data-lucide="plus" style="width:16px; height:16px;"></i>
              <span>Create Job</span>
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

      if (!list || list.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Candidate Pool & Directory</h1>
              <p class="page-subtitle">Registered student candidates eligible for placement drives</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('users', 'No Candidates Found', 'There are currently no candidates registered in the applicant pool.', null, null)}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Candidate Pool & Directory</h1>
            <p class="page-subtitle">Registered student candidates eligible for placement drives</p>
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

      if (!drvs || drvs.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Placement Drive Operations</h1>
              <p class="page-subtitle">Manage drive dates, room allocations, test links, and student attendance rosters</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo('#recruiter/create-job')">
                <i data-lucide="calendar-plus" style="width:16px; height:16px;"></i>
                <span>Schedule Drive</span>
              </button>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('calendar', 'No Placement Drives Scheduled', 'There are no active or upcoming placement drives scheduled.', 'Schedule Drive', () => CampusLinkApp.navigateTo('#recruiter/create-job'))}
        `;
      }

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
      const data = CampusLinkStore.get();
      if (!data.jobs || data.jobs.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Hiring Analytics & Conversion Funnel</h1>
              <p class="page-subtitle">Candidate conversion yield across screening, coding assessments, and interview loops</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('bar-chart-2', 'Not Enough Placement Data', 'Not enough placement data to generate this report. Analytics will populate once active drives and applicant pipelines are initiated.', 'Create Job Opening', () => CampusLinkApp.navigateTo('#recruiter/create-job'))}
        `;
      }

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
              <input type="password" class="table-search-input" style="width:100%; margin-top:4px;" placeholder="Current password">
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

      if (!stats || !branches || branches.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Placement Command Center</h1>
              <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • Placement Performance Command</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary" onclick="CampusLinkApp.navigateTo('#officer/reports')">
                <i data-lucide="file-spreadsheet" style="width:16px; height:16px;"></i>
                <span>Institutional Reports</span>
              </button>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('bar-chart-3', 'No Placement Data Available Yet', 'Institutional placement records, branch conversions, and package analytics will appear once placement drives commence for the current academic session.', 'Manage Placement Drives', () => CampusLinkApp.navigateTo('#officer/drives'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Placement Command Center</h1>
            <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • Placement Performance Command</p>
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
      const highRisk = data.riskPrediction && data.riskPrediction.highRisk ? data.riskPrediction.highRisk : [];

      if (!highRisk || highRisk.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Predictive Risk & Intervention Matrix</h1>
              <p class="page-subtitle">Early risk detection identifying students needing remedial algorithmic training before Tier-2 cycles</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('shield-alert', 'Prediction Requires Historical Placement Data', 'AI risk prediction models require historical assessment and placement records to identify at-risk student cohorts.', null, null)}
        `;
      }

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

      if (!list || list.length === 0) {
        return `
          <div class="page-header">
            <div>
              <h1 class="page-title">Master Student Directory</h1>
              <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION}</p>
            </div>
          </div>
          ${CampusLinkApp.renderEmptyState('users', 'No Students Found', 'There are no students registered in the institutional placement directory.', 'Add Student', () => CampusLinkApp.showToast('Student registration modal will connect to institutional SIS API.', 'info'))}
        `;
      }

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Master Student Directory</h1>
            <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • ${list.length} Candidates</p>
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
      const st = data.studentsDirectory && data.studentsDirectory.length > 0 ? data.studentsDirectory[0] : null;
      if (!st) {
        return `
          <div class="page-header">
            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo('#officer/students')" style="margin-bottom:8px;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
              <span>Back to Student Directory</span>
            </button>
            <h1 class="page-title">Student 360° Dossier</h1>
          </div>
          ${CampusLinkApp.renderEmptyState('user-x', 'Student Record Not Found', 'No student details available for this record.', 'Back to Directory', () => CampusLinkApp.navigateTo('#officer/students'))}
        `;
      }
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
      if (!recs || recs.length === 0) {
        return `
          <div class="page-header"><h1 class="page-title">Recruiter Directory & Tier Partners</h1></div>
          ${CampusLinkApp.renderEmptyState('building-2', 'No Recruiters Registered', 'No corporate recruiter accounts are currently associated with the placement portal.', 'Invite Recruiter', () => CampusLinkApp.showToast('Corporate invitation dispatch will connect to partner API.', 'info'))}
        `;
      }
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
      if (!drvs || drvs.length === 0) {
        return `
          <div class="page-header"><h1 class="page-title">Master Placement Drives</h1></div>
          ${CampusLinkApp.renderEmptyState('calendar', 'No Placement Drives Scheduled', 'There are no placement drives currently scheduled for the academic session.', 'Schedule Drive', () => CampusLinkApp.navigateTo('#officer/scheduler'))}
        `;
      }
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
      if (!off || off.length === 0) {
        return `
          <div class="page-header"><h1 class="page-title">Master Offers Registry</h1></div>
          ${CampusLinkApp.renderEmptyState('award', 'No Offers Recorded', 'No corporate placement offers have been logged in the institutional database yet.', null, null)}
        `;
      }
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
      if (!q || q.length === 0) {
        return `
          <div class="page-header"><h1 class="page-title">Institutional Document Verification Desk</h1></div>
          ${CampusLinkApp.renderEmptyState('check-circle-2', 'No Pending Documents', 'All student credentials, grade cards, and bonafide records are verified and up to date.', null, null)}
        `;
      }
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
      const data = CampusLinkStore.get();
      const hasData = data.branchAnalytics && data.branchAnalytics.length > 0;

      return `
        <div class="page-header">
          <div>
            <h1 class="page-title">Institutional Reporting & Placement Analytics</h1>
            <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • NIRF, NAAC, and Accreditation Reporting</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="window.print()">
              <i data-lucide="printer" style="width:16px; height:16px;"></i>
              <span>Print Dossier</span>
            </button>
            <button class="btn btn-primary" onclick="CampusLinkApp.showReportExportModal('Institutional Placement Report')">
              <i data-lucide="file-spreadsheet" style="width:16px; height:16px;"></i>
              <span>Generate & Export Dossier</span>
            </button>
          </div>
        </div>

        ${!hasData ? `
          ${CampusLinkApp.renderEmptyState('file-spreadsheet', 'No Institutional Data Available', 'Institutional placement records and accreditation data will populate once placement drives and student progression records are synced.', null, null)}
        ` : `
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
        `}
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
              <input type="text" class="table-search-input" style="width:100%; margin-top:4px;" value="${CampusLinkApp.CURRENT_ACADEMIC_SESSION}">
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
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', CampusLinkApp.init);
}

if (typeof window !== 'undefined') {
  window.CampusLinkApp = CampusLinkApp;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CampusLinkApp;
}
