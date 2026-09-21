/**
 * CAMPUSLINK - Auth Page Controller (Sign In & Sign Up)
 * Includes Real-Time Dynamic Password Strength Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initAuthTheme();
  initTabSwitchers();
  initPasswordToggles();
  initPasswordStrengthMeter();
  initCaptchaVerification();
  initAuthFormSubmissions();
  initSocialLogin();
  initFeaturesMegaMenu();
});

let currentAuthCaptcha = '';

function generateCaptchaCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function renderCaptchaVisual(code) {
  const colors = ['#1e3a8a', '#0f766e', '#b45309', '#7e22ce', '#be123c', '#1d4ed8'];
  return code.split('').map((char, idx) => {
    const rot = (idx % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 12) + 2);
    const col = colors[idx % colors.length];
    return `<span style="display:inline-block; transform:rotate(${rot}deg); margin:0 3px; font-family:'Courier New', monospace, serif; font-weight:800; font-size:20px; color:${col}; text-shadow:1px 1px 2px rgba(0,0,0,0.15); letter-spacing:2px; user-select:none;">${char}</span>`;
  }).join('');
}

function initCaptchaVerification() {
  const display = document.getElementById('authCaptchaDisplay');
  const refreshBtn = document.getElementById('refreshCaptchaBtn');
  const input = document.getElementById('authCaptchaInput');

  const refresh = () => {
    currentAuthCaptcha = generateCaptchaCode();
    if (display) display.innerHTML = renderCaptchaVisual(currentAuthCaptcha);
    if (input) input.value = '';
    if (window.lucide) window.lucide.createIcons();
  };

  refreshBtn?.addEventListener('click', refresh);
  refresh();
}

function initFeaturesMegaMenu() {
  const toggleBtn = document.getElementById('featuresMenuToggle');
  const overlay = document.getElementById('featuresMegaOverlay');
  const closeBtn = document.getElementById('closeMegaBtn');
  const searchInput = document.getElementById('megaFeatureSearch');
  const cards = document.querySelectorAll('.feature-tile-card');
  const megaSignInBtn = document.getElementById('megaSignInBtn');
  const megaSignUpBtn = document.getElementById('megaSignUpBtn');

  const openFeatures = () => {
    toggleBtn?.classList.add('active');
    overlay?.classList.add('active');
    setTimeout(() => searchInput?.focus(), 100);
  };

  const closeFeatures = () => {
    toggleBtn?.classList.remove('active');
    overlay?.classList.remove('active');
    if (searchInput) {
      searchInput.value = '';
      cards.forEach(c => c.style.display = 'flex');
    }
  };

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (overlay?.classList.contains('active')) {
      closeFeatures();
    } else {
      openFeatures();
    }
  });

  closeBtn?.addEventListener('click', closeFeatures);

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeFeatures();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('active')) {
      closeFeatures();
    }
  });

  // Live filter search
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const kw = card.getAttribute('data-keyword') || '';
      if (text.includes(q) || kw.includes(q)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Mega Action Buttons
  megaSignInBtn?.addEventListener('click', () => {
    closeFeatures();
    document.getElementById('tabSignInBtn')?.click();
  });

  megaSignUpBtn?.addEventListener('click', () => {
    closeFeatures();
    document.getElementById('tabSignUpBtn')?.click();
  });

  // Feature Card Click
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.tile-title')?.textContent || 'Feature';
      closeFeatures();
      showAuthToast(`Selected ${title}. Sign in or register to access.`);
    });
  });
}

function initTabSwitchers() {
  const tabSignIn = document.getElementById('tabSignInBtn');
  const tabSignUp = document.getElementById('tabSignUpBtn');
  const signInView = document.getElementById('signInView');
  const signUpView = document.getElementById('signUpView');
  const switchToSignUp = document.getElementById('switchToSignUp');
  const switchToSignIn = document.getElementById('switchToSignIn');

  const showSignIn = () => {
    tabSignIn?.classList.add('active');
    tabSignUp?.classList.remove('active');
    signInView?.classList.add('active');
    signUpView?.classList.remove('active');
    document.title = 'Sign In - CAMPUSLINK';
  };

  const showSignUp = () => {
    tabSignUp?.classList.add('active');
    tabSignIn?.classList.remove('active');
    signUpView?.classList.add('active');
    signInView?.classList.remove('active');
    document.title = 'Sign Up - CAMPUSLINK';
  };

  tabSignIn?.addEventListener('click', showSignIn);
  tabSignUp?.addEventListener('click', showSignUp);
  switchToSignUp?.addEventListener('click', showSignUp);
  switchToSignIn?.addEventListener('click', showSignIn);
}

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.pwd-toggle-btn');

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="eye-icon"></i>`;
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  });
}

/**
 * Interactive Real-Time Password Strength Engine
 */
