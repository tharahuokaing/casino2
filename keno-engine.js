/**
 * MODULE 13: CYBER-KENO MATRIX ENGINE
 * Manages matrix state array mapping, random node coordinate draws,
 * payout calculation tables, and real-time wallet mutations.
 */
(function() {
    // 1. Core Config & Telemetry State
    const MAX_SELECTIONS = 5;
    const STAKE_COST = 10.00; // Base stake amount per sweep configuration
    
    // Paytable mapping based on hits for 5 selected nodes
    const PAYOUT_MULTIPLIERS = {
        0: 0,
        1: 2,
        2: 5,
        3: 15,
        4: 50,
        5: 150
    };

    let selectedNodes = [];
    let isDrawing = false;

    // UI Cache Registry
    const elMatrixGrid = document.querySelector('.keno-matrix-grid');
    const elStatusLabel = document.getElementById('keno-selection-status');
    const elBtnClear = document.getElementById('btn-keno-clear');
    const elBalanceDisplay = document.getElementById('balance-display');

    document.addEventListener('DOMContentLoaded', () => {
        initMatrixInteraction();
        initControlTriggers();
    });

    /**
     * Installs event capture loops onto individual node grid points
     */
    function initMatrixInteraction() {
        if (!elMatrixGrid) return;

        elMatrixGrid.addEventListener('click', (e) => {
            const node = e.target.closest('.keno-node');
            if (!node || isDrawing) return;

            const value = parseInt(node.getAttribute('data-value'), 10);

            if (selectedNodes.includes(value)) {
                // Deselect point
                selectedNodes = selectedNodes.filter(val => val !== value);
                node.classList.remove('armed-target');
            } else {
                // Enforce selection max cap threshold limits
                if (selectedNodes.length >= MAX_SELECTIONS) {
                    updateStatusHUD("CAP REACHED: DE-ARM A NODE FIRST");
                    return;
                }
                selectedNodes.push(value);
                node.classList.add('armed-target');
            }

            updateSelectionHUD();
        });
    }

    /**
     * Initializes hardware wipe array button listeners and setup sweep triggers
     */
    function initControlTriggers() {
        if (elBtnClear) {
            elBtnClear.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering unexpected grid events
                if (isDrawing) return;
                resetMatrixGrid();
                updateSelectionHUD();
            });
        }

        // Use the status bar header zone as the active execution terminal prompt
        const headerTrigger = document.querySelector('#keno-arena .audio-track-info');
        if (headerTrigger) {
            headerTrigger.style.cursor = 'pointer';
            headerTrigger.addEventListener('click', () => {
                if (!isDrawing && selectedNodes.length === MAX_SELECTIONS) {
                    executeKenoSweep();
                }
            });
        }
    }

    /**
     * Core Game Execution Pipeline Loop
     */
    async function executeKenoSweep() {
        isDrawing = true;
        updateStatusHUD("INITIATING DRAW SEQUENCE... PURGING PAST ARRAYS");

        // Validate state wallet values
        let walletBalance = parseFloat(elBalanceDisplay?.textContent || '0');
        if (walletBalance < STAKE_COST) {
            updateStatusHUD("TERMINAL ERROR: INSUFFICIENT DATA BALANCE");
            isDrawing = false;
            return;
        }

        // Deduct baseline operational credits
        walletBalance -= STAKE_COST;
        if (elBalanceDisplay) elBalanceDisplay.textContent = walletBalance.toFixed(2);

        // Clear layout state modifiers (preserve target selections)
        const allNodes = document.querySelectorAll('.keno-node');
        allNodes.forEach(n => n.classList.remove('locked-hit', 'draw-miss'));

        // Algorithmic Draw Generation (Draw 5 random distinct values out of 20)
        let drawPool = [];
        while (drawPool.length < 5) {
            let roll = Math.floor(Math.random() * 20) + 1;
            if (!drawPool.includes(roll)) {
                drawPool.push(roll);
            }
        }

        // Async progressive render sweep matching typical display lag profiles
        let matchingHitsCount = 0;
        for (let i = 0; i < drawPool.length; i++) {
            await delay(400);
            const drawnValue = drawPool[i];
            const matchingNode = document.querySelector(`.keno-node[data-value="${drawnValue}"]`);

            if (matchingNode) {
                if (selectedNodes.includes(drawnValue)) {
                    matchingNode.classList.add('locked-hit');
                    matchingHitsCount++;
                } else {
                    matchingNode.classList.add('draw-miss');
                }
            }
        }

        // Payout Calculations
        const multiplier = PAYOUT_MULTIPLIERS[matchingHitsCount] || 0;
        const prizeCredits = STAKE_COST * multiplier;
        
        walletBalance += prizeCredits;

        await delay(300);
        if (elBalanceDisplay) elBalanceDisplay.textContent = walletBalance.toFixed(2);

        // Print final analytics summaries to overlay panel fields
        if (prizeCredits > 0) {
            updateStatusHUD(`SWEEP COMPLETE // HITS: ${matchingHitsCount}/${MAX_SELECTIONS} // MATCH FOUND (+${prizeCredits.toFixed(2)})`);
        } else {
            updateStatusHUD(`SWEEP COMPLETE // HITS: ${matchingHitsCount}/${MAX_SELECTIONS} // ARRAY EVADED`);
        }

        isDrawing = false;
    }

    /**
     * Restores the matrix grid UI components to pristine defaults
     */
    function resetMatrixGrid() {
        selectedNodes = [];
        const allNodes = document.querySelectorAll('.keno-node');
        allNodes.forEach(n => {
            n.className = 'keno-node';
        });
    }

    function updateSelectionHUD() {
        updateStatusHUD(`MATRIX INITIALIZED // ${selectedNodes.length} / ${MAX_SELECTIONS} NODES ARMED`);
        
        // Highlight click prompt indicator if ready to process execution commands
        if (selectedNodes.length === MAX_SELECTIONS) {
            updateStatusHUD(`ALL NODES LOCKED // CLICK HERE TO INITIALIZE SWEEP`);
        }
    }

    function updateStatusHUD(msg) {
        if (elStatusLabel) elStatusLabel.textContent = msg.toUpperCase();
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
