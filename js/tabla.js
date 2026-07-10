// ── Render tabla ─────────────────────────────────────────────────
function renderTabla() {
  var grp = document.getElementById('groupBy').value;

  document.getElementById('btnLimpiar').style.display = hayFiltrosActivos() ? 'inline-block' : 'none';

  var list = getJugadoresFiltrados();

  if (sortKeys.length > 0) {
    list.sort(function(a, b) {
      for (var i = 0; i < sortKeys.length; i++) {
        var k   = sortKeys[i];
        var av  = a[k.col] === '' ? -Infinity : +a[k.col];
        var bv  = b[k.col] === '' ? -Infinity : +b[k.col];
        var cmp = (av - bv) * k.dir;
        if (cmp !== 0) return cmp;
        // Si la columna primaria es "años", desempata automáticamente por días
        if (k.col === 'anos' && i === sortKeys.length - 1) {
          var ad = a.dias === '' ? -Infinity : +a.dias;
          var bd = b.dias === '' ? -Infinity : +b.dias;
          return (ad - bd) * k.dir;
        }
      }
      return 0;
    });
  }

  var total = jugadores.length;
  document.getElementById('counter').textContent = list.length < total
    ? list.length + ' de ' + total
    : total + ' jugadores';

  if (list.length === 0) {
    var msg = jugadores.length === 0
      ? '<div class="empty-icon">⏳</div><div class="empty-title">Cargando jugadores…</div>'
      : '<div class="empty-icon">🔍</div><div class="empty-title">Sin resultados</div>' +
        '<div class="empty-desc">Ningún jugador coincide con los filtros aplicados.</div>' +
        '<span class="empty-hint" onclick="limpiarFiltros()">× Limpiar filtros</span>';
    document.getElementById('tbody').innerHTML = '<tr><td colspan="28"><div class="empty-state">' + msg + '</div></td></tr>';
    return;
  }

  var html = '';
  if (grp) {
    var groups = {};
    list.forEach(function(j) {
      var key = String(j[grp] || 'Sin valor');
      if (!groups[key]) groups[key] = [];
      groups[key].push(j);
    });
    var keys = Object.keys(groups).sort(function(a, b) {
      var na = parseFloat(a), nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb)) return nb - na;
      return a.localeCompare(b, 'es');
    });
    keys.forEach(function(key) {
      html += '<tr class="group-row"><td colspan="28">' + esc(key) + ' (' + groups[key].length + ')</td></tr>';
      groups[key].forEach(function(j) { html += renderRow(j); });
    });
  } else {
    list.forEach(function(j) { html += renderRow(j); });
  }

  document.getElementById('tbody').innerHTML = html;
}

function skillCell(val) {
  if (val === '' || val == null) return '<td class="empty">&middot;</td>';
  var high = val >= 14;
  return '<td class="' + (high ? 'num-high' : 'num') + '">' + val + '</td>';
}

function numCell(val) {
  return val !== '' && val != null
    ? '<td class="num">' + val + '</td>'
    : '<td class="empty">&middot;</td>';
}

// ── Edición inline ───────────────────────────────────────────────
function selHtml(id, opts, val) {
  var s = '<select class="er" id="' + id + '">';
  opts.forEach(function(o) {
    s += '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
  });
  return s + '</select>';
}

function erNum(id, val, w) {
  return '<input class="er" type="number" min="0" id="' + id + '" value="' + (val !== '' && val != null ? val : '') + '" style="width:' + (w || 38) + 'px">';
}

function erTxt(id, val, w) {
  return '<input class="er" type="text" id="' + id + '" value="' + esc(val || '') + '" style="width:' + (w || 70) + 'px">';
}

