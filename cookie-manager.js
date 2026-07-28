/**
 * SYSTEM COOKIE & STORAGE CONTROLLER
 * Utility methods for setting, getting, and wiping session cookies and game states.
 */
const CyberStorage = {
    /**
     * Set a browser cookie
     * @param {string} name - Cookie name
     * @param {string|number} value - Value to store
     * @param {number} days - Expiration duration in days
     */
    setCookie: function(name, value, days = 7) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${encodeURIComponent(value) || ""}${expires}; path=/; SameSite=Strict`;
    },

    /**
     * Retrieve a stored cookie value
     * @param {string} name - Cookie key name
     * @returns {string|null}
     */
    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    },

    /**
     * Delete a cookie by setting an expired timestamp
     * @param {string} name 
     */
    eraseCookie: function(name) {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    },

    /**
     * Synchronizes and resets session parameters while explicitly preserving 
     * the CURRENT balance left in memory/UI unless an explicit override amount is provided.
     * 
     * @param {number|null} targetAmount - Optional balance override value.
     */
    resetBalanceSession: function(targetAmount = null) {
        const elBalanceDisplay = document.getElementById('balance-display');
        let currentBalanceLeft;

        if (targetAmount !== null) {
            // Use user-provided explicit amount
            currentBalanceLeft = parseFloat(targetAmount);
        } else {
            // Read remaining balance directly from UI, falling back to local storage or 1000000.00
            const uiVal = parseFloat(elBalanceDisplay?.textContent || '');
            const storageVal = parseFloat(localStorage.getItem('cyber_app_user_balance') || '');

            if (!isNaN(uiVal)) {
                currentBalanceLeft = uiVal;
            } else if (!isNaN(storageVal)) {
                currentBalanceLeft = storageVal;
            } else {
                currentBalanceLeft = 1000000.00; // Default baseline if no balance context exists
            }
        }

        // Commit remaining balance and active session state
        localStorage.setItem('cyber_app_user_balance', currentBalanceLeft.toFixed(2));
        this.setCookie('user_session_active', 'true', 1);
        this.setCookie('user_balance_left', currentBalanceLeft.toFixed(2), 1);
        
        // Ensure UI stays in sync
        if (elBalanceDisplay) {
            elBalanceDisplay.textContent = currentBalanceLeft.toFixed(2);
        }

        console.log(`[SESSION RESET] Session re-initialized. Remaining Balance Preserved: ${currentBalanceLeft.toFixed(2)}`);
    }
};
