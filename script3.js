/**
 * CC-v7.0 MODULAR EXTENSION SCRIPT 3
 * Engines Covered: Baccarat, Video Poker, Blackjack
 */

/**
 * UTILITY: SHARED CYBER DECK ENGINE
 */
const CyberDeck = {
    suits: ['♠', '♥', '♦', '♣'],
    values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    
    generate() {
        let deck = [];
        for (let suit of this.suits) {
            for (let val of this.values) {
                deck.push({ suit, val });
            }
        }
        return this.shuffle(deck);
    },

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    },

    getWeight(card) {
        if (['J', 'Q', 'K'].includes(card.val)) return 10;
        if (card.val === 'A') return 11;
        return parseInt(card.val);
    }
};

/**
 * MODULE 7: BACCARAT ENGINE
 */
const BaccaratEngine = {
    calculateScore(hand) {
        let total = 0;
        for (let card of hand) {
            if (['J', 'Q', 'K', '10'].includes(card.val)) total += 0;
            else if (card.val === 'A') total += 1;
            else total += parseInt(card.val);
        }
        return total % 10; // Modulo 10 alignment baseline
    },

    execute(bet) {
        const sideInput = document.querySelector('input[name="baccarat-side"]:checked');
        const targetSide = sideInput ? sideInput.value : 'Player'; // Default to Player positional vector
        
        const deck = CyberDeck.generate();
        
        // Initial Deal Vectors
        let playerHand = [deck.pop(), deck.pop()];
        let bankerHand = [deck.pop(), deck.pop()];

        let pScore = this.calculateScore(playerHand);
        let bScore = this.calculateScore(bankerHand);

        // Standard Third Card Drawing Matrix Protocols
        if (pScore < 6 && bScore < 8) {
            const pThird = deck.pop();
            playerHand.push(pThird);
            pScore = this.calculateScore(playerHand);

            const pThirdVal = BaccaratEngine.calculateScore([pThird]);
            if (
                bScore <= 2 ||
                (bScore === 3 && pThirdVal !== 8) ||
                (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(pThirdVal)) ||
                (bScore === 5 && [4, 5, 6, 7].includes(pThirdVal)) ||
                (bScore === 6 && [6, 7].includes(pThirdVal))
            ) {
                bankerHand.push(deck.pop());
                bScore = this.calculateScore(bankerHand);
            }
        } else if (bScore < 6 && pScore >= 6) {
            bankerHand.push(deck.pop());
            bScore = this.calculateScore(bankerHand);
        }

        // Visual Node Layout Updates
        document.getElementById('baccarat-player-cards').textContent = playerHand.map(c => `${c.val}${c.suit}`).join(' ');
        document.getElementById('baccarat-banker-cards').textContent = bankerHand.map(c => `${c.val}${c.suit}`).join(' ');
        document.getElementById('baccarat-score-display').textContent = `P: ${pScore} | B: ${bScore}`;

        let winner = 'Tie';
        if (pScore > bScore) winner = 'Player';
        else if (bScore > pScore) winner = 'Banker';

        let multiplier = 0;
        if (targetSide === winner) {
            if (winner === 'Tie') multiplier = 8;
            else if (winner === 'Banker') multiplier = 1.95; // 5% house juice execution deduction
            else multiplier = 2;
        }

        const winAmount = Math.floor(bet * multiplier);
        return {
            win: winAmount,
            msg: multiplier > 0 
                ? `[SECTOR MATCH] Position ${winner.toUpperCase()} verified dominant. Payout: +$${winAmount}` 
                : `Matrix resolved on ${winner.toUpperCase()}. Selection array dropped execution.`,
            type: multiplier > 0 ? "success" : "error"
        };
    }
};

/**
 * MODULE 8: VIDEO POKER ENGINE
 */