function renderEditRow(j) {
  var htUrl = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;
  var r = '<tr class="edit-row" data-id="' + j.id + '">';
  r += '<td><strong>' + esc(j.nombre) + '</strong></td>';
  r += '<td><a href="' + htUrl + '" target="_blank" style="color:var(--brand);font-family:monospace;font-size:10px;text-decoration:none">' + j.id + '↗</a></td>';
  r += '<td>' + selHtml('er_pos',   POSS_OPTS, j.posicion) + '</td>';
  r += '<td>' + selHtml('er_esp',   ESPS_OPTS, j.esp)    + '</td>';
  r += '<td>' + erNum('er_port',    j.port)               + '</td>';
  r += '<td>' + erNum('er_def',     j.def)                + '</td>';
  r += '<td>' + erNum('er_jug',     j.jug)                + '</td>';
  r += '<td>' + erNum('er_lat',     j.lat)                + '</td>';
  r += '<td>' + erNum('er_pas',     j.pas)                + '</td>';
  r += '<td>' + erNum('er_anot',    j.anot)               + '</td>';
  r += '<td>' + erNum('er_bp',      j.bp)                 + '</td>';
  r += '<td>' + erNum('er_htms',    j.htms,    44)        + '</td>';
  r += '<td>' + erNum('er_htms28',  j.htms28,  44)        + '</td>';
  r += '<td>' + erNum('er_tsi',     j.tsi,     52)        + '</td>';
  r += '<td>' + erNum('er_forma',   j.forma,   38)        + '</td>';
  r += '<td>' + erNum('er_res',     j.resistencia, 38)    + '</td>';
  r += '<td>' + selHtml('er_nivel', NIFS_OPTS, j.nivel)   + '</td>';
  r += '<td>' + erTxt('er_tier',    j.tier,    44)        + '</td>';
  r += '<td>' + erNum('er_anos',    j.anos,    38)        + '</td>';
  r += '<td>' + erNum('er_dias',    j.dias,    38)        + '</td>';
  r += '<td>' + erNum('er_lvent',   j.lvlEnt,  38)        + '</td>';
  r += '<td>' + erNum('er_efent',   j.efEnt,   44)        + '</td>';
  r += '<td>' + erTxt('er_dueno',   j.dueno,   80)        + '</td>';
  r += '<td>' + selHtml('er_con',   CONS_OPTS, j.contacto) + '</td>';
  r += '<td>' + erNum('er_lid',     j.liderazgo,  38)     + '</td>';
  r += '<td>' + erNum('er_exp',     j.experiencia, 38)    + '</td>';
  r += '<td>' + erTxt('er_notas',   j.notas,  120)        + '</td>';
  r += '<td style="white-space:nowrap">'
    + '<button class="btn-sm btn-edit" onclick="saveRowEdit(\'' + j.id + '\')" title="Guardar">💾</button> '
    + '<button class="btn-sm btn-del"  onclick="cancelEdit()" title="Cancelar">✖</button>'
    + '</td>';
  r += '</tr>';
  return r;
}

function startEdit(id) {
  editingId = id;
  renderTabla();
  setTimeout(function() {
    var firstInput = document.querySelector('.edit-row .er');
    if (firstInput) firstInput.focus();
  }, 50);
}

function cancelEdit() {
  editingId = null;
  renderTabla();
}

async function saveRowEdit(id) {
  var idx = jugadores.findIndex(function(j) { return String(j.id) === String(id); });
  if (idx < 0) return;

  function gn(elId) { var v = parseFloat(document.getElementById(elId).value); return isNaN(v) ? '' : Math.max(0, v); }
  function gs(elId) { return document.getElementById(elId).value.trim(); }

  jugadores[idx].posicion    = gs('er_pos');
  jugadores[idx].esp         = gs('er_esp');
  jugadores[idx].port        = gn('er_port');
  jugadores[idx].def         = gn('er_def');
  jugadores[idx].jug         = gn('er_jug');
  jugadores[idx].lat         = gn('er_lat');
  jugadores[idx].pas         = gn('er_pas');
  jugadores[idx].anot        = gn('er_anot');
  jugadores[idx].bp          = gn('er_bp');
  jugadores[idx].htms        = gn('er_htms');
  jugadores[idx].htms28      = gn('er_htms28');
  jugadores[idx].tsi         = gn('er_tsi');
  jugadores[idx].forma       = gn('er_forma');
  jugadores[idx].resistencia = gn('er_res');
  jugadores[idx].nivel       = gs('er_nivel');
  jugadores[idx].tier        = gs('er_tier');
  jugadores[idx].anos        = gn('er_anos');
  jugadores[idx].dias        = gn('er_dias');
  jugadores[idx].lvlEnt      = gn('er_lvent');
  jugadores[idx].efEnt       = gn('er_efent');
  jugadores[idx].dueno       = gs('er_dueno');
  jugadores[idx].contacto    = gs('er_con');
  jugadores[idx].liderazgo   = gn('er_lid');
  jugadores[idx].experiencia = gn('er_exp');
  jugadores[idx].notas       = gs('er_notas');

  var res = await client.from('jugadores').upsert(mapToDb(jugadores[idx]), { onConflict: 'id' });
  if (res.error) { showToast('Error al guardar: ' + res.error.message, 'err'); return; }

  var savedId     = id;
  var savedNombre = jugadores[idx].nombre;
  editingId = null;
  renderTabla();
  showToast('✓ ' + savedNombre + ' guardado.');
  setTimeout(function() {
    var row = document.querySelector('#tbody tr[data-id="' + savedId + '"]');
    if (row) {
      row.classList.add('row-saved');
      setTimeout(function() { row.classList.remove('row-saved'); }, 1200);
    }
  }, 20);
}

