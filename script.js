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
const audioIcon = audioToggleBtn?.querySelector('.audio-icon');
const volumeSlider = document.getElementById('sys-volume');

let isAudioPlaying = false; // Start false to comply with browser autoplay blocks until user interaction

if (audioElement) {
    audioElement.volume = 0.5;
}

function toggleSystemAudio() {
    if (!audioElement || !audioToggleBtn || !audioIcon) return;
    
    isAudioPlaying = !isAudioPlaying;
    if (isAudioPlaying) {
        audioElement.play().catch(err => console.log("Audio play blocked:", err));
        audioIcon.textContent = '▶';
        audioToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
        audioElement.pause();
        audioIcon.textContent = '⏸';
        audioToggleBtn.setAttribute('aria-pressed', 'false');
    }
}

function adjustSystemVolume(value) {
    if (audioElement) {
        audioElement.volume = value / 100;
    }
}

// Initialize audio listeners
audioToggleBtn?.addEventListener('click', toggleSystemAudio);
volumeSlider?.addEventListener('input', (e) => adjustSystemVolume(e.target.value));

// ============================================
// NAVIGATION SYSTEM
// ============================================
const navButtons = document.querySelectorAll('.nav-btn');
const gameWindows = document.querySelectorAll('.game-window');
const actionBtn = document.getElementById('btn-action');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Prevent shifting tabs while an un-cashable sub-game state is running
        if (crashGameActive || (blackjackGameActive && !minesCashedOut && minesGameActive)) {
            setSystemMessage("Finish or cash out your current game before switching arenas!");
            return;
        }

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
        if (selectedGame) {
            selectedGame.classList.remove('hidden');
        }
        
        // Update active game state
        activeGame = gameId;
        
        // Update action button layout
        updateActionButtonText();
        
        // Reset sub-game elements if necessary
        resetGameViews(gameId);
        
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
    if (!actionBtn) return;
    const texts = {
        'slots': 'SPIN REELS',
        'coin': 'FLIP COIN',
        'crash': crashGameActive ? 'CASH OUT' : 'START CRASH',
        'roulette': 'ROLL ROULETTE',
        'rps': 'PLAY RPS',
        'mines': minesGameActive ? 'CASH OUT' : 'START MINES',
        'blackjack': blackjackGameActive ? 'PLAYING...' : 'START BLACKJACK',
        'baccarat': 'PLAY BACCARAT',
        'dice': 'ROLL DICE',
        'wheel': 'SPIN WHEEL',
        'plinko': 'DROP PLINKO'
    };
    actionBtn.textContent = texts[activeGame] || 'PLAY';
    
    // Disable main action button during interactive card sequences
    if (activeGame === 'blackjack' && blackjackGameActive) {
        actionBtn.disabled = true;
    } else {
        actionBtn.disabled = false;
    }
}

function resetGameViews(gameId) {
    if (gameId === 'blackjack') {
        bjActionGroup?.classList.add('hidden');
    }
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
    if (balanceDisplay) balanceDisplay.textContent = `$${Number(balance).toFixed(2)}`;
    if (betDisplay) betDisplay.textContent = `$${currentBet}`;
    if (winDisplay) winDisplay.textContent = `$${Number(lastWin).toFixed(2)}`;
}

decreaseBetBtn?.addEventListener('click', () => {
    if (currentBet > 10) {
        currentBet -= 10;
        updateDisplays();
        setSystemMessage(`Bet decreased to $${currentBet}`);
    }
});

increaseBetBtn?.addEventListener('click', () => {
    if (currentBet + 10 <= balance) {
        currentBet += 10;
        updateDisplays();
        setSystemMessage(`Bet increased to $${currentBet}`);
    } else {
        setSystemMessage("Cannot increase bet higher than your absolute balance!");
    }
});

actionBtn?.addEventListener('click', () => {
    // If the main action button doubles as a cashout button for modern crash loops
    if (activeGame === 'crash' && crashGameActive) {
        cashoutCrash();
        return;
    }
    if (activeGame === 'mines' && minesGameActive) {
        cashoutMines();
        return;
    }
    playGame();
});

function setSystemMessage(message) {
    const messageEl = document.getElementById('system-message');
    if (messageEl) messageEl.textContent = message;
}

