/**
 * CC-v7.0 MODULAR EXTENSION SCRIPT 4
 * Engines Covered: Dice, Wheel
 */

/**
 * MODULE 9: CLASSIC DICE ROLLER ENGINE
 */
const DiceEngine = {
    execute(bet) {
        const choiceInput = document.querySelector('input[name="dice-choice"]:checked');
        const userChoice = choiceInput ? choiceInput.value : 'Over';
        const outputField = document.getElementById('dice-result-output');

        // Generate algorithmic pseudo-random roll between 1 and 100
        const rollResult = Math.floor(Math.random() * 100) + 1;
        outputField.textContent = rollResult;

        let isWin = false;
        
        // High-Low 50 Threshold Matrix Verification
        if (userChoice === 'Over' && rollResult > 50) {
            isWin = true;
        } else if (userChoice === 'Under' && rollResult < 50) {
            isWin = true;
        }

        // Handle structural tie break mapping (Exact 50 is an automatic house absorption)
        if (rollResult === 50) {
            isWin = false;
        }

        const winAmount = isWin ? bet * 1.95 : 0; // 1.95x standard payout multiplier tracking

        return {
            win: Math.floor(winAmount),
            msg: isWin 
                ? `[BOUNDS MATCH] Roll verified at ${rollResult}. Payout: +$${Math.floor(winAmount)}`
                : `Roll settled on ${rollResult}. Allocation target breached calibration limits.`,
            type: isWin ? "success" : "error"
        };
    }
};

/**
 * MODULE 10: MULTI-MULTIPLIER RISK WHEEL ENGINE
 */
const RiskWheelEngine = {
    // Structural Multiplier Map Layout mirroring physical wheel wedges
    sectors: [0.00, 1.50, 0.50, 2.00, 0.00, 1.20, 0.80, 5.00, 0.00, 1.50, 0.20, 3.00],
    isSpinning: false,

    execute(bet) {
        if (this.isSpinning) return { win: 0, holdState: true };

        const spinner = document.getElementById('wheel-spinner-output');
        const actionBtn = document.getElementById('btn-action');
        
        this.isSpinning = true;
        actionBtn.disabled = true;
        
        displayMessage("Commencing kinetic impulse sequence... rotating target core.");

        // Calculate a slice index at random
        const sectorCount = this.sectors.length;
        const targetSectorIndex = Math.floor(Math.random() * sectorCount);
        const sectorDegrees = 360 / sectorCount;

        // Force minimum 4 complete orbital rotations (1440 deg) before alignment index lock
        const finalRotationAngle = 1440 + (targetSectorIndex * sectorDegrees);

        // Apply physical transformation directly to CSS DOM style mapping
        spinner.style.transform = `rotate(${finalRotationAngle}deg)`;

        // Delay core value assignments until CSS transition window completes safely (1.5 seconds)
        setTimeout(() => {
            this.isSpinning = false;
            actionBtn.disabled = false;

            // Reset matrix position back into standard viewport values cleanly for future loops
            spinner.style.transition = 'none';
            spinner.style.transform = `rotate(${targetSectorIndex * sectorDegrees}deg)`;
            
            // Force browser layout repaint before restoring animations
            void spinner.offsetHeight; 
            spinner.style.transition = 'transform 1.5s cubic-bezier(0.1, 0.8, 0.1, 1)';

            const multiplier = this.sectors[targetSectorIndex];
            const winAmount = Math.floor(bet * multiplier);

            state.lastWin = winAmount;
            state.balance += winAmount;

            let logType = "success";
            let logMsg = `[IMPACT COUPLING] Sector locked on ${multiplier.toFixed(2)}x. Payload: +$${winAmount}`;

            if (multiplier === 0) {
                logType = "error";
                logMsg = "Core settled on NULL sector. Investment capital absorbed.";
            } else if (multiplier < 1) {
                logType = "default";
                logMsg = `[PARTIAL DAMAGE RECOVERY] Settled on ${multiplier.toFixed(2)}x. Returned: +$${winAmount}`;
            }

            displayMessage(logMsg, logType);
            updateInterface();

        }, 1500);

        return { win: 0, holdState: true };
    }
};

/**
 * GLOBAL WINDOW HOOK EXPORT INTERFACES
 * Re-routes Section 4 main actions directly into local memory banks
 */
window.execute_dice_engine = function() {
    state.balance -= state.currentBet;
    const result = DiceEngine.execute(state.currentBet);
    state.lastWin = result.win;
    state.balance += result.win;
    displayMessage(result.msg, result.type);
    updateInterface();
};

window.execute_wheel_engine = function() {
    state.balance -= state.currentBet;
    updateInterface();
    RiskWheelEngine.execute(state.currentBet);
};
