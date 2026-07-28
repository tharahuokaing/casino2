/**
 * CYBER DATA EXPORTER ENGINE
 * Exports IndexedDB transaction ledger data into CSV and JSON formats.
 */
(function() {
    const DB_NAME = 'CyberCasinoDB';
    const STORE_NAME = 'transaction_ledger';

    document.addEventListener('DOMContentLoaded', () => {
        injectExportControls();
        setupExportEvents();
    });

    // 1. Inject Export Buttons into Ledger & Analytics Footers
    function injectExportControls() {
        // Add to Ledger Footer
        const ledgerFooter = document.querySelector('.ledger-footer');
        if (ledgerFooter) {
            const exportGroup = `
            <div class="export-btn-group">
                <button id="export-json-btn" class="btn-export btn-json">EXPORT JSON</button>
                <button id="export-csv-btn" class="btn-export btn-csv">EXPORT CSV</button>
            </div>`;
            ledgerFooter.insertAdjacentHTML('afterbegin', exportGroup);
        }
    }

    // 2. Fetch Data from IndexedDB
    function getLedgerData() {
        return new Promise((resolve) => {
            const req = indexedDB.open(DB_NAME);
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) return resolve([]);
                
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const getAll = store.getAll();
                getAll.onsuccess = () => resolve(getAll.result || []);
            };
            req.onerror = () => resolve([]);
        });
    }

    // 3. Export Formatter logic
    async function triggerJSONExport() {
        const data = await getLedgerData();
        if (data.length === 0) return alert('No transaction data to export.');

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        downloadBlob(jsonString, `cyber_ledger_${getTimestampString()}.json`);
    }

    async function triggerCSVExport() {
        const data = await getLedgerData();
        if (data.length === 0) return alert('No transaction data to export.');

        const headers = ['ID', 'Timestamp', 'Game', 'Type', 'Amount', 'NetChange', 'BalanceAfter'];
        const csvRows = [headers.join(',')];

        data.forEach(item => {
            const row = [
                item.id || '',
                `"${item.timestamp}"`,
                `"${item.game}"`,
                item.type,
                item.amount,
                item.netChange,
                item.balanceAfter
            ];
            csvRows.push(row.join(','));
        });

        const csvString = `data:text/csv;charset=utf-8,${encodeURIComponent(csvRows.join('\n'))}`;
        downloadBlob(csvString, `cyber_ledger_${getTimestampString()}.csv`);
    }

    // Helper Download Trigger
    function downloadBlob(content, filename) {
        const link = document.createElement('a');
        link.setAttribute('href', content);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function getTimestampString() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    }

    function setupExportEvents() {
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'export-json-btn') triggerJSONExport();
            if (e.target.id === 'export-csv-btn') triggerCSVExport();
        });
    }
})();