// ============================================
// MAIN GAME LOGIC
// ============================================
function playGame() {
    if (balance < currentBet) {
        setSystemMessage("Insufficient balance! Decrease your bet.");
        return;
    }
    
    // Deduct bet immediately upfront
    balance -= currentBet;
    updateDisplays();
    
    switch(activeGame) {
        case 'slots': playSlots(); break;
        case 'coin': playCoinFlip(); break;
        case 'crash': startCrash(); break;
        case 'roulette': playRoulette(); break;
        case 'rps': playRPS(); break;
        case 'mines': startMines(); break;
        case 'blackjack': startBlackjack(); break;
        case 'baccarat': playBaccarat(); break;
        case 'dice': playDice(); break;
        case 'wheel': playWheel(); break;
        case 'plinko': playPlinko(); break;
        default:
            setSystemMessage("Game engine selection error.");
    }
}

// ============================================
// GAME 1: SLOTS
// ============================================
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
].filter(Boolean);

const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];

function playSlots() {
    if (reels.length < 3) {
        setSystemMessage("Error: Missing slot reel DOM structures.");
        return;
    }
    setSystemMessage("Spinning reels...");
    if (actionBtn) actionBtn.disabled = true;
    
    let spinCount = 0;
    const maxSpins = 10;
    
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        });
        
        spinCount++;
        if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            if (actionBtn) actionBtn.disabled = false;
            checkSlotsWin();
        }
    }, 100);
}

