// ── Helpers de barras de habilidad ──────────────────────────────
function skillLevelClass(v) {
  if (!v || v <= 0) return 'lv-0';
  if (v <= 3)  return 'lv-1';
  if (v <= 5)  return 'lv-2';
  if (v <= 8)  return 'lv-3';
  if (v <= 11) return 'lv-4';
  if (v <= 13) return 'lv-5';
  if (v <= 17) return 'lv-6';
  return 'lv-7';
}

function skillBarHtml(label, val) {
  var has = val !== '' && val != null;
  var num = has ? +val : 0;
  var pct = has ? Math.round((Math.min(num, 20) / 20) * 100) : 0;
  var lbl = has && NIVEL_LABEL[num] ? NIVEL_LABEL[num] : '';
  var cls = has ? skillLevelClass(num) : 'lv-0';
  return '<div class="pm-skill-row">'
    + '<span class="pm-skill-label">' + label + '</span>'
    + '<div class="pm-bar-wrap">'
    + (has
      ? '<div class="pm-bar-fill ' + cls + '" style="width:' + pct + '%"><span class="pm-bar-text">' + lbl + '</span></div>'
      : '<span class="pm-bar-empty">&mdash;</span>')
    + '</div>'
    + '<span class="pm-skill-val">' + (has ? num : '&middot;') + '</span>'
    + '</div>';
}

function headerBarHtml(label, val, max) {
  var has = val !== '' && val != null;
  var num = has ? +val : 0;
  var pct = has ? Math.round((Math.min(num, max) / max) * 100) : 0;
  var lbl = has && NIVEL_LABEL[num] ? NIVEL_LABEL[num] : '';
  var cls = has ? skillLevelClass(num) : 'lv-0';
  return '<div class="pm-hbar">'
    + '<span class="pm-hbar-label">' + label + '</span>'
    + '<div class="pm-hbar-track">'
    + (has ? '<div class="pm-hbar-fill ' + cls + '" style="width:' + pct + '%">'
           + (lbl ? '<span class="pm-hbar-text">' + lbl + '</span>' : '')
           + '</div>' : '')
    + '</div>'
    + '<span class="pm-hbar-val">' + (has ? num + '/' + max : '&mdash;') + '</span>'
    + '</div>';
}

// ── Modal jugador (ficha) ────────────────────────────────────────
function openPlayerModal(id) {
  var j = jugadores.find(function(j) { return String(j.id) === String(id); });
  if (!j) return;
  currentModalId = id;

  var posKey = POS_CLASS[j.posicion] || '';
  var espKey = ESP_CLASS[j.esp] || '';
  var htUrl  = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;

  var h = '';

  // Header — nombre · esp · forma · resistencia agrupados
  h += '<div class="pm-header">';
  h +=   '<div class="pm-title-block">';
  h +=     '<div class="pm-name-row">';
  h +=       '<h2>' + esc(j.nombre) + '</h2>';
  if (posKey) h += '<span class="badge badge-' + posKey + '">' + posKey + '</span>';
  h += espBadgeHtml(j.esp, 'esp-pill');
  h +=     '</div>';
  var sub = [];
  if (j.anos !== '' && j.anos != null) sub.push(j.anos + ' años y ' + (j.dias || 0) + ' días');
  if (j.dueno) sub.push('Club: <strong>' + esc(j.dueno) + '</strong>');
  if (sub.length) h += '<div class="pm-sub-row">' + sub.join(' &middot; ') + '</div>';
  var hasForma = j.forma !== '' && j.forma != null;
  var hasRes   = j.resistencia !== '' && j.resistencia != null;
  if (hasForma || hasRes) {
    h += '<div class="pm-header-bars">';
    if (hasForma) h += headerBarHtml('Forma', j.forma, 8);
    if (hasRes)   h += headerBarHtml('Resistencia', j.resistencia, 9);
    h += '</div>';
  }
  h +=   '</div>';
  h +=   '<div class="pm-actions">';
  h +=     '<button class="close-btn" onclick="closePlayerModal()">×</button>';
  h +=   '</div>';
  h += '</div>';

  // Body
  h += '<div class="pm-body-new">';

  // Chips: nivel, tier, TSI
  var chips = [];
  if (j.nivel) chips.push('<span class="pm-chip pm-chip-nivel">' + esc(j.nivel) + '</span>');
  if (j.tier)  chips.push('<span class="pm-chip pm-chip-tier">Tier ' + esc(j.tier) + '</span>');
  if (j.tsi !== '' && j.tsi != null) chips.push('<span class="pm-chip pm-chip-tsi">TSI ' + (+j.tsi).toLocaleString('es-ES') + '</span>');
  if (chips.length) h += '<div class="pm-chips-row">' + chips.join('') + '</div>';

  // Habilidades
  h += '<div class="pm-section-label">Habilidades</div>';
  h += '<div class="pm-skills-table">';
  h += skillBarHtml('Portería',     j.port);
  h += skillBarHtml('Defensa',      j.def);
  h += skillBarHtml('Jugadas',      j.jug);
  h += skillBarHtml('Lateral',      j.lat);
  h += skillBarHtml('Pases',        j.pas);
  h += skillBarHtml('Anotación',    j.anot);
  h += skillBarHtml('Balón parado', j.bp);
  h += '</div>';

  // Perfil — liderazgo, experiencia, HTMS, HTMS28, portal
  var perfil = [];
  if (j.liderazgo   !== '' && j.liderazgo   != null) perfil.push(['Liderazgo',   +j.liderazgo,   NIVEL_LABEL[+j.liderazgo]   || '']);
  if (j.experiencia !== '' && j.experiencia != null) perfil.push(['Experiencia', +j.experiencia, NIVEL_LABEL[+j.experiencia] || '']);
  if (j.htms   !== '' && j.htms   != null) perfil.push(['HTMS',   +j.htms,   '']);
  if (j.htms28 !== '' && j.htms28 != null) perfil.push(['HTMS28', +j.htms28, '']);
  if (j.portal) perfil.push(['Portal', j.portal, '']);
  if (perfil.length) {
    h += '<div class="pm-section-label">Perfil</div>';
    h += '<div class="pm-profile-grid">';
    perfil.forEach(function(p) {
      h += '<div class="pm-profile-card">'
         + '<span class="pm-profile-label">' + p[0] + '</span>'
         + '<span class="pm-profile-val">' + esc(String(p[1])) + '</span>'
         + (p[2] ? '<span class="pm-profile-lbl">' + esc(p[2]) + '</span>' : '')
         + '</div>';
    });
    h += '</div>';
  }

  if (j.notas) {
    h += '<div class="pm-section-label">Notas</div>';
    h += '<div class="pm-notas">' + esc(j.notas) + '</div>';
  }

  h += '</div>'; // pm-body-new

  // Footer
  h += '<div class="pm-footer">';
  h +=   '<a class="pm-ht-btn" href="' + htUrl + '" target="_blank">Ver en Hattrick ↗</a>';
  h +=   '<button class="pm-close-full" onclick="closePlayerModal()">Cerrar</button>';
  h += '</div>';

  document.querySelector('#playerOverlay .player-modal').innerHTML = h;
  document.getElementById('playerOverlay').classList.add('open');
}

