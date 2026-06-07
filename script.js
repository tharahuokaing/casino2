// --- Game State Infrastructure ---
let balance = 1000;
let currentBet = 10;
const minBet = 10;
const maxBet = 100;
const betStep = 10;
let activeGame = 'slots';

// Loop tracking variables for specific games
let crashInterval = null;
let crashMultiplier = 1.00;
let crashPoint = 0;
let isCrashActive = false;

// Configuration Asset Array pools
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

// --- Element Extraction Mapping ---
const balanceDisplay = document.getElementById('balance-display');
const betDisplay = document.getElementById('bet-display');
const winDisplay = document.getElementById('win-display');
const systemMessage = document.getElementById('system-message');
const btnAction = document.getElementById('btn-action');
const btnIncreaseBet = document.getElementById('btn-increase-bet');
const btnDecreaseBet = document.getElementById('btn-decrease-bet');

// Navigation Interface Extraction
const tabs = {
    slots: document.getElementById('tab-slots'),
    coin: document.getElementById('tab-coin'),
    crash: document.getElementById('tab-crash'),
    roulette: document.getElementById('tab-roulette'),
    rps: document.getElementById('tab-rps')
};
const arenas = {
    slots: document.getElementById('slots-arena'),
    coin: document.getElementById('coin-arena'),
    crash: document.getElementById('crash-arena'),
    roulette: document.getElementById('roulette-arena'),
    rps: document.getElementById('rps-arena')
};

// Game Specific Node Hooks
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const coinElement = document.getElementById('coin-element');
const crashOutput = document.getElementById('crash-multiplier-output');
const btnCrashCashout = document.getElementById('btn-crash-cashout');
const rouletteBallOutput = document.getElementById('roulette-ball-output');
const rouletteTargetInput = document.getElementById('roulette-target-input');
const rpsPlayerNode = document.getElementById('rps-player-node');
const rpsComputerNode = document.getElementById('rps-computer-node');

// --- Initialization Event Bindings ---
btnIncreaseBet.addEventListener('click', () => adjustBet(betStep));
btnDecreaseBet.addEventListener('click', () => adjustBet(-betStep));
btnAction.addEventListener('click', routeEngineExecution);
btnCrashCashout.addEventListener('click', executeCrashCashout);

Object.keys(tabs).forEach(gameKey => {
    tabs[gameKey].addEventListener('click', () => switchActiveGameContainer(gameKey));
});

// --- Core Bankroll Controllers ---
function adjustBet(amount) {
    if (isCrashActive) return; // Freeze adjustments mid game
    const target = currentBet + amount;
    if (target >= minBet && target <= maxBet) {
        currentBet = target;
        betDisplay.textContent = `$${currentBet}`;
    }
}

function switchActiveGameContainer(targetKey) {
    if (isCrashActive) return; // Prevent navigation during run routines
    activeGame = targetKey;
    
    // UI Layout Reset Loops
    Object.keys(tabs).forEach(k => tabs[k].classList.remove('active'));
    Object.keys(arenas).forEach(k => arenas[k].classList.add('hidden'));
    
    tabs[targetKey].classList.add('active');
    arenas[targetKey].classList.remove('hidden');
    
    // Set Action string profiles dynamically
    const names = { slots: 'SPIN REELS', coin: 'FLIP COIN', crash: 'START ROCKET', roulette: 'SPIN WHEEL', rps: 'PLAY HAND' };
    btnAction.textContent = names[targetKey];
    systemMessage.textContent = `Welcome to ${targetKey.toUpperCase()} arena. Set parameters and execute.`;
    updateDisplays(0);
}

function routeEngineExecution() {
    if (balance < currentBet) {
        systemMessage.textContent = "❌ Insufficient Capital Bankroll.";
        return;
    }
    
    balance -= currentBet;
    updateDisplays(0);
    toggleControls(true);

    switch(activeGame) {
        case 'slots': runSlotsEngine(); break;
        case 'coin': runCoinEngine(); break;
        case 'crash': runCrashEngine(); break;
        case 'roulette': runRouletteEngine(); break;
        case 'rps': runRPSEngine(); break;
    }
}

// --- ENGINE 1: Slots Realizations ---
function runSlotsEngine() {
    systemMessage.textContent = "Spinning slot reels...";
    reel1.classList.add('spinning'); reel2.classList.add('spinning'); reel3.classList.add('spinning');

    setTimeout(() => stopSingleReel(reel1), 600);
    setTimeout(() => stopSingleReel(reel2), 1000);
    setTimeout(() => {
        stopSingleReel(reel3);
        let s1 = reel1.textContent, s2 = reel2.textContent, s3 = reel3.textContent;
        let winnings = 0;

        if (s1 === s2 && s2 === s3) {
            let mult = s1 === '7️⃣' ? 25 : (s1 === '💎' ? 12 : 5);
            winnings = currentBet * mult;
            systemMessage.textContent = `🎰 Triple Strike Match! Won $${winnings}!`;
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            winnings = Math.floor(currentBet * 1.5);
            systemMessage.textContent = `Double Sub-Match. Returned $${winnings}`;
        } else {
            systemMessage.textContent = "Zero line intersections matched.";
        }
        balance += winnings; updateDisplays(winnings); toggleControls(false);
    }, 1400);
}
function stopSingleReel(el) { el.classList.remove('spinning'); el.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)]; }