const VideoPokerEngine = {
    deck: [],
    hand: [],
    heldIndices: new Set(),
    isRunning: false,

    initializeRound() {
        this.deck = CyberDeck.generate();
        this.hand = [this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop()];
        this.heldIndices.clear();
        this.isRunning = true;

        this.renderInterface();
        document.getElementById('btn-action').disabled = true;
        document.getElementById('btn-poker-draw').classList.remove('hidden');
        displayMessage("Cards loaded into active storage. Choose nodes to lock/hold, then execute Draw.");
    },

    renderInterface() {
        const container = document.getElementById('poker-cards-container');
        container.innerHTML = '';

        this.hand.forEach((card, index) => {
            const cardNode = document.createElement('div');
            cardNode.className = `poker-card ${this.heldIndices.has(index) ? 'held-lock' : ''}`;
            cardNode.innerHTML = `${card.val}<br>${card.suit}`;
            
            // Set element visual color based on suit arrays
            if (['♥', '♦'].includes(card.suit)) cardNode.style.color = '#ff3366';
            else cardNode.style.color = 'var(--cyber-blue)';

            cardNode.addEventListener('click', () => {
                if (!this.isRunning) return;
                if (this.heldIndices.has(index)) this.heldIndices.delete(index);
                else this.heldIndices.add(index);
                this.renderInterface();
            });

            container.appendChild(cardNode);
        });
    },

    executeDraw() {
        if (!this.isRunning) return;
        this.isRunning = false;

        // Repopulate non-locked hardware sectors
        for (let i = 0; i < 5; i++) {
            if (!this.heldIndices.has(i)) {
                this.hand[i] = this.deck.pop();
            }
        }

        this.renderInterface();
        document.getElementById('btn-poker-draw').classList.add('hidden');
        document.getElementById('btn-action').disabled = false;

        const evaluation = this.evaluateHand();
        const payout = Math.floor(state.currentBet * evaluation.mult);
        
        state.lastWin = payout;
        state.balance += payout;

        displayMessage(`[EVALUATION RECOGNIZED] Rank: ${evaluation.rank}. Gain: +$${payout}`, evaluation.mult > 0 ? "success" : "error");
        updateInterface();
    },

    evaluateHand() {
        // Quick ranking lookups for standard payout loops
        const counts = {};
        const suits = {};
        this.hand.forEach(c => {
            counts[c.val] = (counts[c.val] || 0) + 1;
            suits[c.suit] = (suits[c.suit] || 0) + 1;
        });

        const countsArr = Object.values(counts).sort((a, b) => b - a);
        const isFlush = Object.keys(suits).length === 1;

        if (countsArr[0] === 4) return { rank: "FOUR OF A KIND", mult: 25 };
        if (countsArr[0] === 3 && countsArr[1] === 2) return { rank: "FULL HOUSE", mult: 9 };
        if (isFlush) return { rank: "FLUSH RUN", mult: 6 };
        if (countsArr[0] === 3) return { rank: "THREE OF A KIND", mult: 3 };
        if (countsArr[0] === 2 && countsArr[1] === 2) return { rank: "TWO PAIRS", mult: 2 };
        if (countsArr[0] === 2 && Object.keys(counts).find(k => counts[k] === 2 && ['J', 'Q', 'K', 'A'].includes(k))) {
            return { rank: "JACKS OR BETTER", mult: 1 };
        }

        return { rank: "HIGH CARD TRASH VECTOR", mult: 0 };
    }
};

document.getElementById('btn-poker-draw').addEventListener('click', () => {
    VideoPokerEngine.executeDraw();
});

/**
 * MODULE 9: BLACKJACK ENGINE (CLASSIC 21)
 */
