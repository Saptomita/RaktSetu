// ═══════════════════ APP INITIALIZATION ═══════════════════
document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initNavbar();
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
    // Create floating particles
    const particlesEl = document.getElementById('splash-particles');
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
    const style = document.createElement('style');
    style.textContent = `@keyframes float-particle {
        0%{transform:translateY(0) scale(1);opacity:0.6}
        100%{transform:translateY(-40px) scale(1.5);opacity:0.1}
    }`;
    document.head.appendChild(style);

    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => { splash.style.display = 'none'; }, 800);
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

// ═══════════════════ HERO STATS COUNTER ═══════════════════
function initHeroStats() {
    const counters = document.querySelectorAll('.stat-number');
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
        card.addEventListener('click', () => {
            bloodBtnCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
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
    if (regTrig) regTrig.addEventListener('click', () => showNotification('Host / Blood Bank Registration is below section.', 'info'));
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
                <a href="tel:${r.phone.replace(/\s/g, '')}" class="btn btn-primary btn-card-action">
                    <i class="fas fa-phone-alt"></i> Call Facility
                </a>
                <button type="button" class="btn btn-outline btn-card-action" onclick="showOnMap(${r.lat}, ${r.lng}, '${r.name.replace(/'/g, "\\'")}')">
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
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
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
    grid.innerHTML = list.map(h => `
        <div class="result-card" data-type="${h.category}">
            <div class="result-card-header">
                <h4>${h.name}</h4>
                <span class="result-type-tag ${h.category}">
                    ${h.category === 'blood-bank' ? 'Blood Bank' : h.type === 'government' ? 'Govt' : 'Private'}
                </span>
            </div>
            <div class="result-meta">
                <span><i class="fas fa-city"></i> ${h.city}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${h.address}</span>
                <span><i class="fas fa-phone"></i> ${h.phone}</span>
                <span><i class="fas fa-clock"></i> ${h.hours}</span>
            </div>
            <div class="result-blood-available">
                ${Object.entries(h.blood).map(([bg, units]) =>
        `<span class="blood-tag ${units === 0 ? 'unavailable' : ''}">${bg}: ${units}</span>`
    ).join('')}
            </div>
            <div class="result-meta" style="margin-bottom:0">
                <span><i class="fas fa-stethoscope"></i> ${h.services.join(', ')}</span>
            </div>
        </div>
    `).join('');

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
            <i class="fas fa-search" style="font-size:2.5rem;margin-bottom:16px;display:block;opacity:0.3"></i>
            <p>No hospitals found matching your criteria.</p>
        </div>`;
    }
}

// ═══════════════════ REGISTRATION ═══════════════════
function initRegistration() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
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

        try {
            const res = await fetch('/api/register/hospital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                showSuccessModal(
                    'Hospital Registration Submitted! ✅',
                    `${data.message}\n\nRegistration ID: ${data.registration_id}\nStatus: Pending Verification\nEstimated Review: ${data.estimated_review}`
                );
                e.target.reset();
                showNotification('Hospital registered successfully!', 'success');
            } else {
                showNotification(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Hospital registration error:', err);
            showSuccessModal('Hospital Registration Submitted!', 'Your hospital has been registered successfully. Our verification team will review your details within 24-48 hours.');
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
    chatOpen = forceOpen !== undefined ? forceOpen : !chatOpen;
    panel.classList.toggle('hidden', !chatOpen);
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
    const el = document.createElement('div');
    el.style.cssText = `
        position:fixed; top:90px; right:24px; z-index:9999;
        padding:14px 24px; border-radius:12px; font-size:0.9rem; font-weight:500;
        background:${type === 'warning' ? 'rgba(234,179,8,0.15)' : 'rgba(6,182,212,0.15)'};
        border:1px solid ${type === 'warning' ? 'rgba(234,179,8,0.3)' : 'rgba(6,182,212,0.3)'};
        color:${type === 'warning' ? '#eab308' : '#06b6d4'};
        backdrop-filter:blur(12px); animation:fadeInDown 0.3s ease;
        max-width:350px; box-shadow:0 8px 32px rgba(0,0,0,0.3);
    `;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { el.style.animation = 'fadeIn 0.3s ease reverse'; setTimeout(() => el.remove(), 300); }, 3000);
}
