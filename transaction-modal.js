/**
 * CYBER CASINO TRANSACTION LEDGER MODAL CONTROLLER v2.0
 * Features: High-Roller UI, Sound FX Engine, Live Metrics & Export Directives
 */
(function() {
    const DB_NAME = 'CyberCasinoDB';
    const STORE_NAME = 'transaction_ledger';

    document.addEventListener('DOMContentLoaded', () => {
        injectLedgerModalMarkup();
        bindEvents();
    });

    // --------------------------------------------------------------------------
    // 1. Synthesize Casino Audio Effects (Web Audio API - No External Files)
    // --------------------------------------------------------------------------
    function playAudioFx(type) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'open') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'click') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            }
        } catch (e) {
            // Audio context blocked or unsupported
        }
    }

    // --------------------------------------------------------------------------
    // 2. Inject Modal DOM Structure
    // --------------------------------------------------------------------------
    function injectLedgerModalMarkup() {
        if (document.getElementById('ledger-modal-overlay')) return;

        const modalHTML = `
        <div id="ledger-modal-overlay" class="ledger-modal-overlay hidden">
            <div class="ledger-modal-frame">
                <!-- Header -->
                <div class="ledger-header">
                    <div class="ledger-title">
                        <span class="ledger-icon">📜</span>
                        <h3>TRANSACTION LEDGER</h3>
                        <span class="vip-badge-shimmer" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">VIP AUDIT</span>
                    </div>
                    <button id="close-ledger-btn" class="close-modal-btn" aria-label="Close Modal">&times;</button>
                </div>

                <!-- Live Performance Metrics Header -->
                <div class="ledger-stats-bar">
                    <div class="stat-pill">
                        <span class="stat-label">TOTAL TURNOVER</span>
                        <span id="ledger-stat-volume" class="stat-val">$0.00</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-label">NET PROFIT / LOSS</span>
                        <span id="ledger-stat-net" class="stat-val">$0.00</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-label">TOTAL SETTLED</span>
                        <span id="ledger-stat-count" class="stat-val">0</span>
                    </div>
                </div>

                <!-- Transaction History Table -->
                <div class="ledger-body">
                    <div class="table-header">
                        <span>Time</span>
                        <span>Game</span>
                        <span>Type</span>
                        <span>Net P/L</span>
                        <span>Balance</span>
                    </div>
                    <div id="ledger-rows-container" class="ledger-rows">
                        <div class="empty-ledger-msg">QUERYING BLOCKCHAIN LEDGER...</div>
                    </div>
                </div>

                <!-- Footer with Export & Maintenance Tools -->
                <div class="ledger-footer">
                    <div class="export-btn-group">
                        <button id="export-json-btn" class="btn-export btn-json">⚡ JSON EXPORT</button>
                        <button id="export-csv-btn" class="btn-export btn-csv">📊 CSV EXPORT</button>
                    </div>
                    <button id="clear-ledger-btn" class="btn-clear-history">PURGE HISTORY</button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // --------------------------------------------------------------------------
    // 3. Database Layer & Data Rendering
    // --------------------------------------------------------------------------
    function fetchLedgerData() {
        return new Promise((resolve) => {
            const req = indexedDB.open(DB_NAME);
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) return resolve([]);
                
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const getAll = store.getAll();
                getAll.onsuccess = () => resolve(getAll.result || []);
            };
            req.onerror = () => resolve([]);
        });
    }

    async function renderLedgerModal() {
        const container = document.getElementById('ledger-rows-container');
        if (!container) return;

        const data = await fetchLedgerData();
        
        // Reverse array to show newest transactions first
        const records = [...data].reverse();

        if (records.length === 0) {
            container.innerHTML = '<div class="empty-ledger-msg">NO TRANSACTIONS RECORDED YET</div>';
            updateStatsUI(0, 0, 0);
            return;
        }

        let totalTurnover = 0;
        let netPL = 0;

        container.innerHTML = records.map(item => {
            const net = Number(item.netChange) || 0;
            const amt = Number(item.amount) || 0;
            totalTurnover += Math.abs(amt);
            netPL += net;

            const isPos = net > 0;
            const isZero = net === 0;
            const rowClass = isPos ? 'row-positive' : (isZero ? '' : 'row-negative');
            
            const badgeType = (item.type || 'TX').toLowerCase();
            let badgeClass = 'badge-stake';
            if (badgeType.includes('win')) badgeClass = 'badge-win';
            else if (badgeType.includes('loss')) badgeClass = 'badge-loss';
            else if (badgeType.includes('reset')) badgeClass = 'badge-reset';

            const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--';

            return `
            <div class="ledger-row ${rowClass}" data-id="${item.id || ''}">
                <span style="color: var(--text-muted); font-size: 0.75rem;">${timeStr}</span>
                <span style="font-weight: 600; color: #ffffff;">${escapeHtml(item.game || 'System')}</span>
                <span><span class="col-type ${badgeClass}">${(item.type || 'SETTLE').toUpperCase()}</span></span>
                <span class="col-net">${isPos ? '+' : ''}$${net.toFixed(2)}</span>
                <span style="color: var(--neon-cyan); font-weight: 600;">$${Number(item.balanceAfter || 0).toFixed(2)}</span>
            </div>`;
        }).join('');

        updateStatsUI(totalTurnover, netPL, records.length);
    }

    function updateStatsUI(volume, net, count) {
        const volEl = document.getElementById('ledger-stat-volume');
        const netEl = document.getElementById('ledger-stat-net');
        const countEl = document.getElementById('ledger-stat-count');

        if (volEl) volEl.textContent = `$${volume.toFixed(2)}`;
        if (countEl) countEl.textContent = count;
        
        if (netEl) {
            netEl.textContent = `${net >= 0 ? '+' : ''}$${net.toFixed(2)}`;
            netEl.className = 'stat-val ' + (net > 0 ? 'txt-green' : (net < 0 ? 'txt-red' : ''));
        }
    }

    // --------------------------------------------------------------------------
    // 4. Modal Open/Close Controls & Event Binding
    // --------------------------------------------------------------------------
    function openModal() {
        const modal = document.getElementById('ledger-modal-overlay');
        if (modal) {
            playAudioFx('open');
            renderLedgerModal();
            modal.classList.remove('hidden');
        }
    }

    function closeModal() {
        const modal = document.getElementById('ledger-modal-overlay');
        if (modal) {
            playAudioFx('click');
            modal.classList.add('hidden');
        }
    }

    async function purgeLedgerHistory() {
        if (!confirm('Are you sure you want to purge all local transaction records? This action cannot be undone.')) return;
        
        playAudioFx('click');
        const req = indexedDB.open(DB_NAME);
        req.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) return;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const clearReq = store.clear();
            clearReq.onsuccess = () => renderLedgerModal();
        };
    }

    function bindEvents() {
        document.body.addEventListener('click', (e) => {
            // Open Triggers
            if (e.target.closest('#open-ledger-btn') || e.target.closest('.btn-ledger-open')) {
                openModal();
            }
            // Close Triggers
            if (e.target.id === 'close-ledger-btn' || e.target.id === 'ledger-modal-overlay') {
                closeModal();
            }
            // Purge History
            if (e.target.id === 'clear-ledger-btn') {
                purgeLedgerHistory();
            }
            // Dynamic Audio Feedback for Row Selection
            if (e.target.closest('.ledger-row')) {
                playAudioFx('click');
            }
        });

        // Close on Escape Key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }

    // Expose Global Controller Interface
    window.CyberLedgerModal = {
        open: openModal,
        close: closeModal,
        refresh: renderLedgerModal
    };
})();

/**
 * CYBER CASINO LEDGER IMPORT/RESTORE ENGINE
 * Add this to your transaction-modal.js or reference as a separate module.
 */
(function() {
    const DB_NAME = 'CyberCasinoDB';
    const STORE_NAME = 'transaction_ledger';

    // --------------------------------------------------------------------------
    // 1. JSON Import & Validation Logic
    // --------------------------------------------------------------------------
    async function importLedgerBackup(file, mode = 'merge') {
        try {
            const fileText = await file.text();
            const importedData = JSON.parse(fileText);

            // Validate standard casino export schema
            const records = Array.isArray(importedData) ? importedData : importedData.transactions;

            if (!Array.isArray(records)) {
                throw new Error('Invalid JSON format: Missing array of transaction records.');
            }

            // Sanitize and validate record entries
            const validRecords = records.filter(item => {
                return item && (item.timestamp || item.id) && (item.amount !== undefined || item.netChange !== undefined);
            });

            if (validRecords.length === 0) {
                throw new Error('No valid transaction records found in the uploaded backup file.');
            }

            // Write to IndexedDB
            const req = indexedDB.open(DB_NAME);
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    alert('IndexedDB store not found.');
                    return;
                }

                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                if (mode === 'overwrite') {
                    store.clear();
                }

                let addedCount = 0;
                validRecords.forEach(record => {
                    // Normalize record fields
                    const entry = {
                        id: record.id || `import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                        timestamp: record.timestamp || new Date().toISOString(),
                        game: record.game || 'Imported Entry',
                        type: record.type || 'RESTORE',
                        amount: Number(record.amount) || 0,
                        netChange: Number(record.netChange) || 0,
                        balanceAfter: Number(record.balanceAfter) || 0
                    };

                    store.put(entry);
                    addedCount++;
                });

                tx.oncomplete = () => {
                    // Play success audio if available
                    if (window.playAudioFx) window.playAudioFx('open');
                    
                    alert(`Success! Successfully ${mode === 'overwrite' ? 'restored' : 'merged'} ${addedCount} transactions.`);

                    // Refresh Modal and Analytics UI
                    if (window.CyberLedgerModal && window.CyberLedgerModal.refresh) {
                        window.CyberLedgerModal.refresh();
                    }
                    if (window.CyberAnalyticsDrawer && window.CyberAnalyticsDrawer.refresh) {
                        window.CyberAnalyticsDrawer.refresh();
                    }
                };
            };
        } catch (err) {
            alert(`Restore Failed: ${err.message}`);
        }
    }

    // --------------------------------------------------------------------------
    // 2. Trigger File Selection Dialog
    // --------------------------------------------------------------------------
    function triggerRestoreDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json, application/json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const modeChoice = confirm(
                "Click 'OK' to MERGE with existing history.\nClick 'Cancel' to OVERWRITE (Purge existing ledger)."
            );

            const mode = modeChoice ? 'merge' : 'overwrite';
            importLedgerBackup(file, mode);
        };

        input.click();
    }

    // Bind to UI Button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'import-json-btn' || e.target.closest('#import-json-btn')) {
            triggerRestoreDialog();
        }
    });

    // Expose Global Restore Interface
    window.CyberLedgerRestore = {
        importFile: importLedgerBackup,
        prompt: triggerRestoreDialog
    };
})();
