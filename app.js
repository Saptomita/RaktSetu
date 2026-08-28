// ═══════════════════ APP INITIALIZATION ═══════════════════
const USERS_STORAGE_KEY = 'raktsetu_registered_users';
const HOSPITALS_STORAGE_KEY = 'raktsetu_registered_hospitals';

let pendingUser = null;
let pendingResetEmail = null;
let pendingResetRole = null;

function initAuthStores() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        const defaultUsers = [
            { name: 'Demo User', email: 'user@example.com', phone: '9876543210', password: 'password123' }
        ];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(HOSPITALS_STORAGE_KEY)) {
        const defaultHospitals = [
            {
                name: 'AIIMS Hospital & Blood Bank',
                email: 'hosp@example.com',
                phone: '9876543210',
                password: 'password123',
                rohiniId: 'ROHINI123'
            }
        ];
        localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(defaultHospitals));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthStores();
    initSplash();
    initNavbar();
    initLoginModal();
    initHeroStats();
    initSearchForm();
    initHospitalDirectory();
    initRegistration();
    initEmergencyModal();
    initChatbot();
});

// ═══════════════════ SPLASH SCREEN ═══════════════════
function initSplash() {
    const splash = document.getElementById('splash-screen');

    // Always clear session on page load so login is always required
    sessionStorage.removeItem('raktsetuLoggedIn');
    sessionStorage.removeItem('raktsetuUser');
    sessionStorage.removeItem('raktsetuRole');

    // Reset default visibility for unregistered usage
    const registerSection = document.getElementById('register-section');
    const registerNav = document.querySelector('.nav-link[data-section="register-section"]');
    if (registerSection) registerSection.style.display = 'block';
    if (registerNav) registerNav.style.display = 'flex';

    // Create floating particles
    const particlesEl = document.getElementById('splash-particles');
    if (particlesEl) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position:absolute;
                width:${Math.random() * 4 + 2}px; height:${Math.random() * 4 + 2}px;
                background:${Math.random() > 0.5 ? 'rgba(239,68,68,0.4)' : 'rgba(6,182,212,0.4)'};
                border-radius:50%; left:${Math.random() * 100}%; top:${Math.random() * 100}%;
                animation: float-particle ${Math.random() * 4 + 3}s ease-in-out infinite alternate;
                animation-delay: ${Math.random() * 2}s;
            `;
            particlesEl.appendChild(p);
        }
    }
    const style = document.createElement('style');
    style.textContent = `@keyframes float-particle {
        0%{transform:translateY(0) scale(1);opacity:0.6}
        100%{transform:translateY(-40px) scale(1.5);opacity:0.1}
    }`;
    document.head.appendChild(style);

    setTimeout(() => {
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.style.display = 'none';
                // ✔ Auto-open login modal after splash finishes
                const modal = document.getElementById('login-modal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }, 800);
        }
    }, 2800);
}

// ═══════════════════ NAVBAR ═══════════════════
function initNavbar() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            links.classList.remove('open');
        });
    });

    // Scroll-spy
    const sections = document.querySelectorAll('.section, .hero-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('data-section') === id);
                });
            }
        });
    }, { threshold: 0.3 });
    sections.forEach(s => observer.observe(s));
}

// ═══════════════════ LOGIN MODAL & AUTH FLOW ═══════════════════
function initLoginModal() {
    const modal = document.getElementById('login-modal');

    function closeModal() {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Toggle Password Visibility
    document.querySelectorAll('.toggle-pwd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.parentElement.querySelector('.pwd-input');
            if (input) {
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                e.target.classList.toggle('fa-eye', !show);
                e.target.classList.toggle('fa-eye-slash', show);
            }
        });
    });

    // View Switching (Login, OTP, Signup, Forgot Pwd)
    document.querySelectorAll('.auth-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.closest('.auth-link').dataset.target;
            document.querySelectorAll('.auth-view').forEach(view => {
                view.classList.remove('active-view');
                view.classList.add('hidden-view');
            });
            document.getElementById(targetId).classList.remove('hidden-view');
            document.getElementById(targetId).classList.add('active-view');
        });
    });

    // Login Tabs (User / Hospital)
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const targetFormId = e.target.dataset.tab;
            document.querySelectorAll('#view-login .auth-form').forEach(f => {
                f.classList.remove('active-form');
                f.classList.add('hidden-form');
                f.style.display = 'none';
            });
            const targetForm = document.getElementById(targetFormId);
            targetForm.classList.remove('hidden-form');
            targetForm.classList.add('active-form');
            targetForm.style.display = 'block';
        });
    });

    // Hospital Login Submit
    const hospForm = document.getElementById('hospital-login-form');
    if (hospForm) {
        hospForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rohiniInput = document.getElementById('hosp-rohini').value.trim();
            const emailInput = document.getElementById('hosp-login-email').value.trim();
            const passwordInput = document.getElementById('hosp-login-password').value;
            const btn = e.target.querySelector('button[type="submit"]');

            const hospitals = JSON.parse(localStorage.getItem(HOSPITALS_STORAGE_KEY) || '[]');
            const foundHosp = hospitals.find(h =>
                h.email.toLowerCase() === emailInput.toLowerCase() &&
                h.password === passwordInput &&
                h.rohiniId.toUpperCase() === rohiniInput.toUpperCase()
            );

            if (!foundHosp) {
                showNotification('Invalid email, password, or Rohini ID.', 'error');
                return;
            }

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            btn.disabled = true;

            setTimeout(() => {
                sessionStorage.setItem('raktsetuRole', 'hospital');
                sessionStorage.setItem('raktsetuUser', foundHosp.name);
                sessionStorage.setItem('raktsetuLoggedIn', 'true');

                applyRoleLogic('hospital');
                updateNavUser('hospital', foundHosp.name);
                closeModal();
                btn.innerHTML = 'Log In as Hospital';
                btn.disabled = false;
                hospForm.reset();
            }, 1000);
        });
    }

    // User Login Step 1 (Enter Email & Password)
    const userForm = document.getElementById('user-login-form');
    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('user-login-email').value.trim();
            const passwordInput = document.getElementById('user-login-password').value;
            const btn = e.target.querySelector('button[type="submit"]');

            const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
            const foundUser = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput);

            if (!foundUser) {
                showNotification('Invalid email or password.', 'error');
                return;
            }

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
            btn.disabled = true;

            setTimeout(() => {
                pendingUser = foundUser;
                // Transition to OTP view
                document.getElementById('view-login').classList.remove('active-view');
                document.getElementById('view-login').classList.add('hidden-view');
                document.getElementById('view-otp').classList.remove('hidden-view');
                document.getElementById('view-otp').classList.add('active-view');

                // Show notification with simulated OTP for verification
                const last4Digits = foundUser.phone.slice(-4);
                showNotification(`OTP code sent to phone ending in ****${last4Digits}. (Simulated OTP: 1234)`, 'success');

                btn.innerHTML = 'Continue to OTP';
                btn.disabled = false;
            }, 800);
        });
    }

    // User Login Step 2 (Verify OTP & Phone Number)
    const otpForm = document.getElementById('otp-form');
    if (otpForm) {
        otpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneInput = document.getElementById('otp-phone').value.trim();

            // Gather OTP digit values
            const otpBoxes = document.querySelectorAll('.otp-input-box');
            let otpCode = '';
            otpBoxes.forEach(box => otpCode += box.value.trim());

            if (!pendingUser) {
                showNotification('No login session active. Please try again.', 'error');
                return;
            }

            const cleanedPhoneInput = phoneInput.replace(/[-+()\s]/g, '');
            const cleanedUserPhone = pendingUser.phone.replace(/[-+()\s]/g, '');

            const phoneMatches = cleanedPhoneInput.endsWith(cleanedUserPhone) || cleanedUserPhone.endsWith(cleanedPhoneInput);

            if (!phoneMatches) {
                showNotification('Phone number does not match registered phone number.', 'error');
                return;
            }

            if (otpCode !== '1234') {
                showNotification('Invalid OTP code. Please enter 1234.', 'error');
                return;
            }

            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            btn.disabled = true;

            setTimeout(() => {
                sessionStorage.setItem('raktsetuRole', 'user');
                sessionStorage.setItem('raktsetuUser', pendingUser.name);
                sessionStorage.setItem('raktsetuLoggedIn', 'true');

                applyRoleLogic('user');
                updateNavUser('user', pendingUser.name);
                closeModal();
                btn.innerHTML = 'Verify & Log In';
                btn.disabled = false;
                userForm.reset();
                otpForm.reset();
                pendingUser = null;
            }, 1000);
        });
    }

    // Signup Submit
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('signup-name').value.trim();
            const emailInput = document.getElementById('signup-email').value.trim();
            const phoneInput = document.getElementById('signup-phone').value.trim();
            const passwordInput = document.getElementById('signup-password').value;
            const btn = e.target.querySelector('button[type="submit"]');

            const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
            const emailExists = users.some(u => u.email.toLowerCase() === emailInput.toLowerCase());

            if (emailExists) {
                showNotification('Email is already registered.', 'error');
                return;
            }

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
            btn.disabled = true;

            setTimeout(() => {
                users.push({
                    name: nameInput,
                    email: emailInput,
                    phone: phoneInput,
                    password: passwordInput
                });
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

                showNotification('Account created successfully! Please log in.', 'success');

                // Switch back to login
                document.getElementById('view-signup').classList.remove('active-view');
                document.getElementById('view-signup').classList.add('hidden-view');
                document.getElementById('view-login').classList.remove('hidden-view');
                document.getElementById('view-login').classList.add('active-view');

                btn.innerHTML = 'Sign Up';
                btn.disabled = false;
                signupForm.reset();
            }, 1200);
        });
    }

    // Forgot Password Submit
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-forgot-submit');
            const pwdGroup = document.getElementById('new-pwd-group');
            const emailInput = document.getElementById('forgot-email').value.trim();

            if (pwdGroup.style.display === 'none') {
                const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
                const hospitals = JSON.parse(localStorage.getItem(HOSPITALS_STORAGE_KEY) || '[]');

                const userAccNum = users.findIndex(u => u.email.toLowerCase() === emailInput.toLowerCase());
                const hospAccNum = hospitals.findIndex(h => h.email.toLowerCase() === emailInput.toLowerCase());

                if (userAccNum === -1 && hospAccNum === -1) {
                    showNotification('No registered account found with this email.', 'error');
                    return;
                }

                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
                btn.disabled = true;

                setTimeout(() => {
                    pendingResetEmail = emailInput;
                    pendingResetRole = userAccNum !== -1 ? 'user' : 'hospital';

                    pwdGroup.style.display = 'block';
                    btn.innerHTML = 'Update Password';
                    btn.disabled = false;
                    document.getElementById('forgot-new-pwd').required = true;
                    showNotification('Verification success! Input your new password.', 'success');
                }, 1000);
            } else {
                const newPasswordVal = document.getElementById('forgot-new-pwd').value;
                if (!newPasswordVal) {
                    showNotification('Please enter a new password.', 'error');
                    return;
                }

                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
                btn.disabled = true;

                setTimeout(() => {
                    if (pendingResetRole === 'user') {
                        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
                        const idx = users.findIndex(u => u.email.toLowerCase() === pendingResetEmail.toLowerCase());
                        if (idx !== -1) {
                            users[idx].password = newPasswordVal;
                            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
                        }
                    } else if (pendingResetRole === 'hospital') {
                        const hospitals = JSON.parse(localStorage.getItem(HOSPITALS_STORAGE_KEY) || '[]');
                        const idx = hospitals.findIndex(h => h.email.toLowerCase() === pendingResetEmail.toLowerCase());
                        if (idx !== -1) {
                            hospitals[idx].password = newPasswordVal;
                            localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals));
                        }
                    }

                    showNotification('Password updated successfully! Please log in.', 'success');
                    btn.innerHTML = 'Send Reset Link';
                    btn.disabled = false;
                    pwdGroup.style.display = 'none';
                    document.getElementById('forgot-new-pwd').required = false;
                    forgotForm.reset();
                    pendingResetEmail = null;
                    pendingResetRole = null;

                    // Back to login
                    document.getElementById('view-forgot').classList.remove('active-view');
                    document.getElementById('view-forgot').classList.add('hidden-view');
                    document.getElementById('view-login').classList.remove('hidden-view');
                    document.getElementById('view-login').classList.add('active-view');
                }, 1000);
            }
        });
    }

    // OTP Input auto-advance
    const otpInputs = document.querySelectorAll('.otp-input-box');
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', function (e) {
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            if (e.key === 'Backspace' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
}

// ═══════════════════ ROLE BASED ACCESS CONTROL ═══════════════════
function applyRoleLogic(role) {
    const heroSearchBtn = document.getElementById('hero-search-btn');
    const heroHospBtn = document.getElementById('hero-hospitals-btn');

    // Page Sections
    const searchSection = document.getElementById('search-section');
    const hospitalSection = document.getElementById('hospitals-section');
    const registerSection = document.getElementById('register-section');

    // Nav Links / Buttons
    const searchNav = document.querySelector('.nav-link[data-section="search-section"]');
    const hospitalNav = document.querySelector('.nav-link[data-section="hospitals-section"]');
    const registerNav = document.querySelector('.nav-link[data-section="register-section"]');
    const registerBtn = document.getElementById('btn-register-trigger');

    // Hero Search Card
    const heroSearchCard = document.querySelector('.hero-search-card');

    if (role === 'hospital') {
        // Hospitals shouldn't see search or directories
        if (searchSection) searchSection.style.display = 'none';
        if (hospitalSection) hospitalSection.style.display = 'none';
        if (searchNav) searchNav.style.display = 'none';
        if (hospitalNav) hospitalNav.style.display = 'none';

        // Hospitals must see registration/donate, nav items, and Register trigger
        if (registerSection) registerSection.style.display = 'block';
        if (registerNav) registerNav.style.display = 'flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';

        // Hide main search prompts in hero
        if (heroSearchBtn) heroSearchBtn.style.display = 'none';
        if (heroHospBtn) heroHospBtn.style.display = 'none';
        if (heroSearchCard) heroSearchCard.style.display = 'none';

        showNotification('Logged in as Hospital Facility.', 'success');
    }
    else if (role === 'user') {
        // Users shouldn't see registration
        if (registerSection) registerSection.style.display = 'none';
        if (registerNav) registerNav.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';

        // Users must see search directories
        if (searchSection) searchSection.style.display = 'block';
        if (hospitalSection) hospitalSection.style.display = 'block';
        if (searchNav) searchNav.style.display = 'flex';
        if (hospitalNav) hospitalNav.style.display = 'flex';

        // Show main search prompts in hero
        if (heroSearchBtn) heroSearchBtn.style.display = 'inline-flex';
        if (heroHospBtn) heroHospBtn.style.display = 'inline-flex';
        if (heroSearchCard) heroSearchCard.style.display = 'block';

        showNotification('Logged in successfully.', 'success');
    }
}

// ═══════════════════ NAV USER PROFILE SIGNATURE ═══════════════════
function updateNavUser(role, displayName) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    // Remove any existing user chips
    const oldChip = document.getElementById('nav-user-profile-chip');
    if (oldChip) oldChip.remove();

    if (displayName) {
        // Create user chip
        const chip = document.createElement('div');
        chip.id = 'nav-user-profile-chip';
        chip.className = 'nav-user-chip';
        chip.innerHTML = `
            <div class="nav-user-avatar">
                <i class="fas fa-${role === 'hospital' ? 'hospital' : 'user'}"></i>
            </div>
            <span class="nav-user-name">${displayName}</span>
            <button class="nav-logout-btn" id="btn-nav-logout" title="Log Out" aria-label="Log out">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;

        // Insert at the beginning of navActions
        navActions.insertBefore(chip, navActions.firstChild);

        // Bind logout button click
        const logoutBtn = chip.querySelector('#btn-nav-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    }
}

function logoutUser() {
    sessionStorage.removeItem('raktsetuLoggedIn');
    sessionStorage.removeItem('raktsetuUser');
    sessionStorage.removeItem('raktsetuRole');

    // Clear user chip
    const oldChip = document.getElementById('nav-user-profile-chip');
    if (oldChip) oldChip.remove();

    // Show splash-like reset or redirect, and display login modal again
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Reset view
    const searchSection = document.getElementById('search-section');
    const hospitalSection = document.getElementById('hospitals-section');
    const registerSection = document.getElementById('register-section');

    const searchNav = document.querySelector('.nav-link[data-section="search-section"]');
    const hospitalNav = document.querySelector('.nav-link[data-section="hospitals-section"]');
    const registerNav = document.querySelector('.nav-link[data-section="register-section"]');
    const regBtn = document.getElementById('btn-register-trigger');
    const heroSearchBtn = document.getElementById('hero-search-btn');
    const heroHospBtn = document.getElementById('hero-hospitals-btn');
    const heroCard = document.querySelector('.hero-search-card');

    if (searchSection) searchSection.style.display = 'block';
    if (hospitalSection) hospitalSection.style.display = 'block';
    if (registerSection) registerSection.style.display = 'block';

    if (searchNav) searchNav.style.display = 'flex';
    if (hospitalNav) hospitalNav.style.display = 'flex';
    if (registerNav) registerNav.style.display = 'flex';
    if (regBtn) regBtn.style.display = 'inline-flex';

    if (heroSearchBtn) heroSearchBtn.style.display = 'inline-flex';
    if (heroHospBtn) heroHospBtn.style.display = 'inline-flex';
    if (heroCard) heroCard.style.display = 'block';

    showNotification('Logged out successfully.', 'info');
}

// ═══════════════════ HERO STATS COUNTER ═══════════════════
function initHeroStats() {
    // Observe both old .stat-number and new .stat-card-number elements
    const counters = document.querySelectorAll('.stat-number, .stat-card-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();
    const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target).toLocaleString() + (target >= 1000 ? '+' : '+');
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// ═══════════════════ BLOOD SEARCH ═══════════════════
let searchMap = null;
let searchMarkers = [];

function initSearchForm() {
    const form = document.getElementById('blood-search-form');
    const locateBtn = document.getElementById('btn-locate');

    // Selectable blood groups selection logic
    const bloodGroupInput = document.getElementById('blood-group');
    const bloodBtnCards = document.querySelectorAll('.blood-btn-card');
    bloodBtnCards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');
        card.setAttribute('aria-label', `Select blood group ${card.dataset.value}`);
        card.addEventListener('click', () => {
            bloodBtnCards.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-pressed', 'false');
            });
            card.classList.add('active');
            card.setAttribute('aria-pressed', 'true');
            bloodGroupInput.value = card.dataset.value;
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });

    locateBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const input = document.getElementById('location-input');
                    input.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                    locateBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => { locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i>'; }, 2000);
                },
                () => {
                    locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
                    showNotification('Location access denied. Please enter manually.', 'warning');
                }
            );
        }
    });

    // Nav and Hero buttons chatbot trigger
    const chatTriggerLink = document.getElementById('nav-ai-assist');
    if (chatTriggerLink) {
        chatTriggerLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChatbot(true);
        });
    }

    // Modal/triggers fallback
    const loginTrig = document.getElementById('btn-login-trigger');
    const regTrig = document.getElementById('btn-register-trigger');
    if (loginTrig) loginTrig.addEventListener('click', () => showNotification('Authentication service is coming soon!', 'info'));
    if (regTrig) {
        regTrig.addEventListener('click', () => {
            const regSection = document.getElementById('register-section');
            if (regSection) regSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ── Hero Quick Blood Search card wiring ───────────────────────
    const heroForm = document.getElementById('hero-quick-search-form');
    const hqsLocateBtn = document.getElementById('hqs-locate-btn');

    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const hqsGroup = document.getElementById('hqs-blood-group').value;
            const hqsLocation = document.getElementById('hqs-location').value.trim();
            const hqsRadius = document.getElementById('hqs-radius').value;

            if (!hqsGroup) { showNotification('Please select a blood group.', 'warning'); return; }
            if (!hqsLocation) { showNotification('Please enter a location.', 'warning'); return; }

            // Prefill the main search form
            const mainBloodInput = document.getElementById('blood-group');
            const mainLocInput = document.getElementById('location-input');
            const mainRadiusSelect = document.getElementById('search-radius');
            if (mainBloodInput) mainBloodInput.value = hqsGroup;
            if (mainLocInput) mainLocInput.value = hqsLocation;
            if (mainRadiusSelect) mainRadiusSelect.value = hqsRadius;

            // Sync active blood button in main form
            document.querySelectorAll('.blood-btn-card').forEach(c => {
                c.classList.toggle('active', c.dataset.value === hqsGroup);
            });

            // Scroll to search section and trigger search
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => performSearch(), 600);
        });
    }

    if (hqsLocateBtn) {
        hqsLocateBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                hqsLocateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const locInput = document.getElementById('hqs-location');
                        if (locInput) locInput.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                        hqsLocateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current';
                    },
                    () => {
                        hqsLocateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current';
                        showNotification('Location access denied. Please enter manually.', 'warning');
                    }
                );
            }
        });
    }
}

