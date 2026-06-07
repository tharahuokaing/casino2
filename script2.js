/**
 * CC-v7.0 MODULAR EXTENSION SCRIPT 2
 * Engines Covered: Roulette, Rock Paper Scissors, Mines
 */

/**
 * MODULE 4: ROULETTE ENGINE
 */
const RouletteEngine = {
    execute(bet) {
        const targetInput = document.getElementById('roulette-target-input');
        const ballOutput = document.getElementById('roulette-ball-output');
        
        let userTarget = parseInt(targetInput.value);
        
        // Sanitize boundary limits
        if (isNaN(userTarget) || userTarget < 0 || userTarget > 36) {
            userTarget = 7;
            targetInput.value = 7;
        }

        // Simulate standard physical wheel array (0-36)
        const winningNumber = Math.floor(Math.random() * 37);
        ballOutput.textContent = winningNumber < 10 ? `0${winningNumber}` : winningNumber;

        // Visual frame color assignment based on wheel matrix properties
        if (winningNumber === 0) {
            ballOutput.style.color = 'var(--neon-green)';
        } else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(winningNumber)) {
            ballOutput.style.color = '#ff3366'; // Red
        } else {
            ballOutput.style.color = 'var(--cyber-blue)'; // Black
        }

        const isWin = userTarget === winningNumber;
        const winAmount = isWin ? bet * 35 : 0; // Standard single-number payout layout

        return {
            win: winAmount,
            msg: isWin 
                ? `[VECTOR LOCK] Sector ${winningNumber} intercepted perfectly. Payout: +$${winAmount}`
                : `Wheel settled on Sector ${winningNumber}. Targeting vector missed.`,
            type: isWin ? "success" : "error"
        };
    }
};

/**
 * MODULE 5: ROCK PAPER SCISSORS (RPS) ENGINE
 */
const RPSEngine = {
    choices: ['Rock', 'Paper', 'Scissors'],
    nodes: { 'Rock': '✊', 'Paper': '🫱', 'Scissors': '✌️' },

    execute(bet) {
        const playerChoice = document.querySelector('input[name="rps-choice"]:checked').value;
        const computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];

        // Update interface graphics nodes
        document.getElementById('rps-player-node').textContent = this.nodes[playerChoice];
        document.getElementById('rps-computer-node').textContent = this.nodes[computerChoice];

        let multiplier = 0;
        let logMsg = "";
        let logType = "error";

        if (playerChoice === computerChoice) {
            multiplier = 1; // Stake recovery on draw condition
            logMsg = `[SYNC STALEMATE] Both matrices selected ${playerChoice.toUpperCase()}. Stake recovered.`;
            logType = "default";
        } else if (
            (playerChoice === 'Rock' && computerChoice === 'Scissors') ||
            (playerChoice === 'Paper' && computerChoice === 'Rock') ||
            (playerChoice === 'Scissors' && computerChoice === 'Paper')
        ) {
            multiplier = 2;
            logMsg = `[COMBAT OVERRIDE] ${playerChoice.toUpperCase()} breaks ${computerChoice.toUpperCase()}. Payout: +$${bet * multiplier}`;
            logType = "success";
        } else {
            multiplier = 0;
            logMsg = `[SYSTEM OVERRIDE] ${computerChoice.toUpperCase()} neutralized ${playerChoice.toUpperCase()}. Matrix lost.`;
        }

        return {
            win: bet * multiplier,
            msg: logMsg,
            type: logType
        };
    }
};

/**
 * MODULE 6: MINES GRID ENGINE (TACTICAL SPACE)
 */
