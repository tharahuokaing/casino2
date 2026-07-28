/**
 * TRANSACTION HISTORY MODAL ENGINE
 * Listens to state mutations, logs win/loss history into IndexedDB,
 * and renders a real-time ledger modal view.
 */
(function() {
    const DB_NAME = 'CyberCasinoDB';
    const STORE_NAME = 'transaction_ledger';

    document.addEventListener('DOMContentLoaded', () => {
        initLedgerDB();
        injectModalHTML();
        setupEventListeners();
    });

    // 1. Initialize IndexedDB for Transaction History
    function initLedgerDB() {
        const request = indexedDB.open(DB_NAME, 2); // Upgraded DB version
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    }

    // 2. Log a New Transaction Entry
    async function recordTransaction(type, gameName, amount, netChange, balanceAfter) {
        const entry = {
            timestamp: new Date().toISOString(),
            game: gameName || 'System',
            type: type, // 'WIN', 'LOSS', 'STAKE', 'RESET'
            amount: parseFloat(amount),
            netChange: parseFloat(netChange),
            balanceAfter: parseFloat(balanceAfter)
        };

        const dbRequest = indexedDB.open(DB_NAME);
        dbRequest.onsuccess = (e) => {
            const db = e.target.result;
            if (db.objectStoreNames.contains(STORE_NAME)) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.add(entry);
                tx.oncomplete = () => {
                    // Refresh view if modal is open
                    const modal = document.getElementById('ledger-modal-overlay');
                    if (modal && !modal.classList.contains('hidden')) {
                        renderTransactionList();
                    }
                };
            }
        };
    }

    // 3. Inject Modal HTML Shell into Document Body
    function injectModalHTML() {
        const modalMarkup = `
        <div id="ledger-modal-overlay" class="ledger-modal-overlay hidden">
            <div class="ledger-modal-frame">
                <div class="ledger-header">
                    <div class="ledger-title">
                        <span class="ledger-icon">📜</span>
                        <h3>TRANSACTION LEDGER</h3>
                    </div>
                    <button id="close-ledger-btn" class="close-modal-btn">&times;</button>
                </div>
                
                <div class="ledger-stats-bar">
                    <div class="stat-pill">
                        <span class="stat-label">RECORDED LOGS</span>
                        <span id="total-logs-count" class="stat-val">0</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-label">SESSION NET FLOW</span>
                        <span id="session-net-flow" class="stat-val">$0.00</span>
                    </div>
                </div>

                <div class="ledger-body">
                    <div class="table-header">
                        <span>TIME</span>
                        <span>GAME / SOURCE</span>
                        <span>TYPE</span>
                        <span>NET AMOUNT</span>
                        <span>BALANCE</span>
                    </div>
                    <div id="ledger-rows-container" class="ledger-rows">
                        <!-- Dynamic rows will render here -->
                    </div>
                </div>
                
                <div class="ledger-footer">
                    <button id="clear-ledger-btn" class="btn-clear-history">CLEAR LOGS</button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalMarkup);
    }

    // 4. Render Transaction Rows from DB
    async function renderTransactionList() {
        const container = document.getElementById('ledger-rows-container');
        const countLabel = document.getElementById('total-logs-count');
        const netFlowLabel = document.getElementById('session-net-flow');
        if (!container) return;

        const dbRequest = indexedDB.open(DB_NAME);
        dbRequest.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) return;

            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();

            req.onsuccess = () => {
                const logs = req.result.reverse(); // Show latest first
                container.innerHTML = '';

                if (logs.length === 0) {
                    container.innerHTML = `<div class="empty-ledger-msg">NO TRANSACTIONS RECORDED YET</div>`;
                    if (countLabel) countLabel.textContent = '0';
                    if (netFlowLabel) {
                        netFlowLabel.textContent = '$0.00';
                        netFlowLabel.className = 'stat-val';
                    }
                    return;
                }

                let totalNet = 0;
                logs.forEach(item => {
                    totalNet += item.netChange;
                    const row = document.createElement('div');
                    row.className = `ledger-row ${item.netChange >= 0 ? 'row-positive' : 'row-negative'}`;

                    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const formattedNet = (item.netChange >= 0 ? '+' : '') + item.netChange.toFixed(2);

                    row.innerHTML = `
                        <span class="col-time">${timeStr}</span>
                        <span class="col-game">${item.game.toUpperCase()}</span>
                        <span class="col-type badge-${item.type.toLowerCase()}">${item.type}</span>
                        <span class="col-net">${formattedNet}</span>
                        <span class="col-bal">$${item.balanceAfter.toFixed(2)}</span>
                    `;
                    container.appendChild(row);
                });

                if (countLabel) countLabel.textContent = logs.length;
                if (netFlowLabel) {
                    netFlowLabel.textContent = (totalNet >= 0 ? '+$' : '-$') + Math.abs(totalNet).toFixed(2);
                    netFlowLabel.className = `stat-val ${totalNet >= 0 ? 'txt-green' : 'txt-red'}`;
                }
            };
        };
    }

    // 5. Setup UI Event Handlers & Global Integration Hook
    function setupEventListeners() {
        // Toggle modal open/close
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#open-ledger-trigger')) {
                const modal = document.getElementById('ledger-modal-overlay');
                modal.classList.remove('hidden');
                renderTransactionList();
            }
            if (e.target.closest('#close-ledger-btn') || e.target.id === 'ledger-modal-overlay') {
                document.getElementById('ledger-modal-overlay').classList.add('hidden');
            }
        });

        // Clear history button
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'clear-ledger-btn') {
                const dbRequest = indexedDB.open(DB_NAME);
                dbRequest.onsuccess = (evt) => {
                    const db = evt.target.result;
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    tx.objectStore(STORE_NAME).clear();
                    tx.oncomplete = () => renderTransactionList();
                };
            }
        });

        // Register Global Helper for Game Engine Modules
        window.CyberLedger = {
            log: function(gameName, type, amount, netChange, newBalance) {
                recordTransaction(type, gameName, amount, netChange, newBalance);
            }
        };
    }
})();
