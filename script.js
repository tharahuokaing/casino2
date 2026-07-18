// ============================================
// IMPERIAL CYBER CASINO - MASTER SCRIPT
// ============================================

// Global State
let balance = 1000000;
let currentBet = 1000000;
let lastWin = 0;
let activeGame = 'slots';

// ============================================
// AUDIO SYSTEM
// ============================================
const audioElement = document.getElementById('core-bg-sound');
const audioToggleBtn = document.getElementById('btn-audio-toggle');
const audioIcon = audioToggleBtn.querySelector('.audio-icon');
const volumeSlider = document.getElementById('sys-volume');

let isAudioPlaying = true;
audioElement.volume = 0.5;

function toggleSystemAudio() {
    isAudioPlaying = !isAudioPlaying;
    if (isAudioPlaying) {
        audioElement.play();
        audioIcon.textContent = '▶';
        audioToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
        audioElement.pause();
        audioIcon.textContent = '⏸';
        audioToggleBtn.setAttribute('aria-pressed', 'false');
    }
}

function adjustSystemVolume(value) {
    audioElement.volume = value / 100;
}

// Initialize audio
audioToggleBtn.addEventListener('click', toggleSystemAudio);
volumeSlider.addEventListener('input', (e) => adjustSystemVolume(e.target.value));

// ============================================
// NAVIGATION SYSTEM
// ============================================
const navButtons = document.querySelectorAll('.nav-btn');
const gameWindows = document.querySelectorAll('.game-window');
const actionBtn = document.getElementById('btn-action');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        navButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        // Add active class to clicked button
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // Hide all game windows
        gameWindows.forEach(window => window.classList.add('hidden'));
        
        // Show selected game window
        const gameId = btn.id.replace('tab-', '');
        const selectedGame = document.getElementById(`${gameId}-arena`);
        selectedGame.classList.remove('hidden');
        
        // Update active game
        activeGame = gameId;
        
        // Update action button text
        updateActionButtonText();
        
        // Update system message
        setSystemMessage(`Welcome to ${getGameName(gameId)}! Place your bet and play.`);
    });
});

function getGameName(gameId) {
    const names = {
        'slots': 'Slots',
        'coin': 'Coin Flip',
        'crash': 'Crash',
        'roulette': 'Roulette',
        'rps': 'Rock Paper Scissors',
        'mines': 'Mines',
        'blackjack': 'Blackjack',
        'baccarat': 'Baccarat',
        'dice': 'Dice',
        'wheel': 'Wheel',
        'plinko': 'Plinko'
    };
    return names[gameId] || gameId;
}

function updateActionButtonText() {
    const texts = {
        'slots': 'SPIN REELS',
        'coin': 'FLIP COIN',
        'crash': 'START CRASH',
        'roulette': 'ROLL ROULETTE',
        'rps': 'PLAY RPS',
        'mines': 'START MINES',
        'blackjack': 'START BLACKJACK',
        'baccarat': 'PLAY BACCARAT',
        'dice': 'ROLL DICE',
        'wheel': 'SPIN WHEEL',
        'plinko': 'DROP PLINKO'
    };
    actionBtn.textContent = texts[activeGame] || 'PLAY';
}

// ============================================
// BETTING SYSTEM
// ============================================
const balanceDisplay = document.getElementById('balance-display');
const betDisplay = document.getElementById('bet-display');
const winDisplay = document.getElementById('win-display');
const decreaseBetBtn = document.getElementById('btn-decrease-bet');
const increaseBetBtn = document.getElementById('btn-increase-bet');

function updateDisplays() {
    balanceDisplay.textContent = `$${balance}`;
    betDisplay.textContent = `$${currentBet}`;
    winDisplay.textContent = `$${lastWin}`;
}

decreaseBetBtn.addEventListener('click', () => {
    if (currentBet > 10) {
        currentBet -= 10;
        updateDisplays();
        setSystemMessage(`Bet decreased to $${currentBet}`);
    }
});

increaseBetBtn.addEventListener('click', () => {
    if (currentBet + 10 <= balance) {
        currentBet += 10;
        updateDisplays();
        setSystemMessage(`Bet increased to $${currentBet}`);
    }
});

actionBtn.addEventListener('click', () => {
    playGame();
});

function setSystemMessage(message) {
    const messageEl = document.getElementById('system-message');
    messageEl.textContent = message;
}

