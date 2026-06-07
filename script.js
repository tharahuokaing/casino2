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

// --- Platform Core State Bankroll Infrastructure ---
let balance = 1000;
let currentBet = 10;
const minBet = 10;
const maxBet = 100;
const betStep = 10;
let activeGame = 'slots';

// Engine loop active states tracking parameters
let crashInterval = null, crashMultiplier = 1.00, crashPoint = 0, isCrashActive = false;

// --- GAME 6: MINES STATE SYSTEM ---
let minesPattern = [], revealedCount = 0, isMinesActive = false, minesPayoutMultiplier = 1.00;

// --- GAME 7: BLACKJACK STATE SYSTEM ---
let bjDeck = [], bjPlayerHand = [], bjDealerHand = [], isBlackjackActive = false;

// Shared Global Node Targets Extraction Mapping
const balanceDisplay = document.getElementById('balance-display');
const betDisplay = document.getElementById('bet-display');
const winDisplay = document.getElementById('win-display');
const systemMessage = document.getElementById('system-message');
const btnAction = document.getElementById('btn-action');
const btnIncreaseBet = document.getElementById('btn-increase-bet');
const btnDecreaseBet = document.getElementById('btn-decrease-bet');

// Register the complete 10-Game Tab Map Configuration Arrays
const gameKeys = ['slots', 'coin', 'crash', 'roulette', 'rps', 'mines', 'blackjack', 'dice', 'wheel', 'plinko'];
const tabs = {}, arenas = {};
gameKeys.forEach(k => {
    tabs[k] = document.getElementById(`tab-${k}`);
    arenas[k] = document.getElementById(`${k}-arena`);
});

// Hook Specific Elements Loops
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
const reel1 = document.getElementById('reel1'), reel2 = document.getElementById('reel2'), reel3 = document.getElementById('reel3');
const coinElement = document.getElementById('coin-element');
const crashOutput = document.getElementById('crash-multiplier-output'), btnCrashCashout = document.getElementById('btn-crash-cashout');
const rouletteBallOutput = document.getElementById('roulette-ball-output'), rouletteTargetInput = document.getElementById('roulette-target-input');
const rpsPlayerNode = document.getElementById('rps-player-node'), rpsComputerNode = document.getElementById('rps-computer-node');

// Game 6-10 Specialized Sub-Node Hooks
const minesBoard = document.getElementById('mines-board'), btnMinesCashout = document.getElementById('btn-mines-cashout');
const bjDealerScore = document.getElementById('bj-dealer-score'), bjDealerCards = document.getElementById('bj-dealer-cards');
const bjPlayerScore = document.getElementById('bj-player-score'), bjPlayerCards = document.getElementById('bj-player-cards');
const bjActionGroup = document.getElementById('bj-action-group'), btnBjHit = document.getElementById('btn-bj-hit'), btnBjStand = document.getElementById('btn-bj-stand');
const diceResultOutput = document.getElementById('dice-result-output');
const wheelSpinnerOutput = document.getElementById('wheel-spinner-output');
const plinkoDisplayBoard = document.getElementById('plinko-display-board');

// --- Initialization Mechanics Routing ---
btnIncreaseBet.addEventListener('click', () => adjustBet(betStep));
btnDecreaseBet.addEventListener('click', () => adjustBet(-betStep));
btnAction.addEventListener('click', routeEngineExecution);

// In-Game Specialized Sub-Trigger Actions Bindings
btnMinesCashout.addEventListener('click', cashoutMinesEngine);
btnBjHit.addEventListener('click', executeBlackjackHit);
btnBjStand.addEventListener('click', executeBlackjackStand);

gameKeys.forEach(key => {
    tabs[key].addEventListener('click', () => switchActiveLayoutSpace(key));
});

function adjustBet(amount) {
    if (isCrashActive || isMinesActive || isBlackjackActive) return; // Lock controls mid-round
    const target = currentBet + amount;
    if (target >= minBet && target <= maxBet) {
        currentBet = target;
        betDisplay.textContent = `$${currentBet}`;
    }
}

