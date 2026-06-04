// Seed mock data for the platform members as shown in the screenshot.
const SEEDED_MEMBERS = [
    { name: "Suharso", email: "suharso@gmail.com", date: "20 Mei 2026", year: 2026, timestamp: new Date("2026-05-20T10:00:00").getTime() },
    { name: "agnar", email: "agnar@gmail.com", date: "21 Mei 2026", year: 2026, timestamp: new Date("2026-05-21T09:00:00").getTime() },
    { name: "fadhil", email: "fadhil@gmail.com", date: "21 Mei 2026", year: 2026, timestamp: new Date("2026-05-21T10:00:00").getTime() }
];

// Indonesian Location data dictionary
const INDONESIAN_LOCATIONS = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur"],
    "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Tasikmalaya", "Cirebon", "Sukabumi"],
    "Jawa Tengah": ["Semarang", "Surakarta", "Magelang", "Pekalongan", "Tegal", "Salatiga"],
    "Jawa Timur": ["Surabaya", "Malang", "Batu", "Kediri", "Madiun", "Blitar", "Probolinggo", "Pasuruan"],
    "D.I. Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Gunungkidul", "Kulon Progo"],
    "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Buleleng", "Klungkung", "Karangasem"],
    "Banten": ["Tangerang", "Serang", "Cilegon", "Tangerang Selatan", "Pandeglang", "Lebak"],
    "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar", "Sibolga", "Tanjungbalai", "Tebing Tinggi"],
    "Sulawesi Selatan": ["Makassar", "Parepare", "Palopo", "Gowa", "Maros", "Bone"]
};

// Initialize application state
let users = [];
let currentUser = null;

window.getDatasetQualityInfo = function(entry) {
        if (!entry) return { finalScore: 0, criteria: [], rawScore: 0 };
        const score = entry.qualityScore || 0;
        
        function seededRand(seed, min, max) {
            let x = Math.sin(seed * 9301 + 49297) * 233280;
            return min + (x - Math.floor(x)) * (max - min);
        }
        
        const seed = entry.id || 1;
        
        // Refresh user from storage to get latest resolved alerts if necessary
        const storageUser = JSON.parse(localStorage.getItem('insight_session_v2'));
        const resolvedAlerts = (storageUser && storageUser.resolvedAlerts) || (currentUser && currentUser.resolvedAlerts) || [];
        
        const resolved = resolvedAlerts.includes('dq-' + seed);
        const finalScore = resolved ? Math.max(98, score) : score;
        
        const completeness  = Math.min(100, Math.round(finalScore + seededRand(seed * 2, -2, 2)));
        const accuracy      = Math.min(100, Math.round(finalScore + seededRand(seed * 5, -3, 3)));
        const validity      = Math.min(100, Math.round(finalScore + seededRand(seed * 8, -4, 4)));
        const consistency   = Math.min(100, Math.round(finalScore + seededRand(seed * 3, -3, 3)));
        const timeliness    = Math.min(100, Math.round(finalScore + seededRand(seed * 6, -5, 5)));
        
        const average = Math.round((completeness + accuracy + validity + consistency + timeliness) / 5);
        
        const criteria = [
            { label: 'Completeness', val: completeness, weight: 0.2 },
            { label: 'Accuracy',     val: accuracy,     weight: 0.2 },
            { label: 'Validity',     val: validity,     weight: 0.2 },
            { label: 'Consistency',  val: consistency,  weight: 0.2 },
            { label: 'Timeliness',   val: timeliness,   weight: 0.2 }
        ];
        
        return { finalScore: average, criteria, rawScore: score };
    }


// Initialize app data from local storage
function initData() {
    // Load registered users list from local storage or create new with seeded data
    const savedUsers = localStorage.getItem('insight_users_v2');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        users = SEEDED_MEMBERS.map((m) => ({
            username: m.name,
            email: m.email,
            regDate: m.date,
            regYear: m.year,
            timestamp: m.timestamp
        }));
        localStorage.setItem('insight_users_v2', JSON.stringify(users));
    }

    // Load active session
    refreshCurrentUserFromStorage();
}

// Always read the latest currentUser from localStorage — call this before every render
function refreshCurrentUserFromStorage() {
    const savedSession = localStorage.getItem('insight_session_v2');
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
    }
    // Also re-read users array so it stays in sync
    const savedUsers = localStorage.getItem('insight_users_v2');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// Format Date helper to Indonesian format (e.g. 21 Mei 2026)
function formatDate(date) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dd = date.getDate();
    const mm = months[date.getMonth()];
    const yyyy = date.getFullYear();
    return `${dd} ${mm} ${yyyy}`;
}

// Helper to format Month and Year for "Member Since"
function getMemberSinceString(user) {
    if (user.timestamp) {
        const date = new Date(user.timestamp);
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    if (user.regDate) {
        const parts = user.regDate.split(' ');
        if (parts.length >= 3) {
            return `${parts[1]} ${parts[2]}`;
        }
        return user.regDate;
    }
    return "Mei 2026";
}

// Dynamic Profile Page Render helper
function updateProfileView() {
    if (!currentUser) return;
    
    // 1. Profile Banner Name & ID
    const nameDisplay = document.getElementById('profile-display-name');
    const idDisplay = document.getElementById('profile-display-id');
    const avatarImg = document.getElementById('profile-avatar-img');
    
    nameDisplay.textContent = currentUser.username;
    
    // Find index of this user in sorted list (1-based index)
    const sortedUsers = [...users].sort((a, b) => a.timestamp - b.timestamp);
    const overallIndex = sortedUsers.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase()) + 1;
    idDisplay.textContent = `User ID: #${overallIndex || 3}`;
    
    // 2. Avatar Photo or Initials
    if (currentUser.profilePic) {
        avatarImg.style.backgroundImage = `url(${currentUser.profilePic})`;
        avatarImg.style.backgroundSize = 'cover';
        avatarImg.style.backgroundPosition = 'center';
        avatarImg.textContent = '';
    } else {
        avatarImg.style.backgroundImage = 'none';
        avatarImg.textContent = getInitials(currentUser.username);
    }
    
    // 3. Personal Info Labels
    document.getElementById('info-val-fullname').textContent = currentUser.username;
    document.getElementById('info-val-email').textContent = currentUser.email;
    document.getElementById('info-val-phone').textContent = currentUser.phone || '-';
    document.getElementById('info-val-location').textContent = currentUser.location || '-';
    document.getElementById('info-val-membersince').textContent = getMemberSinceString(currentUser);
    
    // 4. Reset editing visual state
    const editBtn = document.getElementById('btn-edit-personal-info');
    if (editBtn) {
        editBtn.classList.remove('btn-save-active');
        editBtn.innerHTML = `
            <span class="btn-text-content">
                <svg viewBox="0 0 24 24" class="action-icon"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                Edit
            </span>
        `;
    }
    
    // Hide inputs, show labels
    document.getElementById('info-input-fullname').style.display = 'none';
    document.getElementById('info-input-phone').style.display = 'none';
    document.querySelector('.location-edit-group').style.display = 'none';
    
    document.getElementById('info-val-fullname').style.display = 'block';
    document.getElementById('info-val-phone').style.display = 'block';
    document.getElementById('info-val-location').style.display = 'block';
    
    // 5. Initialize stats boxes
    document.getElementById('profile-stat-datasources').textContent = currentUser.dataSources || 0;
    document.getElementById('profile-stat-activeprojects').textContent = currentUser.activeProjects || 0;
    document.getElementById('profile-stat-qualityscore').textContent = currentUser.qualityScore || '0%';
}

// ============================================================
// HOME FEATURES — definition, last-used tracking, render
// ============================================================

const HOME_FEATURES = [
    {
        key:     'datasource-overview',
        title:   'Data Source Overview',
        desc:    'Display and manage all connected data sources',
        target:  'datasource-overview-view',
        available: true
    },
    {
        key:     'add-data',
        title:   'Add Data Source',
        desc:    'Connect and upload new data sources to the platform',
        target:  'add-data-view',
        available: true
    },
    {
        key:     'data-quality',
        title:   'Data Quality Dashboard',
        desc:    'Monitor data quality metrics and trends',
        target:  'data-quality-view',
        available: true
    },
    {
        key:     'pipeline',
        title:   'Pipeline Monitoring',
        desc:    'Track data pipeline status and performance',
        target:  'pipeline-view',
        available: true
    },
    {
        key:     'alerts',
        title:   'Alerts & Notifications',
        desc:    'Manage alerts for data issues and updates',
        target:  'alerts-view',
        available: true
    }
];

function getLastUsedFeature() {
    return localStorage.getItem('insight_last_feature') || null;
}

function setLastUsedFeature(featureKey) {
    localStorage.setItem('insight_last_feature', featureKey);
}

function renderHomeFeatures() {
    const container = document.getElementById('home-feature-list');
    if (!container) return;

    const lastUsed = getLastUsedFeature();

    // Sort: last-used first, then other available, then coming-soon
    const sorted = [...HOME_FEATURES].sort((a, b) => {
        if (a.key === lastUsed) return -1;
        if (b.key === lastUsed) return  1;
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return  1;
        return 0;
    });

    container.innerHTML = sorted.map(f => {
        let cls = 'feature-list-item';
        if (!f.available) {
            cls += ' feature-coming-soon-home';
        } else if (f.key === lastUsed) {
            cls += ' feature-available feature-last-used';
        } else {
            cls += ' feature-available';
        }

        return `
        <div class="${cls}" data-feature-key="${f.key}" data-target="${f.target || ''}">
            <div class="feature-item-info">
                <h4>${f.title}</h4>
                <p>${f.desc}</p>
            </div>
            <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>`;
    }).join('');

    // Attach click handlers for available features
    container.querySelectorAll('.feature-list-item.feature-available').forEach(el => {
        el.addEventListener('click', () => {
            const key    = el.dataset.featureKey;
            const target = el.dataset.target;
            if (!target) return;
            setLastUsedFeature(key);
            // Add data wizard needs reset first
            if (target === 'add-data-view' && typeof resetDataEntryWizard === 'function') {
                resetDataEntryWizard();
            }
            navigateTo(target);
        });
    });
}

// Views Navigation Controller
function navigateTo(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });


    // Show selected view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
        // Trigger reflow for transition
        targetView.offsetHeight;
        targetView.classList.add('active');
    }

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Always refresh currentUser from storage before rendering any view
    refreshCurrentUserFromStorage();

    // Handle view-specific UI renders
    if (viewId === 'home-view') {
        updateNavbarSession();
        renderHomeFeatures();
    } else if (viewId === 'about-view') {
        updateNavbarSession();
    } else if (viewId === 'dashboard-view') {
        updateNavbarSession();
        renderDashboardList();
    } else if (viewId === 'profile-view') {
        updateNavbarSession();
        updateProfileView();
    } else if (viewId === 'data-entry-view') {
        updateNavbarSession();
        renderDataEntryDashboard();
    } else if (viewId === 'datasource-overview-view') {
        updateNavbarSession();
        renderDataSourceOverview();
    } else if (viewId === 'pipeline-view') {
        updateNavbarSession();
        renderPipelineMonitoring();
    } else if (viewId === 'pipeline-detail-view') {
        updateNavbarSession();
        renderPipelineDetail();
    } else if (viewId === 'data-quality-view') {
        updateNavbarSession();
        renderDataQuality();
    } else if (viewId === 'data-quality-analyze-view') {
        updateNavbarSession();
        renderDataQualityAnalyze();
    } else if (viewId === 'alerts-view') {
        updateNavbarSession();
        renderAlerts();
    }
}

