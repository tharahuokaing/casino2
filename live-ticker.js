/**
 * LIVE NETWORK ACTIVITY TICKER ENGINE
 * Generates real-time feeds of simulated wins/payouts across active games.
 */
(function() {
    const GAMES = ['Soccer Arena', 'Cyber Keno', 'Baccarat Arena', 'Space Fishing', 'Solar Roulette'];
    const USERS = ['CipherX', 'Neo_99', 'Thara_Cyber', 'KenoMaster', 'Vortex_01', 'Astra_Dev'];

    document.addEventListener('DOMContentLoaded', () => {
        injectTickerHTML();
        startTickerLoop();
    });

    function injectTickerHTML() {
        const tickerHTML = `
        <div class="network-ticker-bar">
            <div class="ticker-badge"><span class="ticker-dot"></span> LIVE NETWORK FEED</div>
            <div class="ticker-viewport">
                <div id="ticker-track" class="ticker-track"></div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('afterbegin', tickerHTML);
    }

    function createRandomWinEntry() {
        const randomUser = USERS[Math.floor(Math.random() * USERS.length)];
        const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
        const randomAmount = (Math.random() * 250 + 10).toFixed(2);

        return `<div class="ticker-item">
            <span class="usr">${randomUser}</span> won 
            <span class="amt">+$${randomAmount}</span> on 
            <span class="game">${randomGame}</span>
        </div>`;
    }

    function startTickerLoop() {
        const track = document.getElementById('ticker-track');
        if (!track) return;

        // Seed initial items
        for (let i = 0; i < 5; i++) {
            track.insertAdjacentHTML('beforeend', createRandomWinEntry());
        }

        // Periodically inject new live wins
        setInterval(() => {
            const newItem = document.createElement('div');
            newItem.innerHTML = createRandomWinEntry();
            const child = newItem.firstElementChild;
            child.classList.add('ticker-enter');
            
            track.prepend(child);
            if (track.children.length > 8) {
                track.removeChild(track.lastElementChild);
            }
        }, 3500);
    }
})();