// ============================================
// MAIN GAME LOGIC
// ============================================
function playGame() {
    if (balance < currentBet) {
        setSystemMessage("Insufficient balance! Decrease your bet.");
        return;
    }
    
    balance -= currentBet;
    updateDisplays();
    
    switch(activeGame) {
        case 'slots': playSlots();
            break;
        case 'coin': playCoinFlip();
            break;
        case 'crash': startCrash();
            break;
        case 'roulette': playRoulette();
            break;
        case 'rps': playRPS();
            break;
        case 'mines': startMines();
            break;
        case 'blackjack': startBlackjack();
            break;
        case 'baccarat': playBaccarat();
            break;
        case 'dice': playDice();
            break;
        case 'wheel': playWheel();
            break;
        case 'plinko': playPlinko();
            break;
    }
}

// ============================================
// GAME 1: SLOTS
// ============================================
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];

function playSlots() {
    setSystemMessage("Spinning reels...");
    
    let spinCount = 0;
    const maxSpins = 10;
    
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        });
        
        spinCount++;
        if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            checkSlotsWin();
        }
    }, 100);
}

function checkSlotsWin() {
    const result = reels.map(reel => reel.textContent);
    const [r1, r2, r3] = result;
    
    if (r1 === r2 && r2 === r3) {
        // All three match - 20x payout
        const winAmount = currentBet * 20;
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`JACKPOT! All three match! You won $${winAmount}!`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Two match - 3x payout
        const winAmount = currentBet * 3;
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`Nice! Two match! You won $${winAmount}!`);
    } else {
        lastWin = 0;
        setSystemMessage("No match. Try again!");
    }
    
    updateDisplays();
}

// ============================================
// GAME 2: COIN FLIP
// ============================================
const coinElement = document.getElementById('coin-element');

function playCoinFlip() {
    const choice = document.querySelector('input[name="coin-choice"]:checked').value;
    setSystemMessage(`Coin flipping... You chose ${choice}`);
    
    coinElement.style.transition = 'transform 0.5s';
    coinElement.style.transform = 'rotateY(720deg)';
    
    setTimeout(() => {
        coinElement.style.transform = 'rotateY(0deg)';
        
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        coinElement.textContent = result === 'Heads' ? '🪙' : '🪙';
        
        if (choice === result) {
            const winAmount = currentBet * 2;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`It's ${result}! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`It's ${result}. You lost. Try again!`);
        }
        
        updateDisplays();
    }, 1000);
}

// ============================================
// GAME 3: CRASH
// ============================================
let crashInterval = null;
let crashMultiplier = 1.00;
let crashGameActive = false;
let crashPoint = 0;
const crashOutput = document.getElementById('crash-multiplier-output');
const crashCashoutBtn = document.getElementById('btn-crash-cashout');

function startCrash() {
    if (crashGameActive) {
        cashoutCrash();
        return;
    }
    
    crashGameActive = true;
    crashMultiplier = 1.00;
    crashPoint = (Math.random() * 5 + 1).toFixed(2);
    crashPoint = Math.random() < 0.3 ? 1.00 : crashPoint; // 30% chance of instant crash
    
    crashOutput.textContent = '1.00x';
    crashCashoutBtn.classList.remove('hidden');
    setSystemMessage(`Crash started! Multiplier: 1.00x (Crash point: ${crashPoint}x)`);
    
    crashInterval = setInterval(() => {
        crashMultiplier += 0.01;
        crashOutput.textContent = `${crashMultiplier.toFixed(2)}x`;
        
        if (crashMultiplier >= crashPoint) {
            clearInterval(crashInterval);
            crashGameActive = false;
            crashCashoutBtn.classList.add('hidden');
            lastWin = 0;
            setSystemMessage(`CRASHED at ${crashMultiplier.toFixed(2)}x! You lost $${currentBet}`);
            updateDisplays();
        }
    }, 50);
}

function cashoutCrash() {
    clearInterval(crashInterval);
    crashGameActive = false;
    crashCashoutBtn.classList.add('hidden');
    
    const winAmount = currentBet * crashMultiplier;
    balance += winAmount;
    lastWin = winAmount;
    setSystemMessage(`Cashed out at ${crashMultiplier.toFixed(2)}x! You won $${winAmount.toFixed(2)}!`);
    updateDisplays();
}

crashCashoutBtn.addEventListener('click', cashoutCrash);

// ============================================
// GAME 4: ROULETTE
// ============================================
const rouletteOutput = document.getElementById('roulette-ball-output');
const rouletteTarget = document.getElementById('roulette-target-input');