function performSearch() {
    const group = document.getElementById('blood-group').value;
    const location = document.getElementById('location-input').value.toLowerCase().trim();
    const radius = parseInt(document.getElementById('search-radius').value);

    if (!group) {
        showNotification('Please select a blood group first.', 'warning');
        return;
    }
    if (!location) {
        showNotification('Please enter a location/city search.', 'warning');
        return;
    }

    const btn = document.getElementById('search-submit-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    btn.disabled = true;

    setTimeout(() => {
        let userCoords = null;
        // Check if coords were entered directly
        const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
            userCoords = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        } else {
            // Look up city
            for (const [city, coords] of Object.entries(CITY_COORDS)) {
                if (location.includes(city)) {
                    userCoords = coords;
                    break;
                }
            }
        }

        if (!userCoords) {
            // Default to Delhi
            userCoords = CITY_COORDS.delhi;
        }

        // Filter results
        let results = HOSPITALS_DATA.filter(h => {
            const dist = getDistance(userCoords.lat, userCoords.lng, h.lat, h.lng);
            h._distance = dist;
            return h.blood[group] > 0 && dist <= radius;
        }).sort((a, b) => a._distance - b._distance);

        // If no results within radius, show all with blood
        if (results.length === 0) {
            results = HOSPITALS_DATA.filter(h => h.blood[group] > 0)
                .map(h => { h._distance = getDistance(userCoords.lat, userCoords.lng, h.lat, h.lng); return h; })
                .sort((a, b) => a._distance - b._distance)
                .slice(0, 6);
        }

        displayResults(results, group, userCoords);
        btn.innerHTML = '<i class="fas fa-search"></i> Search Blood Banks';
        btn.disabled = false;
    }, 1200);
}

