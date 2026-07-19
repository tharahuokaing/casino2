/**
 * MODULE 15: LIVE CASINO BACCARAT ENGINE
 * Handles rule evaluation, chip selection, live deck dealing vectors, 
 * and dynamic state synchronization back to the user balance architecture.
 */
(function() {
    // 1. Core State Vectors
    let currentSelectedChip = 10;
    let isRoundActive = false;
    
    // UI Elements Selector Cache
    const elPlayerCards = document.getElementById('live-player-cards');
    const elBankerCards = document.getElementById('live-banker-cards');
    const elPlayerTotal = document.getElementById('live-player-total');
    const elBankerTotal = document.getElementById('live-banker-total');
    const elBalanceDisplay = document.getElementById('balance-display');
    const elStatusBadgeText = document.querySelector('.stream-status-badge .telemetry-txt');
    
    // 2. Event Listeners Initialization
    document.addEventListener('DOMContentLoaded', () => {
        initChipListeners();
        initGameLoopTriggers();
    });

    /**
     * Intercepts chip selections and updates token states
     */
    function initChipListeners() {
        const chipRadios = document.querySelectorAll('input[name="selected-chip-value"]');
        chipRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentSelectedChip = parseInt(e.target.value, 10);
                console.log(`[BACCARAT CORE] Token Selector Mutation: ${currentSelectedChip} units armed.`);
            });
        });
    }

    /**
     * Installs action interception on the betting matrix labels
     */
    function initGameLoopTriggers() {
        const betZones = document.querySelectorAll('.real-baccarat-board .bet-zone-btn');
        betZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                const targetInputId = zone.getAttribute('for');
                const inputElement = document.getElementById(targetInputId);
                
                if (inputElement && !isRoundActive) {
                    const selectedBetType = inputElement.value; // Player, Tie, or Banker
                    executeBaccaratRound(selectedBetType);
                }
            });
        });
    }

    // 3. Mathematical Rule & Evaluation Engine
    function getCardValue(card) {
        if (['J', 'Q', 'K', '10'].includes(card.value)) return 0;
        if (card.value === 'A') return 1;
        return parseInt(card.value, 10);
    }

    function calculateHandScore(hand) {
        const sum = hand.reduce((acc, card) => acc + getCardValue(card), 0);
        return sum % 10; // Baccarat scoring removes the tens digit
    }

    function drawRandomCard() {
        const suits = ['♣', '♠', '♥', '♦'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return {
            suit: suits[Math.floor(Math.random() * suits.length)],
            value: values[Math.floor(Math.random() * values.length)]
        };
    }

    // 4. Core Game Execution & State Synchronization Flow
    async function executeBaccaratRound(betPlacedOn) {
        isRoundActive = true;
        updateStatusTelemetry("DEALER VALERIA: MIXING SHOE ARRAY...");

        // Deduct balance before dealing sequence begins
        let userBalance = parseFloat(elBalanceDisplay?.textContent || '0');
        if (userBalance < currentSelectedChip) {
            updateStatusTelemetry("SYSTEM ERROR: INSUFFICIENT BALANCE FOR TRACK");
            isRoundActive = false;
            return;
        }
        
        userBalance -= currentSelectedChip;
        if (elBalanceDisplay) elBalanceDisplay.textContent = userBalance.toFixed(2);

        // Clear previous card rendering layout pipelines
        elPlayerCards.innerHTML = '';
        elBankerCards.innerHTML = '';
        elPlayerTotal.textContent = '0';
        elBankerTotal.textContent = '0';

        // Stage 1: Initial Deal (2 Cards Each)
        let playerHand = [drawRandomCard(), drawRandomCard()];
        let bankerHand = [drawRandomCard(), drawRandomCard()];

        // Async render delays mimicking physical distribution times
        await delaySequence(600);
        renderHand(playerHand, elPlayerCards, elPlayerTotal);
        await delaySequence(600);
        renderHand(bankerHand, elBankerCards, elBankerTotal);

        let pScore = calculateHandScore(playerHand);
        let bScore = calculateHandScore(bankerHand);

        // Evaluate Baccarat Rules Matrix
        const isNatural = pScore >= 8 || bScore >= 8;

        if (!isNatural) {
            let playerDrewThird = false;
            let thirdCardValue = -1;

            // Player Third Card Rule
            if (pScore <= 5) {
                await delaySequence(600);
                const newCard = drawRandomCard();
                playerHand.push(newCard);
                playerDrewThird = true;
                thirdCardValue = getCardValue(newCard);
                renderHand(playerHand, elPlayerCards, elPlayerTotal);
                pScore = calculateHandScore(playerHand);
            }

            // Banker Third Card Rule Matrix Logic
            let bankerDraws = false;
            if (!playerDrewThird) {
                if (bScore <= 5) bankerDraws = true;
            } else {
                // Evaluates Banker decision based on Player's pulled card index value
                if (bScore <= 2) bankerDraws = true;
                else if (bScore === 3 && thirdCardValue !== 8) bankerDraws = true;
                else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(thirdCardValue)) bankerDraws = true;
                else if (bScore === 5 && [4, 5, 6, 7].includes(thirdCardValue)) bankerDraws = true;
                else if (bScore === 6 && [6, 7].includes(thirdCardValue)) bankerDraws = true;
            }

            if (bankerDraws) {
                await delaySequence(600);
                bankerHand.push(drawRandomCard());
                renderHand(bankerHand, elBankerCards, elBankerTotal);
                bScore = calculateHandScore(bankerHand);
            }
        }

        // Determine Game Output Matrix
        let roundOutcome = 'Tie';
        if (pScore > bScore) roundOutcome = 'Player';
        else if (bScore > pScore) roundOutcome = 'Banker';

        // 5. Payout Calculation & Final State Resolution
        let winMultiplier = 0;
        if (betPlacedOn === roundOutcome) {
            if (roundOutcome === 'Player') winMultiplier = 2;       // 1:1 payout + original bet returned
            else if (roundOutcome === 'Banker') winMultiplier = 1.95; // 0.95:1 payout + original bet returned
            else if (roundOutcome === 'Tie') winMultiplier = 9;         // 8:1 payout + original bet returned
        }

        const totalWon = currentSelectedChip * winMultiplier;
        userBalance += totalWon;

        // Commit balance changes to interface memory loops
        await delaySequence(400);
        if (elBalanceDisplay) elBalanceDisplay.textContent = userBalance.toFixed(2);
        
        // Final Status Display Updates
        if (totalWon > 0) {
            updateStatusTelemetry(`ROUND COMPLETE // MATCHED: ${roundOutcome.toUpperCase()} // +${totalWon.toFixed(2)} CREDITS`);
        } else {
            updateStatusTelemetry(`ROUND COMPLETE // MATCHED: ${roundOutcome.toUpperCase()} // AT REST`);
        }

        isRoundActive = false;
    }

    // 6. UI Generation Render Pipelines
    function renderHand(handArray, containerElement, totalElement) {
        containerElement.innerHTML = '';
        handArray.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'mini-card-face';
            cardDiv.textContent = `${card.suit} ${card.value}`;
            
            // Text color logic for standard red suits
            if (['♥', '♦'].includes(card.suit)) {
                cardDiv.style.color = 'var(--alert-red)';
            }
            containerElement.appendChild(cardDiv);
        });
        totalElement.textContent = calculateHandScore(handArray);
    }

    function updateStatusTelemetry(messageString) {
        if (elStatusBadgeText) {
            elStatusBadgeText.textContent = messageString;
        }
    }

    function delaySequence(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
