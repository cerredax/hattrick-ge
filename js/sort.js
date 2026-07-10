// ── Click en cabecera de tabla ───────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('thead').addEventListener('click', function(e) {
    var th = e.target.closest('th.sortable');
    if (!th) return;
    var col      = th.dataset.col;
    var existing = sortKeys.findIndex(function(k) { return k.col === col; });
    var dir      = existing >= 0 ? sortKeys[existing].dir * -1 : -1;
    sortKeys = [{ col: col, dir: dir }];
    syncSortUI();
    actualizarCabecerasSort();
    renderTabla();
  });
});

// ── Panel de ordenación ──────────────────────────────────────────
function toggleSortPanel() {
  var panel = document.getElementById('sortPanel');
  var open  = panel.style.display !== 'none';
  if (open) { panel.style.display = 'none'; return; }
  renderSortPanel();
  panel.style.display = 'block';
}

document.addEventListener('click', function(e) {
  var wrap = document.getElementById('sortWrap');
  if (wrap && !wrap.contains(e.target)) {
    var p = document.getElementById('sortPanel');
    if (p) p.style.display = 'none';
  }
});

function renderSortPanel() {
  var container = document.getElementById('sortLevels');
  if (!container) return;
  container.innerHTML = '';

  if (sortKeys.length === 0) {
    var empty = document.createElement('p');
    empty.className   = 'sort-panel-empty';
    empty.textContent = 'Sin criterios de ordenación';
    container.appendChild(empty);
  } else {
    sortKeys.forEach(function(k, i) {
      var row = document.createElement('div');
      row.className = 'sort-level-row';

      var num = document.createElement('span');
      num.className   = 'sort-level-num';
      num.textContent = i + 1;

      var sel = document.createElement('select');
      sel.className = 'sort-level-col';
      SORT_COLS.forEach(function(c) {
        var o = document.createElement('option');
        o.value = c.val; o.textContent = c.label;
        if (c.val === k.col) o.selected = true;
        sel.appendChild(o);
      });
      (function(idx) { sel.onchange = function() { setSortLevelCol(idx, this.value); }; })(i);

      var btnDir = document.createElement('button');
      btnDir.className   = 'sort-level-dir';
      btnDir.textContent = k.dir === 1 ? '↑ Asc' : '↓ Desc';
      (function(idx) { btnDir.onclick = function() { toggleSortLevelDir(idx); }; })(i);

      var btnDel = document.createElement('button');
      btnDel.className   = 'sort-level-del';
      btnDel.title       = 'Eliminar';
      btnDel.textContent = '×';
      (function(idx) { btnDel.onclick = function() { removeSortLevel(idx); }; })(i);

      row.appendChild(num);
      row.appendChild(sel);
      row.appendChild(btnDir);
      row.appendChild(btnDel);
      container.appendChild(row);
    });
  }

  var badge = document.getElementById('sortBadge');
  if (badge) {
    badge.textContent   = sortKeys.length;
    badge.style.display = sortKeys.length ? 'inline-flex' : 'none';
  }
}

function addSortLevel() {
  var used = sortKeys.map(function(k) { return k.col; });
  var next = null;
  for (var i = 0; i < SORT_COLS.length; i++) {
    if (used.indexOf(SORT_COLS[i].val) === -1) { next = SORT_COLS[i]; break; }
  }
  if (!next) return;
  sortKeys.push({ col: next.val, dir: -1 });
  renderSortPanel();
  actualizarCabecerasSort();
  renderTabla();
}

function removeSortLevel(i) {
  sortKeys.splice(i, 1);
  renderSortPanel();
  actualizarCabecerasSort();
  renderTabla();
}

function setSortLevelCol(i, col) {
  var dup = -1;
  for (var j = 0; j < sortKeys.length; j++) {
    if (j !== i && sortKeys[j].col === col) { dup = j; break; }
  }
  if (dup !== -1) { sortKeys.splice(dup, 1); if (dup < i) i--; }
  sortKeys[i].col = col;
  renderSortPanel();
  actualizarCabecerasSort();
  renderTabla();
}

function toggleSortLevelDir(i) {
  sortKeys[i].dir *= -1;
  renderSortPanel();
  actualizarCabecerasSort();
  renderTabla();
}

function clearSort() {
  sortKeys = [];
  renderSortPanel();
  actualizarCabecerasSort();
  renderTabla();
}

function syncSortUI() {
  renderSortPanel();
}

// ── Indicadores en cabeceras ─────────────────────────────────────
function actualizarCabecerasSort() {
  document.querySelectorAll('th.sortable').forEach(function(t) {
    t.classList.remove('sort-asc', 'sort-desc', 'sort-sec');
    t.removeAttribute('data-sort-rank');
  });
  sortKeys.forEach(function(k, i) {
    var t = document.querySelector('th[data-col="' + k.col + '"]');
    if (!t) return;
    t.classList.add(k.dir === 1 ? 'sort-asc' : 'sort-desc');
    if (i === 1) t.classList.add('sort-sec');
    t.setAttribute('data-sort-rank', i + 1);
  });
}
