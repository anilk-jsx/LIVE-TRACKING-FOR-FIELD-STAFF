/* Session manager for TRACE THE PATH
   - Sets a client-side session with an 8-hour expiry
   - Exposes: setSession(user), isSessionValid(), clearSession(), requireLogin()
   - Auto-logs out when expiry reached (clears storage, signs out from Firebase if available, redirects to login)
*/
(function () {
    const SESSION_KEY = 'currentUser';
    // For testing set to 1 minute. Change back to 8 * 60 * 60 * 1000 for production (8 hours)
    const EXPIRY_MS = 1 * 60 * 1000; // 1 minute (testing)

    function readStored() {
        try {
            const s = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
            if (!s) return null;
            return JSON.parse(s);
        } catch (e) {
            return null;
        }
    }

    function writeStored(obj) {
        try {
            const str = JSON.stringify(obj);
            try { sessionStorage.setItem(SESSION_KEY, str); } catch (e) {}
            try { localStorage.setItem(SESSION_KEY, str); } catch (e) {}
        } catch (e) {}
    }

    function clearStored() {
        try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    }

    let expiryTimer = null;
    function scheduleExpiry(delayMs) {
        if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null; }
        if (typeof delayMs !== 'number' || delayMs <= 0) {
            // expire immediately on next tick
            setTimeout(expireNow, 10);
            return;
        }
        expiryTimer = setTimeout(expireNow, delayMs + 1000); // add small buffer
    }

    function expireNow() {
        // Clear storage and try to sign out of Firebase if available
        clearStored();
        try {
            if (window.firebaseAuth && typeof window.signOut === 'function') {
                // call signOut but avoid unhandled rejection
                Promise.resolve(window.signOut(window.firebaseAuth)).catch(() => {});
            }
        } catch (e) {}

        try { history.replaceState(null, '', 'index.html'); } catch (e) {}
        try { location.replace('index.html'); } catch (e) { /* last resort */ }
    }

    function isSessionValid() {
        const u = readStored();
        if (!u) return false;
        if (!u.expiry) return true; // legacy entries without expiry are considered valid
        return Date.now() < u.expiry;
    }

    function setSession(userData) {
        if (!userData || typeof userData !== 'object') return;
        const now = Date.now();
        const expiry = now + EXPIRY_MS;
        const store = Object.assign({}, userData, {
            loginTime: new Date(now).toISOString(),
            expiry: expiry
        });
        writeStored(store);
        scheduleExpiry(EXPIRY_MS);
    }

    function clearSession() {
        clearStored();
        try { history.replaceState(null, '', 'index.html'); } catch (e) {}
        try { location.replace('index.html'); } catch (e) {}
    }

    function requireLogin(opts) {
        opts = opts || {};
        const redirectUrl = opts.redirectUrl || 'index.html';
        const u = readStored();
        if (!u) {
            try { history.replaceState(null, '', redirectUrl); } catch (e) {}
            try { location.replace(redirectUrl); } catch (e) {}
            return false;
        }
        if (u.expiry && Date.now() >= u.expiry) {
            // expired
            clearStored();
            try {
                if (window.firebaseAuth && typeof window.signOut === 'function') {
                    Promise.resolve(window.signOut(window.firebaseAuth)).catch(() => {});
                }
            } catch (e) {}
            try { history.replaceState(null, '', redirectUrl); } catch (e) {}
            try { location.replace(redirectUrl); } catch (e) {}
            return false;
        }
        // schedule expiry if not already scheduled
        if (u.expiry) {
            scheduleExpiry(u.expiry - Date.now());
        }
        return true;
    }

    // Expose public API
    window.setSession = setSession;
    window.isSessionValid = isSessionValid;
    window.clearSession = clearSession;
    window.requireLogin = requireLogin;

    // Initialize when script loads
    (function init() {
        const u = readStored();
        if (u && u.expiry) {
            const remaining = u.expiry - Date.now();
            if (remaining <= 0) { expireNow(); return; }
            scheduleExpiry(remaining);
        }
    })();

})();