function switchActiveLayoutSpace(targetKey) {
    if (isCrashActive || isMinesActive || isBlackjackActive) return;
    activeGame = targetKey;
    
    gameKeys.forEach(k => { tabs[k].classList.remove('active'); arenas[k].classList.add('hidden'); });
    tabs[targetKey].classList.add('active');
    arenas[targetKey].classList.remove('hidden');
    
    // Clear display structures if necessary
    btnAction.classList.remove('hidden');
    bjActionGroup.classList.add('hidden');
    btnMinesCashout.classList.add('hidden');
    btnCrashCashout.classList.add('hidden');

    const buttonStrings = {
        slots: 'SPIN REELS', coin: 'FLIP COIN', crash: 'START ROCKET', roulette: 'SPIN WHEEL',
        rps: 'PLAY HAND', mines: 'INITIALIZE MINESFIELD', blackjack: 'DEAL CARDS', dice: 'ROLL DICE',
        wheel: 'SPIN WHEEL', plinko: 'DROP PLINKO BALL'
    };
    btnAction.textContent = buttonStrings[targetKey];
    systemMessage.textContent = `Active Arena: ${targetKey.toUpperCase()}. Set configuration parameters.`;
    updateDisplays(0);
}

function routeEngineExecution() {
    if (balance < currentBet) { systemMessage.textContent = "❌ Insufficient Capital Bankroll Balance."; return; }
    
    balance -= currentBet;
    updateDisplays(0);
    toggleControls(true);

    switch(activeGame) {
        case 'slots': runSlotsEngine(); break;
        case 'coin': runCoinEngine(); break;
        case 'crash': runCrashEngine(); break;
        case 'roulette': runRouletteEngine(); break;
        case 'rps': runRPSEngine(); break;
        case 'mines': runMinesEngine(); break;
        case 'blackjack': runBlackjackEngine(); break;
        case 'dice': runDiceEngine(); break;
        case 'wheel': runWheelEngine(); break;
        case 'plinko': runPlinkoEngine(); break;
    }
}

// --- STANDARD ENGINES 1 - 5 (CONCISE PRESERVATION) ---
function runSlotsEngine() {
    reel1.classList.add('spinning'); reel2.classList.add('spinning'); reel3.classList.add('spinning');
    setTimeout(() => reel1.textContent = slotSymbols[Math.floor(Math.random()*7)], 400);
    setTimeout(() => reel2.textContent = slotSymbols[Math.floor(Math.random()*7)], 700);
    setTimeout(() => {
        reel3.textContent = slotSymbols[Math.floor(Math.random()*7)];
        let s1=reel1.textContent, s2=reel2.textContent, s3=reel3.textContent, w=0;
        if (s1===s2 && s2===s3) w=currentBet*(s1==='7️⃣'?20:8);
        else if (s1===s2||s2===s3||s1===s3) w=Math.floor(currentBet*1.2);
        balance+=w; systemMessage.textContent=w>0?`Match hit! Won $${w}`:"No structural hits matched.";
        updateDisplays(w); toggleControls(false);
    }, 1000);
}
function runCoinEngine() {
    let sel = document.querySelector('input[name="coin-choice"]:checked').value;
    let res = Math.random()<0.5?'Heads':'Tails';
    coinElement.textContent = res==='Heads'?'🪙':'👑';
    let w = sel===res?currentBet*2:0; balance+=w;
    systemMessage.textContent = w>0?`Win! Result: ${res}`:`Loss. Result: ${res}`;
    updateDisplays(w); toggleControls(false);
}
function runCrashEngine() {
    isCrashActive=true; crashMultiplier=1.00; btnAction.classList.add('hidden'); btnCrashCashout.classList.remove('hidden');
    crashPoint = parseFloat((1.05 + Math.random()*4).toFixed(2));
    crashInterval = setInterval(() => {
        crashMultiplier+=0.05; crashOutput.textContent = crashMultiplier.toFixed(2)+"x";
        if (crashMultiplier>=crashPoint){
            clearInterval(crashInterval); crashOutput.textContent = `CRASHED @ ${crashPoint.toFixed(2)}x`;
            systemMessage.textContent="💥 Crash limit crossed."; isCrashActive=false;
            btnCrashCashout.classList.add('hidden'); btnAction.classList.remove('hidden'); toggleControls(false);
        }
    },100);
}
function executeCrashCashout(){
    clearInterval(crashInterval); let w = Math.floor(currentBet*crashMultiplier); balance+=w;
    systemMessage.textContent=`Cashed out at ${crashMultiplier.toFixed(2)}x. Won $${w}`;
    isCrashActive=false; btnCrashCashout.classList.add('hidden'); btnAction.classList.remove('hidden'); updateDisplays(w); toggleControls(false);
}
function runRouletteEngine() {
    let t = parseInt(rouletteTargetInput.value)||0; let r = Math.floor(Math.random()*37); rouletteBallOutput.textContent=r;
    let w = t===r?currentBet*35:0; balance+=w; systemMessage.textContent=w>0?`Jackpot hit! Won $${w}`:`Landed on ${r}`;
    updateDisplays(w); toggleControls(false);
}
function runRPSEngine() {
    let p = document.querySelector('input[name="rps-choice"]:checked').value;
    let moves = ['Rock','Paper','Scissors'], c = moves[Math.floor(Math.random()*3)];
    rpsPlayerNode.textContent=p[0]; rpsComputerNode.textContent=c[0];
    let w = p===c?currentBet:( ((p==='Rock'&&c==='Scissors')||(p==='Paper'&&c==='Rock')||(p==='Scissors'&&c==='Paper')) ? currentBet*2 : 0 );
    balance+=w; systemMessage.textContent=w===currentBet?"Tie!":w>0?"Victory!":"Defeat.";
    updateDisplays(w); toggleControls(false);
}