// Update user details in headers (including profile badge image/initials)
function updateNavbarSession() {
    const userNameDisplays = document.querySelectorAll('.username-display');
    const userAvatarLetters = document.querySelectorAll('.avatar-letter');
    
    if (currentUser) {
        userNameDisplays.forEach(el => el.textContent = currentUser.username);
        const letter = currentUser.username.charAt(0).toUpperCase();
        userAvatarLetters.forEach(el => el.textContent = letter);

        const avatars = document.querySelectorAll('.user-profile-badge .avatar');
        avatars.forEach(el => {
            if (currentUser.profilePic) {
                el.style.backgroundImage = `url(${currentUser.profilePic})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.textContent = '';
            } else {
                el.style.backgroundImage = 'none';
                el.innerHTML = `<span class="avatar-letter">${letter}</span>`;
            }
        });
    }
}

function updateAboutSession() {
    updateNavbarSession();
}

function updateDashboardSession() {
    updateNavbarSession();
}


// Auth Actions: Register user
function registerUser(username, email, password) {
    // Check if email already exists
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        alert("Email already registered!");
        return false;
    }

    const today = new Date();
    const newUser = {
        username: username,
        email: email,
        password: password,
        regDate: formatDate(today),
        regYear: today.getFullYear(),
        timestamp: today.getTime()
    };

    users.push(newUser);
    localStorage.setItem('insight_users_v2', JSON.stringify(users));
    
    // Set current active session
    currentUser = newUser;
    localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
    
    return true;
}

// Auth Actions: Login user
function loginUser(email, password) {
    // Look for user matching email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        if (user.password && user.password !== password) {
            alert("Incorrect password!");
            return false;
        }
        currentUser = JSON.parse(JSON.stringify(user));
        localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
        return true;
    } else {
        // Fallback: If not found in seeds, create temporary session profile so it proceeds
        const namePart = email.split('@')[0];
        const readableName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const today = new Date();
        const fallbackUser = {
            username: readableName,
            email: email,
            password: password,
            regDate: formatDate(today),
            regYear: today.getFullYear(),
            timestamp: today.getTime()
        };
        // Add to db
        users.push(fallbackUser);
        localStorage.setItem('insight_users_v2', JSON.stringify(users));
        
        currentUser = fallbackUser;
        localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
        return true;
    }
}

// Generate initials for avatar circle
function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

// Dashboard Search and Rendering logic
function renderDashboardList(searchQuery = '') {
    const listContainer = document.getElementById('members-list');
    const totalUsersCount = document.getElementById('total-users-count');
    const users2026Count = document.getElementById('users-2026-count');
    const userFooterNotice = document.getElementById('user-footer-notice');
    
    // Sort users chronologically (oldest registration first)
    const sortedUsers = [...users].sort((a, b) => a.timestamp - b.timestamp);

    // Apply search filter if query is present
    const filteredUsers = sortedUsers.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate dynamic stats from all users (not filtered)
    const total = sortedUsers.length;
    const count2026 = sortedUsers.filter(u => u.regYear === 2026).length;

    if (totalUsersCount) totalUsersCount.textContent = total;
    if (users2026Count) users2026Count.textContent = count2026;

    if (userFooterNotice) {
        userFooterNotice.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            You are one of the <strong>${total} users</strong> of this platform!
        `;
    }

    // Clear list container
    listContainer.innerHTML = '';

    if (filteredUsers.length === 0) {
        listContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--light-text-muted); padding: 2rem;">No members found matching "${searchQuery}"</div>`;
        return;
    }

    // Render list
    filteredUsers.forEach(user => {
        // Find index of this user in the sorted list (1-based index)
        const overallIndex = sortedUsers.findIndex(u => u.timestamp === user.timestamp) + 1;
        
        let avatarClass = 'member-avatar-blue';
        if (overallIndex % 3 === 2) {
            avatarClass = 'member-avatar-purple';
        } else if (overallIndex % 3 === 0) {
            avatarClass = 'member-avatar-pink';
        }
        
        const itemHTML = `
            <div class="member-item animate-fade-in">
                <div class="member-left-side">
                    <div class="member-avatar ${avatarClass}">${overallIndex}</div>
                    <div class="member-details">
                        <h4>${user.username}</h4>
                        <p class="member-email">${user.email || (user.username.toLowerCase() + '@gmail.com')}</p>
                        <p class="reg-date">Mendaftar: ${user.regDate}</p>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
}

// Toggle input password visibility (hide/show eye)
function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const showIcon = this.querySelector('.show-icon');
            const hideIcon = this.querySelector('.hide-icon');

            if (input.type === 'password') {
                input.type = 'text';
                showIcon.style.display = 'none';
                hideIcon.style.display = 'block';
            } else {
                input.type = 'password';
                showIcon.style.display = 'block';
                hideIcon.style.display = 'none';
            }
        });
    });
}

// Global Search Autocomplete
function setupGlobalSearch() {
    const searchInputs = document.querySelectorAll('.global-search-input');
    
    searchInputs.forEach(input => {
        const dropdown = input.nextElementSibling;
        if (!dropdown || !dropdown.classList.contains('search-autocomplete-dropdown')) return;
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                dropdown.style.display = 'none';
                return;
            }
            
            const matches = HOME_FEATURES.filter(f => 
                f.title.toLowerCase().includes(query) || 
                f.desc.toLowerCase().includes(query)
            );
            
            if (matches.length === 0) {
                dropdown.innerHTML = `<div class="search-autocomplete-empty">No matching features found</div>`;
            } else {
                dropdown.innerHTML = matches.map(f => {
                    const statusText = f.available ? '' : ' <span style="font-size: 0.65rem; color: var(--light-text-muted);">(Soon)</span>';
                    const styleStr = f.available ? '' : ' opacity: 0.6; cursor: default;';
                    return `
                    <div class="search-autocomplete-item" style="${styleStr}" data-key="${f.key}" data-target="${f.target || ''}" data-available="${f.available}">
                        <div class="search-autocomplete-title">${f.title}${statusText}</div>
                        <div class="search-autocomplete-desc">${f.desc}</div>
                    </div>`;
                }).join('');
                
                // Add click events
                dropdown.querySelectorAll('.search-autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const target = item.dataset.target;
                        const key = item.dataset.key;
                        const available = item.dataset.available === 'true';
                        
                        if (!available) return;
                        
                        input.value = '';
                        dropdown.style.display = 'none';
                        
                        if (target) {
                            setLastUsedFeature(key);
                            if (target === 'add-data-view' && typeof resetDataEntryWizard === 'function') {
                                resetDataEntryWizard();
                            }
                            navigateTo(target);
                        }
                    });
                });
            }
            
            dropdown.style.display = 'block';
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });
}

// Bind DOM event listeners when page loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Init Mock Data & Saved Session
    initData();
    setupPasswordToggles();
    setupGlobalSearch();

    // 2. View Redirection routing based on session
    if (currentUser) {
        navigateTo('home-view');
    } else {
        navigateTo('landing-view');
    }

    // 3. Landing page redirects
    document.querySelectorAll('.btn-to-register').forEach(el => {
        el.addEventListener('click', () => {
            navigateTo('register-view');
        });
    });

    document.querySelectorAll('.btn-to-login').forEach(el => {
        el.addEventListener('click', () => {
            navigateTo('login-view');
        });
    });

    // 4. Form Submissions
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;

            if (username && email && password) {
                const success = registerUser(username, email, password);
                if (success) {
                    registerForm.reset();
                    navigateTo('home-view');
                }
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (email && password) {
                const success = loginUser(email, password);
                if (success) {
                    loginForm.reset();
                    navigateTo('home-view');
                }
            }
        });
    }

    // 5. Navigation Links Click Handlers
    document.querySelectorAll('.link-to-home').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('home-view');
        });
    });

    document.querySelectorAll('.link-to-data-strategy').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('data-strategy-view');
        });
    });

    document.querySelectorAll('.link-to-analytic-tool').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('analytic-tool-view');
        });
    });

    document.querySelectorAll('.link-to-best-practice').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('best-practice-view');
            // reset to page 1 on navigate
            document.getElementById('bp-page-1').style.display='block';
            document.getElementById('bp-page-2').style.display='none';
            window.scrollTo(0,0);
        });
    });

    document.querySelectorAll('.link-to-about').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('about-view');
        });
    });

    document.querySelectorAll('.link-to-dashboard').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('dashboard-view');
        });
    });

    // Data Entry Dashboard (from Get Started, feature items on home)
    document.querySelectorAll('.link-to-data-entry').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('data-entry-view');
        });
    });

    // Add Data Wizard (from Add Data Source card inside data-entry-view)
    document.querySelectorAll('.link-to-add-data').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setLastUsedFeature('add-data');   // track last-used
            resetDataEntryWizard();
            navigateTo('add-data-view');
        });
    });

    // Data Source Overview (from overview card inside data-entry-view)
    document.querySelectorAll('.link-to-datasource-overview').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setLastUsedFeature('datasource-overview');  // track last-used
            navigateTo('datasource-overview-view');
        });
    });

    // Pipeline Monitoring (from pipeline card inside data-entry-view)
    document.querySelectorAll('.link-to-pipeline').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setLastUsedFeature('pipeline'); // track last-used
            navigateTo('pipeline-view');
        });
    });

    document.querySelectorAll('.link-to-data-quality').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setLastUsedFeature('data-quality'); // track last-used
            navigateTo('data-quality-view');
        });
    });

    document.querySelectorAll('.link-to-alerts').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setLastUsedFeature('alerts'); // track last-used
            navigateTo('alerts-view');
        });
    });

    // Logout
    document.querySelectorAll('.btn-logout').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            currentUser = null;
            localStorage.removeItem('insight_session_v2');
            navigateTo('landing-view');
        });
    });

    // 6. Live Dashboard search filter
    const dashboardSearch = document.getElementById('dashboard-member-search');
    if (dashboardSearch) {
        dashboardSearch.addEventListener('input', (e) => {
            renderDashboardList(e.target.value);
        });
    }

    // 7. Profile navigation click handler
    document.querySelectorAll('.link-to-profile').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('profile-view');
        });
    });

    // 8. Personal Info Edit/Save Toggle
    const editPersonalInfoBtn = document.getElementById('btn-edit-personal-info');
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', () => {
            const isEditing = editPersonalInfoBtn.classList.contains('btn-save-active');
            
            const nameInput = document.getElementById('info-input-fullname');
            const phoneInput = document.getElementById('info-input-phone');
            const locationGroup = document.querySelector('.location-edit-group');
            
            const nameVal = document.getElementById('info-val-fullname');
            const phoneVal = document.getElementById('info-val-phone');
            const locationVal = document.getElementById('info-val-location');
            
            const provSelect = document.getElementById('info-select-province');
            const citySelect = document.getElementById('info-select-city');
            
            if (!isEditing) {
                // Enter Edit Mode
                editPersonalInfoBtn.classList.add('btn-save-active');
                editPersonalInfoBtn.innerHTML = `
                    <span class="btn-text-content">
                        <svg viewBox="0 0 24 24" class="action-icon"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        Save
                    </span>
                `;
                
                nameVal.style.display = 'none';
                phoneVal.style.display = 'none';
                locationVal.style.display = 'none';
                
                nameInput.style.display = 'block';
                phoneInput.style.display = 'block';
                locationGroup.style.display = 'flex';
                
                nameInput.value = currentUser.username;
                phoneInput.value = currentUser.phone || '';
                
                // Populate provinces
                provSelect.innerHTML = '<option value="">Pilih Provinsi</option>';
                Object.keys(INDONESIAN_LOCATIONS).forEach(prov => {
                    provSelect.insertAdjacentHTML('beforeend', `<option value="${prov}">${prov}</option>`);
                });
                
                // Parse existing location
                if (currentUser.location && currentUser.location !== '-') {
                    const locParts = currentUser.location.split(', ');
                    if (locParts.length === 2) {
                        const cityStr = locParts[0].trim();
                        const provStr = locParts[1].trim();
                        
                        if (INDONESIAN_LOCATIONS[provStr]) {
                            provSelect.value = provStr;
                            
                            citySelect.disabled = false;
                            citySelect.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
                            INDONESIAN_LOCATIONS[provStr].forEach(city => {
                                citySelect.insertAdjacentHTML('beforeend', `<option value="${city}">${city}</option>`);
                            });
                            citySelect.value = cityStr;
                        }
                    }
                } else {
                    citySelect.disabled = true;
                    citySelect.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
                }
            } else {
                // Save and Exit Edit Mode
                const newName = nameInput.value.trim();
                const newPhone = phoneInput.value.trim();
                const selectedProv = provSelect.value;
                const selectedCity = citySelect.value;
                
                if (!newName) {
                    alert("Nama tidak boleh kosong!");
                    return;
                }
                
                currentUser.username = newName;
                currentUser.phone = newPhone || '-';
                
                if (selectedProv && selectedCity) {
                    currentUser.location = `${selectedCity}, ${selectedProv}`;
                } else {
                    currentUser.location = '-';
                }
                
                // Persist session
                localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
                
                // Persist in users array
                const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                if (userIdx !== -1) {
                    users[userIdx].username = newName;
                    users[userIdx].phone = currentUser.phone;
                    users[userIdx].location = currentUser.location;
                    localStorage.setItem('insight_users_v2', JSON.stringify(users));
                }
                
                updateNavbarSession();
                updateProfileView();
            }
        });
    }

    // 9. Province Select Change
    const provSelect = document.getElementById('info-select-province');
    const citySelect = document.getElementById('info-select-city');
    if (provSelect && citySelect) {
        provSelect.addEventListener('change', (e) => {
            const selectedProv = e.target.value;
            if (selectedProv && INDONESIAN_LOCATIONS[selectedProv]) {
                citySelect.disabled = false;
                citySelect.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
                INDONESIAN_LOCATIONS[selectedProv].forEach(city => {
                    citySelect.insertAdjacentHTML('beforeend', `<option value="${city}">${city}</option>`);
                });
            } else {
                citySelect.disabled = true;
                citySelect.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
            }
        });
    }

    // 10. Profile Pic Upload options trigger
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const modalPhotoOptions = document.getElementById('modal-photo-options');
    const btnClosePhotoModal = document.getElementById('btn-close-photo-modal');
    
    if (btnChangeAvatar && modalPhotoOptions) {
        btnChangeAvatar.addEventListener('click', () => {
            modalPhotoOptions.style.display = 'flex';
        });
    }
    if (btnClosePhotoModal && modalPhotoOptions) {
        btnClosePhotoModal.addEventListener('click', () => {
            modalPhotoOptions.style.display = 'none';
        });
    }

    // 11. Upload file handler
    const btnUploadFileOption = document.getElementById('btn-upload-file-option');
    const profileFileInput = document.getElementById('profile-file-input');
    if (btnUploadFileOption && profileFileInput) {
        btnUploadFileOption.addEventListener('click', () => {
            profileFileInput.click();
        });
    }
    
    if (profileFileInput) {
        profileFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("Ukuran file maksimal adalah 2MB!");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Url = event.target.result;
                    currentUser.profilePic = base64Url;
                    
                    localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
                    const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                    if (userIdx !== -1) {
                        users[userIdx].profilePic = base64Url;
                        localStorage.setItem('insight_users_v2', JSON.stringify(users));
                    }
                    
                    updateNavbarSession();
                    updateProfileView();
                    modalPhotoOptions.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 12. Camera stream controls
    const btnTakePhotoOption = document.getElementById('btn-take-photo-option');
    const modalCameraCapture = document.getElementById('modal-camera-capture');
    const btnCancelCamera = document.getElementById('btn-cancel-camera');
    const btnCapturePhoto = document.getElementById('btn-capture-photo');
    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    let cameraStream = null;
    
    if (btnTakePhotoOption && modalCameraCapture) {
        btnTakePhotoOption.addEventListener('click', () => {
            modalPhotoOptions.style.display = 'none';
            modalCameraCapture.style.display = 'flex';
            
            navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
                .then(stream => {
                    cameraStream = stream;
                    cameraVideo.srcObject = stream;
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    alert("Gagal mengakses kamera: " + err.message);
                    modalCameraCapture.style.display = 'none';
                });
        });
    }
    
    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        modalCameraCapture.style.display = 'none';
    }
    
    if (btnCancelCamera) {
        btnCancelCamera.addEventListener('click', stopCamera);
    }
    
    if (btnCapturePhoto && cameraCanvas && cameraVideo) {
        btnCapturePhoto.addEventListener('click', () => {
            if (cameraStream) {
                const ctx = cameraCanvas.getContext('2d');
                cameraCanvas.width = cameraVideo.videoWidth || 640;
                cameraCanvas.height = cameraVideo.videoHeight || 480;
                
                ctx.translate(cameraCanvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
                
                const dataUrl = cameraCanvas.toDataURL('image/jpeg');
                currentUser.profilePic = dataUrl;
                
                localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
                const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                if (userIdx !== -1) {
                    users[userIdx].profilePic = dataUrl;
                    localStorage.setItem('insight_users_v2', JSON.stringify(users));
                }
                
                updateNavbarSession();
                updateProfileView();
                stopCamera();
            }
        });
    }

    // 13. Change password trigger & form submit
    const btnTriggerChangePassword = document.getElementById('btn-trigger-change-password');
    const modalChangePassword = document.getElementById('modal-change-password');
    const btnCancelPwd = document.getElementById('btn-cancel-pwd');
    const formChangePassword = document.getElementById('form-change-password');
    
    if (btnTriggerChangePassword && modalChangePassword) {
        btnTriggerChangePassword.addEventListener('click', () => {
            modalChangePassword.style.display = 'flex';
        });
    }
    if (btnCancelPwd && modalChangePassword) {
        btnCancelPwd.addEventListener('click', () => {
            modalChangePassword.style.display = 'none';
            formChangePassword.reset();
        });
    }
    
    if (formChangePassword) {
        formChangePassword.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPwd = document.getElementById('pwd-current').value;
            const newPwd = document.getElementById('pwd-new').value;
            const confirmPwd = document.getElementById('pwd-confirm').value;
            
            const storedPwd = currentUser.password || "password";
            if (currentPwd !== storedPwd) {
                alert("Password saat ini salah!");
                return;
            }
            
            if (newPwd.length < 6) {
                alert("Password baru minimal 6 karakter!");
                return;
            }
            
            if (newPwd !== confirmPwd) {
                alert("Konfirmasi password baru tidak cocok!");
                return;
            }
            
            currentUser.password = newPwd;
            localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
            const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIdx !== -1) {
                users[userIdx].password = newPwd;
                localStorage.setItem('insight_users_v2', JSON.stringify(users));
            }
            
            alert("Password berhasil diubah!");
            modalChangePassword.style.display = 'none';
            formChangePassword.reset();
        });
    }

    // 14. Email Preferences trigger & save
    const btnTriggerEmailPrefs = document.getElementById('btn-trigger-email-preferences');
    const modalEmailPrefs = document.getElementById('modal-email-preferences');
    const btnCancelEmailPref = document.getElementById('btn-cancel-email-pref');
    const btnSaveEmailPref = document.getElementById('btn-save-email-pref');
    
    if (btnTriggerEmailPrefs && modalEmailPrefs) {
        btnTriggerEmailPrefs.addEventListener('click', () => {
            modalEmailPrefs.style.display = 'flex';
            const prefs = currentUser.emailPrefs || { weekly: true, security: true, updates: false };
            document.getElementById('pref-email-weekly').checked = prefs.weekly;
            document.getElementById('pref-email-security').checked = prefs.security;
            document.getElementById('pref-email-updates').checked = prefs.updates;
        });
    }
    
    if (btnCancelEmailPref && modalEmailPrefs) {
        btnCancelEmailPref.addEventListener('click', () => {
            modalEmailPrefs.style.display = 'none';
        });
    }
    
    if (btnSaveEmailPref) {
        btnSaveEmailPref.addEventListener('click', () => {
            const weekly = document.getElementById('pref-email-weekly').checked;
            const security = document.getElementById('pref-email-security').checked;
            const updates = document.getElementById('pref-email-updates').checked;
            
            currentUser.emailPrefs = { weekly, security, updates };
            localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
            const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIdx !== -1) {
                users[userIdx].emailPrefs = currentUser.emailPrefs;
                localStorage.setItem('insight_users_v2', JSON.stringify(users));
            }
            
            alert("Email Preferences disimpan!");
            modalEmailPrefs.style.display = 'none';
        });
    }

    // 15. Privacy Settings trigger & save
    const btnTriggerPrivacy = document.getElementById('btn-trigger-privacy-settings');
    const modalPrivacy = document.getElementById('modal-privacy-settings');
    const btnCancelPrivacy = document.getElementById('btn-cancel-privacy');
    const btnSavePrivacy = document.getElementById('btn-save-privacy');
    
    if (btnTriggerPrivacy && modalPrivacy) {
        btnTriggerPrivacy.addEventListener('click', () => {
            modalPrivacy.style.display = 'flex';
            const settings = currentUser.privacySettings || { publicProfile: false, shareData: true, activeStatus: true };
            document.getElementById('pref-privacy-public').checked = settings.publicProfile;
            document.getElementById('pref-privacy-share').checked = settings.shareData;
            document.getElementById('pref-privacy-status').checked = settings.activeStatus;
        });
    }
    
    if (btnCancelPrivacy && modalPrivacy) {
        btnCancelPrivacy.addEventListener('click', () => {
            modalPrivacy.style.display = 'none';
        });
    }
    
    if (btnSavePrivacy) {
        btnSavePrivacy.addEventListener('click', () => {
            const publicProfile = document.getElementById('pref-privacy-public').checked;
            const shareData = document.getElementById('pref-privacy-share').checked;
            const activeStatus = document.getElementById('pref-privacy-status').checked;
            
            currentUser.privacySettings = { publicProfile, shareData, activeStatus };
            localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
            const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIdx !== -1) {
                users[userIdx].privacySettings = currentUser.privacySettings;
                localStorage.setItem('insight_users_v2', JSON.stringify(users));
            }
            
            alert("Privacy Settings disimpan!");
            modalPrivacy.style.display = 'none';
        });
    }

    // =============================================
    // RENDER: DATA ENTRY DASHBOARD
    // =============================================

    window.renderDataEntryDashboard = function renderDataEntryDashboard() {
        // Always read fresh data
        const entries = (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];

        // --- Stat Cards ---
        const totalSources = entries.length || (currentUser ? (currentUser.dataSources || 0) : 0);
        const activeProjs  = entries.filter(e => e.activity === 'in-progress').length;
        const avgScore     = entries.length > 0
            ? Math.round(entries.reduce((s, e) => s + (e.qualityScore || 0), 0) / entries.length) + '%'
            : (currentUser ? (currentUser.qualityScore || '0%') : '0%');

        const elDS = document.getElementById('ded-datasources');
        const elAP = document.getElementById('ded-activeprojects');
        const elQS = document.getElementById('ded-qualityscore');
        if (elDS) elDS.textContent = totalSources;
        if (elAP) elAP.textContent = activeProjs;
        if (elQS) elQS.textContent = avgScore;

        // --- Count by activity (from real entries) ---
        const counts = { todo: 0, 'in-progress': 0, 'in-review': 0, done: 0 };
        entries.forEach(e => {
            if (counts[e.activity] !== undefined) counts[e.activity]++;
        });
        const total = entries.length;

        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('ded-count-todo',       counts['todo']);
        setEl('ded-count-inprogress', counts['in-progress']);
        setEl('ded-count-inreview',   counts['in-review']);
        setEl('ded-count-done',       counts['done']);
        setEl('ded-count-total',      total);

        // --- Pie Chart (always uses real data when available) ---
        window.drawDedPieChart(counts, total);
    };

    window.drawDedPieChart = function drawDedPieChart(counts, total) {
        const canvas = document.getElementById('ded-pie-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height / 2, r = 70;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const slices = [
            { key: 'todo',        color: '#f59e0b', label: 'To Do' },
            { key: 'in-progress', color: '#3b82f6', label: 'In Progress' },
            { key: 'in-review',   color: '#a855f7', label: 'In Review' },
            { key: 'done',        color: '#10b981', label: 'Done' },
        ];

        // Use real data always; fall back to demo only when truly zero entries
        const displayCounts = total > 0 ? counts : { todo: 30, 'in-progress': 45, 'in-review': 20, done: 81 };
        const displayTotal  = total > 0 ? total  : 176;

        // Update legend numbers with display data
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        if (total === 0) {
            setEl('ded-count-todo',       displayCounts['todo']);
            setEl('ded-count-inprogress', displayCounts['in-progress']);
            setEl('ded-count-inreview',   displayCounts['in-review']);
            setEl('ded-count-done',       displayCounts['done']);
            setEl('ded-count-total',      displayTotal);
        }

        let startAngle = -Math.PI / 2;
        slices.forEach(s => {
            const val = displayCounts[s.key];
            const sliceAngle = (val / displayTotal) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = s.color;
            ctx.fill();

            // Label on slice
            if (val > 0) {
                const midAngle = startAngle + sliceAngle / 2;
                const lx = cx + (r * 0.62) * Math.cos(midAngle);
                const ly = cy + (r * 0.62) * Math.sin(midAngle);
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const pct = Math.round((val / displayTotal) * 100);
                ctx.fillText(pct + '%', lx, ly);
            }

            startAngle += sliceAngle;
        });

        // Inner circle for donut effect
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.45, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(17, 24, 54, 0.95)';
        ctx.fill();

        // Center text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayTotal, cx, cy - 8);
        ctx.font = '9px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText('Total', cx, cy + 8);
    };

    // =============================================
    // RENDER: PIPELINE MONITORING
    // =============================================
    
    window.renderPipelineMonitoring = function renderPipelineMonitoring() {
        const getEntries = () => (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];
        
        function refreshPipelineStats() {
            const entries = getEntries();
            const total = entries.length;
            const active = entries.filter(e => e.activity === 'in-progress' || e.activity === 'in-review').length;
            
            let totalAccuracy = 0;
            let totalRecordsNum = 0;
            
            entries.forEach(e => {
                totalAccuracy += (e.qualityScore || 0);
                const pName = e.name || e.sourceName || '';
                totalRecordsNum += (pName.length * 1500) + ((e.qualityScore || 0) * 100);
            });
            
            const avgAcc = total > 0 ? (totalAccuracy / total).toFixed(1) + '%' : '0%';
            const formattedRecords = totalRecordsNum > 1000 ? (totalRecordsNum / 1000).toFixed(1) + 'K' : totalRecordsNum;
            
            const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setEl('pipeline-stat-total', total);
            setEl('pipeline-stat-active', active);
            setEl('pipeline-stat-accuracy', avgAcc);
            setEl('pipeline-stat-records', formattedRecords);
        }
        
        function applyPipelineFilters() {
            const searchEl = document.getElementById('pipeline-search-input');
            window._renderPipelineCards(getEntries(), searchEl ? searchEl.value : '');
        }
        
        refreshPipelineStats();
        window._renderPipelineCards(getEntries(), '');
        
        const searchEl = document.getElementById('pipeline-search-input');
        if (searchEl) {
            searchEl.value = '';
            searchEl.oninput = applyPipelineFilters;
        }
    };
    
    window._renderPipelineCards = function _renderPipelineCards(allEntries, search) {
        const container = document.getElementById('pipeline-cards-container');
        const emptyState = document.getElementById('pipeline-empty-state');
        if (!container) return;
        
        const s = search.toLowerCase().trim();
        
        const filtered = allEntries.filter(e => {
            if (!s) return true;
            const nameMatch = (e.name && e.name.toLowerCase().includes(s)) || (e.sourceName && e.sourceName.toLowerCase().includes(s));
            const actMatch = e.activity && e.activity.toLowerCase().includes(s);
            return nameMatch || actMatch;
        });
        
        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = filtered.map(entry => {
            const pipelineName = entry.name || entry.sourceName || 'Unknown Pipeline';
            // Use actual version if available, otherwise deterministic mock
            const version = entry.version || ("1." + (pipelineName.length % 10));
            const records = ((pipelineName.length * 1.5) + ((entry.qualityScore || 0) * 0.1)).toFixed(1) + "K";
            
            let statusLabel = entry.activity;
            let statusClass = "status-todo";
            if (entry.activity === 'in-progress') { statusLabel = "In Progress"; statusClass = "status-in-progress"; }
            else if (entry.activity === 'in-review') { statusLabel = "In Review"; statusClass = "status-in-review"; }
            else if (entry.activity === 'done') { statusLabel = "Done"; statusClass = "status-done"; }
            else if (entry.activity === 'todo') { statusLabel = "To Do"; statusClass = "status-todo"; }
            
            return `
            <div class="pipeline-card">
                <div class="pipeline-card-header">
                    <div class="pipeline-card-title">
                        <h3>${pipelineName}</h3>
                        <span class="pipeline-status ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="pipeline-card-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2zM21 9v6h-2v-6h2z"/></svg>
                    </div>
                </div>
                
                <ul class="pipeline-info-list">
                    <li class="pipeline-info-item">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                        Date: ${entry.date || entry.dateAdded || 'N/A'}
                    </li>
                    <li class="pipeline-info-item">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Owner: ${currentUser.username}
                    </li>
                    <li class="pipeline-info-item">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        Version: ${version}
                    </li>
                </ul>
                
                <div class="pipeline-metrics">
                    <div class="pipeline-metric-box">
                        <span class="pipeline-metric-label">Accuracy</span>
                        <span class="pipeline-metric-val">${entry.qualityScore || 0}%</span>
                    </div>
                    <div class="pipeline-metric-box">
                        <span class="pipeline-metric-label">Records</span>
                        <span class="pipeline-metric-val records">${records}</span>
                    </div>
                </div>
                
                <div class="pipeline-card-footer">
                    <span class="pipeline-last-updated">Last updated: Just now</span>
                    <button class="pipeline-monitor-btn" onclick="window.showPipelineDetail(${entry.id})">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
                        Monitor This Data
                    </button>
                </div>
            </div>`;
        }).join('');
    };

    // =============================================
    // RENDER: PIPELINE DETAIL VIEW (Chart.js)
    // =============================================
    let pipelineCharts = {};
    window.currentPipelineId = null;

    window.showPipelineDetail = function(id) {
        window.currentPipelineId = id;
        navigateTo('pipeline-detail-view');
    };

    window.renderPipelineDetail = function renderPipelineDetail() {
        if (!window.Chart) {
            console.warn("Chart.js not loaded.");
            return;
        }

        const entries = (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];
        // If currentPipelineId is not found, fallback to the first entry
        const entry = entries.find(e => e.id === window.currentPipelineId) || entries[0];
        
        if (!entry) {
            return; // No data to show
        }

        const seedVal = entry.id || 12345;
        const resolved = currentUser && currentUser.resolvedAlerts && currentUser.resolvedAlerts.includes('pl-' + seedVal);

        Chart.defaults.color = 'rgba(255, 255, 255, 0.5)';
        Chart.defaults.font.family = 'sans-serif';
        Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
        Chart.defaults.scale.grid.borderColor = 'rgba(255, 255, 255, 0.1)';

        function createChart(id, config) {
            if (pipelineCharts[id]) {
                pipelineCharts[id].destroy();
            }
            const ctx = document.getElementById(id);
            if (ctx) {
                pipelineCharts[id] = new Chart(ctx, config);
            }
        }

        // Simple pseudo-random generator seeded by entry.id so it's deterministic per pipeline
        let seed = seedVal;
        function random(min, max) {
            let x = Math.sin(seed++) * 10000;
            return min + (x - Math.floor(x)) * (max - min);
        }

        // Generate data based on entry properties to make it dynamic but deterministic
        const baseAcc = entry.qualityScore || 90;
        const baseErr = resolved ? 0 : Math.max(1000, 10000 - (baseAcc * 80)); 

        // Update top stats dynamically
        const processedGB = Math.round(random(10, 800));
        const activeCount = Math.round(random(1, 50));
        const totalCount = activeCount + Math.round(random(0, 10));
        const failCount = resolved ? 0 : Math.round(random(0, 15));
        
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        
        setEl('pd-val-1', totalCount.toLocaleString());
        setEl('pd-trend-1', '+' + (random(2, 15)).toFixed(1) + '%');
        
        setEl('pd-val-2', activeCount.toLocaleString());
        setEl('pd-trend-2', baseAcc.toFixed(1) + '%');
        
        setEl('pd-val-3', processedGB + ' GB');
        const tbStr = (processedGB / 1000 * random(1, 5)).toFixed(1) + ' TB';
        setEl('pd-trend-3', tbStr);
        
        setEl('pd-val-4', failCount.toLocaleString());
        setEl('pd-trend-4', '-' + (random(1, 10)).toFixed(1) + '%');

        // 1. Pipeline Performance Overview (Wide Line Chart)
        createChart('pd-performance-chart', {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [
                    {
                        label: 'Throughput (req/s)',
                        data: Array.from({length: 7}, () => random(6000, 9000)),
                        borderColor: '#60a5fa',
                        backgroundColor: '#60a5fa',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3
                    },
                    {
                        label: 'Latency (ms)',
                        data: Array.from({length: 7}, () => random(100, 500)),
                        borderColor: '#c084fc',
                        backgroundColor: '#c084fc',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3
                    },
                    {
                        label: 'Errors',
                        data: Array.from({length: 7}, () => random(baseErr * 0.5, baseErr * 1.5)),
                        borderColor: '#f87171',
                        backgroundColor: '#f87171',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } } },
                scales: { y: { beginAtZero: true } }
            }
        });

        // 2. Data Quality Metrics (Cyan Line Chart)
        createChart('pd-quality-chart', {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Accuracy (%)',
                        data: Array.from({length: 7}, () => random(Math.max(0, baseAcc - 5), Math.min(100, baseAcc + 5))),
                        borderColor: '#34d399',
                        backgroundColor: '#34d399',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3
                    },
                    {
                        label: 'Completeness (%)',
                        data: Array.from({length: 7}, () => random(95, 100)),
                        borderColor: '#2dd4bf',
                        backgroundColor: '#2dd4bf',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
                scales: { y: { min: 80, max: 100, ticks: { stepSize: 5 } } }
            }
        });

        // 3. Processing Time Analysis (Orange Line Chart)
        createChart('pd-time-chart', {
            type: 'line',
            data: {
                labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
                datasets: [
                    {
                        label: 'Avg Time (min)',
                        data: Array.from({length: 6}, () => random(10, 30)),
                        borderColor: '#fbbf24',
                        backgroundColor: '#fbbf24',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Max Time (min)',
                        data: Array.from({length: 6}, () => random(35, 60)),
                        borderColor: '#f87171',
                        backgroundColor: '#f87171',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
                scales: { y: { min: 0, max: 100, ticks: { stepSize: 25 } } }
            }
        });

        // 4. Pipeline Execution Status (Bar Chart)
        createChart('pd-execution-chart', {
            type: 'bar',
            data: {
                labels: ['User Data', 'Analytics', 'Reporting', 'Integration', 'Backup'],
                datasets: [
                    {
                        label: 'Success',
                        data: Array.from({length: 5}, () => Math.round(random(500, 1000))),
                        backgroundColor: '#34d399',
                        barThickness: 20
                    },
                    {
                        label: 'Failed',
                        data: Array.from({length: 5}, () => resolved ? 0 : Math.round(random(0, 50))),
                        backgroundColor: '#f87171',
                        barThickness: 20
                    },
                    {
                        label: 'Pending',
                        data: Array.from({length: 5}, () => Math.round(random(50, 200))),
                        backgroundColor: '#fbbf24',
                        barThickness: 20
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
                scales: { y: { beginAtZero: true } }
            }
        });
    };

    // =============================================
    // RENDER: DATA SOURCE OVERVIEW  (global so navigateTo can call it)
    // =============================================

    window.renderDataSourceOverview = function renderDataSourceOverview() {
        // Always read the latest data from currentUser (already refreshed by navigateTo)
        const getEntries = () => (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];

        function refreshStats() {
            const entries = getEntries();
            const counts = { todo: 0, 'in-progress': 0, 'in-review': 0, done: 0 };
            let totalAccuracy = 0;
            entries.forEach(e => {
                if (counts[e.activity] !== undefined) counts[e.activity]++;
                totalAccuracy += (e.qualityScore || 0);
            });
            const avgAcc = entries.length > 0 ? (totalAccuracy / entries.length).toFixed(1) + '%' : '0%';
            const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setEl('dso-stat-total',      entries.length);
            setEl('dso-stat-todo',       counts['todo']);
            setEl('dso-stat-inprogress', counts['in-progress']);
            setEl('dso-stat-inreview',   counts['in-review']);
            setEl('dso-stat-done',       counts['done']);
            setEl('dso-stat-accuracy',   avgAcc);
        }

        function applyFilters() {
            const searchEl = document.getElementById('dso-search');
            const filterEl = document.getElementById('dso-filter');
            window._dsoRenderTable(
                getEntries(),
                searchEl ? searchEl.value : '',
                filterEl ? filterEl.value : 'all'
            );
        }

        refreshStats();
        window._dsoRenderTable(getEntries(), '', 'all');

        // Search
        const searchEl = document.getElementById('dso-search');
        if (searchEl) {
            searchEl.value = '';
            searchEl.oninput = applyFilters;
        }

        // Filter
        const filterEl = document.getElementById('dso-filter');
        if (filterEl) {
            filterEl.value = 'all';
            filterEl.onchange = applyFilters;
        }

        // Modal close
        const modalClose = document.getElementById('dso-modal-close');
        const overlay    = document.getElementById('dso-modal-overlay');
        if (modalClose) modalClose.onclick = () => { if (overlay) overlay.style.display = 'none'; };
        if (overlay) overlay.onclick = (e) => { if (e.target === overlay) overlay.style.display = 'none'; };

        // Expose live refresh for delete
        window._dsoRefresh = () => { refreshCurrentUserFromStorage(); refreshStats(); applyFilters(); };
    };

    window._dsoRenderTable = function _dsoRenderTable(allEntries, search, filter) {
        const tbody     = document.getElementById('dso-tbody');
        const emptyEl   = document.getElementById('dso-empty');
        const tableWrap = document.getElementById('dso-table-wrap');
        const countEl   = document.getElementById('dso-entry-count');
        if (!tbody) return;

        const q = (search || '').toLowerCase().trim();
        const filtered = allEntries.filter(entry => {
            const matchFilter = filter === 'all' || entry.activity === filter;
            const matchSearch = !q ||
                (entry.name        || '').toLowerCase().includes(q) ||
                (entry.fileName    || '').toLowerCase().includes(q) ||
                (entry.notes       || '').toLowerCase().includes(q) ||
                (entry.description || '').toLowerCase().includes(q) ||
                (entry.activity    || '').toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });

        if (filtered.length === 0) {
            if (emptyEl)   emptyEl.style.display   = 'flex';
            if (tableWrap) tableWrap.style.display  = 'none';
            return;
        }
        if (emptyEl)   emptyEl.style.display   = 'none';
        if (tableWrap) tableWrap.style.display  = 'block';

        if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allEntries.length} entries`;

        const actCfg = {
            'todo':        { label: 'To Do',       cls: 'dso-badge-todo' },
            'in-progress': { label: 'In Progress',  cls: 'dso-badge-inprogress' },
            'in-review':   { label: 'In Review',    cls: 'dso-badge-inreview' },
            'done':        { label: 'Done',          cls: 'dso-badge-done' },
        };

        tbody.innerHTML = filtered.map((entry) => {
            const act = actCfg[entry.activity] || { label: entry.activity || '-', cls: '' };
            const score = window.getDatasetQualityInfo(entry).finalScore;
            const accClass = score >= 80 ? 'dso-acc-green' : score >= 50 ? 'dso-acc-yellow' : 'dso-acc-red';
            const fileIcon = entry.hasImage ? '🖼️' : entry.fileName ? '📄' : '📋';
            const submittedDate = entry.submittedAt
                ? new Date(entry.submittedAt).toLocaleDateString('en-CA')
                : (entry.date || '-');
            const notesText = entry.notes || entry.description || '-';
            const versionText = entry.version ? `v${entry.version}` : '-';

            return `<tr data-idx="${allEntries.indexOf(entry)}">
                <td>
                    <div class="dso-file-cell">
                        <span class="dso-file-icon">${fileIcon}</span>
                        <div>
                            <div class="dso-file-name">${entry.fileName || 'Manual Entry'}</div>
                            <div class="dso-file-type">${entry.fileType || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="dso-date-cell">
                        <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-5-8h-5v5h5v-5z"/></svg>
                        ${submittedDate}
                    </div>
                </td>
                <td>
                    <div class="dso-name-cell">
                        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        ${entry.name || '-'}
                    </div>
                </td>
                <td><span class="dso-badge ${act.cls}">${act.label}</span></td>
                <td>
                    <div class="dso-version-cell">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
                        ${versionText}
                    </div>
                </td>
                <td><span class="dso-accuracy-val ${accClass}">${score}%</span></td>
                <td><span class="dso-notes-cell" title="${notesText}">${notesText}</span></td>
                <td>
                    <div class="dso-action-btns">
                        <button class="dso-btn-view" title="View Detail" onclick="dsoOpenDetail(${allEntries.indexOf(entry)})">
                            <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        </button>
                        <button class="dso-btn-download" title="Download Data" onclick="dsoDownloadEntry(${allEntries.indexOf(entry)})">
                            <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        </button>
                        <button class="dso-btn-delete" title="Delete" onclick="dsoDeleteEntry(${allEntries.indexOf(entry)})">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    };

    // Global functions for table button onclick (must be on window scope)
    window.dsoOpenDetail = function(idx) {
        if (!currentUser || !currentUser.dataEntries) return;
        const entry = currentUser.dataEntries[idx];
        if (!entry) return;

        const overlay = document.getElementById('dso-modal-overlay');
        const title   = document.getElementById('dso-modal-title');
        const body    = document.getElementById('dso-modal-body');
        if (!overlay || !title || !body) return;

        const actLabel = { 'todo':'To Do','in-progress':'In Progress','in-review':'In Review','done':'Done' };
        const submittedDate = entry.submittedAt
            ? new Date(entry.submittedAt).toLocaleString('id-ID')
            : (entry.date || '-');

        title.textContent = entry.fileName || 'Manual Entry';
        body.innerHTML = `
            <div class="dso-modal-grid">
                ${entry.hasImage && entry.fileDataUrl ? `<div class="dso-modal-preview"><img src="${entry.fileDataUrl}" alt="preview"></div>` : ''}
                <div class="dso-modal-rows">
                    ${[
                        ['File', entry.fileName || 'Tidak ada file'],
                        ['Tipe', entry.fileType || '-'],
                        ['Name', entry.name || '-'],
                        ['Tanggal', entry.date || '-'],
                        ['Disubmit', submittedDate],
                        ['Activity', actLabel[entry.activity] || entry.activity || '-'],
                        ['Version', entry.version || '-'],
                        ['Description', entry.description || '-'],
                        ['Notes', entry.notes || '-'],
                        ['Quality Score', window.getDatasetQualityInfo(entry).finalScore + '%'],
                    ].map(([k, v]) => `
                        <div class="dso-detail-row">
                            <span class="dso-detail-key">${k}</span>
                            <span class="dso-detail-val">${v}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        overlay.style.display = 'flex';
    };

    window.dsoDeleteEntry = function(idx) {
        if (!currentUser || !currentUser.dataEntries) return;
        const entry = currentUser.dataEntries[idx];
        if (!entry) return;

        if (!confirm(`Delete data "${entry.fileName || entry.name || 'this entry'}"?`)) return;

        currentUser.dataEntries.splice(idx, 1);

        // Recalculate all stats from remaining entries
        const remaining = currentUser.dataEntries;
        currentUser.dataSources    = remaining.length;
        currentUser.activeProjects = remaining.filter(e => e.activity === 'in-progress').length;
        currentUser.qualityScore   = remaining.length > 0
            ? Math.round(remaining.reduce((s, e) => s + (e.qualityScore || 0), 0) / remaining.length) + '%'
            : '0%';

        localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
        const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (userIdx !== -1) {
            users[userIdx] = JSON.parse(JSON.stringify(currentUser));
            localStorage.setItem('insight_users_v2', JSON.stringify(users));
        }

        // Refresh currentUser from storage then re-render
        refreshCurrentUserFromStorage();
        if (window._dsoRefresh) window._dsoRefresh();
        else renderDataSourceOverview();
    };

    window.dsoDownloadEntry = function(idx) {
        if (!currentUser || !currentUser.dataEntries) return;
        const entry = currentUser.dataEntries[idx];
        if (!entry) return;

        const downloadData = {
            metadata: {
                id: entry.id,
                name: entry.name || entry.sourceName,
                type: entry.type || entry.sourceType,
                uploadDate: entry.dateAdded,
                qualityScore: entry.qualityScore,
                records: entry.records,
                size: entry.size
            },
            dataPreview: [
                { id: 1, sample_field: "Sample Value 1" },
                { id: 2, sample_field: "Sample Value 2" },
                { id: 3, sample_field: "Sample Value 3" }
            ],
            notes: entry.notes || "No notes available."
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadData, null, 4));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        const fileName = (entry.fileName || entry.name || entry.sourceName || 'dataset').replace(/\s+/g, '_').toLowerCase();
        dlAnchorElem.setAttribute("download", fileName + ".json");
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        document.body.removeChild(dlAnchorElem);
    };

    // =============================================
    // DATA ENTRY WIZARD (add-data-view)
    // =============================================


    let deCurrentStep = 1;
    let deFileData = null;

    function resetDataEntryWizard() {
        deCurrentStep = 1;
        deFileData = null;

        const fileInput = document.getElementById('de-file-input');
        if (fileInput) fileInput.value = '';
        ['de-date','de-name','de-version','de-description','de-notes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const actSel = document.getElementById('de-activity');
        if (actSel) actSel.value = '';

        setFilePreview(null);

        const scanResult = document.getElementById('de-scan-result');
        if (scanResult) scanResult.style.display = 'none';

        [1,2,3,4].forEach(n => {
            const card = document.getElementById('de-step-' + n);
            if (card) card.style.display = n === 1 ? 'block' : 'none';
        });

        updateStepper(1);
    }

    function updateStepper(step) {
        deCurrentStep = step;
        for (let i = 1; i <= 4; i++) {
            const stepEl = document.querySelector(`.de-step[data-step="${i}"]`);
            if (!stepEl) continue;
            stepEl.classList.remove('active', 'completed');
            if (i < step) stepEl.classList.add('completed');
            else if (i === step) stepEl.classList.add('active');

            const lineEl = document.getElementById('de-line-' + i);
            if (lineEl) lineEl.classList.toggle('active', i < step);
        }
    }

    function showStep(n) {
        [1,2,3,4].forEach(i => {
            const card = document.getElementById('de-step-' + i);
            if (card) card.style.display = i === n ? 'block' : 'none';
        });
        updateStepper(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setFilePreview(fileObj) {
        const previewEl = document.getElementById('de-file-preview');
        const imgWrap   = document.getElementById('de-preview-img-wrap');
        const nameEl    = document.getElementById('de-file-name');

        if (!fileObj) {
            if (previewEl) previewEl.style.display = 'none';
            if (imgWrap)   imgWrap.innerHTML = '';
            if (nameEl)    nameEl.textContent = '';
            return;
        }

        if (previewEl) previewEl.style.display = 'flex';
        if (nameEl)    nameEl.textContent = fileObj.name;

        if (imgWrap) {
            if (fileObj.isImage && fileObj.dataUrl) {
                imgWrap.innerHTML = `<img src="${fileObj.dataUrl}" alt="preview">`;
            } else {
                const ext = fileObj.name.split('.').pop().toUpperCase().slice(0,4);
                imgWrap.innerHTML = `<div class="de-file-icon">${ext}</div>`;
            }
        }
    }

    function simulateImageScan(file) {
        const now = new Date();
        const kb  = (file.size / 1024).toFixed(1);
        const scanDetails = document.getElementById('de-scan-details');
        const scanResult  = document.getElementById('de-scan-result');

        const items = [
            { key: 'File Name',  val: file.name },
            { key: 'Type',       val: file.type || 'Unknown' },
            { key: 'Size',       val: kb + ' KB' },
            { key: 'Scanned',    val: now.toLocaleTimeString() },
            { key: 'Resolution', val: 'Detected' },
            { key: 'Quality',    val: Math.floor(Math.random() * 15 + 85) + '%' },
        ];

        if (scanDetails) {
            scanDetails.innerHTML = items.map(item => `
                <div class="de-scan-item">
                    <div class="de-scan-key">${item.key}</div>
                    <div class="de-scan-val">${item.val}</div>
                </div>
            `).join('');
        }
        if (scanResult) scanResult.style.display = 'block';
    }

    function processFile(file) {
        const isImage = file.type.startsWith('image/');
        const reader  = new FileReader();
        reader.onload = (ev) => {
            deFileData = { name: file.name, type: file.type, size: file.size, dataUrl: ev.target.result, isImage };
            setFilePreview(deFileData);
            if (isImage) simulateImageScan(file);
            else {
                const scanResult = document.getElementById('de-scan-result');
                if (scanResult) scanResult.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    // Upload zone
    const deUploadZone = document.getElementById('de-upload-zone');
    const deFileInput  = document.getElementById('de-file-input');
    if (deUploadZone && deFileInput) {
        deUploadZone.addEventListener('click', (e) => {
            if (e.target.closest('#de-remove-file')) return;
            deFileInput.click();
        });
        deUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); deUploadZone.classList.add('dragover'); });
        deUploadZone.addEventListener('dragleave', () => deUploadZone.classList.remove('dragover'));
        deUploadZone.addEventListener('drop', (e) => {
            e.preventDefault(); deUploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        });
        deFileInput.addEventListener('change', (e) => { const f = e.target.files[0]; if (f) processFile(f); });
    }

    const deRemoveFile = document.getElementById('de-remove-file');
    if (deRemoveFile) {
        deRemoveFile.addEventListener('click', (e) => {
            e.stopPropagation(); deFileData = null;
            if (deFileInput) deFileInput.value = '';
            setFilePreview(null);
            const sr = document.getElementById('de-scan-result');
            if (sr) sr.style.display = 'none';
        });
    }

    // Step 1 â†’ 2
    const btnNext1 = document.getElementById('de-btn-next-1');
    if (btnNext1) {
        btnNext1.addEventListener('click', () => {
            showStep(2);
            const dateInput = document.getElementById('de-date');
            if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
            const nameInput = document.getElementById('de-name');
            if (nameInput && !nameInput.value && currentUser) nameInput.value = currentUser.username;
        });
    }

    const btnPrev2 = document.getElementById('de-btn-prev-2');
    if (btnPrev2) btnPrev2.addEventListener('click', () => showStep(1));

    const btnNext2 = document.getElementById('de-btn-next-2');
    if (btnNext2) {
        btnNext2.addEventListener('click', () => {
            const name     = document.getElementById('de-name').value.trim();
            const activity = document.getElementById('de-activity').value;
            if (!name)     { alert('Please enter your name.'); return; }
            if (!activity) { alert('Please select an activity status.'); return; }
            showStep(3);
        });
    }

    const btnPrev3 = document.getElementById('de-btn-prev-3');
    if (btnPrev3) btnPrev3.addEventListener('click', () => showStep(2));

    const btnSubmit = document.getElementById('de-btn-submit');
    if (btnSubmit) btnSubmit.addEventListener('click', submitDataEntry);

    function submitDataEntry() {
        const date        = document.getElementById('de-date').value;
        const name        = document.getElementById('de-name').value.trim();
        const activity    = document.getElementById('de-activity').value;
        const version     = document.getElementById('de-version').value.trim();
        const description = document.getElementById('de-description').value.trim();
        const notes       = document.getElementById('de-notes').value.trim();

        const newEntryId = Date.now();
        const score = calculateQualityScore({ file: deFileData, date, name, activity, version, description, notes }, newEntryId);

        if (currentUser) {
            // Ensure dataEntries array exists
            if (!currentUser.dataEntries) currentUser.dataEntries = [];

            // Build new entry
            const newEntry = {
                id: newEntryId,
                date, name, activity, version, description, notes,
                fileName:    deFileData ? deFileData.name    : null,
                fileType:    deFileData ? deFileData.type    : null,
                hasImage:    deFileData ? deFileData.isImage : false,
                fileDataUrl: (deFileData && deFileData.isImage) ? deFileData.dataUrl : null,
                qualityScore: score.rawScore,
                submittedAt: new Date().toISOString()
            };

            currentUser.dataEntries.push(newEntry);

            // Recalculate stats from actual entries
            const allEntries = currentUser.dataEntries;
            currentUser.dataSources    = allEntries.length;
            currentUser.activeProjects = allEntries.filter(e => e.activity === 'in-progress').length;
            currentUser.qualityScore   = Math.round(
                allEntries.reduce((s, e) => s + (e.qualityScore || 0), 0) / allEntries.length
            ) + '%';

            // Save session first
            localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));

            // Sync to users array and save
            const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIdx !== -1) {
                // Deep-merge: keep currentUser as the authoritative copy
                users[userIdx] = JSON.parse(JSON.stringify(currentUser));
                localStorage.setItem('insight_users_v2', JSON.stringify(users));
            }

            // Re-read currentUser from storage to ensure it's fresh
            refreshCurrentUserFromStorage();
        }

        renderSuccessStep(score, { date, name, activity, version, description, notes });
        showStep(4);
    }

    function calculateQualityScore({ file, date, name, activity, version, description, notes }, entryId) {
        const baseVal = (file ? 25 : 0) + ((file && file.isImage) ? 15 : (file ? 7 : 0)) +
                        (date ? 15 : 0) + (name ? 15 : 0) + (activity ? 15 : 0) +
                        ((description ? 7.5 : 0) + (notes ? 4.5 : 0) + (version ? 3 : 0));
        const rawScore = Math.min(100, Math.round(baseVal));
        
        const info = window.getDatasetQualityInfo({ id: entryId || Date.now(), qualityScore: rawScore });
        return { total: info.finalScore, criteria: info.criteria, rawScore: rawScore };
    }

    function activityLabel(val) {
        const map = { 'todo': 'â¬¤ To Do', 'in-progress': 'â¬¤ In Progress', 'in-review': 'â¬¤ In Review', 'done': 'â¬¤ Done' };
        return map[val] || val;
    }

    function renderSuccessStep(score, data) {
        const ring  = document.getElementById('de-ring-fill');
        const pctEl = document.getElementById('de-ring-pct');
        if (ring && pctEl) {
            setTimeout(() => {
                ring.style.strokeDashoffset = 314 - (score.total / 100) * 314;
                pctEl.textContent = score.total + '%';
            }, 200);
        }

        const breakdownEl = document.getElementById('de-quality-breakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = score.criteria.map(c => `
                <div class="de-qb-row">
                    <span class="de-qb-label">${c.label}</span>
                    <div class="de-qb-bar-wrap"><div class="de-qb-bar" style="width:0%" data-target="${c.val}%"></div></div>
                    <span class="de-qb-val">${c.val}%</span>
                </div>
            `).join('');
            setTimeout(() => {
                breakdownEl.querySelectorAll('.de-qb-bar').forEach(bar => { bar.style.width = bar.dataset.target; });
            }, 300);
        }

        const summaryGrid = document.getElementById('de-summary-grid');
        if (summaryGrid) {
            const rows = [
                ['File',     deFileData ? deFileData.name : 'None'],
                ['Date',     data.date     || '-'],
                ['Name',     data.name     || '-'],
                ['Activity', activityLabel(data.activity)],
                ['Version',  data.version  || '-'],
                ['Quality',  score.total + '%'],
            ];
            summaryGrid.innerHTML = rows.map(([k, v]) => `
                <div class="de-summary-row">
                    <span class="de-summary-key">${k}</span>
                    <span class="de-summary-val">${v}</span>
                </div>
            `).join('');
        }
    }

    // Step 4 buttons
    const btnAddMore = document.getElementById('de-btn-add-more');
    if (btnAddMore) {
        btnAddMore.addEventListener('click', () => resetDataEntryWizard());
    }

    // "Kembali ke Data Entry" button – picked up by link-to-data-entry delegation above
});

// =============================================
// RENDER: DATA QUALITY DASHBOARD
// =============================================
window.renderDataQuality = function renderDataQuality() {
    const entries = (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];

    // ── Source badge colors (deterministic by index) ──
    const badgePalettes = [
        { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },  // green
        { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },  // blue
        { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' },// purple
        { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },  // yellow
        { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },// red
        { color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.3)' },  // teal
    ];

    // ── Seeded RNG for deterministic quality metrics ──
    function seededRand(seed, min, max) {
        let x = Math.sin(seed * 9301 + 49297) * 233280;
        return min + (x - Math.floor(x)) * (max - min);
    }

    // ── Summary stats ──
    const total = entries.length;
    let totalAcc = 0;
    let totalRecordsNum = 0;
    let totalIssues = 0;

    entries.forEach((e, i) => {
        const seed = e.id || (i + 1);
        const resolved = currentUser && currentUser.resolvedAlerts && currentUser.resolvedAlerts.includes('dq-' + seed);
        
        totalAcc += resolved ? Math.max(98, e.qualityScore || 0) : (e.qualityScore || 0);
        const pName = e.name || e.sourceName || '';
        const recordsForEntry = Math.round(seededRand(seed, 5000, 1250000));
        totalRecordsNum += recordsForEntry;
        totalIssues += resolved ? 0 : Math.round(seededRand(seed * 3, 0, 67));
    });

    const avgAcc = total > 0 ? (totalAcc / total).toFixed(1) : 0;
    const recordsFormatted = totalRecordsNum >= 1000000
        ? (totalRecordsNum / 1000000).toFixed(1) + 'M'
        : totalRecordsNum >= 1000
            ? (totalRecordsNum / 1000).toFixed(1) + 'K'
            : totalRecordsNum;

    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('dq-stat-total', total);
    setEl('dq-stat-avg', avgAcc + '%');
    setEl('dq-stat-records', recordsFormatted);
    setEl('dq-stat-issues', totalIssues);

    // ── Table body ──
    const tbody = document.getElementById('dq-table-body');
    const emptyState = document.getElementById('dq-empty-state');

    if (!tbody) return;

    if (total === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = entries.map((entry, i) => {
        const idx = i % badgePalettes.length;
        const palette = badgePalettes[idx];
        const pName = entry.name || entry.sourceName || 'Dataset';
        const score = window.getDatasetQualityInfo(entry).finalScore;
        const seed = entry.id || (i + 1);

        // Derived per-entry deterministic values
        const records = Math.round(seededRand(seed, 5000, 1250000));
        const resolved = currentUser && currentUser.resolvedAlerts && currentUser.resolvedAlerts.includes('dq-' + seed);
        
        const issues = resolved ? 0 : Math.round(seededRand(seed * 3, 0, 67));
        const criticalCount = resolved ? 0 : Math.round(seededRand(seed * 7, 0, Math.min(issues, 9)));
        const finalScore = resolved ? Math.max(98, score) : score;
        const trendVal = seededRand(seed * 11, -2.5, 4.5).toFixed(1);
        const trendUp = parseFloat(trendVal) >= 0;
        const recordsFmt = records >= 1000000
            ? (records / 1000000).toFixed(1) + 'M'
            : records >= 1000
                ? (records / 1000).toFixed(0) + ',' + String(records % 1000).padStart(3, '0')
                : records;

        // Quality bars: completeness, accuracy, validity (derived from score)
        const completeness = Math.min(100, finalScore + seededRand(seed * 2, -2, 2)).toFixed(1);
        const accuracy     = Math.min(100, finalScore + seededRand(seed * 5, -3, 3)).toFixed(1);
        const validity     = Math.min(100, finalScore + seededRand(seed * 8, -4, 4)).toFixed(1);

        // Score color
        let scoreColor = '#34d399';
        if (finalScore < 93) scoreColor = '#fbbf24';
        if (finalScore < 85) scoreColor = '#f87171';

        // Source label: use activity or a short snippet of sourceName/description
        const sourceLabel = entry.activity
            ? entry.activity.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : (entry.description ? entry.description.split(' ').slice(0, 2).join(' ') : 'Source');

        // Time ago label
        let timeAgo = 'just now';
        if (entry.submittedAt) {
            const diff = Math.floor((Date.now() - new Date(entry.submittedAt)) / 60000);
            if (diff < 1) timeAgo = 'just now';
            else if (diff < 60) timeAgo = diff + ' minutes ago';
            else if (diff < 1440) timeAgo = Math.floor(diff / 60) + ' hours ago';
            else timeAgo = Math.floor(diff / 1440) + ' days ago';
        }

        const chartId = 'dq-mini-chart-' + seed;

        return `
        <div class="dq-row" data-id="${entry.id || i}">
            <div class="dq-row-main">
                <div class="dq-cell-name">
                    <div class="dq-ds-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36 0-2.54-2.05-4.64-4.6-4.64-1.32 0-2.52.54-3.4 1.4A4.62 4.62 0 0 0 6.6 0 4.6 4.6 0 0 0 2 4.64c0 .48.11.92.18 1.36H0v16h20V6zm-9.8-3.88C10.7 1.44 11.33 1 12 1c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2c0-.34.1-.66.2-.88zM6.6 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.6 18V8h8v12H2zm10 0V8h8v12h-8z"/></svg>
                    </div>
                    <div class="dq-name-info">
                        <strong>${pName}</strong>
                        <span class="dq-name-time">
                            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                            ${timeAgo}
                        </span>
                    </div>
                </div>
                <div>
                    <span class="dq-source-badge" style="color:${palette.color}; background:${palette.bg}; border-color:${palette.border};">${sourceLabel}</span>
                </div>
                <div class="dq-quality-cell">
                    <span class="dq-score-value" style="color:${scoreColor};">${finalScore.toFixed(1)}%</span>
                    <span class="dq-score-trend ${trendUp ? 'up' : 'down'}">${trendUp ? '↑ +' : '↓ '}${trendVal}%</span>
                </div>
                <div class="dq-issues-cell">
                    <span class="dq-issues-count ${criticalCount === 0 ? 'dq-issues-ok' : ''}">
                        ${criticalCount === 0
                            ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                            : '<svg viewBox="0 0 24 24" width="14" height="14" fill="#f87171"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
                        } ${issues}
                    </span>
                    ${criticalCount > 0 ? '<span class="dq-issues-critical">' + criticalCount + ' Critical</span>' : ''}
                </div>
                <div class="dq-records-cell">${recordsFmt}</div>
                <button class="dq-analyze-btn" onclick="window.showDataQualityAnalyze(${entry.id || i})">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2zM21 9v6h-2v-6h2z"/></svg>
                    Analyze
                </button>
            </div>
            <div class="dq-quality-expand">
                <div class="dq-expand-inner">
                    <div class="dq-metric-bar-group">
                        <div class="dq-metric-bar-label"><span>Completeness</span><span>${completeness}%</span></div>
                        <div class="dq-metric-bar-track"><div class="dq-metric-bar-fill dq-fill-blue" style="width:${completeness}%"></div></div>
                    </div>
                    <div class="dq-metric-bar-group">
                        <div class="dq-metric-bar-label"><span>Accuracy</span><span>${accuracy}%</span></div>
                        <div class="dq-metric-bar-track"><div class="dq-metric-bar-fill dq-fill-pink" style="width:${accuracy}%"></div></div>
                    </div>
                    <div class="dq-metric-bar-group">
                        <div class="dq-metric-bar-label"><span>Validity</span><span>${validity}%</span></div>
                        <div class="dq-metric-bar-track"><div class="dq-metric-bar-fill dq-fill-green" style="width:${validity}%"></div></div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    // ── Click-to-expand rows ──
    tbody.querySelectorAll('.dq-row').forEach(row => {
        row.addEventListener('mouseenter', () => row.classList.add('expanded'));
        row.addEventListener('mouseleave', () => row.classList.remove('expanded'));
    });

    // ── Live search ──
    const searchEl = document.getElementById('dq-search-input');
    if (searchEl) {
        searchEl.value = '';
        searchEl.oninput = () => {
            const q = searchEl.value.toLowerCase().trim();
            tbody.querySelectorAll('.dq-row').forEach(row => {
                const name = (row.querySelector('.dq-name-info strong') || {}).textContent || '';
                const src  = (row.querySelector('.dq-source-badge') || {}).textContent || '';
                row.style.display = (!q || name.toLowerCase().includes(q) || src.toLowerCase().includes(q)) ? '' : 'none';
            });
        };
    }
};

// =============================================
// RENDER: DATA QUALITY ANALYZE VIEW
// =============================================
let dqaCharts = {};
window.currentDqaEntryId = null;

window.showDataQualityAnalyze = function(id) {
    window.currentDqaEntryId = id;
    navigateTo('data-quality-analyze-view');
};

window.renderDataQualityAnalyze = function() {
    if (!window.Chart) { console.warn('Chart.js not loaded'); return; }

    const entries = (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];
    const entryIdx = entries.findIndex(e => e.id === window.currentDqaEntryId);
    const i = entryIdx >= 0 ? entryIdx : 0;
    const entry = entries[i];
    if (!entry) return;

    const score = window.getDatasetQualityInfo(entry).finalScore;
    // ── Use EXACT SAME seeded RNG as renderDataQuality ──
    // This is a pure function: same seed → always same output, no state
    function seededRand(seed, min, max) {
        let x = Math.sin(seed * 9301 + 49297) * 233280;
        return min + (x - Math.floor(x)) * (max - min);
    }
    const seed = entry.id || (i + 1);
    const resolved = currentUser && currentUser.resolvedAlerts && currentUser.resolvedAlerts.includes('dq-' + seed);
    const finalScore = resolved ? Math.max(98, score) : score;

    // ── SAME VALUES as shown in the dashboard table ──
    const completeness  = Math.min(100, finalScore + seededRand(seed * 2, -2, 2)).toFixed(1);
    const accuracy      = Math.min(100, finalScore + seededRand(seed * 5, -3, 3)).toFixed(1);
    const validity      = Math.min(100, finalScore + seededRand(seed * 8, -4, 4)).toFixed(1);
    const records       = Math.round(seededRand(seed, 5000, 1250000));
    const issues        = resolved ? 0 : Math.round(seededRand(seed * 3, 0, 67));
    const criticalCount = resolved ? 0 : Math.round(seededRand(seed * 7, 0, Math.min(issues, 9)));
    const trendRaw      = seededRand(seed * 11, -2.5, 4.5);
    const trendPct      = trendRaw.toFixed(1);
    const trendUp       = trendRaw >= 0;

    const pName = entry.name || entry.sourceName || 'Dataset';
    const recordsFmt = records >= 1000000
        ? (records / 1000000).toFixed(1) + 'M'
        : records >= 1000
            ? (records / 1000).toFixed(0) + 'K'
            : records;

    // ── Update top stat cards ──
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('dqa-score-val',    finalScore.toFixed(1) + '%');
    setEl('dqa-score-trend',  (trendUp ? '+' : '') + trendPct + '%');
    setEl('dqa-records-val',  recordsFmt);
    setEl('dqa-issues-val',   issues);
    setEl('dqa-critical-val', criticalCount > 0 ? criticalCount + ' Critical' : 'No Issues');
    const titleEl = document.getElementById('dqa-dataset-name');
    if (titleEl) titleEl.textContent = pName;

    // Trend badge color
    const trendBadge = document.getElementById('dqa-score-trend');
    if (trendBadge) {
        trendBadge.className = 'dqa-stat-badge ' + (trendUp ? 'green' : 'red');
    }

    Chart.defaults.color = 'rgba(255,255,255,0.45)';
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';

    function makeChart(id, cfg) {
        if (dqaCharts[id]) dqaCharts[id].destroy();
        const c = document.getElementById(id);
        if (c) dqaCharts[id] = new Chart(c, cfg);
    }

    // Helper: seeded array generator, no shared state
    function seededArr(len, seedBase, min, max) {
        return Array.from({length: len}, (_, k) =>
            Math.min(100, Math.max(0, seededRand(seedBase + k * 17, min, max)))
        );
    }

    // 1. Overall Quality Score Trend — ends at current score, rises from (score - ~8)
    const months = ['Jan 20','Jan 21','Jan 22','Jan 23','Jan 24','Jan 25','Jan 26'];
    const trendBase = Math.max(80, finalScore - 8);
    const trendData = months.map((_, k) => {
        const prog = trendBase + ((finalScore - trendBase) * (k / (months.length - 1)));
        return parseFloat(Math.min(100, prog + seededRand(seed * 13 + k * 31, -1, 1)).toFixed(2));
    });
    // Force last point to be the real score
    trendData[trendData.length - 1] = parseFloat(score.toFixed(2));

    makeChart('dqa-trend-chart', {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Quality Score (%)',
                data: trendData,
                borderColor: '#34d399',
                backgroundColor: 'rgba(52,211,153,0.15)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#34d399'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
            scales: { y: {
                min: Math.max(80, Math.floor(trendBase) - 2),
                max: 100,
                ticks: { stepSize: 2 }
            }}
        }
    });

    // 2. Quality Dimensions — anchored to real completeness/accuracy/validity
    const dims = ['Completeness','Accuracy','Consistency','Validity','Uniqueness'];
    const dimBase = [
        parseFloat(completeness),
        parseFloat(accuracy),
        parseFloat(Math.min(100, score + seededRand(seed * 3, -3, 3)).toFixed(1)),
        parseFloat(validity),
        parseFloat(Math.min(100, score + seededRand(seed * 6, -5, 5)).toFixed(1))
    ];
    const weeks = ['Week 1','Week 2','Week 3','Week 4'];
    const dimColors = ['#34d399','#f87171','#60a5fa','#fbbf24'];
    const dimDatasets = weeks.map((w, wi) => ({
        label: w,
        data: dimBase.map((base, di) =>
            parseFloat(Math.min(100, base + seededRand(seed * (wi + 2) + di * 19, -2, 2)).toFixed(1))
        ),
        borderColor: dimColors[wi],
        backgroundColor: dimColors[wi],
        borderWidth: 2, tension: 0.4, pointRadius: 3
    }));
    // Week 4 = current real values
    dimDatasets[3].data = dimBase.map(v => parseFloat(v.toFixed(1)));

    const dimMin = Math.max(80, Math.floor(Math.min(...dimBase)) - 3);
    makeChart('dqa-dims-chart', {
        type: 'line',
        data: { labels: dims, datasets: dimDatasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 12 } } },
            scales: { y: { min: dimMin, max: 100, ticks: { stepSize: 2 } } }
        }
    });

    // 3. Data Freshness — scaled relative to record count
    const hours = ['00:00','04:00','08:00','12:00','16:00','20:00'];
    const baseOnTime = Math.round(records / 1000 * 0.85);
    const baseDelayed = Math.round(records / 1000 * 0.15);
    makeChart('dqa-freshness-chart', {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'On Time',
                    data: hours.map((_, k) => Math.round(baseOnTime + seededRand(seed * 19 + k * 7, -baseOnTime * 0.1, baseOnTime * 0.1))),
                    borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.2)',
                    borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3
                },
                {
                    label: 'Delayed',
                    data: hours.map((_, k) => Math.round(baseDelayed + seededRand(seed * 23 + k * 11, -baseDelayed * 0.2, baseDelayed * 0.2))),
                    borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.15)',
                    borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // 4. Issues by Category — total distributed across categories, based on real `issues` count
    const cats = ['Missing Values','Duplicates','Format Errors','Outliers','Schema Violations'];
    // Distribute `issues` total across categories and severity proportionally
    const catWeights = cats.map((_, k) => seededRand(seed * 29 + k * 13, 0.1, 1));
    const catTotal = catWeights.reduce((a, b) => a + b, 0);
    const catIssues = catWeights.map(w => Math.max(1, Math.round(issues * (w / catTotal))));

    // Split each category's issue count into severity levels (Critical~5%, High~20%, Med~35%, Low~40%)
    const critFrac = Math.min(issues, criticalCount) / Math.max(issues, 1);
    makeChart('dqa-issues-chart', {
        type: 'bar',
        data: {
            labels: cats,
            datasets: [
                { label: 'Critical', data: catIssues.map(n => Math.max(0, Math.round(n * critFrac + seededRand(seed * 31, -0.5, 0.5)))), backgroundColor: '#f87171', barThickness: 14 },
                { label: 'High',     data: catIssues.map(n => Math.round(n * 0.20 + seededRand(seed * 37, 0, 2))), backgroundColor: '#fbbf24', barThickness: 14 },
                { label: 'Medium',   data: catIssues.map(n => Math.round(n * 0.35 + seededRand(seed * 41, 0, 3))), backgroundColor: '#60a5fa', barThickness: 14 },
                { label: 'Low',      data: catIssues.map(n => Math.round(n * 0.40 + seededRand(seed * 43, 0, 2))), backgroundColor: '#34d399', barThickness: 14 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
            scales: { y: { beginAtZero: true } }
        }
    });
};

// =============================================
// RENDER: ALERTS & NOTIFICATIONS VIEW
// =============================================
let currentAlerts = [];
let currentAlertFilterType = 'all';
let currentAlertFilterSev = 'all';

window.renderAlerts = function() {
    const entries = (currentUser && currentUser.dataEntries) ? currentUser.dataEntries : [];
    
    // Seeded RNG function to keep alerts consistent per dataset
    function seededRand(seed, min, max) {
        let x = Math.sin(seed * 9301 + 49297) * 233280;
        return min + (x - Math.floor(x)) * (max - min);
    }

    currentAlerts = [];
    
    const plAlerts = [
        { title: 'Pipeline Execution Failed', sev: 'CRITICAL', desc: 'pipeline failed during data transformation stage', notePrefix: 'Check the transformation scripts for' },
        { title: 'High Latency Detected', sev: 'HIGH', desc: 'showing latency above 500ms threshold', notePrefix: 'Optimize queries or increase compute resources for' },
        { title: 'Data Processing Delayed', sev: 'MEDIUM', desc: 'processing time exceeded expected duration by 45%', notePrefix: 'Review batch sizes and scheduling for' },
        { title: 'Connection Timeout', sev: 'HIGH', desc: 'unable to connect to source database', notePrefix: 'Verify database credentials and network firewalls for' }
    ];
    
    const dqAlerts = [
        { title: 'Critical Data Quality Issue Detected', sev: 'CRITICAL', desc: 'Missing required fields in customer database - email column has null values', notePrefix: 'Add NOT NULL constraints and backfill data in' },
        { title: 'Duplicate Records Found', sev: 'HIGH', desc: 'Product catalog contains duplicate entries based on SKU field', notePrefix: 'Run deduplication queries prioritizing the most recent records in' },
        { title: 'Schema Violation Detected', sev: 'CRITICAL', desc: 'Marketing campaign data has invalid date formats', notePrefix: 'Update data parsing scripts to handle ISO-8601 formats for' },
        { title: 'Data Completeness Below Threshold', sev: 'MEDIUM', desc: 'User Activity Logs missing timestamp data for 0.5% of records', notePrefix: 'Investigate tracking event payloads in the upstream system for' }
    ];

    entries.forEach((entry, idx) => {
        const seed = entry.id || (idx + 1);
        const name = entry.name || entry.sourceName || 'Dataset';
        
        const isPlResolved = currentUser && currentUser.resolvedAlerts && currentUser.resolvedAlerts.includes('pl-' + seed);
        const isDqResolved = currentUser && currentUser.resolvedAlerts && currentUser.resolvedAlerts.includes('dq-' + seed);
        
        // 35% chance of Pipeline Issue
        if (!isPlResolved && seededRand(seed * 11, 0, 100) < 35) {
            const tmpl = plAlerts[Math.floor(seededRand(seed * 13, 0, plAlerts.length))];
            currentAlerts.push({
                id: 'pl-' + seed,
                dataset: name,
                type: 'Pipeline',
                title: tmpl.title,
                severity: tmpl.sev,
                desc: `${name} ${tmpl.desc}`,
                timeAgo: Math.floor(seededRand(seed * 17, 5, 59)) + ' minutes ago',
                records: Math.floor(seededRand(seed * 19, 100, 15000)) + ' records affected',
                note: `${tmpl.notePrefix} ${name}. The system detected anomalies at step ${Math.floor(seededRand(seed, 2, 8))}.`,
                breakdown: [
                    `<li>Process failed at execution step: <strong>Transformation Layer</strong></li>`,
                    `<li>Error code: <strong>ERR_${Math.floor(seededRand(seed, 1000, 9999))}</strong></li>`,
                    `<li>Last successful run: <strong>${Math.floor(seededRand(seed * 2, 2, 24))} hours ago</strong></li>`,
                    `<li>Impact: Downstream dashboards using this data may show stale or missing metrics.</li>`
                ]
            });
        }
        
        // 45% chance of Data Quality Issue
        if (!isDqResolved && seededRand(seed * 23, 0, 100) < 45) {
            const tmpl = dqAlerts[Math.floor(seededRand(seed * 29, 0, dqAlerts.length))];
            currentAlerts.push({
                id: 'dq-' + seed,
                dataset: name,
                type: 'Data Quality',
                title: tmpl.title,
                severity: tmpl.sev,
                desc: tmpl.desc,
                timeAgo: Math.floor(seededRand(seed * 31, 1, 12)) + ' hours ago',
                records: Math.floor(seededRand(seed * 37, 50, 5000)) + ' records affected',
                note: `${tmpl.notePrefix} ${name}. Consider applying automatic quarantine rules to prevent downstream impact.`,
                breakdown: [
                    `<li>Affected Column/Field: <strong>${tmpl.title.includes('Duplicate') ? 'SKU / ID' : 'Multiple'}</strong></li>`,
                    `<li>Number of invalid records: <strong>${Math.floor(seededRand(seed * 37, 50, 5000))} rows</strong></li>`,
                    `<li>Data Source: <strong>${name}</strong></li>`,
                    `<li>Recommended Action: Needs immediate attention to prevent reporting inaccuracies.</li>`
                ]
            });
        }
    });
    
    // Sort critical first, then high
    const sevScore = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1 };
    currentAlerts.sort((a, b) => sevScore[b.severity] - sevScore[a.severity]);

    // Update Stats
    const criticalCount = currentAlerts.filter(a => a.severity === 'CRITICAL').length;
    const highCount = currentAlerts.filter(a => a.severity === 'HIGH').length;
    const dqCount = currentAlerts.filter(a => a.type === 'Data Quality').length;
    const plCount = currentAlerts.filter(a => a.type === 'Pipeline').length;
    
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('alerts-stat-critical', criticalCount);
    setEl('alerts-stat-high', highCount);
    setEl('alerts-stat-dq', dqCount);
    setEl('alerts-stat-pipeline', plCount);

    updateAlertList();
};

function updateAlertList() {
    const listEl = document.getElementById('alerts-list');
    if (!listEl) return;
    
    const filtered = currentAlerts.filter(a => {
        if (currentAlertFilterType !== 'all' && a.type !== currentAlertFilterType) return false;
        if (currentAlertFilterSev !== 'all' && a.severity !== currentAlertFilterSev.toUpperCase()) return false;
        return true;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding: 3rem; color: #9ca3af;">No alerts found for the selected filters.</div>`;
        return;
    }

    listEl.innerHTML = filtered.map(alert => {
        const iconClass = alert.severity.toLowerCase();
        let iconSvg = '';
        if (alert.severity === 'CRITICAL') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
        } else if (alert.severity === 'HIGH') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
        }

        return `
        <div class="alert-card">
            <div class="alert-icon-box ${iconClass}">
                ${iconSvg}
            </div>
            <div class="alert-content">
                <div class="alert-title-row">
                    <h4>${alert.title}</h4>
                    <span class="alert-severity-badge ${iconClass}">${alert.severity}</span>
                    <span class="alert-type-badge">${alert.type}</span>
                </div>
                <p class="alert-desc">${alert.desc}</p>
                <div class="alert-meta-row">
                    <div class="alert-meta-item">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36 0-2.54-2.05-4.64-4.6-4.64-1.32 0-2.52.54-3.4 1.4A4.62 4.62 0 0 0 6.6 0 4.6 4.6 0 0 0 2 4.64c0 .48.11.92.18 1.36H0v16h20V6zm-9.8-3.88C10.7 1.44 11.33 1 12 1c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2c0-.34.1-.66.2-.88zM6.6 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.6 18V8h8v12H2zm10 0V8h8v12h-8z"/></svg>
                        ${alert.dataset}
                    </div>
                    <div class="alert-meta-item">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                        ${alert.timeAgo}
                    </div>
                    <div class="alert-meta-item">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                        ${alert.records}
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="alert-btn alert-btn-outline" onclick="window.viewAlertDetails('${alert.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        View Details
                    </button>
                    <button class="alert-btn alert-btn-analyze" onclick="window.analyzeAlert('${alert.id}')">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2zM21 9v6h-2v-6h2z"/></svg>
                        Analyze Issue
                    </button>
                    <button class="alert-btn alert-btn-fix" onclick="window.fixAlert('${alert.id}')">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>
                        Fix Issue
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Set up filter buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#alerts-type-filter .alerts-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#alerts-type-filter .alerts-filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentAlertFilterType = e.target.dataset.filter;
            updateAlertList();
        });
    });
    
    document.querySelectorAll('#alerts-severity-filter .alerts-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#alerts-severity-filter .alerts-filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentAlertFilterSev = e.target.dataset.filter;
            updateAlertList();
        });
    });
});

window.analyzeAlert = function(id) {
    const alert = currentAlerts.find(a => a.id === id);
    if (!alert) return;
    
    const modal = document.getElementById('alerts-analyze-modal');
    const loadingState = document.getElementById('alerts-modal-loading');
    const resultState = document.getElementById('alerts-modal-result');
    const noteText = document.getElementById('alerts-result-note-text');
    
    // Reset modal state to loading
    loadingState.classList.add('active');
    resultState.classList.remove('active');
    modal.classList.add('active');
    
    // Simulate backend analysis delay
    setTimeout(() => {
        noteText.textContent = alert.note;
        loadingState.classList.remove('active');
        resultState.classList.add('active');
    }, 2500);
};

window.closeAnalyzeModal = function() {
    document.getElementById('alerts-analyze-modal').classList.remove('active');
};

window.viewAlertDetails = function(id) {
    const alert = currentAlerts.find(a => a.id === id);
    if (!alert) return;
    
    const modal = document.getElementById('alerts-details-modal');
    if (!modal) return;
    
    // Set text contents
    const iconClass = alert.severity.toLowerCase();
    
    const sevBadge = document.getElementById('ad-severity-badge');
    sevBadge.textContent = alert.severity;
    sevBadge.className = 'alert-severity-badge ' + iconClass;
    
    document.getElementById('ad-type-badge').textContent = alert.type;
    document.getElementById('ad-title').textContent = alert.title;
    document.getElementById('ad-dataset').textContent = 'Dataset: ' + alert.dataset + ' • ' + alert.records;
    
    const list = document.getElementById('ad-breakdown-list');
    list.innerHTML = alert.breakdown.join('');
    
    // Wire up analyze button inside details modal
    const analyzeBtn = document.getElementById('ad-analyze-btn');
    analyzeBtn.onclick = () => {
        closeDetailsModal();
        window.analyzeAlert(alert.id);
    };
    
    modal.classList.add('active');
};

window.closeDetailsModal = function() {
    const modal = document.getElementById('alerts-details-modal');
    if (modal) modal.classList.remove('active');
};

window.fixAlert = function(id) {
    const alert = currentAlerts.find(a => a.id === id);
    if (!alert) return;
    
    const modal = document.getElementById('alerts-fix-modal');
    const loadingState = document.getElementById('alerts-fix-loading');
    const failedState = document.getElementById('alerts-fix-failed');
    const successState = document.getElementById('alerts-fix-success');
    
    // Reset all states
    loadingState.classList.add('active');
    failedState.classList.remove('active');
    successState.classList.remove('active');
    modal.classList.add('active');
    
    // Set up the "Go to Analyze" button
    const analyzeBtn = document.getElementById('af-analyze-btn');
    analyzeBtn.onclick = () => {
        closeFixModal();
        window.analyzeAlert(alert.id);
    };
    
    // Simulate attempt delay
    setTimeout(() => {
        loadingState.classList.remove('active');
        
        // Critical/High severity -> Fail. Medium -> Success.
        if (alert.severity === 'MEDIUM') {
            successState.classList.add('active');
            
            // Persist the resolution
            if (!currentUser.resolvedAlerts) currentUser.resolvedAlerts = [];
            if (!currentUser.resolvedAlerts.includes(id)) {
                currentUser.resolvedAlerts.push(id);
                localStorage.setItem('insight_session_v2', JSON.stringify(currentUser));
                const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                if (userIdx !== -1) {
                    users[userIdx].resolvedAlerts = currentUser.resolvedAlerts;
                    localStorage.setItem('insight_users_v2', JSON.stringify(users));
                }
            }
            
            // Remove the alert from the list for real simulation effect
            currentAlerts = currentAlerts.filter(a => a.id !== id);
            updateAlertList();
        } else {
            failedState.classList.add('active');
        }
    }, 2500);
};

window.closeFixModal = function() {
    const modal = document.getElementById('alerts-fix-modal');
    if (modal) modal.classList.remove('active');
};
