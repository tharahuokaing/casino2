/**
 * MODULE 14: CYBER-SONAR DEEP SEA FISHING ENGINE
 * Coordinates sonar map target updates, biome weight vectors, and 
 * runs programmatic reward calculations tied to target balance models.
 */
(function() {
    // 1. Biome Target Allocation Tables
    const BIOME_MANIFEST = {
        Shallow: {
            name: "Cyber-Mackerel",
            minWeight: 1.2,
            maxWeight: 3.5,
            payout: 2.2,
            catchChance: 0.75 // 75% success rate
        },
        Reef: {
            // Random choice array populated dynamically for reef depths
            species: [
                { name: "Neon Anemone Fin", minWeight: 4.0, maxWeight: 12.8, payout: 5.0, catchChance: 0.55 },
                { name: "Prismatic Ray", minWeight: 15.1, maxWeight: 30.0, payout: 12.0, catchChance: 0.40 }
            ]
        },
        Abyss: {
            name: "Hadopelagic Kraken",
            minWeight: 85.5,
            maxWeight: 275.0,
            payout: 75.0,
            catchChance: 0.12 // 12% high-reward risk profile
        }
    };

    // 2. Local State Management Loops
    let selectedBiome = 'Shallow';
    let isReeling = false;

    // Cache DOM Nodes for fast UI manipulation updates
    const elDepthStatus = document.getElementById('sonar-depth-telemetry');
    const elStatusLine = document.getElementById('fishing-status-line');
    const elCatchBox = document.getElementById('fishing-catch-display');
    const elBalanceDisplay = document.getElementById('balance-display');

    document.addEventListener('DOMContentLoaded', () => {
        initBiomeSelectors();
        initSonarRadarTrigger();
    });

    /**
     * Installs event tracking interceptors on deep sea radio arrays
     */
    function initBiomeSelectors() {
        const depthRadios = document.querySelectorAll('input[name="fishing-depth"]');
        depthRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (isReeling) return;
                selectedBiome = e.target.value;
                updateDepthTelemetry();
            });
        });
    }

    /**
     * Attaches line deployment trigger hooks directly to the main sonar arena box
     */
    function initSonarRadarTrigger() {
        const arenaContainer = document.querySelector('.sonar-viewport-frame');
        if (arenaContainer) {
            arenaContainer.style.cursor = 'pointer';
            arenaContainer.addEventListener('click', () => {
                if (!isReeling) {
                    deploySonarLine();
                }
            });
        }
    }

    /**
     * Updates header status readouts during sector mutations
     */
    function updateDepthTelemetry() {
        if (!elDepthStatus) return;
        switch (selectedBiome) {
            case 'Shallow':
                elDepthStatus.textContent = "SONAR ACTIVE // DEPTH: 45M // UPPER PHOTIC BIOME";
                break;
            case 'Reef':
                elDepthStatus.textContent = "SONAR ACTIVE // DEPTH: 180M // MESOPELAGIC REEF VECTOR";
                break;
            case 'Abyss':
                elDepthStatus.textContent = "SONAR ACTIVE // DEPTH: 4500M // HADAL TRENCH VOID";
                break;
        }
    }

    /**
     * Core Sonar Loop execution handler
     */
    async function deploySonarLine() {
        isReeling = true;
        
        // Fetch baseline balance from existing framework profile
        let currentBalance = parseFloat(elBalanceDisplay?.textContent || '0');
        
        // Base telemetry validation configuration cost mapping (Modify to match your stake framework)
        const baseDeploymentCost = 10.00; 

        if (currentBalance < baseDeploymentCost) {
            if (elStatusLine) elStatusLine.textContent = "INSUFFICIENT FUNDS IN STORAGE CONTAINER";
            isReeling = false;
            return;
        }

        // Subtract structural balance cost overheads
        currentBalance -= baseDeploymentCost;
        if (elBalanceDisplay) elBalanceDisplay.textContent = currentBalance.toFixed(2);

        // Reset display frame arrays before calculations run
        elCatchBox.classList.add('hidden');
        elStatusLine.textContent = "TRANSMITTER DROPPING... SCANNING SCATTERED REFLECTIONS";

        // Shift visual radar ping artifacts inside viewport box
        randomizePingTargets();

        // Async timing mechanics simulating environmental drag loops
        await new Promise(resolve => setTimeout(resolve, 1800));

        // Generate target data matrices from configured state models
        let fishTarget = null;
        if (selectedBiome === 'Reef') {
            const list = BIOME_MANIFEST.Reef.species;
            fishTarget = list[Math.floor(Math.random() * list.length)];
        } else {
            fishTarget = BIOME_MANIFEST[selectedBiome];
        }

        // Algorithmic evaluation validation pass
        const randomRoll = Math.random();
        const success = randomRoll <= fishTarget.catchChance;

        if (success) {
            // Interpolate dynamic weight scalars
            const weight = (Math.random() * (fishTarget.maxWeight - fishTarget.minWeight) + fishTarget.minWeight).toFixed(1);
            const payoutCredits = baseDeploymentCost * fishTarget.payout;
            
            // Sync final credits back to user memory blocks
            currentBalance += payoutCredits;
            if (elBalanceDisplay) elBalanceDisplay.textContent = currentBalance.toFixed(2);

            // Print capture metrics inside HUD overlays
            elStatusLine.textContent = `TARGET ACQUIRED! CRITICAL HARVEST COMPLETE (+${payoutCredits.toFixed(2)})`;
            
            const nameLabel = elCatchBox.querySelector('.fish-name-label');
            const weightLabel = elCatchBox.querySelector('.fish-weight-label');
            
            if (nameLabel) nameLabel.textContent = fishTarget.name.toUpperCase();
            if (weightLabel) weightLabel.textContent = `${weight} KG MATRICES`;
            
            elCatchBox.classList.remove('hidden');
        } else {
            elStatusLine.textContent = "ARRAY TIMEOUT: BIOMASS EVADED RADAR FIELD PROFILE";
        }

        isReeling = false;
    }

    /**
     * Randomly relocates the HTML visual pings to match standard radar patterns
     */
    function randomizePingTargets() {
        const targets = document.querySelectorAll('.sonar-ping-target');
        targets.forEach(target => {
            const topPercent = Math.floor(Math.random() * 60) + 15; // keeping bounded inside view frames
            const leftPercent = Math.floor(Math.random() * 70) + 15;
            target.style.top = `${topPercent}%`;
            target.style.left = `${leftPercent}%`;
        });
    }
})();
