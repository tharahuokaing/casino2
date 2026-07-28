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
     * Reset user session balance back to initial baseline state
     * @param {number} defaultAmount 
     */
    resetBalanceSession: function(defaultAmount = 1000.00) {
        localStorage.setItem('cyber_app_user_balance', defaultAmount.toFixed(2));
        this.setCookie('user_session_active', 'true', 1);
        
        const elBalanceDisplay = document.getElementById('balance-display');
        if (elBalanceDisplay) {
            elBalanceDisplay.textContent = defaultAmount.toFixed(2);
        }
    }
};
