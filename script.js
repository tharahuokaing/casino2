/**
 * CC-v7.0 CORE APPLICATION CONTROLLER
 * Core System Operations & Navigation Management Module
 */

// Global System State Matrix
let state = {
    balance: 1000,
    currentBet: 10,
    lastWin: 0,
    activeTab: 'slots',
    trendHistory: ['P', 'B', 'B', 'T', 'P'] // Pre-loaded trend data array
};

// DOM Elements Registry
const DOM = {
    balance: document.getElementById('balance-display'),
    bet: document.getElementById('bet-display'),
    win: document.getElementById('win-display'),
    msg: document.getElementById('system-message'),
    actionBtn: document.getElementById('btn-action'),
    navBtns: document.querySelectorAll('.nav-btn'),
    gameWindows: document.querySelectorAll('.game-window'),
    bgAudio: document.getElementById('core-bg-sound'),
    audioIcon: document.querySelector('.audio-icon'),
    sysVolume: document.getElementById('sys-volume'),
    
    // Baccarat Engine View Binding Targets
    bacPlayerScore: document.getElementById('bac-player-score'),
    bacBankerScore: document.getElementById('bac-banker-score'),
    bacPlayerCards: document.getElementById('bac-player-cards'),
    bacBankerCards: document.getElementById('bac-banker-cards'),
    bacTrendHistory: document.getElementById('bac-trend-history')
};

/**
 * SECTION 1: GLOBAL STATE MODIFIER ENGINE
 */
function updateInterface() {
    DOM.balance.textContent = `$${state.balance.toLocaleString()}`;
    DOM.bet.textContent = `$${state.currentBet}`;
    DOM.win.textContent = `$${state.lastWin}`;
}

function displayMessage(text, type = 'default') {
    DOM.msg.textContent = text;
    DOM.msg.className = ''; // Reset CSS states
    if (type !== 'default') DOM.msg.classList.add(`msg-${type}`);
}

/**
 * SECTION 2: HARDWARE INTERACTION & VIEW ROUTING
 */
DOM.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.id.replace('tab-', '');
        
        // Update operational navigation focus state
        DOM.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Window frame visibility layer cycle
        DOM.gameWindows.forEach(win => win.classList.add('hidden'));
        const activeArena = document.getElementById(`${targetId}-arena`);
        if (activeArena) activeArena.classList.remove('hidden');
        
        state.activeTab = targetId;
        updateActionButtonLabel();
        displayMessage(`Navigation route established: ${targetId.toUpperCase()} module armed.`);
    });
});

function updateActionButtonLabel() {
    switch(state.activeTab) {
        case 'slots':     DOM.actionBtn.textContent = 'SPIN REELS'; break;
        case 'coin':      DOM.actionBtn.textContent = 'FLIP COIN'; break;
        case 'crash':     DOM.actionBtn.textContent = 'LAUNCH ROCKET'; break;
        case 'roulette':   DOM.actionBtn.textContent = 'SPIN WHEEL'; break;
        case 'rps':       DOM.actionBtn.textContent = 'EXECUTE MATCH'; break;
        case 'mines':     DOM.actionBtn.textContent = 'ARM BOARD'; break;
        case 'blackjack':  DOM.actionBtn.textContent = 'DEAL HAND'; break;
        case 'baccarat':   DOM.actionBtn.textContent = 'COMMIT WAGER'; break;
        case 'dice':      DOM.actionBtn.textContent = 'ROLL DICE'; break;
        case 'wheel':     DOM.actionBtn.textContent = 'SPIN RISK WHEEL'; break;
        case 'plinko':    DOM.actionBtn.textContent = 'DROP SPHERE'; break;
        default:          DOM.actionBtn.textContent = 'EXECUTE';
    }
}

// Bet Sizing Step Multipliers
document.getElementById('btn-increase-bet').addEventListener('click', () => {
    if (state.balance >= state.currentBet + 10) {
        state.currentBet += 10;
        updateInterface();
    }
});

document.getElementById('btn-decrease-bet').addEventListener('click', () => {
    if (state.currentBet > 10) {
        state.currentBet -= 10;
        updateInterface();
    }
});