// --- NEW EXPANSION ENGINES 6 - 10 ---

// --- ENGINE 6: MINES FIELD ENGINE ---
function runMinesEngine() {
    isMinesActive = true; revealedCount = 0; minesPayoutMultiplier = 1.00;
    btnAction.classList.add('hidden'); btnMinesCashout.classList.remove('hidden');
    systemMessage.textContent = "Mines field deployed! Click tiles carefully.";
    
    // 3x3 array layout generation model (contains exactly 2 bombs hidden)
    minesPattern = Array(9).fill('safe');
    let bombPositions = [];
    while(bombPositions.length < 2) {
        let pos = Math.floor(Math.random() * 9);
        if(!bombPositions.includes(pos)) { bombPositions.push(pos); minesPattern[pos] = 'mine'; }
    }

    minesBoard.innerHTML = '';
    for(let i=0; i<9; i++) {
        let tile = document.createElement('div');
        tile.className = 'mine-tile';
        tile.textContent = '?';
        tile.dataset.index = i;
        tile.addEventListener('click', handleMinesTileClick);
        minesBoard.appendChild(tile);
    }
}

function handleMinesTileClick(e) {
    if(!isMinesActive) return;
    let tile = e.target;
    if(tile.classList.contains('revealed-safe')) return;
    
    let index = parseInt(tile.dataset.index);
    if(minesPattern[index] === 'mine') {
        // Exploded condition state triggering
        tile.className = 'mine-tile revealed-mine';
        tile.textContent = '💣';
        systemMessage.textContent = "💥 Detonated a hidden mine! Entire round wager lost.";
        terminateMinesRound(false);
    } else {
        tile.className = 'mine-tile revealed-safe';
        tile.textContent = '💎';
        revealedCount++;
        minesPayoutMultiplier *= 1.35; // Compounding scale per consecutive safe square found
        systemMessage.textContent = `Uncovered safety! Current payout scale: ${minesPayoutMultiplier.toFixed(2)}x`;
        if(revealedCount === 7) { cashoutMinesEngine(); } // Auto-win parameter
    }
}

function cashoutMinesEngine() {
    if(!isMinesActive) return;
    let winnings = Math.floor(currentBet * minesPayoutMultiplier);
    balance += winnings;
    systemMessage.textContent = `Secured extraction! Multiplier: ${minesPayoutMultiplier.toFixed(2)}x. Won $${winnings}`;
    updateDisplays(winnings);
    terminateMinesRound(true);
}

