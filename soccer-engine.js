/**
 * MODULE 12: SOCCER SIMULATION & WORLD CUP TELEMETRY ENGINE
 * Automates real-time game ticking simulations, monitors user match predictions,
 * and passes win calculations back to the master balance display array.
 */
(function() {
    // 1. Core Config & Multipliers Manifest
    const STAKE_AMOUNT = 10.00; // Fixed bet stake per simulation execution
    const ODDS = {
        Home: 1.90,
        Draw: 3.40,
        Away: 2.10
    };

    let isMatchSimulating = false;
    let matchTimer = null;

    // Cache Telemetry Viewport Nodes
    const elScoreHome = document.getElementById('football-score-home');
    const elScoreAway = document.getElementById('football-score-away');
    const elStatusLabel = document.querySelector('#football-arena .pulse-label');
    const elBalanceDisplay = document.getElementById('balance-display');

    document.addEventListener('DOMContentLoaded', () => {
        initSimulationTriggers();
    });

    /**
     * Mounts action monitors onto the interactive selection nodes
     */
    function initSimulationTriggers() {
        const betLabels = document.querySelectorAll('.football-bet-zones .bet-zone-btn');
        betLabels.forEach(label => {
            label.addEventListener('click', () => {
                const targetRadioId = label.getAttribute('for');
                const radioInput = document.getElementById(targetRadioId);
                
                if (radioInput && !isMatchSimulating) {
                    // Slight delay allows the native radio check change event to trigger first
                    setTimeout(() => {
                        const predictedWinner = radioInput.value; // Home, Draw, or Away
                        startSoccerSimulation(predictedWinner);
                    }, 50);
                }
            });
        });
    }

    /**
     * Initializes match timers and runs live data simulations
     */
    async function startSoccerSimulation(userPrediction) {
        isMatchSimulating = true;
        
        // 1. Balance verification checks
        let balance = parseFloat(elBalanceDisplay?.textContent || '0');
        if (balance < STAKE_AMOUNT) {
            updateTelemetryStatus("ERROR: INSIDE BALANCE STORAGE IS LOWER THAN STAKE COST");
            isMatchSimulating = false;
            return;
        }

        // Deduct allocation costs immediately
        balance -= STAKE_AMOUNT;
        if (elBalanceDisplay) elBalanceDisplay.textContent = balance.toFixed(2);

        // Reset display vectors
        let currentHomeScore = 0;
        let currentAwayScore = 0;
        if (elScoreHome) elScoreHome.textContent = '0';
        if (elScoreAway) elScoreAway.textContent = '0';

        // 2. Simulated Multi-Stage Match Loop
        // We will loop through 3 distinct tactical action windows per game
        const totalGamePeriods = 3;
        
        for (let period = 1; period <= totalGamePeriods; period++) {
            updateTelemetryStatus(`MATCH IN PROGRESS // PHASE ${period}/${totalGamePeriods} RUNNING`);
            await matchDelay(1200);

            // Algorithmic chance weight generators to trigger match scoring matrices
            const scoringRoll = Math.random();
            
            if (scoringRoll < 0.35) {
                // Home team penetrates defense line
                currentHomeScore++;
                if (elScoreHome) elScoreHome.textContent = currentHomeScore;
                flashScoreDisplay(elScoreHome);
            } else if (scoringRoll < 0.70) {
                // Away team coordinates counter-offensive score
                currentAwayScore++;
                if (elScoreAway) elScoreAway.textContent = currentAwayScore;
                flashScoreDisplay(elScoreAway);
            }
            // Residual bounds simulate defensive stand-offs (no score change)
        }

        // 3. Output Vector Validation Calculations
        let finalOutcome = 'Draw';
        if (currentHomeScore > currentAwayScore) finalOutcome = 'Home';
        else if (currentAwayScore > currentHomeScore) finalOutcome = 'Away';

        // Evaluate payout balance factors
        let creditsWon = 0;
        if (userPrediction === finalOutcome) {
            const currentOdds = ODDS[finalOutcome];
            creditsWon = STAKE_AMOUNT * currentOdds;
            balance += creditsWon;
            
            if (elBalanceDisplay) elBalanceDisplay.textContent = balance.toFixed(2);
            updateTelemetryStatus(`SIM COMPLETE // RESULT: ${finalOutcome.toUpperCase()} // +${creditsWon.toFixed(2)} CR`);
        } else {
            updateTelemetryStatus(`SIM COMPLETE // RESULT: ${finalOutcome.toUpperCase()} // PREDICTION VOID`);
        }

        isMatchSimulating = false;
    }

    /**
     * Utility helpers handling display and async delays
     */
    function updateTelemetryStatus(message) {
        if (elStatusLabel) {
            elStatusLabel.textContent = message.toUpperCase();
        }
    }

    function flashScoreDisplay(element) {
        if (!element) return;
        element.style.color = 'var(--cyber-blue)';
        setTimeout(() => {
            element.style.color = 'var(--text-light)';
        }, 200);
    }

    function matchDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
