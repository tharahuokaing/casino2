/**
 * CYBER CASINO AUTHENTICATION CONTROLLER v1.0
 */
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('auth-modal-overlay');
        const openBtn = document.getElementById('open-auth-trigger');
        const closeBtn = document.getElementById('close-auth-btn');
        const tabs = document.querySelectorAll('.auth-tab-btn');
        const loginForm = document.getElementById('auth-login-form');
        const registerForm = document.getElementById('auth-register-form');

        if (!overlay) return;

        // 1. Modal Toggle Controls
        function openAuthModal(tab = 'login') {
            switchTab(tab);
            overlay.classList.remove('hidden');
        }

        function closeAuthModal() {
            overlay.classList.add('hidden');
        }

        // 2. Tab Switching Logic
        function switchTab(targetTab) {
            tabs.forEach(btn => {
                if (btn.dataset.tab === targetTab) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            if (targetTab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        }

        // 3. Event Listeners
        if (openBtn) {
            openBtn.addEventListener('click', () => openAuthModal('login'));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeAuthModal);
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAuthModal();
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
            });
        });

        // 4. Form Submission Handlers
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            alert(`[AUTHENTICATED] Welcome back, ${username}!`);
            
            // Update HUD user state if trigger button exists
            if (openBtn) {
                openBtn.innerHTML = `<span class="btn-icon">👤</span> ${username}`;
            }
            closeAuthModal();
        });

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            alert(`[ACCOUNT CREATED] Welcome to the Cyber Casino, ${username}!`);
            
            if (openBtn) {
                openBtn.innerHTML = `<span class="btn-icon">👤</span> ${username}`;
            }
            closeAuthModal();
        });
    });
})();
