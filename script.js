// Game State
let balance = 1000;
let currentBet = 10;
const minBet = 10;
const maxBet = 100;
const betStep = 10;

// Symbol pool and payout configurations
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

// DOM Elements
const balanceDisplay = document.getElementById('balance-display');
const betDisplay = document.getElementById('bet-display');
const winDisplay = document.getElementById('win-display');
const systemMessage = document.getElementById('system-message');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const btnSpin = document.getElementById('btn-spin');
const btnIncreaseBet = document.getElementById('btn-increase-bet');
const btnDecreaseBet = document.getElementById('btn-decrease-bet');

// Event Listeners
btnIncreaseBet.addEventListener('click', () => adjustBet(betStep));
btnDecreaseBet.addEventListener('click', () => adjustBet(-betStep));
btnSpin.addEventListener('click', spinReels);

// Adjust bet logic
function adjustBet(amount) {
    const targetBet = currentBet + amount;
    if (targetBet >= minBet && targetBet <= maxBet) {
        currentBet = targetBet;
        betDisplay.textContent = `$${currentBet}`;
    }
}

// Main Spin Execution Loop
function spinReels() {
    if (balance < currentBet) {
        systemMessage.textContent = "❌ Insufficient Funds! Lower your bet.";
        return;
    }

    // Deduct bet from balance
    balance -= currentBet;
    updateDisplays(0);
    systemMessage.textContent = "🎰 Spinning... Good Luck!";
    
    // Disable controls during spin execution
    toggleControls(true);

    // Apply CSS spinning animations
    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    // Simulate staggered reel stopping sequence
    setTimeout(() => stopReel(reel1), 800);
    setTimeout(() => stopReel(reel2), 1200);
    setTimeout(() => {
        const finalSymbols = stopReel(reel3);
        reel3.classList.remove('spinning'); // Ensure last reel cleans up animation
        evaluateResults(finalSymbols);
    }, 1500);
}

// Stops a reel and assigns a random item
function stopReel(reelElement) {
    reelElement.classList.remove('spinning');
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const chosenSymbol = symbols[randomIndex];
    reelElement.textContent = chosenSymbol;
    return chosenSymbol;
}

// Evaluate Win Logic & Multipliers
function evaluateResults() {
    const s1 = reel1.textContent;
    const s2 = reel2.textContent;
    const s3 = reel3.textContent;
    
    let winnings = 0;

    // Check Win Math
    if (s1 === s2 && s2 === s3) {
        // Jackpots / Three of a kind
        let multiplier = 5;
        if (s1 === '💎') multiplier = 15;
        if (s1 === '7️⃣') multiplier = 30; // Grand Jackpot
        
        winnings = currentBet * multiplier;
        systemMessage.textContent = `🎉 JACKPOT! Three ${s1}'s matched! Won $${winnings}!`;
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // Pair match
        winnings = Math.floor(currentBet * 1.5);
        systemMessage.textContent = `👍 Nice! Two matched symbols. Won $${winnings}!`;
    } else {
        // Loss condition
        systemMessage.textContent = "💸 No match. Try spinning again!";
    }

    // Process payout adjustments
    balance += winnings;
    updateDisplays(winnings);
    toggleControls(false);
}

// Synchronize UI State
function updateDisplays(lastWin) {
    balanceDisplay.textContent = `$${balance}`;
    winDisplay.textContent = `$${lastWin}`;
}

// Helper to block clicks during spinning routines
function toggleControls(isDisabled) {
    btnSpin.disabled = isDisabled;
    btnIncreaseBet.disabled = isDisabled;
    btnDecreaseBet.disabled = isDisabled;
}