// --- ENGINE 2: Coin Flip Realizations ---
function runCoinEngine() {
    coinElement.classList.add('flipping');
    systemMessage.textContent = "Coin tossed into system layer...";
    let selection = document.querySelector('input[name="coin-choice"]:checked').value;

    setTimeout(() => {
        coinElement.classList.remove('flipping');
        let outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
        coinElement.textContent = outcome === 'Heads' ? '🪙' : '👑';

        let winnings = 0;
        if (selection === outcome) {
            winnings = currentBet * 2;
            systemMessage.textContent = `🎯 Prediction validated! Result: ${outcome}. Won $${winnings}`;
        } else {
            systemMessage.textContent = `Collision sequence mismatch. Landed on ${outcome}.`;
        }
        balance += winnings; updateDisplays(winnings); toggleControls(false);
    }, 1000);
}

// --- ENGINE 3: Crash Engine Realizations ---
function runCrashEngine() {
    isCrashActive = true;
    crashMultiplier = 1.00;
    crashOutput.classList.remove('crashed');
    crashOutput.textContent = "1.00x";
    
    // House crash calculation algorithm
    let calcChance = Math.random();
    if (calcChance < 0.05) crashPoint = 1.00; // instant crash
    else crashPoint = parseFloat((1.01 + Math.random() * 5).toFixed(2));

    btnAction.classList.add('hidden');
    btnCrashCashout.classList.remove('hidden');
    systemMessage.textContent = "Multiplier expanding. Cash out prior to system failure!";

    crashInterval = setInterval(() => {
        crashMultiplier += 0.04;
        crashOutput.textContent = crashMultiplier.toFixed(2) + "x";

        if (crashMultiplier >= crashPoint) {
            clearInterval(crashInterval);
            crashOutput.classList.add('crashed');
            crashOutput.textContent = `CRASHED @ ${crashPoint.toFixed(2)}x`;
            systemMessage.textContent = "💥 System matrix collapsed. Stake vaporized.";
            cleanupCrashState();
        }
    }, 100);
}

function executeCrashCashout() {
    if (!isCrashActive) return;
    clearInterval(crashInterval);
    
    let winnings = Math.floor(currentBet * crashMultiplier);
    balance += winnings;
    systemMessage.textContent = `🚀 Escaped successfully! Redeemed at ${crashMultiplier.toFixed(2)}x. Total payout: $${winnings}`;
    updateDisplays(winnings);
    cleanupCrashState();
}

function cleanupCrashState() {
    isCrashActive = false;
    btnCrashCashout.classList.add('hidden');
    btnAction.classList.remove('hidden');
    toggleControls(false);
}

// --- ENGINE 4: Roulette Engine Realizations ---
function runRouletteEngine() {
    systemMessage.textContent = "Spinning roulette chamber array...";
    let target = parseInt(rouletteTargetInput.value) || 0;
    if (target < 0 || target > 36) target = 0;

    let iterations = 0;
    let wheelAnim = setInterval(() => {
        rouletteBallOutput.textContent = Math.floor(Math.random() * 37);
        iterations++;
        if (iterations > 15) {
            clearInterval(wheelAnim);
            let result = Math.floor(Math.random() * 37);
            rouletteBallOutput.textContent = result;

            let winnings = 0;
            if (result === target) {
                winnings = currentBet * 35; // 35:1 standard payout array matrix
                systemMessage.textContent = `🎉 Bullseye number verification hit! Target ${target} won $${winnings}!`;
            } else {
                systemMessage.textContent = `Chamber settled on ${result}. Missing designated target ${target}.`;
            }
            balance += winnings; updateDisplays(winnings); toggleControls(false);
        }
    }, 80);
}

// --- ENGINE 5: Rock Paper Scissors Engine Realizations ---
function runRPSEngine() {
    systemMessage.textContent = "Calculating tactical game selections...";
    let playerMove = document.querySelector('input[name="rps-choice"]:checked').value;
    const items = ['Rock', 'Paper', 'Scissors'];
    const icons = { Rock: '✊', Paper: '🫱', Scissors: '✌️' };

    let cpuMove = items[Math.floor(Math.random() * 3)];
    rpsPlayerNode.textContent = icons[playerMove];
    rpsComputerNode.textContent = icons[cpuMove];

    let winnings = 0;
    if (playerMove === cpuMove) {
        winnings = currentBet; // Refund configuration
        systemMessage.textContent = `🤝 Standing tie condition. Capital stake returned.`;
    } else if (
        (playerMove === 'Rock' && cpuMove === 'Scissors') ||
        (playerMove === 'Paper' && cpuMove === 'Rock') ||
        (playerMove === 'Scissors' && cpuMove === 'Paper')
    ) {
        winnings = currentBet * 2;
        systemMessage.textContent = `🎯 Match superiority achieved! ${playerMove} beats ${cpuMove}. Won $${winnings}`;
    } else {
        systemMessage.textContent = `🤖 AI processing pattern defeated player. ${cpuMove} beats ${playerMove}.`;
    }
    balance += winnings; updateDisplays(winnings); toggleControls(false);
}

// --- Central Control Interfaces ---
function updateDisplays(lastWin) {
    balanceDisplay.textContent = `$${balance}`;
    winDisplay.textContent = `$${lastWin}`;
}

function toggleControls(isDisabled) {
    btnAction.disabled = isDisabled;
    btnIncreaseBet.disabled = isDisabled;
    btnDecreaseBet.disabled = isDisabled;
    Object.keys(tabs).forEach(k => tabs[k].disabled = isDisabled);
}
