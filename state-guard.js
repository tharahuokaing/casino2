/**
 * STATE GUARD & REFRESH PREVENTION ENGINE
 * Ensures balance integrity across page refreshes and prevents state leaks.
 */
(function() {
    const BALANCE_STORAGE_KEY = 'cyber_app_user_balance';
    const DEFAULT_INITIAL_BALANCE = 1000000.00;

    // Cache core UI elements
    const elBalanceDisplay = document.getElementById('balance-display');

    document.addEventListener('DOMContentLoaded', () => {
        initializeBalanceState();
        preventUnintendedRefreshLoss();
    });

    /**
     * Initializes or recovers the current balance from session/local storage
     */
    function initializeBalanceState() {
        let savedBalance = localStorage.getItem(BALANCE_STORAGE_KEY);

        if (savedBalance === null || isNaN(parseFloat(savedBalance))) {
            // First time visit or reset: set default initial balance
            savedBalance = DEFAULT_INITIAL_BALANCE.toFixed(2);
            localStorage.setItem(BALANCE_STORAGE_KEY, savedBalance);
        }

        // Sync stored value back into the UI element safely
        if (elBalanceDisplay) {
            elBalanceDisplay.textContent = parseFloat(savedBalance).toFixed(2);
        }
    }

    /**
     * Listens for balance text mutations and automatically commits them to storage
     */
    if (elBalanceDisplay) {
        const observer = new MutationObserver(() => {
            const currentVal = parseFloat(elBalanceDisplay.textContent || '0');
            if (!isNaN(currentVal)) {
                localStorage.setItem(BALANCE_STORAGE_KEY, currentVal.toFixed(2));
            }
        });

        observer.observe(elBalanceDisplay, { childList: true, characterData: true, subtree: true });
    }

    /**
     * Safeguards against active game reloads to prevent mid-turn credit deductions
     */
    function preventUnintendedRefreshLoss() {
        window.addEventListener('beforeunload', (event) => {
            // Check if any game instance is actively executing an async turn
            const isAnyGameActive = document.querySelector('.game-window:not(.hidden) .btn:disabled');
            
            if (isAnyGameActive) {
                // Cancel standard reload sequence to prompt confirmation dialog
                event.preventDefault();
                event.returnValue = '';
            }
        });
    }
})();