function playRoulette() {
    const target = parseInt(rouletteTarget.value);
    setSystemMessage(`Roulette rolling... Target: ${target}`);
    
    setTimeout(() => {
        const result = Math.floor(Math.random() * 37);
        rouletteOutput.textContent = result;
        
        if (result === target) {
            const winAmount = currentBet * 36;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🎯 ${result}! JACKPOT! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`${result} is not ${target}. You lost $${currentBet}`);
        }
        
        updateDisplays();
    }, 1000);
}

// ============================================
// GAME 5: ROCK PAPER SCISSORS
// ============================================
const rpsPlayer = document.getElementById('rps-player-node');
const rpsComputer = document.getElementById('rps-computer-node');

function playRPS() {
    const choice = document.querySelector('input[name="rps-choice"]:checked').value;
    const choices = ['Rock', 'Paper', 'Scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    
    setSystemMessage(`RPS playing... You: ${choice}, Computer: ${computerChoice}`);
    
    setTimeout(() => {
        rpsPlayer.textContent = choice;
        rpsComputer.textContent = computerChoice;
        
        let result = '';
        if (choice === computerChoice) {
            result = 'draw';
            const winAmount = currentBet;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`It's a draw! You get your $${winAmount} back.`);
        } else if (
            (choice === 'Rock' && computerChoice === 'Scissors') ||
            (choice === 'Paper' && computerChoice === 'Rock') ||
            (choice === 'Scissors' && computerChoice === 'Paper')
        ) {
            result = 'win';
            const winAmount = currentBet * 2;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`You win! ${choice} beats ${computerChoice}. You won $${winAmount}!`);
        } else {
            result = 'lose';
            lastWin = 0;
            setSystemMessage(`You lose! ${computerChoice} beats ${choice}. You lost $${currentBet}`);
        }
        
        updateDisplays();
    }, 500);
}

// ============================================
// GAME 6: MINES
// ============================================
let minesBoard = [];
let minesGameActive = false;
let minesCashedOut = false;
let minesDug = 0;
const minesBoardEl = document.getElementById('mines-board');
const minesCashoutBtn = document.getElementById('btn-mines-cashout');
const MINES_COUNT = 3;
const GRID_SIZE = 9;

function startMines() {
    if (minesGameActive && !minesCashedOut) {
        cashoutMines();
        return;
    }
    
    // Reset game
    minesGameActive = true;
    minesCashedOut = false;
    minesDug = 0;
    minesBoard = [];
    
    // Create board with random mines
    let minePositions = new Set();
    while (minePositions.size < MINES_COUNT) {
        minePositions.add(Math.floor(Math.random() * GRID_SIZE));
    }
    
    for (let i = 0; i < GRID_SIZE; i++) {
        minesBoard.push(minePositions.has(i));
    }
    
    // Render board
    minesBoardEl.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        const tile = document.createElement('div');
        tile.className = 'mines-tile';
        tile.dataset.index = i;
        tile.textContent = '❓';
        tile.addEventListener('click', () => digMines(i, tile));
        minesBoardEl.appendChild(tile);
    }
    
    minesCashoutBtn.classList.remove('hidden');
    setSystemMessage(`Mines started! ${MINES_COUNT} mines hidden. Click tiles to dig!`);
}

function digMines(index, tile) {
    if (!minesGameActive || minesCashedOut || tile.classList.contains('digged')) {
        return;
    }
    
    tile.classList.add('digged');
    
    if (minesBoard[index]) {
        // Hit a mine!
        tile.textContent = '💣';
        tile.style.backgroundColor = '#ff4444';
        minesGameActive = false;
        minesCashoutBtn.classList.add('hidden');
        lastWin = 0;
        setSystemMessage(`💥 BOOM! You hit a mine! You lost $${currentBet}`);
        updateDisplays();
        revealAllMines();
    } else {
        // Safe!
        tile.textContent = '💎';
        tile.style.backgroundColor = '#44ff44';
        minesDug++;
        
        // Calculate multiplier based on digs
        const multiplier = 1 + (minesDug * 0.3);
        setSystemMessage(`Safe! ${minesDug}/${GRID_SIZE - MINES_COUNT}. Multiplier: ${multiplier.toFixed(2)}x`);
        
        if (minesDug >= GRID_SIZE - MINES_COUNT) {
            cashoutMines();
        }
    }
}

function cashoutMines() {
    if (!minesGameActive || minesCashedOut) {
        return;
    }
    
    minesCashedOut = true;
    minesGameActive = false;
    minesCashoutBtn.classList.add('hidden');
    
    const multiplier = 1 + (minesDug * 0.3);
    const winAmount = currentBet * multiplier;
    balance += winAmount;
    lastWin = winAmount;
    setSystemMessage(`Cashed out! ${minesDug} safe digs. You won $${winAmount.toFixed(2)}!`);
    updateDisplays();
    revealAllMines();
}

