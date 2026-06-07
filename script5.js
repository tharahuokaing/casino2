/**
 * CC-v7.0 MODULAR EXTENSION SCRIPT 5
 * Engines Covered: Horizontal Cascade Plinko Layout
 */

const PlinkoEngine = {
    // Multiplier map corresponding to the final pocket array destinations (Left to Right)
    pockets: [5.00, 2.00, 0.50, 0.20, 0.50, 2.00, 5.00],
    rowCount: 6, // Total vertical peg rows the sphere must pass through
    isDropping: false,

    execute(bet) {
        if (this.isDropping) return;

        const board = document.getElementById('plinko-display-board');
        const actionBtn = document.getElementById('btn-action');

        this.isDropping = true;
        actionBtn.disabled = true;
        
        displayMessage("Dropping kinetic sphere module... calculating vector deflection paths.");

        let currentPositionIndex = 0; // Initialize at top center index peg position
        let pathHistory = [];

        // Compute the binary choice tracking array (Left or Right deflection at each peg)
        for (let i = 0; i < this.rowCount; i++) {
            const goRight = Math.random() >= 0.5;
            if (goRight) {
                currentPositionIndex++;
            }
            pathHistory.push(currentPositionIndex);
        }

        // Animate the visual cascade through rows sequentially
        this.animateCascade(board, pathHistory, 0, () => {
            // Resolution Callback Triggered once the sphere finishes its trajectory
            this.isDropping = false;
            actionBtn.disabled = false;

            // Pick multiplier mapping based on final position index tracking bounds
            const multiplier = this.pockets[currentPositionIndex];
            const winAmount = Math.floor(bet * multiplier);

            state.lastWin = winAmount;
            state.balance += winAmount;

            let logType = "success";
            let logMsg = `[GRAVITY INTERCEPT] Sphere landed in pocket matrix. Multiplier: ${multiplier.toFixed(2)}x. Payload: +$${winAmount}`;

            if (multiplier < 1) {
                logType = "error";
                logMsg = `[REDUCED SECTOR] Sphere settled on ${multiplier.toFixed(2)}x zone. Capital diminished.`;
            }

            displayMessage(logMsg, logType);
            updateInterface();
        });
    },

    animateCascade(board, path, step, completionCallback) {
        // Clear board out to display only current active frames dynamically
        board.innerHTML = '';

        // Generate the visual representation row layout blocks up to current step position
        for (let r = 0; r <= this.rowCount; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'plinko-animation-row';
            rowDiv.style.display = 'flex';
            rowDiv.style.justifyContent = 'center';
            rowDiv.style.gap = '8px';
            rowDiv.style.margin = '4px 0';

            // Pad spaces out to match row layouts
            for (let c = 0; c <= r; c++) {
                const nodeSpan = document.createElement('span');
                
                if (r === step && c === path[step - 1]) {
                    // Frame match: Render active falling sphere token matrix element
                    nodeSpan.textContent = '🟢';
                    nodeSpan.style.textShadow = '0 0 8px var(--neon-green)';
                } else if (r === this.rowCount) {
                    // Bottom Row: Display target multiplier layout badges
                    nodeSpan.textContent = `${this.pockets[c]}x`;
                    nodeSpan.style.fontSize = '0.62rem';
                    nodeSpan.style.fontFamily = 'monospace';
                    nodeSpan.style.color = 'var(--text-muted)';
                } else {
                    // Standard structural deflection peg mapping point
                    nodeSpan.textContent = '●';
                    nodeSpan.style.color = '#202b3c';
                }

                rowDiv.appendChild(nodeSpan);
            }
            board.appendChild(rowDiv);
        }

        if (step <= this.rowCount) {
            // Recurse animation loop steps using timed intervals for structural frame synchronization
            setTimeout(() => {
                this.animateCascade(board, path, step + 1, completionCallback);
            }, 250);
        } else {
            // Fire callback when terminal depth limits are crossed
            completionCallback();
        }
    }
};

/**
 * GLOBAL WINDOW HOOK EXPORT INTERFACES
 * Interfaces Section 4 main core routing matrix directly to plinko engine memory
 */
window.execute_plinko_engine = function() {
    state.balance -= state.currentBet;
    updateInterface();
    PlinkoEngine.execute(state.currentBet);
};