// ── Render fila ──────────────────────────────────────────────────
function renderRow(j) {
  if (String(j.id) === String(editingId)) return renderEditRow(j);
  var htUrl  = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;
  var posKey = POS_CLASS[j.posicion] || '';
  var cBadge = j.contacto === 'Sí'
    ? '<span class="badge-si" onclick="toggleContacto(\'' + j.id + '\',event)" title="Clic para cambiar">Sí</span>'
    : '<span class="badge-no" onclick="toggleContacto(\'' + j.id + '\',event)" title="Clic para cambiar">No</span>';

  var r = '<tr data-id="' + j.id + '">';
  r += '<td onclick="openPlayerModal(\'' + j.id + '\')"><strong>' + esc(j.nombre) + '</strong></td>';
  r += '<td><a href="' + htUrl + '" target="_blank" style="color:var(--brand);text-decoration:none;font-family:monospace;font-size:10px">' + j.id + '↗</a></td>';
  r += '<td>' + (posKey ? '<span class="badge badge-' + posKey + '">' + esc(j.posicion) + '</span>' : '<span style="color:#c2cbd8">&mdash;</span>') + '</td>';
  r += '<td>' + espBadgeHtml(j.esp, 'esp-compact') + '</td>';
  r += skillCell(j.port) + skillCell(j.def) + skillCell(j.jug) + skillCell(j.lat);
  r += skillCell(j.pas)  + skillCell(j.anot) + skillCell(j.bp);
  r += numCell(j.htms)   + numCell(j.htms28) + numCell(j.tsi);
  r += numCell(j.forma)  + numCell(j.resistencia);
  r += '<td style="color:var(--muted);font-size:10px">' + esc(j.nivel) + '</td>';
  r += '<td style="color:var(--muted)">' + esc(j.tier) + '</td>';
  r += numCell(j.anos)   + numCell(j.dias);
  r += numCell(j.lvlEnt) + numCell(j.efEnt);
  r += '<td style="color:#475569"><small>' + esc(j.dueno) + '</small></td>';
  r += '<td>' + cBadge + '</td>';
  r += numCell(j.liderazgo) + numCell(j.experiencia);
  r += '<td><small style="color:var(--muted)">' + esc((j.notas || '').substring(0, 50)) + (j.notas && j.notas.length > 50 ? '…' : '') + '</small></td>';
  r += '<td style="white-space:nowrap">'
    + '<button class="btn-sm btn-edit" onclick="startEdit(\'' + j.id + '\')" title="Editar fila">✏️</button>'
    + '</td>';
  r += '</tr>';
  return r;
}

// ── Toggle contacto ──────────────────────────────────────────────
async function toggleContacto(id, event) {
  event.stopPropagation();
  var idx = jugadores.findIndex(function(j) { return String(j.id) === String(id); });
  if (idx < 0) return;
  var anterior = jugadores[idx].contacto;
  var nuevo    = anterior === 'Sí' ? 'No' : 'Sí';
  var res = await client.from('jugadores').update({ contacto: nuevo }).eq('id', id);
  if (res.error) {
    showToast('Error al actualizar contacto: ' + res.error.message, 'err');
    return;
  }
  jugadores[idx].contacto = nuevo;
  renderTabla();
}