function checkSlotsWin() {
    const result = reels.map(reel => reel.textContent);
    const [r1, r2, r3] = result;
    
    if (r1 === r2 && r2 === r3) {
        const winAmount = currentBet * 20;
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`JACKPOT! All three match! You won $${winAmount}!`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
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
    const checkedRadio = document.querySelector('input[name="coin-choice"]:checked');
    if (!checkedRadio) {
        setSystemMessage("Please select Heads or Tails first!");
        balance += currentBet; // Refund bet deduction
        updateDisplays();
        return;
    }
    
    if (actionBtn) actionBtn.disabled = true;
    const choice = checkedRadio.value;
    setSystemMessage(`Coin flipping... You chose ${choice}`);
    
    if (coinElement) {
        coinElement.style.transition = 'transform 0.5s ease-out';
        coinElement.style.transform = 'rotateY(720deg)';
    }
    
    setTimeout(() => {
        if (coinElement) {
            coinElement.style.transform = 'rotateY(0deg)';
        }
        
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        if (coinElement) {
            coinElement.textContent = result === 'Heads' ? '🪙 Heads' : '🪙 Tails';
        }
        
        if (choice === result) {
            const winAmount = currentBet * 2;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`It's ${result}! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`It's ${result}. You lost. Try again!`);
        }
        
        if (actionBtn) actionBtn.disabled = false;
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
    crashGameActive = true;
    crashMultiplier = 1.00;
    
    // True crash math algorithm simulation
    crashPoint = (Math.random() * 5 + 1).toFixed(2);
    if (Math.random() < 0.2) crashPoint = 1.00; // 20% Instant loss rate protection
    
    if (crashOutput) crashOutput.textContent = '1.00x';
    crashCashoutBtn?.classList.remove('hidden');
    updateActionButtonText();
    setSystemMessage(`Crash matrix live! Multiplier ascending...`);
    
    if (decreaseBetBtn) decreaseBetBtn.disabled = true;
    if (increaseBetBtn) increaseBetBtn.disabled = true;

    crashInterval = setInterval(() => {
        crashMultiplier += 0.02; // Slightly accelerated scale
        if (crashOutput) crashOutput.textContent = `${crashMultiplier.toFixed(2)}x`;
        
        if (crashMultiplier >= parseFloat(crashPoint)) {
            clearInterval(crashInterval);
            crashGameActive = false;
            crashCashoutBtn?.classList.add('hidden');
            lastWin = 0;
            setSystemMessage(`CRASHED at ${crashMultiplier.toFixed(2)}x! You lost $${currentBet}`);
            
            if (decreaseBetBtn) decreaseBetBtn.disabled = false;
            if (increaseBetBtn) increaseBetBtn.disabled = false;
            updateActionButtonText();
            updateDisplays();
        }
    }, 75);
}

function cashoutCrash() {
    if (!crashGameActive) return;
    clearInterval(crashInterval);
    crashGameActive = false;
    crashCashoutBtn?.classList.add('hidden');
    
    const winAmount = currentBet * crashMultiplier;
    balance += winAmount;
    lastWin = winAmount;
    setSystemMessage(`Cashed out at ${crashMultiplier.toFixed(2)}x! You won $${winAmount.toFixed(2)}!`);
    
    if (decreaseBetBtn) decreaseBetBtn.disabled = false;
    if (increaseBetBtn) increaseBetBtn.disabled = false;
    updateActionButtonText();
    updateDisplays();
}

crashCashoutBtn?.addEventListener('click', cashoutCrash);

// ============================================
// GAME 4: ROULETTE
// ============================================
const rouletteOutput = document.getElementById('roulette-ball-output');
const rouletteTarget = document.getElementById('roulette-target-input');

function playRoulette() {
    if (!rouletteTarget || rouletteTarget.value === "") {
        setSystemMessage("Please enter a valid target pocket number (0-36) first!");
        balance += currentBet;
        updateDisplays();
        return;
    }
    
    const target = parseInt(rouletteTarget.value, 10);
    if (isNaN(target) || target < 0 || target > 36) {
        setSystemMessage("Invalid pocket! Choose a value between 0 and 36.");
        balance += currentBet;
        updateDisplays();
        return;
    }

    if (actionBtn) actionBtn.disabled = true;
    setSystemMessage(`Roulette wheel spinning... Target choice: Pocket ${target}`);
    
    setTimeout(() => {
        const result = Math.floor(Math.random() * 37);
        if (rouletteOutput) rouletteOutput.textContent = result;
        
        if (result === target) {
            const winAmount = currentBet * 36;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🎯 Ball landed on ${result}! Single-number JACKPOT! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`Wheel stopped on pocket ${result}. You lost $${currentBet}`);
        }
        
        if (actionBtn) actionBtn.disabled = false;
        updateDisplays();
    }, 1200);
}

// ============================================
// GAME 5: ROCK PAPER SCISSORS
// ============================================
const rpsPlayer = document.getElementById('rps-player-node');
const rpsComputer = document.getElementById('rps-computer-node');

function playRPS() {
    const checkedRadio = document.querySelector('input[name="rps-choice"]:checked');
    if (!checkedRadio) {
        setSystemMessage("Please choose Rock, Paper, or Scissors first!");
        balance += currentBet;
        updateDisplays();
        return;
    }

    if (actionBtn) actionBtn.disabled = true;
    const choice = checkedRadio.value;
    const choices = ['Rock', 'Paper', 'Scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    
    setSystemMessage(`Throwing down shapes...`);
    
    setTimeout(() => {
        if (rpsPlayer) rpsPlayer.textContent = choice;
        if (rpsComputer) rpsComputer.textContent = computerChoice;
        
        if (choice === computerChoice) {
            balance += currentBet; // Push return
            lastWin = currentBet;
            setSystemMessage(`Both picked ${choice}! It's a draw! Return bet.`);
        } else if (
            (choice === 'Rock' && computerChoice === 'Scissors') ||
            (choice === 'Paper' && computerChoice === 'Rock') ||
            (choice === 'Scissors' && computerChoice === 'Paper')
        ) {
            const winAmount = currentBet * 2;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`Victory! ${choice} beats ${computerChoice}. You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`Defeat! ${computerChoice} overrides your ${choice}. Lost $${currentBet}.`);
        }
        
        if (actionBtn) actionBtn.disabled = false;
        updateDisplays();
    }, 600);
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
    minesGameActive = true;
    minesCashedOut = false;
    minesDug = 0;
    minesBoard = [];
    
    let minePositions = new Set();
    while (minePositions.size < MINES_COUNT) {
        minePositions.add(Math.floor(Math.random() * GRID_SIZE));
    }
    
    for (let i = 0; i < GRID_SIZE; i++) {
        minesBoard.push(minePositions.has(i));
    }
    
    if (minesBoardEl) {
        minesBoardEl.innerHTML = '';
        for (let i = 0; i < GRID_SIZE; i++) {
            const tile = document.createElement('div');
            tile.className = 'mines-tile';
            tile.dataset.index = i;
            tile.textContent = '❓';
            tile.style.backgroundColor = ''; // clear styles
            tile.addEventListener('click', () => digMines(i, tile));
            minesBoardEl.appendChild(tile);
        }
    }
    
    minesCashoutBtn?.classList.remove('hidden');
    updateActionButtonText();
    setSystemMessage(`Mines deployed! ${MINES_COUNT} hazards hidden. Dig carefully!`);
}

function digMines(index, tile) {
    if (!minesGameActive || minesCashedOut || tile.classList.contains('digged')) {
        return;
    }
    
    tile.classList.add('digged');
    
    if (minesBoard[index]) {
        tile.textContent = '💣';
        tile.style.backgroundColor = '#ff4444';
        minesGameActive = false;
        minesCashoutBtn?.classList.add('hidden');
        lastWin = 0;
        setSystemMessage(`💥 DETONATION! You struck a mine! You lost $${currentBet}`);
        revealAllMines();
        updateActionButtonText();
        updateDisplays();
    } else {
        tile.textContent = '💎';
        tile.style.backgroundColor = '#44ff44';
        minesDug++;
        
        const multiplier = 1 + (minesDug * 0.35);
        setSystemMessage(`Safe selection! ${minesDug}/${GRID_SIZE - MINES_COUNT} cleared. Current value: ${multiplier.toFixed(2)}x`);
        
        if (minesDug >= GRID_SIZE - MINES_COUNT) {
            cashoutMines();
        }
    }
}

function cashoutMines() {
    if (!minesGameActive || minesCashedOut) return;
    
    minesCashedOut = true;
    minesGameActive = false;
    minesCashoutBtn?.classList.add('hidden');
    
    const multiplier = 1 + (minesDug * 0.35);
    const winAmount = currentBet * multiplier;
    balance += winAmount;
    lastWin = winAmount;
    setSystemMessage(`Successful field extraction! Clear route multiplier achieved ${multiplier.toFixed(2)}x. Won $${winAmount.toFixed(2)}!`);
    revealAllMines();
    updateActionButtonText();
    updateDisplays();
}

function revealAllMines() {
    if (!minesBoardEl) return;
    const tiles = minesBoardEl.querySelectorAll('.mines-tile');
    tiles.forEach((tile, i) => {
        if (!tile.classList.contains('digged')) {
            tile.classList.add('digged');
            if (minesBoard[i]) {
                tile.textContent = '💣';
                tile.style.backgroundColor = '#aa3333';
            } else {
                tile.textContent = '💎';
                tile.style.backgroundColor = '#33aa33';
            }
        }
    });
}

minesCashoutBtn?.addEventListener('click', cashoutMines);

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
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value, 10);
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
    if (!element) return;
    const cardEl = document.createElement('div');
    cardEl.className = 'bj-card-element';
    cardEl.textContent = `${card.value}${card.suit}`;
    
    // Aesthetic color styling for cards
    if (['♥', '♦'].includes(card.suit)) {
        cardEl.style.color = 'red';
    }
    element.appendChild(cardEl);
}

function startBlackjack() {
    blackjackDeck = createDeck();
    blackjackPlayerHand = [blackjackDeck.pop(), blackjackDeck.pop()];
    blackjackDealerHand = [blackjackDeck.pop()];
    blackjackGameActive = true;
    
    if (bjDealerCards) bjDealerCards.innerHTML = '';
    if (bjPlayerCards) bjPlayerCards.innerHTML = '';
    
    renderCard(blackjackDealerHand[0], bjDealerCards);
    if (bjDealerScore) bjDealerScore.textContent = getCardValue(blackjackDealerHand[0]);
    
    for (let card of blackjackPlayerHand) {
        renderCard(card, bjPlayerCards);
    }
    
    const pScore = calculateHandScore(blackjackPlayerHand);
    if (bjPlayerScore) bjPlayerScore.textContent = pScore;
    
    updateActionButtonText();
    
    if (pScore === 21) {
        // Natural Blackjack payout check
        setSystemMessage("Natural Blackjack!");
        dealerBlackjackTurn();
    } else {
        bjActionGroup?.classList.remove('hidden');
        setSystemMessage("Hit or Stand?");
    }
}

bjHitBtn?.addEventListener('click', () => {
    if (!blackjackGameActive) return;
    
    const card = blackjackDeck.pop();
    blackjackPlayerHand.push(card);
    renderCard(card, bjPlayerCards);
    
    const score = calculateHandScore(blackjackPlayerHand);
    if (bjPlayerScore) bjPlayerScore.textContent = score;
    
    if (score > 21) {
        endBlackjack('lose');
    }
});

bjStandBtn?.addEventListener('click', () => {
    if (!blackjackGameActive) return;
    dealerBlackjackTurn();
});

function dealerBlackjackTurn() {
    let dealerScore = calculateHandScore(blackjackDealerHand);
    
    // Dealer hits until hitting structural soft 17 requirements
    while (dealerScore < 17) {
        const card = blackjackDeck.pop();
        blackjackDealerHand.push(card);
        renderCard(card, bjDealerCards);
        dealerScore = calculateHandScore(blackjackDealerHand);
    }
    
    if (bjDealerScore) bjDealerScore.textContent = dealerScore;
    const playerScore = calculateHandScore(blackjackPlayerHand);
    
    if (dealerScore > 21) {
        endBlackjack('win');
    } else if (playerScore > dealerScore) {
        endBlackjack('win');
    } else if (playerScore === dealerScore) {
        endBlackjack('draw');
    } else {
        endBlackjack('lose');
    }
}

function endBlackjack(result) {
    blackjackGameActive = false;
    bjActionGroup?.classList.add('hidden');
    
    if (result === 'win') {
        const winAmount = currentBet * 2;
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`You win the hand! Received $${winAmount}!`);
    } else if (result === 'draw') {
        balance += currentBet;
        lastWin = currentBet;
        setSystemMessage(`Dealer push. Your bet of $${currentBet} has been returned.`);
    } else {
        lastWin = 0;
        setSystemMessage(`Dealer wins. You lost $${currentBet}`);
    }
    
    updateActionButtonText();
    updateDisplays();
}

// ============================================
// GAME 8: BACCARAT
// ============================================
function playBaccarat() {
    const checkedRadio = document.querySelector('input[name="bac-target"]:checked');
    if (!checkedRadio) {
        setSystemMessage("Please select a target position (PLAYER, BANKER, TIE) to back!");
        balance += currentBet;
        updateDisplays();
        return;
    }
    
    if (actionBtn) actionBtn.disabled = true;
    const betType = checkedRadio.value;
    setSystemMessage(`Cards dealing... You chose ${betType}`);
    
    // Classical mod 10 score math limits
    const playerScore = Math.floor(Math.random() * 10);
    const bankerScore = Math.floor(Math.random() * 10);
    
    const pScoreEl = document.getElementById('bac-player-score');
    const bScoreEl = document.getElementById('bac-banker-score');
    if (pScoreEl) pScoreEl.textContent = playerScore;
    if (bScoreEl) bScoreEl.textContent = bankerScore;
    
    let result = '';
    let winAmount = 0;
    
    if (playerScore > bankerScore) {
        result = 'PLAYER';
    } else if (bankerScore > playerScore) {
        result = 'BANKER';
    } else {
        result = 'TIE';
    }
    
    const trendHistory = document.getElementById('bac-trend-history');
    if (trendHistory) {
        const newTrend = document.createElement('span');
        newTrend.className = `trend-dot ${result.toLowerCase()}`;
        newTrend.textContent = result[0];
        trendHistory.appendChild(newTrend);
    }
    
    if (result === betType) {
        if (betType === 'PLAYER') {
            winAmount = currentBet * 2;
        } else if (betType === 'BANKER') {
            winAmount = currentBet * 1.95; // 5% house commission handled
        } else {
            winAmount = currentBet * 9; // 8:1 payout plus return
        }
        balance += winAmount;
        lastWin = winAmount;
        setSystemMessage(`Coupe complete. ${result} wins! Paid out $${winAmount.toFixed(2)}!`);
    } else {
        lastWin = 0;
        setSystemMessage(`${result} won this shoe card round. You lost $${currentBet}`);
    }
    
    if (actionBtn) actionBtn.disabled = false;
    updateDisplays();
}

// ============================================
// GAME 9: DICE
// ============================================
const diceOutput = document.getElementById('dice-result-output');

function playDice() {
    const checkedRadio = document.querySelector('input[name="dice-choice"]:checked');
    if (!checkedRadio) {
        setSystemMessage("Please choose Over or Under first!");
        balance += currentBet;
        updateDisplays();
        return;
    }

    if (actionBtn) actionBtn.disabled = true;
    const choice = checkedRadio.value;
    setSystemMessage(`Dice shaking... Targeting ${choice} 50`);
    
    setTimeout(() => {
        const result = Math.floor(Math.random() * 100);
        if (diceOutput) diceOutput.textContent = result;
        
        let won = false;
        if (choice === 'Over' && result > 50) won = true;
        if (choice === 'Under' && result < 50) won = true;
        
        if (won) {
            const winAmount = currentBet * 2;
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🎲 Roll hit ${result}! Winner! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`Roll hit ${result}. Condition failed. You lost $${currentBet}`);
        }
        
        if (actionBtn) actionBtn.disabled = false;
        updateDisplays();
    }, 800);
}

// ============================================
// GAME 10: WHEEL
// ============================================
const wheelOutput = document.getElementById('wheel-spinner-output');

function playWheel() {
    if (!wheelOutput) {
        setSystemMessage("Error: Wheel graphics component node is missing.");
        return;
    }
    if (actionBtn) actionBtn.disabled = true;
    setSystemMessage("Wheel spinning...");
    
    wheelOutput.style.transition = 'transform 2s cubic-bezier(0.1, 0.8, 0.1, 1)';
    // Compute random degree offsets to align uniquely every time
    const targetDeg = 720 + Math.floor(Math.random() * 360);
    wheelOutput.style.transform = `rotate(${targetDeg}deg)`;
    
    setTimeout(() => {
        wheelOutput.style.transition = 'none';
        wheelOutput.style.transform = 'rotate(0deg)';
        
        const segments = [
            { multiplier: 0.5 },
            { multiplier: 1 },
            { multiplier: 2 },
            { multiplier: 3 },
            { multiplier: 5 },
            { multiplier: 10 }
        ];
        
        const result = segments[Math.floor(Math.random() * segments.length)];
        const winAmount = currentBet * result.multiplier;
        
        if (result.multiplier >= 1) {
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🎡 Stopped on ${result.multiplier}x multiplier zone! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`🎡 Dropped onto ${result.multiplier}x return loss area. You lost $${currentBet}`);
        }
        
        if (actionBtn) actionBtn.disabled = false;
        updateDisplays();
    }, 2000);
}

// ============================================
// GAME 11: PLINKO
// ============================================
function playPlinko() {
    const display = document.getElementById('plinko-display-board');
    if (!display) {
        setSystemMessage("Error: Missing target Plinko UI frame container.");
        return;
    }
    if (actionBtn) actionBtn.disabled = true;
    setSystemMessage("Plinko peg drop initiated...");
    
    display.innerHTML = '<div class="plinko-node animate-bounce">●</div>';
    
    setTimeout(() => {
        const multipliers = [0.2, 0.5, 1.5, 2, 4, 7, 12];
        const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        const winAmount = currentBet * multiplier;
        
        display.innerHTML = `<div class="plinko-slot-result">Land multiplier: ${multiplier}x</div>`;
        
        if (multiplier >= 1) {
            balance += winAmount;
            lastWin = winAmount;
            setSystemMessage(`🔵 Peg tracked into the ${multiplier}x tray! You won $${winAmount}!`);
        } else {
            lastWin = 0;
            setSystemMessage(`🔵 Peg slipped into a lower ${multiplier}x value tray. Lost $${currentBet}`);
        }
        
        if (actionBtn) actionBtn.disabled = false;
        updateDisplays();
    }, 1500);
}

// ============================================
// INITIALIZATION
// ============================================
// Perform standard baseline rendering passes
updateDisplays();
updateActionButtonText();
setSystemMessage("Welcome to Casino Royale! Select a game arena to start playing.");
