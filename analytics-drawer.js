/**
 * REAL-TIME ANALYTICS & STATS DASHBOARD
 * Computes performance analytics from IndexedDB transaction logs.
 */
(function() {
    const DB_NAME = 'CyberCasinoDB';
    const STORE_NAME = 'transaction_ledger';

    document.addEventListener('DOMContentLoaded', () => {
        injectAnalyticsHTML();
        setupAnalyticsEvents();
    });

    // 1. Inject Analytics Overlay Shell
    function injectAnalyticsHTML() {
        const markup = `
        <div id="analytics-drawer-overlay" class="analytics-overlay hidden">
            <div class="analytics-drawer">
                <div class="analytics-header">
                    <div class="title-group">
                        <span class="analytics-icon">📊</span>
                        <h3>PERFORMANCE TELEMETRY</h3>
                    </div>
                    <button id="close-analytics-btn" class="close-analytics-btn">&times;</button>
                </div>

                <div class="analytics-body">
                    <!-- Key Performance Metrics Grid -->
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <span class="m-label">TOTAL ROUNDS</span>
                            <span id="m-total-rounds" class="m-val">0</span>
                        </div>
                        <div class="metric-card">
                            <span class="m-label">WIN RATE</span>
                            <span id="m-win-rate" class="m-val highlight-green">0%</span>
                        </div>
                        <div class="metric-card">
                            <span class="m-label">HIGHEST WIN</span>
                            <span id="m-highest-win" class="m-val highlight-cyan">$0.00</span>
                        </div>
                        <div class="metric-card">
                            <span class="m-label">PROFIT FACTOR</span>
                            <span id="m-profit-factor" class="m-val">0.00</span>
                        </div>
                    </div>

                    <!-- Visual Proportion Bar -->
                    <div class="proportion-section">
                        <div class="prop-labels">
                            <span class="txt-green">WINS: <span id="prop-wins-count">0</span></span>
                            <span class="txt-red">LOSSES: <span id="prop-losses-count">0</span></span>
                        </div>
                        <div class="proportion-bar-container">
                            <div id="prop-bar-win" class="bar-segment win-segment" style="width: 50%;"></div>
                            <div id="prop-bar-loss" class="bar-segment loss-segment" style="width: 50%;"></div>
                        </div>
                    </div>

                    <!-- Breakdown Table by Game Module -->
                    <div class="game-breakdown-section">
                        <h4>MODULE BREAKDOWN</h4>
                        <div class="breakdown-header">
                            <span>GAME</span>
                            <span>ROUNDS</span>
                            <span>NET PROFIT</span>
                        </div>
                        <div id="breakdown-rows-container" class="breakdown-rows">
                            <!-- Dynamic rows rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', markup);
    }

    // 2. Compute Metrics from Database
    function computeAnalytics() {
        const dbReq = indexedDB.open(DB_NAME);
        dbReq.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) return;

            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();

            req.onsuccess = () => {
                const logs = req.result;
                let wins = 0;
                let losses = 0;
                let highestWin = 0;
                let grossProfit = 0;
                let grossLoss = 0;
                const gameStats = {};

                logs.forEach(log => {
                    const game = log.game || 'System';
                    if (!gameStats[game]) {
                        gameStats[game] = { rounds: 0, net: 0 };
                    }

                    if (log.type === 'WIN') {
                        wins++;
                        if (log.netChange > highestWin) highestWin = log.netChange;
                        grossProfit += log.netChange;
                        gameStats[game].rounds++;
                        gameStats[game].net += log.netChange;
                    } else if (log.type === 'LOSS' || log.type === 'STAKE') {
                        losses++;
                        grossLoss += Math.abs(log.netChange);
                        gameStats[game].rounds++;
                        gameStats[game].net += log.netChange;
                    }
                });

                const totalRounds = wins + losses;
                const winRate = totalRounds > 0 ? ((wins / totalRounds) * 100).toFixed(1) : '0.0';
                const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? 'INF' : '0.00');

                // Update UI elements
                document.getElementById('m-total-rounds').textContent = totalRounds;
                document.getElementById('m-win-rate').textContent = `${winRate}%`;
                document.getElementById('m-highest-win').textContent = `$${highestWin.toFixed(2)}`;
                document.getElementById('m-profit-factor').textContent = profitFactor;

                document.getElementById('prop-wins-count').textContent = wins;
                document.getElementById('prop-losses-count').textContent = losses;

                const winPercent = totalRounds > 0 ? (wins / totalRounds) * 100 : 50;
                document.getElementById('prop-bar-win').style.width = `${winPercent}%`;
                document.getElementById('prop-bar-loss').style.width = `${100 - winPercent}%`;

                renderGameBreakdown(gameStats);
            };
        };
    }

    function renderGameBreakdown(gameStats) {
        const container = document.getElementById('breakdown-rows-container');
        if (!container) return;
        container.innerHTML = '';

        const games = Object.keys(gameStats);
        if (games.length === 0) {
            container.innerHTML = `<div class="empty-breakdown">NO GAME DATA AVAILABLE</div>`;
            return;
        }

        games.forEach(g => {
            const row = document.createElement('div');
            const net = gameStats[g].net;
            row.className = `breakdown-row ${net >= 0 ? 'pos' : 'neg'}`;
            row.innerHTML = `
                <span class="b-game">${g.toUpperCase()}</span>
                <span class="b-rounds">${gameStats[g].rounds}</span>
                <span class="b-net">${net >= 0 ? '+' : ''}$${net.toFixed(2)}</span>
            `;
            container.appendChild(row);
        });
    }

    function setupAnalyticsEvents() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#open-analytics-trigger')) {
                document.getElementById('analytics-drawer-overlay').classList.remove('hidden');
                computeAnalytics();
            }
            if (e.target.closest('#close-analytics-btn') || e.target.id === 'analytics-drawer-overlay') {
                document.getElementById('analytics-drawer-overlay').classList.add('hidden');
            }
        });
    }
})();