function closePlayerModal() {
  document.getElementById('playerOverlay').classList.remove('open');
  currentModalId = null;
}

function closePlayerIfOutside(e) {
  if (e.target === document.getElementById('playerOverlay')) closePlayerModal();
}

// ── Modal ayuda ──────────────────────────────────────────────────
function toggleHelp() {
  document.getElementById('helpModal').classList.toggle('open');
}

function closeHelpIfOutside(e) {
  if (e.target === document.getElementById('helpModal')) toggleHelp();
}

// ── Modal alta (nueva ficha) ─────────────────────────────────────
function toggleAltaPanel() {
  var m = document.getElementById('altaModal');
  if (m.classList.contains('open')) {
    closeAltaPanel();
  } else {
    var inner = document.getElementById('altaModalInner');
    var tpl   = document.getElementById('tplAlta');
    inner.innerHTML = '';
    inner.appendChild(tpl.content.cloneNode(true));
    m.classList.add('open');
    document.getElementById('nNombre').focus();
  }
}

function closeAltaPanel() {
  document.getElementById('altaModal').classList.remove('open');
}

function closeAltaIfOutside(e) {
  if (e.target === document.getElementById('altaModal')) closeAltaPanel();
}

function showNewMsg(txt, cls) {
  var el = document.getElementById('newMsg');
  if (!el) return;
  el.textContent = txt; el.className = 'msg ' + cls; el.style.display = 'block';
}

function resetAltaForm() {
  var inner = document.getElementById('altaModalInner');
  var tpl   = document.getElementById('tplAlta');
  inner.innerHTML = '';
  inner.appendChild(tpl.content.cloneNode(true));
  document.getElementById('nNombre').focus();
}

async function saveNewPlayer() {
  var nombre = document.getElementById('nNombre').value.trim();
  var id     = document.getElementById('nId').value.trim().replace(/[^\d]/g, '');
  if (!nombre || !id) {
    showNewMsg('Nombre e ID son obligatorios.', 'err'); return;
  }
  if (jugadores.find(function(j) { return j.id === id; })) {
    showNewMsg('Ya existe un jugador con ese ID.', 'err'); return;
  }

  function iv(elId) { var v = parseFloat(document.getElementById(elId).value); return isNaN(v) ? null : Math.max(0, v); }
  function sv(elId) { var v = document.getElementById(elId).value.trim(); return v || null; }

  var row = {
    id: id, nombre: nombre,
    anos: iv('nAnos'), dias: iv('nDias'),
    especialidad: sv('nEsp'),
    porteria:     iv('nPort'), defensa:    iv('nDef'),
    jugadas:      iv('nJug'),  lat:        iv('nLat'),
    pases:        iv('nPas'),  anotacion:  iv('nAnot'),
    balon_parado: iv('nBp'),
    htms:         iv('nHtms'), htms28:     iv('nHtms28'), tsi: iv('nTsi'),
    forma:        iv('nForma'),resistencia:iv('nResistencia'),
    posicion:     sv('nPosicion'), nivel:  sv('nNivel'),
    tier:         sv('nTier'),     dueno:  sv('nDueno'),
    contacto:     document.getElementById('nContacto').value,
    liderazgo:    iv('nLiderazgo'), experiencia: iv('nExperiencia'),
    notas:        sv('nNotas'),
  };

  var res = await client.from('jugadores').insert(row);
  if (res.error) { showNewMsg('Error: ' + res.error.message, 'err'); return; }

  jugadores.push(mapFromDb(row));
  jugadores.sort(function(a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
  showToast('✓ ' + nombre + ' añadido.');
  renderTabla();
  closeAltaPanel();
}

// ── Eliminar jugador ─────────────────────────────────────────────
async function deletePlayer(id) {
  alert('El borrado directo está desactivado para evitar pérdidas accidentales. Edita la ficha o marca el contacto/estado según corresponda.');
}