function revealAllMines() {
    const tiles = minesBoardEl.querySelectorAll('.mines-tile');
    tiles.forEach((tile, i) => {
        if (!tile.classList.contains('digged')) {
            tile.classList.add('digged');
            if (minesBoard[i]) {
                tile.textContent = '💣';
                tile.style.backgroundColor = '#ff4444';
            } else {
                tile.textContent = '💎';
                tile.style.backgroundColor = '#44ff44';
            }
        }
    });
}

minesCashoutBtn.addEventListener('click', cashoutMines);

// ============================================
// GAME 7: BLACKJACK
// ============================================
let blackjackDeck = [];
let blackjackPlayerHand = [];
let blackjackDealerHand = [];
let blackjackGameActive = false;
const bjDealerScore = document.getElementById('bj-dealer-score');
const bjPlayerScore = document.getElementById('bj-player-score');
const bjDealerCards = document.getElementById('bj-dealer-cards');
const bjPlayerCards = document.getElementById('bj-player-cards');
const bjActionGroup = document.getElementById('bj-action-group');
const bjHitBtn = document.getElementById('btn-bj-hit');
const bjStandBtn = document.getElementById('btn-bj-stand');

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    
    return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (card.value === 'J' || card.value === 'Q' || card.value === 'K') return 10;
    return parseInt(card.value);
}

function calculateHandScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function renderCard(card, element) {
    const cardEl = document.createElement('div');
    cardEl.className = 'bj-card-element';
    cardEl.textContent = `${card.value}${card.suit}`;
    element.appendChild(cardEl);
}

function startBlackjack() {
    if (blackjackGameActive) {
        return;
    }
    
    blackjackDeck = createDeck();
    blackjackPlayerHand = [blackjackDeck.pop(), blackjackDeck.pop()];
    blackjackDealerHand = [blackjackDeck.pop()];
    blackjackGameActive = true;
    
    bjDealerCards.innerHTML = '';
    bjPlayerCards.innerHTML = '';
    
    renderCard(blackjackDealerHand[0], bjDealerCards);
    bjDealerScore.textContent = getCardValue(blackjackDealerHand[0]);
    
    for (let card of blackjackPlayerHand) {
        renderCard(card, bjPlayerCards);
    }
    bjPlayerScore.textContent = calculateHandScore(blackjackPlayerHand);
    
    bjActionGroup.classList.remove('hidden');
    setSystemMessage("Blackjack started! Hit or Stand?");
}

bjHitBtn.addEventListener('click', () => {
    if (!blackjackGameActive) return;
    
    const card = blackjackDeck.pop();
    blackjackPlayerHand.push(card);
    renderCard(card, bjPlayerCards);
    bjPlayerScore.textContent = calculateHandScore(blackjackPlayerHand);
    
    const score = calculateHandScore(blackjackPlayerHand);
    if (score > 21) {
        endBlackjack('lose');
    }
});

bjStandBtn.addEventListener('click', () => {
    if (!blackjackGameActive) return;
    dealerBlackjackTurn();
});

function dealerBlackjackTurn() {
    let dealerScore = calculateHandScore(blackjackDealerHand);
    
    while (dealerScore < 17) {
        const card = blackjackDeck.pop();
        blackjackDealerHand.push(card);
        renderCard(card, bjDealerCards);
        dealerScore = calculateHandScore(blackjackDealerHand);
    }
    
    bjDealerScore.textContent = dealerScore;
    
    const playerScore = calculateHandScore(blackjackPlayerHand);
    
    if (dealerScore > 21 || playerScore > dealerScore) {
        endBlackjack('win');
    } else if (playerScore === dealerScore) {
        endBlackjack('draw');
    } else {
        endBlackjack('lose');
    }
}

function endBlackjack(result) {
    blackjackGameActive = false;
    bjActionGroup.classList.add('hidden');
    
    if (result === 'win') {
        const winAmount = currentBet * 2;
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`You win! You won $${winAmount}!`);
    } else if (result === 'draw') {
        balance += currentBet;
        lastWin = currentBet;
        setSystemMessage(`Push! You get your $${currentBet} back.`);
    } else {
        lastWin = 0;
        setSystemMessage(`Dealer wins. You lost $${currentBet}`);
    }
    
    updateDisplays();
}

