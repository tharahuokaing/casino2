/**
 * CYBER-STATE ENGINE v2.0 (Modern Architecture)
 * Features:
 * - Async IndexedDB storage (prevents thread-blocking LocalStorage issues)
 * - BroadcastChannel API (Syncs balance across multiple open tabs in real-time)
 * - Web Locks API (Prevents concurrent race conditions on balance mutations)
 * - Event-Driven Architecture (Custom events trigger sleek UI updates)
 */
class CyberStateController extends EventTarget {
    constructor() {
        super();
        this.dbName = 'CyberCasinoDB';
        this.storeName = 'session_state';
        this.db = null;
        this.broadcast = new BroadcastChannel('cyber_state_sync');
        
        this.init();
    }

    async init() {
        await this.initDB();
        await this.syncBalanceFromStorage();
        this.setupCrossTabSync();
        this.setupUnloadGuard();
    }

    // 1. Modern IndexedDB Persistence Wrapper
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject(e);
        });
    }

    async set(key, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async get(key) {
        return new Promise((resolve) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    }

    // 2. Race-Condition Proof Balance Mutation (Web Locks API)
    async mutateBalance(delta) {
        if (!navigator.locks) {
            // Fallback for non-supported browsers
            return this._executeBalanceMutation(delta);
        }

        // Web Lock prevents two game modules or fast clicks from writing at the exact same millisecond
        return await navigator.locks.request('balance_mutation_lock', async () => {
            return await this._executeBalanceMutation(delta);
        });
    }

    async _executeBalanceMutation(delta) {
        let current = (await this.get('user_balance')) ?? 1000.00;
        let newBalance = Math.max(0, current + delta);
        
        await this.set('user_balance', newBalance);
        
        // Notify current tab & other open tabs
        this.updateUI(newBalance);
        this.broadcast.postMessage({ type: 'BALANCE_MUTATED', balance: newBalance });

        return newBalance;
    }

    // 3. Multi-Tab Real-Time Syncing (BroadcastChannel API)
    setupCrossTabSync() {
        this.broadcast.onmessage = (event) => {
            if (event.data?.type === 'BALANCE_MUTATED') {
                this.updateUI(event.data.balance, false);
            }
        };
    }

    // 4. Session Reset Preserving Remaining Balance
    async resetBalanceSession(targetAmount = null) {
        let finalAmount;
        if (targetAmount !== null) {
            finalAmount = parseFloat(targetAmount);
        } else {
            const existing = await this.get('user_balance');
            finalAmount = existing !== null ? parseFloat(existing) : 1000.00;
        }

        await this.set('user_balance', finalAmount);
        this.updateUI(finalAmount);
        this.broadcast.postMessage({ type: 'BALANCE_MUTATED', balance: finalAmount });
        
        console.log(`[CYBER V2] Session reset. Preserved Balance: $${finalAmount.toFixed(2)}`);
    }

    // 5. UI Dispatcher with Animation Triggers
    async syncBalanceFromStorage() {
        const stored = (await this.get('user_balance')) ?? 1000.00;
        this.updateUI(stored, false);
    }

    updateUI(balance, triggerAnimation = true) {
        const displays = document.querySelectorAll('#balance-display, .balance-value');
        displays.forEach(el => {
            el.textContent = parseFloat(balance).toFixed(2);
            if (triggerAnimation) {
                el.classList.remove('balance-updated');
                void el.offsetWidth; // Force CSS reflow
                el.classList.add('balance-updated');
            }
        });

        // Fire custom DOM Event for external game modules
        window.dispatchEvent(new CustomEvent('cyberBalanceChanged', { detail: { balance } }));
    }

    // 6. Navigation Interceptor (Refresh / Tab Close Guard)
    setupUnloadGuard() {
        window.addEventListener('beforeunload', (e) => {
            const isBusy = document.body.classList.contains('game-round-in-progress');
            if (isBusy) {
                e.preventDefault();
                e.returnValue = 'A game sequence is active! Refreshing now might result in lost round state.';
            }
        });
    }
}

// Instantiate global controller singleton
window.CyberState = new CyberStateController();