const MinesEngine = {
    gridSize: 9, // 3x3 array architecture
    mineCount: 2,
    boardState: [],
    revealedCount: 0,
    activeMultiplier: 1.00,
    isRunning: false,

    initializeBoard() {
        this.boardState = Array(this.gridSize).fill({ isMine: false, revealed: false });
        this.revealedCount = 0;
        this.activeMultiplier = 1.00;
        this.isRunning = true;

        // Randomize sub-surface explosive layouts
        let assignedMines = 0;
        while (assignedMines < this.mineCount) {
            const index = Math.floor(Math.random() * this.gridSize);
            if (!this.boardState[index].isMine) {
                this.boardState[index] = { isMine: true, revealed: false };
                assignedMines++;
            }
        }

        this.renderBoard();
        document.getElementById('btn-mines-cashout').classList.remove('hidden');
        document.getElementById('btn-action').disabled = true;
        displayMessage("Tactical grid armed. Select a sector to decrypt layout bounds.");
    },

    renderBoard() {
        const board = document.getElementById('mines-board');
        board.innerHTML = '';

        for (let i = 0; i < this.gridSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'mine-tile';
            tile.textContent = '■';
            tile.addEventListener('click', () => this.handleTileClick(i));
            board.appendChild(tile);
        }
    },

    handleTileClick(index) {
        if (!this.isRunning || this.boardState[index].revealed) return;

        const board = document.getElementById('mines-board');
        const tile = board.children[index];

        if (this.boardState[index].isMine) {
            // Detonation Vector Hit
            this.triggerDetonation();
        } else {
            // Secure Cell Clear
            this.boardState[index] = { isMine: false, revealed: true };
            this.revealedCount++;
            
            // Increment compounding multiplier risk step
            this.activeMultiplier += 0.35 * this.revealedCount;
            
            tile.textContent = '💎';
            tile.classList.add('revealed-safe');
            tile.style.color = 'var(--neon-green)';

            displayMessage(`Sector secure. Current exit extraction coefficient: ${this.activeMultiplier.toFixed(2)}x`);

            // Check if all safe zones are fully mapped out
            if (this.revealedCount === this.gridSize - this.mineCount) {
                this.cashout();
            }
        }
    },

    triggerDetonation() {
        this.isRunning = false;
        clearInterval(this.intervalId);

        const board = document.getElementById('mines-board');
        const cashoutBtn = document.getElementById('btn-mines-cashout');
        const actionBtn = document.getElementById('btn-action');

        // Force global asset exposure display
        for (let i = 0; i < this.gridSize; i++) {
            const tile = board.children[i];
            if (this.boardState[i].isMine) {
                tile.textContent = '💥';
                tile.style.color = '#ff3366';
                tile.style.borderColor = '#ff3366';
            }
        }

        cashoutBtn.classList.add('hidden');
        actionBtn.disabled = false;
        
        displayMessage("GRID EXPLOSION OVERLOAD. Scanning core fried.", "error");
        
        state.lastWin = 0;
        updateInterface();
    },

    cashout() {
        if (!this.isRunning) return;
        this.isRunning = false;

        const cashoutBtn = document.getElementById('btn-mines-cashout');
        const actionBtn = document.getElementById('btn-action');

        cashoutBtn.classList.add('hidden');
        actionBtn.disabled = false;

        const payout = Math.floor(state.currentBet * this.activeMultiplier);
        
        state.lastWin = payout;
        state.balance += payout;

        displayMessage(`[EXTRACTION COMPLETED] Decryption tracks extracted safely. Capital gained: +$${payout}`, "success");
        updateInterface();
        this.renderBlankState();
    },

    renderBlankState() {
        document.getElementById('mines-board').innerHTML = '';
    }
};

// Bind extraction control UI elements directly to component logic
document.getElementById('btn-mines-cashout').addEventListener('click', () => {
    MinesEngine.cashout();
});

/**
 * GLOBAL WINDOW HOOK EXPORT INTERFACES
 * Maps structural integration directly to Section 4 core routers
 */
window.execute_roulette_engine = function() {
    state.balance -= state.currentBet;
    const result = RouletteEngine.execute(state.currentBet);
    state.lastWin = result.win;
    state.balance += result.win;
    displayMessage(result.msg, result.type);
    updateInterface();
};

window.execute_rps_engine = function() {
    state.balance -= state.currentBet;
    const result = RPSEngine.execute(state.currentBet);
    state.lastWin = result.win;
    state.balance += result.win;
    displayMessage(result.msg, result.type);
    updateInterface();
};

window.execute_mines_engine = function() {
    if (!MinesEngine.isRunning) {
        state.balance -= state.currentBet;
        updateInterface();
        MinesEngine.initializeBoard();
    }
};
