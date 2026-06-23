// 🛡️ LIMITED SECURE MODE - Block Inspect & View Source only
(function() {
  // Block specific keyboard shortcuts
  document.addEventListener('keydown', e => {
    const blocked =
      e.key === 'F12' || // Inspect
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || // Inspect
      (e.ctrlKey && e.key.toLowerCase() === 'u'); // View Source

    if (blocked) {
      e.preventDefault();
      e.stopImmediatePropagation();
      document.title = '🚫 INSPECT / VIEW SOURCE BLOCKED';
      document.body.innerHTML =
        '<div style="background:#000;color:#f00;font-family:monospace;text-align:center;padding-top:30vh;font-size:2em;">🚫 ACTION BLOCKED</div>';
      return false;
    }
  }, true);

  // Allow right-click normally, but block if target is the page background
  document.addEventListener('contextmenu', e => {
    if (e.target === document.body) {
      e.preventDefault();
      e.stopImmediatePropagation();
      document.body.innerHTML =
        '<div style="background:#000;color:#f00;font-family:monospace;text-align:center;padding-top:30vh;font-size:2em;">🚫 INSPECT BLOCKED</div>';
      return false;
    }
    // Otherwise allow normal right-click menus
  });
})();
