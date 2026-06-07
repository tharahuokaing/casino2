/**
 * CC-v7.0 Baccarat Core Execution Engine Module
 */
const BaccaratEngine = {
    suits: ['♠', '♥', '♦', '♣'],
    values: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],

    getCardValue(card) {
        if (['10', 'J', 'Q', 'K'].includes(card.value)) return 0;
        if (card.value === 'A') return 1;
        return parseInt(card.value);
    },

    calculateScore(hand) {
        let total = hand.reduce((sum, card) => sum + this.getCardValue(card), 0);
        return total % 10; // Baccarat modular baseline logic
    },

    drawCard() {
        const value = this.values[Math.floor(Math.random() * this.values.length)];
        const suit = this.suits[Math.floor(Math.random() * this.suits.length)];
        return { value, suit };
    },

    executeRound(selectedBetZone, betAmount) {
        // Step 1: Initialize Hands
        let pHand = [this.drawCard(), this.drawCard()];
        let bHand = [this.drawCard(), this.drawCard()];

        let pScore = this.calculateScore(pHand);
        let bScore = this.calculateScore(bHand);

        // Step 2: Validate Natural Rule Matrix
        if (pScore < 8 && bScore < 8) {
            // Player Drawing Matrix rule set
            let pThirdCard = null;
            if (pScore <= 5) {
                pThirdCard = this.drawCard();
                pHand.push(pThirdCard);
                pScore = this.calculateScore(pHand);
            }

            // Banker Drawing Matrix rule set dependent on Player Action
            if (pThirdCard === null) {
                if (bScore <= 5) {
                    bHand.push(this.drawCard());
                }
            } else {
                let p3Val = this.getCardValue(pThirdCard);
                if (bScore <= 2) bHand.push(this.drawCard());
                else if (bScore === 3 && p3Val !== 8) bHand.push(this.drawCard());
                else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) bHand.push(this.drawCard());
                else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) bHand.push(this.drawCard());
                else if (bScore === 6 && [6, 7].includes(p3Val)) bHand.push(this.drawCard());
            }
            bScore = this.calculateScore(bHand);
        }

        // Step 3: Compute Win Evaluation
        let outcome = 'TIE';
        if (pScore > bScore) outcome = 'PLAYER';
        else if (bScore > pScore) outcome = 'BANKER';

        let winMultiplier = 0;
        if (selectedBetZone === outcome) {
            if (outcome === 'PLAYER') winMultiplier = 2.0;
            else if (outcome === 'BANKER') winMultiplier = 1.95; // 5% Commission math mapping
            else if (outcome === 'TIE') winMultiplier = 9.0;
        }

        return {
            playerHand: pHand,
            bankerHand: bHand,
            playerScore: pScore,
            bankerScore: bScore,
            outcome: outcome,
            payout: betAmount * winMultiplier
        };
    }
};