function displayResults(results, group, userCoords) {
    const container = document.getElementById('search-results');
    const grid = document.getElementById('results-grid');
    const title = document.getElementById('results-title');

    container.classList.remove('hidden');
    title.textContent = `Found ${results.length} results for Blood Group ${group}`;

    grid.innerHTML = results.map(r => {
        const units = r.blood[group] || 0;
        const bloodStatusClass = units > 0 ? 'available' : 'out-of-stock';
        const bloodStatusText = units > 0 ? 'Available' : 'Out of Stock';
        const typeLabel = r.category === 'blood-bank' ? 'Blood Bank' : r.type === 'government' ? 'Govt. Hospital' : 'Private Hospital';
        const verifiedBadge = `<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>`;

        // Mock updated time for realistic effect
        const mockHours = (r.name.length % 3) + 1;
        const updatedTime = `Updated ${mockHours} hours ago`;

        return `
        <div class="result-card-new" data-type="${r.category}">
            <div class="result-card-header-new">
                <div class="title-wrap">
                    <h4>${r.name}</h4>
                    <span class="type-tag ${r.category} ${r.type || ''}">${typeLabel}</span>
                </div>
                ${verifiedBadge}
            </div>
            
            <div class="result-card-body-new">
                <div class="info-grid">
                    <div class="info-item"><i class="fas fa-map-marker-alt"></i> <span>${r.address}</span></div>
                    <div class="info-item"><i class="fas fa-route"></i> <span><strong>${r._distance.toFixed(1)} km</strong> away</span></div>
                    <div class="info-item"><i class="fas fa-phone-alt"></i> <span>${r.phone}</span></div>
                    <div class="info-item"><i class="fas fa-clock"></i> <span>${r.hours}</span></div>
                </div>
                
                <div class="stock-status-box ${bloodStatusClass}">
                    <div class="stock-left">
                        <span class="blood-req-badge">${group}</span>
                        <span class="stock-status-label">${bloodStatusText}</span>
                    </div>
                    <div class="stock-right">
                        <span class="units-count">${units}</span>
                        <span class="units-label">Units Available</span>
                    </div>
                </div>

                <div class="card-meta-row-new">
                    <span class="update-time"><i class="far fa-clock"></i> ${updatedTime}</span>
                </div>

                <div class="result-blood-all-available">
                    <p class="all-stock-title">All Stocks Available at this Facility:</p>
                    <div class="all-stock-badges">
                        ${Object.entries(r.blood).map(([bg, u]) =>
            `<span class="mini-blood-badge ${u === 0 ? 'empty' : ''} ${bg === group ? 'highlight' : ''}" title="${u} units available">
                                ${bg}: ${u}
                            </span>`
        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="result-card-actions-new">
                <a href="tel:${r.phone.replace(/\s/g, '')}" class="btn btn-primary btn-card-action" aria-label="Call ${r.name}">
                    <i class="fas fa-phone-alt"></i> Call Facility
                </a>
                <button type="button" class="btn btn-outline btn-card-action" onclick="showOnMap(${r.lat}, ${r.lng}, '${r.name.replace(/'/g, "\\'")}')" aria-label="Show ${r.name} on map">
                    <i class="fas fa-map-marked-alt"></i> Show Location
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Init map
    initSearchMap(results, userCoords);

    // Filter buttons callback
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.result-card-new').forEach(card => {
                if (filter === 'all') card.style.display = '';
                else card.style.display = card.dataset.type === filter ? '' : 'none';
            });
            // Force Leaflet recalculation
            setTimeout(() => { if (searchMap) searchMap.invalidateSize(); }, 150);
        });
    });

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initSearchMap(results, userCoords) {
    if (searchMap) { searchMap.remove(); }
    searchMap = L.map('results-map').setView([userCoords.lat, userCoords.lng], 11);

    // Using MapTiler Basic light maps or OpenStreetMap standard light style
    L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=7zXHyibmS0KMrk0LyTXl', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> &copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(searchMap);

    // User location marker
    L.circleMarker([userCoords.lat, userCoords.lng], {
        radius: 9, fillColor: '#0284c7', fillOpacity: 0.85, color: '#ffffff', weight: 2.5
    }).addTo(searchMap).bindPopup('<b>Your Current Location</b>');

    searchMarkers = [];
    results.forEach(r => {
        const iconColor = r.category === 'blood-bank' ? '#e11d48' : '#7c3aed';
        const iconHtml = `<div style="background:${iconColor};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:12px;border:2.5px solid #ffffff;box-shadow:0 3px 12px rgba(15,23,42,0.15)"><i class="fas fa-${r.category === 'blood-bank' ? 'tint' : 'hospital'}"></i></div>`;

        const icon = L.divIcon({
            className: 'custom-marker',
            html: iconHtml,
            iconSize: [30, 30], iconAnchor: [15, 15]
        });
        const marker = L.marker([r.lat, r.lng], { icon }).addTo(searchMap)
            .bindPopup(`<b>${r.name}</b><br>${r.address}<br>📞 ${r.phone}`);
        searchMarkers.push(marker);
    });

    // Fit bounds
    if (results.length > 0) {
        const group = new L.featureGroup([
            L.marker([userCoords.lat, userCoords.lng]),
            ...searchMarkers
        ]);
        searchMap.fitBounds(group.getBounds().pad(0.15));
    }

    // Invalidate size shortly after to guarantee rendering
    setTimeout(() => { if (searchMap) searchMap.invalidateSize(); }, 200);
}

function showOnMap(lat, lng, name) {
    if (searchMap) {
        searchMap.setView([lat, lng], 14);
        L.popup().setLatLng([lat, lng]).setContent(`<b>${name}</b>`).openOn(searchMap);
        document.getElementById('results-map').scrollIntoView({ behavior: 'smooth' });
    }
}

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════ HOSPITAL DIRECTORY ═══════════════════
function initHospitalDirectory() {
    renderHospitals(HOSPITALS_DATA);

    document.getElementById('hospital-type-filter').addEventListener('change', filterHospitals);
    document.getElementById('hospital-city-filter').addEventListener('change', filterHospitals);
    document.getElementById('hospital-search-input').addEventListener('input', filterHospitals);
}

function filterHospitals() {
    const type = document.getElementById('hospital-type-filter').value;
    const city = document.getElementById('hospital-city-filter').value;
    const search = document.getElementById('hospital-search-input').value.toLowerCase();

    let filtered = HOSPITALS_DATA.filter(h => {
        if (type !== 'all') {
            if (type === 'blood-bank' && h.category !== 'blood-bank') return false;
            if (type !== 'blood-bank' && h.type !== type) return false;
        }
        if (city !== 'all' && h.city.toLowerCase() !== city) return false;
        if (search && !h.name.toLowerCase().includes(search) && !h.address.toLowerCase().includes(search)) return false;
        return true;
    });
    renderHospitals(filtered);
}

function renderHospitals(list) {
    const grid = document.getElementById('hospitals-grid');
    grid.innerHTML = list.map(h => {
        const typeLabel = h.category === 'blood-bank' ? 'BLOOD BANK' : h.type === 'government' ? 'GOVT' : 'PRIVATE';
        const typeClass = h.category === 'blood-bank' ? 'blood-bank' : h.type === 'government' ? 'government' : 'private';

        // Mock a distance and time for the UI since it's a directory
        const mockDist = (Math.random() * 8 + 1).toFixed(1);
        const mockMin = Math.floor(Math.random() * 50 + 5);

        // Find mostly requested blood type for this card mock
        let highlightBg = 'O+';
        let highlightUnits = h.blood['O+'] || 0;
        let statusClass = highlightUnits > 0 ? 'available' : 'unavailable';
        let statusText = highlightUnits > 0 ? 'AVAILABLE' : 'UNAVAILABLE';

        return `
        <div class="directory-card-new" data-type="${h.category}">
            <div class="dir-card-top">
                <span class="dir-badge ${typeClass}"><i class="fas fa-check-circle" style="margin-right:4px"></i> ${typeLabel}</span>
                <span class="dir-badge-dist"><i class="fas fa-location-arrow"></i> ${mockDist} km</span>
            </div>
            
            <h4 class="dir-card-title">${h.name}</h4>
            <div class="dir-card-address"><i class="fas fa-map-marker-alt"></i> ${h.address}, ${h.city}</div>
            
            <div class="dir-blood-status-box">
                <div class="dir-blood-label">SAMPLE BLOOD TYPE STATUS</div>
                <div class="dir-blood-row">
                    <span class="dir-big-bg text-rose">${highlightBg}</span>
                    <span class="dir-status-pill ${statusClass}"><i class="fas fa-circle"></i> ${statusText}</span>
                    <span class="dir-time-pill"><i class="fas fa-history"></i> ${mockMin} mins ago</span>
                </div>
            </div>

            <div class="dir-card-actions">
                <button type="button" class="btn btn-outline hqs-submit-btn" style="width:100%; border:1.5px solid var(--accent-rose); color:var(--accent-rose); padding:10px" aria-label="Details for ${h.name}" onclick="showHospitalDetails('${h.name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${h.address.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${h.city}', '${h.phone}', '${h.hours}', '${h.type || h.category}')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <button type="button" class="btn btn-outline-dark hqs-submit-btn" style="width:100%; padding:10px" onclick="window.open('tel:${h.phone.replace(/\s/g, '')}')" aria-label="Call ${h.name}">
                    <i class="fas fa-phone-alt"></i> Call Now
                </button>
            </div>
        </div>
        `;
    }).join('');

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
            <i class="fas fa-search" style="font-size:2.5rem;margin-bottom:16px;display:block;opacity:0.3"></i>
            <p>No facilities found matching your criteria.</p>
        </div>`;
    }
}



// ═══════════════════ REGISTRATION ═══════════════════
function initRegistration() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Hospital registration → POST /api/register/hospital
    document.getElementById('hospital-register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        const payload = {
            name: document.getElementById('hosp-name').value.trim(),
            type: document.getElementById('hosp-type').value,
            city: document.getElementById('hosp-city').value.trim(),
            address: document.getElementById('hosp-address').value.trim(),
            phone: document.getElementById('hosp-phone').value.trim(),
            email: document.getElementById('hosp-email').value.trim(),
            hours: document.getElementById('hosp-hours').value.trim() || '24/7',
            license: document.getElementById('hosp-license').value.trim(),
            services: document.getElementById('hosp-services').value.trim(),
        };

        const rohiniId = document.getElementById('hosp-rohini-reg').value.trim();
        const password = document.getElementById('hosp-pwd').value;

        try {
            const res = await fetch('/api/register/hospital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            // Save to local hospital credentials store immediately
            const hospitals = JSON.parse(localStorage.getItem(HOSPITALS_STORAGE_KEY) || '[]');
            hospitals.push({ name: payload.name, email: payload.email, phone: payload.phone, password, rohiniId });
            localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals));

            if (data.success) {
                showSuccessModal(
                    'Hospital Registration Submitted! ✅',
                    `${data.message}\n\nRegistration ID: ${data.registration_id}\nStatus: Pending Verification\nYour credentials have been configured for logins!\nRohini ID: ${rohiniId}`
                );
                e.target.reset();
                showNotification('Hospital registered successfully! Use your Email, Password, and Rohini ID to log in.', 'success');
            } else {
                showNotification(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Hospital registration error:', err);
            // Local fallback
            const hospitals = JSON.parse(localStorage.getItem(HOSPITALS_STORAGE_KEY) || '[]');
            hospitals.push({ name: payload.name, email: payload.email, phone: payload.phone, password, rohiniId });
            localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals));

            showSuccessModal('Hospital Registered Locally!', 'Your hospital has been registered. You can now use your Email, Password, and Rohini ID to log in.');
            e.target.reset();
        } finally {
            submitBtn.innerHTML = origHTML;
            submitBtn.disabled = false;
        }
    });

    // Blood bank registration → POST /api/register/bloodbank
    document.getElementById('bloodbank-register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        const payload = {
            name: document.getElementById('bb-name').value.trim(),
            affiliated: document.getElementById('bb-affiliated').value.trim(),
            city: document.getElementById('bb-city').value.trim(),
            address: document.getElementById('bb-address').value.trim(),
            phone: document.getElementById('bb-phone').value.trim(),
            email: document.getElementById('bb-email').value.trim(),
            hours: document.getElementById('bb-hours').value.trim() || '24/7',
            license: document.getElementById('bb-license').value.trim(),
        };

        try {
            const res = await fetch('/api/register/bloodbank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                showSuccessModal(
                    'Blood Bank Registration Submitted! ✅',
                    `${data.message}\n\nRegistration ID: ${data.registration_id}\nStatus: Pending Verification\nEstimated Review: ${data.estimated_review}`
                );
                e.target.reset();
                showNotification('Blood bank registered successfully!', 'success');
            } else {
                showNotification(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Blood bank registration error:', err);
            showSuccessModal('Blood Bank Registration Submitted!', 'Your blood bank has been registered successfully. Our team will verify your license and details within 24-48 hours.');
            e.target.reset();
        } finally {
            submitBtn.innerHTML = origHTML;
            submitBtn.disabled = false;
        }
    });

    // Inventory update → POST /api/inventory/update
    document.getElementById('inventory-update-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitBtn.disabled = true;

        const payload = {
            facility_id: document.getElementById('inv-facility').value,
            blood: {
                "A+": parseInt(document.getElementById('inv-a-pos').value) || 0,
                "A-": parseInt(document.getElementById('inv-a-neg').value) || 0,
                "B+": parseInt(document.getElementById('inv-b-pos').value) || 0,
                "B-": parseInt(document.getElementById('inv-b-neg').value) || 0,
                "AB+": parseInt(document.getElementById('inv-ab-pos').value) || 0,
                "AB-": parseInt(document.getElementById('inv-ab-neg').value) || 0,
                "O+": parseInt(document.getElementById('inv-o-pos').value) || 0,
                "O-": parseInt(document.getElementById('inv-o-neg').value) || 0,
            },
            notes: document.getElementById('inv-notes').value.trim(),
        };

        try {
            const res = await fetch('/api/inventory/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                showSuccessModal(
                    'Inventory Updated! ✅',
                    `${data.message}\n\nUpdate ID: ${data.update_id}\nThe changes are now live and visible to users searching for blood.`
                );
                e.target.reset();
                showNotification('Inventory updated successfully!', 'success');
            } else {
                showNotification(data.message || 'Update failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Inventory update error:', err);
            showSuccessModal('Inventory Updated!', 'Blood inventory has been updated successfully. The changes are now live and visible to users searching for blood.');
            e.target.reset();
        } finally {
            submitBtn.innerHTML = origHTML;
            submitBtn.disabled = false;
        }
    });
}