// ============================================
// GAME 8: BACCARAT
// ============================================
function playBaccarat() {
    const betType = document.querySelector('input[name="bac-target"]:checked').value;
    setSystemMessage(`Baccarat playing... You bet on ${betType}`);
    
    // Simple Baccarat simulation
    const playerScore = Math.floor(Math.random() * 10);
    const bankerScore = Math.floor(Math.random() * 10);
    
    document.getElementById('bac-player-score').textContent = playerScore;
    document.getElementById('bac-banker-score').textContent = bankerScore;
    
    let result = '';
    let winAmount = 0;
    
    if (playerScore > bankerScore) {
        result = 'PLAYER';
    } else if (bankerScore > playerScore) {
        result = 'BANKER';
    } else {
        result = 'TIE';
    }
    
    // Add to trend history
    const trendHistory = document.getElementById('bac-trend-history');
    const newTrend = document.createElement('span');
    newTrend.className = `trend-dot ${result === 'PLAYER' ? 'player' : result === 'BANKER' ? 'banker' : 'tie'}`;
    newTrend.textContent = result[0];
    trendHistory.appendChild(newTrend);
    
    if (result === betType) {
        if (betType === 'PLAYER') {
            winAmount = currentBet * 2;
        } else if (betType === 'BANKER') {
            winAmount = currentBet * 1.95;
        } else {
            winAmount = currentBet * 9;
        }
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`${result} wins! You won $${winAmount.toFixed(2)}!`);
    } else {
        lastWin = 0;
        setSystemMessage(`${result} wins. You lost $${currentBet}`);
    }
    
    updateDisplays();
}

// ============================================
// GAME 9: DICE
// ============================================
const diceOutput = document.getElementById('dice-result-output');

function playDice() {
    const choice = document.querySelector('input[name="dice-choice"]:checked').value;
    setSystemMessage(`Dice rolling... You chose ${choice} 50`);
    
    setTimeout(() => {
        const result = Math.floor(Math.random() * 100);
        diceOutput.textContent = result;
        
        let won = false;
        if (choice === 'Over' && result > 50) {
            won = true;
        } else if (choice === 'Under' && result < 50) {
            won = true;
        }
        
        if (won) {
            const winAmount = currentBet * 2;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🎲 ${result}! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`${result} is not ${choice} 50. You lost $${currentBet}`);
        }
        
        updateDisplays();
    }, 800);
}

// ============================================
// GAME 10: WHEEL
// ============================================
const wheelOutput = document.getElementById('wheel-spinner-output');

function playWheel() {
    setSystemMessage("Wheel spinning...");
    
    wheelOutput.style.transition = 'transform 2s cubic-bezier(0.1, 0.8, 0.1, 1)';
    wheelOutput.style.transform = 'rotate(720deg)';
    
    setTimeout(() => {
        wheelOutput.style.transform = 'rotate(0deg)';
        
        const segments = [
            { multiplier: 0.5, color: '#ff4444' },
            { multiplier: 1, color: '#4444ff' },
            { multiplier: 2, color: '#44ff44' },
            { multiplier: 3, color: '#ffff44' },
            { multiplier: 5, color: '#ff44ff' },
            { multiplier: 10, color: '#44ffff' }
        ];
        
        const result = segments[Math.floor(Math.random() * segments.length)];
        const winAmount = currentBet * result.multiplier;
        
        if (result.multiplier >= 1) {
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🎡 ${result.multiplier}x! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`🎡 ${result.multiplier}x. You lost $${currentBet}`);
        }
        
        updateDisplays();
    }, 2000);
}

// ============================================
// GAME 11: PLINKO
// ============================================
function playPlinko() {
    setSystemMessage("Plinko dropping...");
    
    const display = document.getElementById('plinko-display-board');
    display.innerHTML = '<div class="plinko-node">●</div>';
    
    setTimeout(() => {
        const multiplier = [0.5, 1, 2, 3, 5, 10][Math.floor(Math.random() * 6)];
        const winAmount = currentBet * multiplier;
        
        if (multiplier >= 1) {
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🔵 ${multiplier}x! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`🔵 ${multiplier}x. You lost $${currentBet}`);
        }
        
        updateDisplays();
    }, 1500);
}

// ============================================
// INITIALIZATION
// ============================================
updateDisplays();
updateActionButtonText();
setSystemMessage("Welcome to Casino Royale! Select a game and start playing!");

// Auto-play audio on load (may be blocked by browser)
setTimeout(() => {
    if (audioElement) {
        audioElement.play().catch(() => {
            console.log('Audio autoplay blocked by browser');
        });
    }
}, 1000);