function terminateMinesRound(showAll) {
    isMinesActive = false;
    btnMinesCashout.classList.add('hidden');
    btnAction.classList.remove('hidden');
    toggleControls(false);
    if(!showAll) return;
    Array.from(minesBoard.children).forEach((tile, i) => {
        if(minesPattern[i] === 'mine') { tile.textContent = '💣'; tile.style.color = 'red'; }
    });
}

// --- ENGINE 7: BLACKJACK DECK CALCULATOR ENGINE ---
function runBlackjackEngine() {
    isBlackjackActive = true;
    btnAction.classList.add('hidden');
    bjActionGroup.classList.remove('hidden');
    
    // Build internal functional card data set layout
    bjDeck = [];
    const values = [2,3,4,5,6,7,8,9,10,10,10,10,11];
    for(let i=0; i<4; i++) { bjDeck.push(...values); }
    
    bjPlayerHand = [drawBjCard(), drawBjCard()];
    bjDealerHand = [drawBjCard(), drawBjCard()];
    
    renderBlackjackBoard(false);
    systemMessage.textContent = "Select Hit or Stand to manipulate hand totals.";
}

function drawBjCard() {
    let randIdx = Math.floor(Math.random() * bjDeck.length);
    return bjDeck.splice(randIdx, 1)[0];
}

function calculateHandScore(hand) {
    let sum = hand.reduce((a, b) => a + b, 0);
    let aces = hand.filter(v => v === 11).length;
    while(sum > 21 && aces > 0) { sum -= 10; aces--; } // Dynamic soft Ace scaling adjustment
    return sum;
}

function renderBlackjackBoard(revealDealer) {
    bjPlayerCards.innerHTML = ''; bjDealerCards.innerHTML = '';
    bjPlayerHand.forEach(c => { bjPlayerCards.innerHTML += `<div class="bj-card-element">${c===11?'A':c}</div>`; });
    
    bjPlayerScore.textContent = calculateHandScore(bjPlayerHand);
    
    if(revealDealer) {
        bjDealerHand.forEach(c => { bjDealerCards.innerHTML += `<div class="bj-card-element">${c===11?'A':c}</div>`; });
        bjDealerScore.textContent = calculateHandScore(bjDealerHand);
    } else {
        bjDealerCards.innerHTML += `<div class="bj-card-element">${bjDealerHand[0]===11?'A':bjDealerHand[0]}</div>`;
        bjDealerCards.innerHTML += `<div class="bj-card-element" style="background:#555">?</div>`;
        bjDealerScore.textContent = '?';
    }
}

function executeBlackjackHit() {
    if(!isBlackjackActive) return;
    bjPlayerHand.push(drawBjCard());
    renderBlackjackBoard(false);
    if(calculateHandScore(bjPlayerHand) > 21) { evaluateBlackjackPayouts(); }
}

function executeBlackjackStand() {
    if(!isBlackjackActive) return;
    // Basic AI structural optimization dealer simulation logic loop
    while(calculateHandScore(bjDealerHand) < 17) { bjDealerHand.push(drawBjCard()); }
    evaluateBlackjackPayouts();
}

function evaluateBlackjackPayouts() {
    isBlackjackActive = false;
    renderBlackjackBoard(true);
    bjActionGroup.classList.add('hidden');
    btnAction.classList.remove('hidden');
    toggleControls(false);

    let pScore = calculateHandScore(bjPlayerHand);
    let dScore = calculateHandScore(bjDealerHand);
    let winnings = 0;

    if (pScore > 21) { systemMessage.textContent = "💥 Busted out! Player score went over 21."; }
    else if (dScore > 21 || pScore > dScore) { winnings = currentBet * 2; systemMessage.textContent = `🎉 Win! Hand beat the Dealer. Won $${winnings}`; }
    else if (pScore === dScore) { winnings = currentBet; systemMessage.textContent = "🤝 Push condition. Stake returned."; }
    else { systemMessage.textContent = "Dealer holds hand superiority. Loss recorded."; }

    balance += winnings;
    updateDisplays(winnings);
}