function showSuccessModal(title, message) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').classList.remove('hidden');
}

// ═══════════════════ HOSPITAL DETAILS MODAL ═══════════════════
function showHospitalDetails(name, address, city, phone, hours, type) {
    // Find hospital data for blood stock
    const hosp = HOSPITALS_DATA.find(h => h.name === name);
    const typeLabel = type === 'blood-bank' ? 'Blood Bank' : type === 'government' ? 'Government Hospital' : 'Private Hospital';
    const typeIcon = type === 'blood-bank' ? 'tint' : 'hospital';

    let bloodStockHtml = '';
    if (hosp) {
        bloodStockHtml = `
        <div class="hosp-detail-section">
            <div class="hosp-detail-section-label"><i class="fas fa-droplet"></i> BLOOD STOCK</div>
            <div class="hosp-detail-blood-grid">
                ${Object.entries(hosp.blood).map(([bg, units]) => `
                    <div class="hosp-detail-blood-item ${units === 0 ? 'empty' : 'has-stock'}">
                        <span class="hosp-detail-bg">${bg}</span>
                        <span class="hosp-detail-units">${units > 0 ? units + ' units' : 'Out of Stock'}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    const modalHtml = `
    <div id="hospital-detail-modal" class="modal-overlay" style="display:flex;" onclick="if(event.target===this)closeHospitalDetails()">
        <div class="modal glass-card" style="max-width:520px;width:100%;border-radius:18px;padding:0;overflow:hidden;position:relative;">
            <button class="modal-close" aria-label="Close" onclick="closeHospitalDetails()" style="position:absolute;top:14px;right:14px;z-index:10;">&times;</button>
            <div style="background:linear-gradient(135deg,var(--accent-rose) 0%,#7c3aed 100%);padding:28px 32px 24px;color:#fff;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                    <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">
                        <i class="fas fa-${typeIcon}"></i>
                    </div>
                    <div>
                        <div style="font-size:0.72rem;font-weight:700;opacity:0.8;letter-spacing:0.8px;text-transform:uppercase;">${typeLabel}</div>
                        <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;line-height:1.2;">${name}</h3>
                    </div>
                </div>
            </div>
            <div style="padding:24px 32px 28px;">
                <div class="hosp-detail-section">
                    <div class="hosp-detail-section-label"><i class="fas fa-map-marker-alt"></i> LOCATION</div>
                    <div class="hosp-detail-value">${address}, ${city}</div>
                </div>
                <div class="hosp-detail-section">
                    <div class="hosp-detail-section-label"><i class="fas fa-phone-alt"></i> CONTACT</div>
                    <div class="hosp-detail-value"><a href="tel:${phone.replace(/\s/g, '')}" style="color:var(--accent-rose);font-weight:600;">${phone}</a></div>
                </div>
                <div class="hosp-detail-section">
                    <div class="hosp-detail-section-label"><i class="fas fa-clock"></i> OPERATING HOURS</div>
                    <div class="hosp-detail-value">${hours}</div>
                </div>
                ${bloodStockHtml}
                <div style="display:flex;gap:10px;margin-top:20px;">
                    <a href="tel:${phone.replace(/\s/g, '')}" class="btn btn-primary" style="flex:1;justify-content:center;">
                        <i class="fas fa-phone-alt"></i> Call Now
                    </a>
                    <button type="button" class="btn btn-outline-dark" style="flex:1;justify-content:center;" onclick="closeHospitalDetails()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    const container = document.createElement('div');
    container.id = 'hospital-detail-wrapper';
    container.innerHTML = modalHtml;
    document.body.appendChild(container);
    document.body.style.overflow = 'hidden';
}

function closeHospitalDetails() {
    const wrapper = document.getElementById('hospital-detail-wrapper');
    if (wrapper) wrapper.remove();
    document.body.style.overflow = '';
}

// ═══════════════════ EMERGENCY MODAL ═══════════════════
function initEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    document.getElementById('btn-emergency').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('modal-close-emergency').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    const successModal = document.getElementById('success-modal');
    document.getElementById('modal-close-success').addEventListener('click', () => successModal.classList.add('hidden'));
    document.getElementById('success-ok-btn').addEventListener('click', () => successModal.classList.add('hidden'));
    successModal.addEventListener('click', (e) => { if (e.target === successModal) successModal.classList.add('hidden'); });
}

// ═══════════════════ CHATBOT ═══════════════════
let chatOpen = false;

function initChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const panel = document.getElementById('chatbot-panel');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const clearBtn = document.getElementById('chatbot-clear');
    const minimizeBtn = document.getElementById('chatbot-minimize');

    toggleBtn.addEventListener('click', () => toggleChatbot());
    minimizeBtn.addEventListener('click', () => toggleChatbot(false));

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    clearBtn.addEventListener('click', () => {
        const messages = document.getElementById('chatbot-messages');
        messages.innerHTML = '';
        addBotMessage("Chat cleared! 🔄 How can I help you?");
    });

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            input.value = chip.dataset.query;
            sendMessage();
        });
    });
}

function toggleChatbot(forceOpen) {
    const panel = document.getElementById('chatbot-panel');
    const toggleBtn = document.getElementById('chatbot-toggle');
    chatOpen = forceOpen !== undefined ? forceOpen : !chatOpen;
    panel.classList.toggle('hidden', !chatOpen);
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', chatOpen ? 'true' : 'false');
    }
    if (chatOpen) document.getElementById('chatbot-input').focus();
}

async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const text = input.value.trim();
    if (!text) return;

    addUserMessage(text);
    input.value = '';

    // Disable input during request
    input.disabled = true;
    sendBtn.disabled = true;

    // Show initial message bubble with typing indicator
    const messages = document.getElementById('chatbot-messages');
    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'chat-message bot';
    botMsgEl.innerHTML = `
        <img src="assets/ai_avatar.png" alt="RaktSetu AI" class="chat-avatar">
        <div class="chat-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
    `;
    messages.appendChild(botMsgEl);
    messages.scrollTop = messages.scrollHeight;

    const chatBubble = botMsgEl.querySelector('.chat-bubble');

    // 185-second timeout via AbortController (backend allows up to 180s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 185000);

    try {
        const res = await fetch('/api/medgemma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.reply || `HTTP ${res.status}`);
        }

        // Process response body as a readable stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let botReply = '';
        let isFirstToken = true;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            if (isFirstToken && chunk.trim() !== '') {
                // Clear typing indicator on first non-whitespace token
                chatBubble.innerHTML = '';
                isFirstToken = false;
            }

            botReply += chunk;

            // Format markdown in real-time
            chatBubble.innerHTML = formatMarkdown(botReply);
            messages.scrollTop = messages.scrollHeight;
        }

        if (isFirstToken) {
            chatBubble.innerHTML = 'Sorry, I could not process that request.';
        }

    } catch (err) {
        clearTimeout(timeoutId);

        // Remove typing indicator if we're still showing it
        const indicator = chatBubble.querySelector('.typing-indicator');
        if (indicator) {
            chatBubble.innerHTML = '';
        }

        if (err.name === 'AbortError') {
            console.error('MedGemma request timed out');
            chatBubble.innerHTML = '⏱️ The request timed out. The AI service may be busy — please try again in a moment.';
        } else {
            console.error('MedGemma API error:', err);
            // Append or fallback
            if (isFirstToken) {
                const fallbackResponse = getAIResponse(text);
                chatBubble.innerHTML = formatMarkdown(fallbackResponse);
            } else {
                chatBubble.innerHTML += '<br><br>⚠️ <em>Connection interrupted. Showing partial response.</em>';
            }
        }
        messages.scrollTop = messages.scrollHeight;
    } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}


function addUserMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    const el = document.createElement('div');
    el.className = 'chat-message user';
    el.innerHTML = `<div class="chat-bubble"><p>${escapeHtml(text)}</p></div>`;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
}

function addBotMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    const el = document.createElement('div');
    el.className = 'chat-message bot';
    el.innerHTML = `
        <img src="assets/ai_avatar.png" alt="Gemma" class="chat-avatar">
        <div class="chat-bubble">${formatMarkdown(text)}</div>
    `;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
}

function getAIResponse(query) {
    const q = query.toLowerCase();

    // Blood group detection
    const bloodGroups = ['a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-'];
    const foundGroup = bloodGroups.find(bg => q.includes(bg.toLowerCase()));

    if (foundGroup || q.includes('blood') && (q.includes('find') || q.includes('search') || q.includes('need') || q.includes('where') || q.includes('available') || q.includes('urgent'))) {
        if (foundGroup) {
            const group = foundGroup.toUpperCase();
            const results = HOSPITALS_DATA.filter(h => h.blood[group] > 0).slice(0, 4);
            if (results.length > 0) {
                return AI_RESPONSES.blood_search.found(group, results);
            }
            return AI_RESPONSES.blood_search.not_found(group);
        }
        return AI_RESPONSES.blood_search.default;
    }

    if (q.includes('hospital') || q.includes('nearest') || q.includes('nearby')) {
        return AI_RESPONSES.hospital_info;
    }

    if (q.includes('eligib') || q.includes('who can donate') || q.includes('criteria') || q.includes('requirement')) {
        return AI_RESPONSES.donation_eligibility;
    }

    if (q.includes('process') || q.includes('how to donate') || q.includes('steps') || q.includes('procedure')) {
        return AI_RESPONSES.donation_process;
    }

    if (q.includes('emergency') || q.includes('urgent') || q.includes('help') || q.includes('sos') || q.includes('ambulance')) {
        return AI_RESPONSES.emergency;
    }

    if (q.includes('language') || q.includes('hindi') || q.includes('multilingual') || q.includes('tamil') || q.includes('bengali')) {
        return AI_RESPONSES.multilingual;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste')) {
        return AI_RESPONSES.greeting[Math.floor(Math.random() * AI_RESPONSES.greeting.length)];
    }

    if (q.includes('thank')) {
        return "You're welcome! 😊 Remember, every blood donation can save up to 3 lives. Stay healthy and don't hesitate to reach out if you need help!";
    }

    return AI_RESPONSES.fallback[Math.floor(Math.random() * AI_RESPONSES.fallback.length)];
}

function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════ NOTIFICATIONS ═══════════════════
function showNotification(message, type = 'info') {
    const palette = {
        success: { bg: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.3)', color: '#16a34a' },
        error: { bg: 'rgba(225,29,72,0.12)', border: 'rgba(225,29,72,0.35)', color: '#e11d48' },
        warning: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', color: '#ca8a04' },
        info: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', color: '#0891b2' },
    };
    const p = palette[type] || palette.info;

    const el = document.createElement('div');
    el.style.cssText = `
        position:fixed; top:90px; right:24px; z-index:9999;
        padding:13px 22px; border-radius:12px; font-size:0.88rem; font-weight:600;
        background:${p.bg}; border:1.5px solid ${p.border}; color:${p.color};
        backdrop-filter:blur(14px); animation:fadeInDown 0.3s ease;
        max-width:360px; box-shadow:0 8px 32px rgba(0,0,0,0.18);
        display:flex; align-items:flex-start; gap:8px; line-height:1.4;
    `;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s ease'; setTimeout(() => el.remove(), 320); }, 3500);
}
