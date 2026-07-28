/**
 * CYBER CASINO ANALYTICS DRAWER ENGINE v2.0
 * Real-Time Canvas Charting, P/L Metrics & Live Session Auditing.
 */
(function() {
    const DB_NAME = 'CyberCasinoDB';
    const STORE_NAME = 'transaction_ledger';

    document.addEventListener('DOMContentLoaded', () => {
        injectAnalyticsDrawerDOM();
        setupEvents();
    });

    // 1. Audio Synthesizer Engine
    function playAudioFx(type) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'slide') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
            } else if (type === 'click') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            }
        } catch (e) {
            // Audio context blocked or uninitialized
        }
    }

    // 2. Inject Analytics Drawer Markup
    function injectAnalyticsDrawerDOM() {
        if (document.getElementById('analytics-overlay')) return;

        const drawerHTML = `
        <div id="analytics-overlay" class="analytics-overlay hidden">
            <div class="analytics-drawer">
                <!-- Drawer Header -->
                <div class="analytics-header">
                    <div class="title-group">
                        <h3>PERFORMANCE ANALYTICS</h3>
                        <span class="vip-badge-shimmer" style="font-size: 0.6rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">LIVE AUDIT</span>
                    </div>
                    <button id="close-analytics-btn" class="close-analytics-btn" aria-label="Close Analytics">&times;</button>
                </div>

                <!-- Drawer Main Body -->
                <div class="analytics-body">
                    <!-- Dynamic Metrics Cards Grid -->
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <span class="m-label">NET PROFIT/LOSS</span>
                            <span id="m-net-pl" class="m-val highlight-cyan">$0.00</span>
                        </div>
                        <div class="metric-card">
                            <span class="m-label">WIN RATE</span>
                            <span id="m-win-rate" class="m-val highlight-green">0.0%</span>
                        </div>
                        <div class="metric-card">
                            <span class="m-label">TOTAL ROUNDS</span>
                            <span id="m-total-rounds" class="m-val">0</span>
                        </div>
                        <div class="metric-card">
                            <span class="m-label">HIGHEST PAYOUT</span>
                            <span id="m-max-win" class="m-val highlight-green">$0.00</span>
                        </div>
                    </div>

                    <!-- Canvas Real-Time Chart Visualization -->
                    <div class="chart-container-section" style="background: rgba(2, 6, 23, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span class="m-label" style="letter-spacing: 1px; font-weight: 700;">EQUITY CURVE (NET P/L OVER TIME)</span>
                            <span style="font-size: 0.65rem; color: var(--neon-cyan); font-weight: bold;">LIVE</span>
                        </div>
                        <canvas id="pl-chart-canvas" width="400" height="160" style="width: 100%; height: 160px; display: block;"></canvas>
                    </div>

                    <!-- Win vs Loss Proportion Bar -->
                    <div class="proportion-section">
                        <div class="prop-labels">
                            <span id="prop-wins-lbl" class="highlight-green">WINS: 0</span>
                            <span id="prop-losses-lbl" class="highlight-pink" style="color: var(--neon-pink);">LOSSES: 0</span>
                        </div>
                        <div class="proportion-bar-container">
                            <div id="win-bar-segment" class="bar-segment win-segment" style="width: 50%;"></div>
                            <div id="loss-bar-segment" class="bar-segment loss-segment" style="width: 50%;"></div>
                        </div>
                    </div>

                    <!-- Game Performance Table Breakdown -->
                    <div class="game-breakdown-section">
                        <h4>GAME PERFORMANCE BREAKDOWN</h4>
                        <div class="breakdown-header">
                            <span>GAME</span>
                            <span>ROUNDS</span>
                            <span>NET P/L</span>
                        </div>
                        <div id="breakdown-rows-container" class="breakdown-rows">
                            <div class="empty-breakdown">NO GAME DATA AVAILABLE</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', drawerHTML);
    }

    // 3. Query IndexedDB Ledger
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

    // 4. Custom Canvas Chart Renderer
    function drawEquityChart(records) {
        const canvas = document.getElementById('pl-chart-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Handle High-DPI screens
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        ctx.clearRect(0, 0, width, height);

        if (records.length === 0) {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('NO DATA TO DISPLAY', width / 2, height / 2);
            return;
        }

        // Calculate cumulative P/L values
        let cumulative = 0;
        const points = [0];
        records.forEach(r => {
            cumulative += Number(r.netChange || 0);
            points.push(cumulative);
        });

        const minVal = Math.min(0, ...points);
        const maxVal = Math.max(0, ...points);
        const range = (maxVal - minVal) || 1;

        const padding = 20;
        const drawWidth = width - (padding * 2);
        const drawHeight = height - (padding * 2);

        // Draw Zero Baseline
        const zeroY = padding + drawHeight - (((0 - minVal) / range) * drawHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(width - padding, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate Point Coordinates
        const coords = points.map((val, idx) => {
            const x = padding + (idx / (points.length - 1 || 1)) * drawWidth;
            const y = padding + drawHeight - (((val - minVal) / range) * drawHeight);
            return { x, y };
        });

        // Gradient Fill under curve
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        const isProfitable = cumulative >= 0;
        if (isProfitable) {
            gradient.addColorStop(0, 'rgba(0, 255, 136, 0.35)');
            gradient.addColorStop(1, 'rgba(0, 255, 136, 0.0)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 0, 85, 0.35)');
            gradient.addColorStop(1, 'rgba(255, 0, 85, 0.0)');
        }

        // Area Fill
        ctx.beginPath();
        ctx.moveTo(coords[0].x, zeroY);
        coords.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.lineTo(coords[coords.length - 1].x, zeroY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke Equity Line
        ctx.beginPath();
        coords.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = isProfitable ? '#00ff88' : '#ff0055';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = isProfitable ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 85, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset Shadow

        // Draw Terminal Node Point
        const lastPt = coords[coords.length - 1];
        ctx.beginPath();
        ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = isProfitable ? '#00ff88' : '#ff0055';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 5. Update Metrics & Game Breakdown Data
    async function updateAnalyticsUI() {
        const records = await fetchLedgerData();

        let totalNet = 0;
        let winCount = 0;
        let lossCount = 0;
        let maxWin = 0;
        const gameStats = {};

        records.forEach(r => {
            const net = Number(r.netChange || 0);
            const game = r.game || 'System';

            totalNet += net;

            if (net > 0) {
                winCount++;
                if (net > maxWin) maxWin = net;
            } else if (net < 0) {
                lossCount++;
            }

            if (!gameStats[game]) {
                gameStats[game] = { rounds: 0, net: 0 };
            }
            gameStats[game].rounds++;
            gameStats[game].net += net;
        });

        const totalRounds = records.length;
        const winRate = totalRounds > 0 ? ((winCount / totalRounds) * 100).toFixed(1) : '0.0';

        // Update Stat Cards
        const netEl = document.getElementById('m-net-pl');
        const winRateEl = document.getElementById('m-win-rate');
        const roundsEl = document.getElementById('m-total-rounds');
        const maxWinEl = document.getElementById('m-max-win');

        if (netEl) {
            netEl.textContent = `${totalNet >= 0 ? '+' : ''}$${totalNet.toFixed(2)}`;
            netEl.style.color = totalNet > 0 ? 'var(--neon-green)' : (totalNet < 0 ? 'var(--neon-pink)' : 'var(--neon-cyan)');
        }
        if (winRateEl) winRateEl.textContent = `${winRate}%`;
        if (roundsEl) roundsEl.textContent = totalRounds;
        if (maxWinEl) maxWinEl.textContent = `$${maxWin.toFixed(2)}`;

        // Update Win/Loss Bar Ratio
        const winPercent = totalRounds > 0 ? (winCount / totalRounds) * 100 : 50;
        const lossPercent = totalRounds > 0 ? (lossCount / totalRounds) * 100 : 50;

        const winBar = document.getElementById('win-bar-segment');
        const lossBar = document.getElementById('loss-bar-segment');
        const winsLbl = document.getElementById('prop-wins-lbl');
        const lossesLbl = document.getElementById('prop-losses-lbl');

        if (winBar) winBar.style.width = `${winPercent}%`;
        if (lossBar) lossBar.style.width = `${lossPercent}%`;
        if (winsLbl) winsLbl.textContent = `WINS: ${winCount}`;
        if (lossesLbl) lossesLbl.textContent = `LOSSES: ${lossCount}`;

        // Render Game Breakdown Table
        const breakdownContainer = document.getElementById('breakdown-rows-container');
        if (breakdownContainer) {
            const games = Object.keys(gameStats);
            if (games.length === 0) {
                breakdownContainer.innerHTML = '<div class="empty-breakdown">NO GAME DATA AVAILABLE</div>';
            } else {
                breakdownContainer.innerHTML = games.map(g => {
                    const st = gameStats[g];
                    const isPos = st.net > 0;
                    const rowClass = isPos ? 'pos' : (st.net < 0 ? 'neg' : '');
                    return `
                    <div class="breakdown-row ${rowClass}">
                        <span style="font-weight: 600; color: #ffffff;">${escapeHtml(g)}</span>
                        <span>${st.rounds}</span>
                        <span class="b-net">${isPos ? '+' : ''}$${st.net.toFixed(2)}</span>
                    </div>`;
                }).join('');
            }
        }

        // Draw Canvas Equity Chart
        drawEquityChart(records);
    }

    // 6. Controller Methods
    function openDrawer() {
        const overlay = document.getElementById('analytics-overlay');
        if (overlay) {
            playAudioFx('slide');
            updateAnalyticsUI();
            overlay.classList.remove('hidden');
        }
    }

    function closeDrawer() {
        const overlay = document.getElementById('analytics-overlay');
        if (overlay) {
            playAudioFx('click');
            overlay.classList.add('hidden');
        }
    }

    function setupEvents() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#open-analytics-btn') || e.target.closest('.btn-analytics-open')) {
                openDrawer();
            }
            if (e.target.id === 'close-analytics-btn' || e.target.id === 'analytics-overlay') {
                closeDrawer();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDrawer();
        });

        // Re-render chart on window resize
        window.addEventListener('resize', () => {
            const overlay = document.getElementById('analytics-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                fetchLedgerData().then(records => drawEquityChart(records));
            }
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }

    // Expose Global Interface
    window.CyberAnalyticsDrawer = {
        open: openDrawer,
        close: closeDrawer,
        refresh: updateAnalyticsUI
    };
})();
