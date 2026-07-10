// â”€â”€ Escape HTML â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function espIconSvg(key) {
  var icons = {
    tec: '<path d="M8 2.2c-2.2 0-4 1.7-4 3.8 0 1.5.8 2.6 1.8 3.3v1.1h4.4V9.3C11.2 8.6 12 7.5 12 6c0-2.1-1.8-3.8-4-3.8Z"/><path d="M6.2 12h3.6M6.8 13.7h2.4M5.4 6.2h5.2M8 3.9v4.5"/>',
    imp: '<rect x="3" y="3" width="10" height="10" rx="2"/><circle cx="6.2" cy="6.2" r=".7"/><circle cx="9.8" cy="6.2" r=".7"/><circle cx="8" cy="8" r=".7"/><circle cx="6.2" cy="9.8" r=".7"/><circle cx="9.8" cy="9.8" r=".7"/>',
    pot: '<path d="M5.2 9.7V6.4c0-.8.6-1.4 1.4-1.4h.6V3.8c0-.7.5-1.2 1.2-1.2s1.2.5 1.2 1.2V5h.7c.8 0 1.4.6 1.4 1.4v3.3c0 2-1.5 3.7-3.3 3.7S5.2 11.7 5.2 9.7Z"/><path d="M3.2 8.2h2M10.8 8.2h2M7.2 5v4.6M9.6 5v4.6"/>',
    rap: '<path d="M9.2 1.9 4.4 8.6h3.3l-.9 5.5 4.8-6.8H8.3l.9-5.4Z"/>',
    cab: '<path d="M5 12.8V10c-1-.8-1.6-2-1.6-3.3 0-2.4 1.9-4.3 4.4-4.3s4.4 1.9 4.4 4.3c0 1.8-1.1 3.4-2.7 4v2.1"/><path d="M6.5 6.5h.1M9.5 6.5h.1M6.5 9h3"/><circle cx="11.5" cy="3.6" r="1.7"/>'
  };
  return icons[key] || '';
}

function espBadgeHtml(esp, extraClass) {
  var key = ESP_CLASS[esp] || '';
  var shortLabels = { tec:'Tec', imp:'Imp', pot:'Pot', rap:'Rap', cab:'Cab' };
  var compact = extraClass && extraClass.indexOf('esp-compact') >= 0;
  var label = compact ? (shortLabels[key] || esp) : esp;
  if (!key) return '<span style="color:#c2cbd8">&middot;</span>';
  return '<span class="esp-badge esp-' + key + (extraClass ? ' ' + extraClass : '') + '">'
    + '<svg class="esp-icon" viewBox="0 0 16 16" aria-hidden="true">' + espIconSvg(key) + '</svg>'
    + '<span>' + esc(label) + '</span>'
    + '</span>';
}