/**
 * SECTION 3: SYSTEM INTEGRATED AUDIO CONTROLS
 */
function toggleSystemAudio() {
    if (DOM.bgAudio.paused) {
        DOM.bgAudio.play().catch(err => console.log("Hardware hardware audio interlock delayed: ", err));
        DOM.audioIcon.textContent = '■';
    } else {
        DOM.bgAudio.pause();
        DOM.audioIcon.textContent = '▶';
    }
}

function adjustSystemVolume(val) {
    DOM.bgAudio.volume = val / 100;
}

/**
 * SECTION 4: MASTER ACTION ROUTER MATRIX
 */
DOM.actionBtn.addEventListener('click', () => {
    if (state.balance < state.currentBet) {
        displayMessage("INSUFFICIENT LIQUID BALANCE MATRIX CAPITAL.", "error");
        return;
    }

    // Process baseline bet reduction footprint
    state.balance -= state.currentBet;
    updateInterface();

    // Routing Execution Vectors
    if (state.activeTab === 'baccarat') {
        executeBaccaratModule();
    } else {
        // Fallback interface handler mapping for external scripts (script1.js through script4.js)
        const placeholderWins = [0, state.currentBet * 2, 0, 0, state.currentBet * 1.5];
        const selectedWin = placeholderWins[Math.floor(Math.random() * placeholderWins.length)];
        
        state.lastWin = selectedWin;
        state.balance += selectedWin;
        
        if (selectedWin > 0) {
            displayMessage(`Execution complete. Module returned payload: +$${selectedWin}!`, "success");
        } else {
            displayMessage("Execution complete. Capital absorbed by matrix.", "error");
        }
        updateInterface();
    }
});

/**
 * SECTION 5: MODULAR BACCARAT COMPONENT CONTROLLER
 */
function executeBaccaratModule() {
    // Collect active input states from DOM layout mapping
    const targetBetZone = document.querySelector('input[name="bac-target"]:checked').value;
    
    displayMessage("Computing vector matrices... drawing card configurations...");
    
    // Fire analytical rule processor from target module
    const result = BaccaratEngine.executeRound(targetBetZone, state.currentBet);
    
    // Commit transaction math to balance architecture
    state.lastWin = Math.floor(result.payout);
    state.balance += state.lastWin;
    
    // Push results array to display engine
    DOM.bacPlayerScore.textContent = result.playerScore;
    DOM.bacBankerScore.textContent = result.bankerScore;
    
    renderBaccaratCards(DOM.bacPlayerCards, result.playerHand);
    renderBaccaratCards(DOM.bacBankerCards, result.bankerHand);
    
    // Append structural road logging tracker configurations
    state.trendHistory.push(result.outcome[0]);
    if (state.trendHistory.length > 14) state.trendHistory.shift(); // Constrain viewport spill
    renderTrendLogger();

    // Render outcome messages
    if (state.lastWin > 0) {
        displayMessage(`[${result.outcome} WIN] Target alignment successful! Credited: +$${state.lastWin}`, "success");
    } else {
        displayMessage(`[${result.outcome} WIN] Target alignment lost. Matrix cleared.`, "error");
    }
    
    updateInterface();
}

function renderBaccaratCards(container, hand) {
    container.innerHTML = '';
    hand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'bj-card-element';
        // Assign color codes based on physical card characteristics
        if (['♥', '♦'].includes(card.suit)) {
            cardDiv.style.color = '#ff3366';
        }
        cardDiv.textContent = `${card.value}${card.suit}`;
        container.appendChild(cardDiv);
    });
}

function renderTrendLogger() {
    DOM.bacTrendHistory.innerHTML = '';
    state.trendHistory.forEach(dot => {
        const span = document.createElement('span');
        span.className = 'trend-dot';
        if (dot === 'P') { span.classList.add('player'); span.textContent = 'P'; }
        else if (dot === 'B') { span.classList.add('banker'); span.textContent = 'B'; }
        else { span.classList.add('tie'); span.textContent = 'T'; }
        DOM.bacTrendHistory.appendChild(span);
    });
}

// Global initialization sequence baseline
window.onload = () => {
    updateInterface();
    renderTrendLogger();
};