function initPasswordStrengthMeter() {
  const pwdInput = document.getElementById('regPassword');
  const label = document.getElementById('strengthLabel');
  const segments = [
    document.getElementById('seg1'),
    document.getElementById('seg2'),
    document.getElementById('seg3'),
    document.getElementById('seg4')
  ];

  const reqLen = document.getElementById('reqLen');
  const reqCase = document.getElementById('reqCase');
  const reqNum = document.getElementById('reqNum');
  const reqSpecial = document.getElementById('reqSpecial');

  if (!pwdInput || !label) return;

  const updateRequirement = (el, isValid) => {
    if (!el) return;
    if (isValid) {
      el.classList.add('valid');
      const icon = el.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'check-circle-2');
      }
    } else {
      el.classList.remove('valid');
      const icon = el.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'circle');
      }
    }
  };

  pwdInput.addEventListener('input', () => {
    const val = pwdInput.value;

    // Evaluate Criteria
    const hasLength = val.length >= 8;
    const hasCase = /[a-z]/.test(val) && /[A-Z]/.test(val);
    const hasNum = /[0-9]/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);

    // Update Checklist
    updateRequirement(reqLen, hasLength);
    updateRequirement(reqCase, hasCase);
    updateRequirement(reqNum, hasNum);
    updateRequirement(reqSpecial, hasSpecial);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Reset Segments
    segments.forEach(seg => {
      if (seg) {
        seg.className = 'strength-bar-seg';
      }
    });

    label.className = 'strength-value-label';

    if (val.length === 0) {
      label.textContent = 'Enter password';
      return;
    }

    // Calculate Strength Score (1 to 4)
    let score = 0;
    if (hasLength) score++;
    if (hasCase) score++;
    if (hasNum) score++;
    if (hasSpecial) score++;

    if (val.length < 5) {
      score = 1; // baseline minimum for short string
    }

    if (score === 1) {
      label.textContent = 'Weak';
      label.classList.add('strength-weak');
      segments[0]?.classList.add('seg-active-weak');
    } else if (score === 2) {
      label.textContent = 'Fair';
      label.classList.add('strength-fair');
      segments[0]?.classList.add('seg-active-fair');
      segments[1]?.classList.add('seg-active-fair');
    } else if (score === 3) {
      label.textContent = 'Good';
      label.classList.add('strength-good');
      segments[0]?.classList.add('seg-active-good');
      segments[1]?.classList.add('seg-active-good');
      segments[2]?.classList.add('seg-active-good');
    } else if (score >= 4) {
      label.textContent = 'Strong';
      label.classList.add('strength-strong');
      segments[0]?.classList.add('seg-active-strong');
      segments[1]?.classList.add('seg-active-strong');
      segments[2]?.classList.add('seg-active-strong');
      segments[3]?.classList.add('seg-active-strong');
    }
  });
}

function initAuthFormSubmissions() {
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotLink = document.getElementById('forgotPasswordLink');

  // Sign In
  signInForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const captchaInput = document.getElementById('authCaptchaInput')?.value.trim() || '';
    if (!captchaInput) {
      showAuthToast('Please enter the security captcha verification code.', 'error');
      document.getElementById('authCaptchaInput')?.focus();
      return;
    }

    if (captchaInput.toLowerCase() !== (currentAuthCaptcha || '').toLowerCase()) {
      showAuthToast('Incorrect captcha code. Please enter the new captcha.', 'error');
      document.getElementById('refreshCaptchaBtn')?.click();
      return;
    }

    const btn = document.getElementById('signInSubmitBtn');
    if (btn) {
      btn.innerHTML = `<span>Signing in...</span>`;
      btn.style.opacity = '0.8';
    }

    showAuthToast('Authenticating with CAMPUSLINK...', 'info');

    setTimeout(() => {
      showAuthToast('Login successful! Launching portal...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    }, 700);
  });

  // Sign Up
  signUpForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regFullName')?.value.trim() || 'User';
    const btn = document.getElementById('signUpSubmitBtn');
    if (btn) {
      btn.innerHTML = `<span>Provisioning workspace...</span>`;
      btn.style.opacity = '0.8';
    }

    showAuthToast(`Setting up portal for ${name}...`, 'info');

    setTimeout(() => {
      showAuthToast('Account created! Welcome to CAMPUSLINK.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 900);
    }, 800);
  });

  // Forgot password
  forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value || 'your registered email';
    showAuthToast(`Password reset link sent to ${email}`, 'info');
  });
}

function initSocialLogin() {
  const googleBtn = document.getElementById('googleLoginBtn');
  const appleBtn = document.getElementById('appleLoginBtn');

  googleBtn?.addEventListener('click', () => {
    showAuthToast('Connecting with Google Account...', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 900);
  });

  appleBtn?.addEventListener('click', () => {
    showAuthToast('Connecting with Apple ID...', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 900);
  });
}

function showAuthToast(message, type = 'info') {
  const box = document.getElementById('authToastBox');
  if (!box) return;

  const toast = document.createElement('div');
  toast.className = 'auth-toast-item';
  toast.style.borderLeft = type === 'success' ? '4px solid #10b981' : '4px solid #0284c7';
  toast.textContent = message;

  box.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function initAuthTheme() {
  const savedTheme = localStorage.getItem('campuslink_theme') || 'light';
  applyAuthTheme(savedTheme);

  const toggleBtn = document.getElementById('authThemeToggle');
  toggleBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyAuthTheme(next);
  });
}

function applyAuthTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('campuslink_theme', theme);

  const icon = document.getElementById('authThemeIcon');
  const label = document.getElementById('authThemeLabel');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    icon.style.color = theme === 'dark' ? '#f59e0b' : '#64748b';
  }
  if (label) {
    label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  if (window.lucide) window.lucide.createIcons();
}