const BlackjackEngine = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    isRunning: false,

    getScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            let weight = CyberDeck.getWeight(card);
            if (weight === 11) aces++;
            score += weight;
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    },

    initializeRound() {
        this.deck = CyberDeck.generate();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        this.isRunning = true;

        document.getElementById('btn-action').disabled = true;
        document.getElementById('btn-bj-hit').classList.remove('hidden');
        document.getElementById('btn-bj-stand').classList.remove('hidden');

        this.renderInterface(false);
        displayMessage("Splitting structural assets. Hit or Stand to finalize tactical position.");

        if (this.getScore(this.playerHand) === 21) {
            this.executeStand(); // Structural Natural 21 bypass
        }
    },

    renderInterface(exposeDealer) {
        const pContainer = document.getElementById('bj-player-cards');
        const dContainer = document.getElementById('bj-dealer-cards');

        pContainer.textContent = this.playerHand.map(c => `${c.val}${c.suit}`).join(' ');
        
        if (exposeDealer) {
            dContainer.textContent = this.dealerHand.map(c => `${c.val}${c.suit}`).join(' ');
            document.getElementById('bj-score-display').textContent = `P: ${this.getScore(this.playerHand)} | D: ${this.getScore(this.dealerHand)}`;
        } else {
            dContainer.textContent = `${this.dealerHand[0].val}${this.dealerHand[0].suit} [??]`;
            document.getElementById('bj-score-display').textContent = `P: ${this.getScore(this.playerHand)} | D: ??`;
        }
    },

    executeHit() {
        if (!this.isRunning) return;
        this.playerHand.push(this.deck.pop());
        this.renderInterface(false);

        if (this.getScore(this.playerHand) > 21) {
            this.resolveRound("Bust");
        }
    },

    executeStand() {
        if (!this.isRunning) return;

        // Dealer standard AI logic matrix tracking loop
        let dScore = this.getScore(this.dealerHand);
        while (dScore < 17) {
            this.dealerHand.push(this.deck.pop());
            dScore = this.getScore(this.dealerHand);
        }

        const pScore = this.getScore(this.playerHand);

        if (dScore > 21) this.resolveRound("DealerBust");
        else if (pScore > dScore) this.resolveRound("Win");
        else if (dScore > pScore) this.resolveRound("Loss");
        else this.resolveRound("Push");
    },

    resolveRound(outcome) {
        this.isRunning = false;
        this.renderInterface(true);

        document.getElementById('btn-bj-hit').classList.add('hidden');
        document.getElementById('btn-bj-stand').classList.add('hidden');
        document.getElementById('btn-action').disabled = false;

        let multiplier = 0;
        let message = "";
        let type = "error";

        switch (outcome) {
            case "Win":
                multiplier = 2;
                message = "[TACTICAL VICTORY] Dealer defenses breached.";
                type = "success";
                break;
            case "DealerBust":
                multiplier = 2;
                message = "[SYSTEM EXPLOSION] Dealer hardware cracked past 21 bounds.";
                type = "success";
                break;
            case "Push":
                multiplier = 1;
                message = "[SYNC TRACE LOCK] Hand structural values draw.";
                type = "default";
                break;
            case "Bust":
                message = "Terminal overload. Operations exceeded 21 load parameters.";
                break;
            case "Loss":
                message = "Dealer computation outmatched tracking vectors.";
                break;
        }

        const payout = Math.floor(state.currentBet * multiplier);
        state.lastWin = payout;
        state.balance += payout;

        displayMessage(`${message} Gained: +$${payout}`, type);
        updateInterface();
    }
};

document.getElementById('btn-bj-hit').addEventListener('click', () => BlackjackEngine.executeHit());
document.getElementById('btn-bj-stand').addEventListener('click', () => BlackjackEngine.executeStand());

/**
 * GLOBAL WINDOW HOOK EXPORT INTERFACES
 */
window.execute_baccarat_engine = function() {
    state.balance -= state.currentBet;
    const result = BaccaratEngine.execute(state.currentBet);
    state.lastWin = result.win;
    state.balance += result.win;
    displayMessage(result.msg, result.type);
    updateInterface();
};

window.execute_poker_engine = function() {
    if (!VideoPokerEngine.isRunning) {
        state.balance -= state.currentBet;
        updateInterface();
        VideoPokerEngine.initializeRound();
    }
};

window.execute_blackjack_engine = function() {
    if (!BlackjackEngine.isRunning) {
        state.balance -= state.currentBet;
        updateInterface();
        BlackjackEngine.initializeRound();
    }
};
