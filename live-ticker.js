/**
 * LIVE NETWORK ACTIVITY TICKER ENGINE
 * Generates real-time feeds of simulated wins/payouts across active games.
 */
(function() {
    const GAMES = ['Soccer Arena', 'Cyber Keno', 'Baccarat Arena', 'Space Fishing', 'Solar Roulette'];
    const USERS = ['Mr. Tola', 'Mr. Neo_99', 'Ms. Vichika', 'Mr. KenoMaster', 'Mr. Vortex_01', 'Mr. Astra_Dev', 'Ms. Nita', 'Mr. Huokaing_Thara', 'Mr. Nou_vichaka', 'Mr. Do', 'Ms. Sok Rachana', 'Mr. Sok Khemera', 'Mr. Dom', 'Ms. Kimmuy', 'Mr. Men', 'Mr. Man', 'Mr. Kuo', 'Mr. Mek', 'Mr. B','Test User', 'Mr. Thorn', 'Mrs. San Sopheata', 'Mr. Chansamnang', 'Mr. Huo','Mr. Raem', 'Ms. Seng Viseynea', 'Ms. Som Sodavin', 'Mrs. Svay Metrey', 'Mr. Chorn Rothanak', 'Mr. Phay Chanrothana', 'Mr. Vanneat', 'Mr. Mengly', 'Ms. Ton Ni Mey', 'Mr. Ton Ni Rath', 'Ms. Tharoth', 'Mr. Heng', 'Mr. Thorn Vichet', 'Mr. Jerry', 'Mr. Bo', 'Mr. Tom', 'Mr. Chum Chan Rothanak', 'Mr. Seng Chhat', 'Mrs. Dalin', 'Ms. Khouch', 'Mr. Tek Hy', 'Mr. Tray', 'Mr. Chea', 'Mr. Phann'];

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
        
        // Generate payout between $100,000.00 and $9,999,999.00
        const randomRawAmount = Math.random() * 9899999 + 100000;
        const formattedAmount = randomRawAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return `<div class="ticker-item">
            <span class="usr">${randomUser}</span> won 
            <span class="amt">+$${formattedAmount}</span> on 
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