// --- ENGINE 8: DICE MECHANICS ENGINE ---
function runDiceEngine() {
    let rollChoice = document.querySelector('input[name="dice-choice"]:checked').value;
    let rollResult = Math.floor(Math.random() * 100) + 1;
    diceResultOutput.textContent = rollResult;
    
    let isWin = false;
    if(rollChoice === 'Over' && rollResult > 50) isWin = true;
    if(rollChoice === 'Under' && rollResult < 50) isWin = true;

    let winnings = isWin ? Math.floor(currentBet * 1.95) : 0;
    balance += winnings;
    systemMessage.textContent = isWin ? `🎯 Hit! Result: ${rollResult}. Won $${winnings}` : `Miss. Result: ${rollResult}.`;
    updateDisplays(winnings);
    toggleControls(false);
}

// --- ENGINE 9: RISK WHEEL ENGINE ---
function runWheelEngine() {
    // Multipliers matrix indexing sector points
    const wheelSegments = [0, 2, 0.5, 1.5, 0, 10, 0.2, 2.5]; // Index 5 represents high risk 10x multiplier trap
    let randomSector = Math.floor(Math.random() * wheelSegments.length);
    
    let visualDegrees = 1440 + (randomSector * (360 / wheelSegments.length));
    wheelSpinnerOutput.style.transform = `rotate(${visualDegrees}deg)`;
    systemMessage.textContent = "Wheel sector deceleration routing in progress...";

    setTimeout(() => {
        let mult = wheelSegments[randomSector];
        let winnings = Math.floor(currentBet * mult);
        balance += winnings;
        systemMessage.textContent = mult > 1 ? `🎉 Wheel hit sector! Multiplier: ${mult}x! Won $${winnings}` : `Settled on lower tier index ${mult}x.`;
        // Reset transformation track silently
        wheelSpinnerOutput.style.transform = 'rotate(0deg)';
        updateDisplays(winnings);
        toggleControls(false);
    }, 1600);
}

// --- ENGINE 10: HORIZONTAL CASCADE PLINKO ---
function runPlinkoEngine() {
    let trackingPath = [];
    let currentColumn = 0;
    
    // Simulate drop pattern calculations through a 4-tier risk layout vector grid
    for(let i=0; i<4; i++) {
        let step = Math.random() < 0.5 ? -1 : 1;
        currentColumn += step;
        trackingPath.push(step === -1 ? 'L' : 'R');
    }

    plinkoDisplayBoard.innerHTML = `
        <div class="plinko-node">●</div>
        <div class="plinko-path-display">${trackingPath.join(' → ')}</div>
        <div class="plinko-bins">
            <div class="plinko-bin" id="pbin-0">4.0x</div>
            <div class="plinko-bin" id="pbin-1">1.2x</div>
            <div class="plinko-bin" id="pbin-2">0.5x</div>
            <div class="plinko-bin" id="pbin-3">1.2x</div>
            <div class="plinko-bin" id="pbin-4">4.0x</div>
        </div>
    `;

    // Map offset vector position into absolute positive distribution indices
    let targetBinIndex = Math.abs(currentColumn) + 1;
    if(targetBinIndex > 4) targetBinIndex = 4;
    
    const payoutMap = [4.0, 1.2, 0.5, 1.2, 4.0];
    let selectedMult = payoutMap[targetBinIndex];

    setTimeout(() => {
        let binHighlight = document.getElementById(`pbin-${targetBinIndex}`);
        if(binHighlight) binHighlight.style.backgroundColor = '#dfb15b';
        
        let winnings = Math.floor(currentBet * selectedMult);
        balance += winnings;
        systemMessage.textContent = `Ball settled into pocket multiplier: ${selectedMult}x. Won $${winnings}`;
        updateDisplays(winnings);
        toggleControls(false);
    }, 800);
}

// --- Sync Interface Assets Layer ---
function updateDisplays(lastWin) {
    balanceDisplay.textContent = `$${balance}`;
    winDisplay.textContent = `$${lastWin}`;
}

function toggleControls(isDisabled) {
    btnAction.disabled = isDisabled;
    btnIncreaseBet.disabled = isDisabled;
    btnDecreaseBet.disabled = isDisabled;
    gameKeys.forEach(k => tabs[k].disabled = isDisabled);
}
