// ══════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════
var SUPABASE_URL = 'https://iqanfecsyfwwqyjefotw.supabase.co';
var SUPABASE_KEY = 'sb_publishable_umSjGxQjdoL0-nGfdv8Eyw_OVcEbZ_V';
var APP_PASSWORD = 'hattrick2026';

// ══════════════════════════════════════════════════════════════
//  ESTADO
// ══════════════════════════════════════════════════════════════
var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
var jugadores = [];
var sortCol = null, sortDir = 1;
var parsedImport = null;
var currentModalId = null;
var editingId = null;

var POS_CLASS = {
  'Portero':'Por','Delantero':'Del','Mediocentro':'MC',
  'Extremo':'Ext','Defensa Central':'DC','Defensa Lateral':'DL'
};
var ESP_CLASS = {
  'Técnico':'tec','Imprevisible':'imp','Potente':'pot',
  'Rápido':'rap','Cabezón':'cab'
};

// ══════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════
window.addEventListener('load', function() {
  if (sessionStorage.getItem('ht_auth') === '1') mostrarApp();
});

function login() {
  if (document.getElementById('pwdInput').value === APP_PASSWORD) {
    sessionStorage.setItem('ht_auth', '1');
    mostrarApp();
  } else {
    document.getElementById('loginErr').style.display = 'block';
  }
}

function mostrarApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  cargarJugadores();
}

// ══════════════════════════════════════════════════════════════
//  SUPABASE
// ══════════════════════════════════════════════════════════════
async function cargarJugadores() {
  document.getElementById('stats').textContent = 'Cargando...';
  var res = await client.from('jugadores').select('*').order('nombre', { ascending: true });
  if (res.error) {
    document.getElementById('stats').textContent = 'Error: ' + res.error.message;
    return;
  }
  jugadores = res.data.map(mapFromDb);
  document.getElementById('stats').textContent = jugadores.length + ' jugadores';
  actualizarFiltroAnos();
  renderTabla();
}

function mapFromDb(r) {
  return {
    nombre:     r.nombre       || '',
    id:         r.id           || '',
    anos:       r.anos         != null ? r.anos         : '',
    dias:       r.dias         != null ? r.dias         : '',
    esp:        r.especialidad || '',
    port:       r.porteria     != null ? r.porteria     : '',
    def:        r.defensa      != null ? r.defensa      : '',
    jug:        r.jugadas      != null ? r.jugadas      : '',
    lat:        r.lat          != null ? r.lat          : '',
    pas:        r.pases        != null ? r.pases        : '',
    anot:       r.anotacion    != null ? r.anotacion    : '',
    bp:         r.balon_parado != null ? r.balon_parado : '',
    htms:       r.htms         != null ? r.htms         : '',
    htms28:     r.htms28       != null ? r.htms28       : '',
    tsi:        r.tsi          != null ? r.tsi          : '',
    forma:      r.forma        != null ? r.forma        : '',
    resistencia:r.resistencia  != null ? r.resistencia  : '',
    posicion:   r.posicion     || '',
    nivel:      r.nivel        || '',
    tier:       r.tier         || '',
    portal:     r.portal       || '',
    lvlEnt:     r.nivel_entrenador   != null ? r.nivel_entrenador   : '',
    efEnt:      r.eficiencia_entreno != null ? r.eficiencia_entreno : '',
    notas:      r.notas        || '',
    contacto:   r.contacto     || 'No',
    dueno:      r.dueno        || '',
    caracter:   r.caracter     || '',
    liderazgo:  r.liderazgo    != null ? r.liderazgo    : '',
    experiencia:r.experiencia  != null ? r.experiencia  : '',
    fechaReg:   r.fecha_registro || '',
    fecha17:    r.fecha_17000    || '',
  };
}

function mapToDb(j) {
  function n(v){ var x = parseFloat(v); return isNaN(x) ? null : x; }
  return {
    id:                 j.id          || null,
    nombre:             j.nombre      || null,
    anos:               n(j.anos),
    dias:               n(j.dias),
    especialidad:       j.esp         || null,
    porteria:           n(j.port),
    defensa:            n(j.def),
    jugadas:            n(j.jug),
    lat:                n(j.lat),
    pases:              n(j.pas),
    anotacion:          n(j.anot),
    balon_parado:       n(j.bp),
    htms:               n(j.htms),
    htms28:             n(j.htms28),
    tsi:                n(j.tsi),
    forma:              n(j.forma),
    resistencia:        n(j.resistencia),
    posicion:           j.posicion    || null,
    nivel:              j.nivel       || null,
    tier:               j.tier        || null,
    portal:             j.portal      || null,
    nivel_entrenador:   n(j.lvlEnt),
    eficiencia_entreno: n(j.efEnt),
    notas:              j.notas       || null,
    contacto:           j.contacto    || 'No',
    dueno:              j.dueno       || null,
    caracter:           j.caracter    || null,
    liderazgo:          n(j.liderazgo),
    experiencia:        n(j.experiencia),
    fecha_registro:     j.fechaReg    || null,
    fecha_17000:        j.fecha17     || null,
  };
}

// ══════════════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════════════
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(function(t, i) {
    t.classList.toggle('active', ['jugadores','importar'][i] === name);
  });
  document.querySelectorAll('.tab-content').forEach(function(c) {
    c.classList.toggle('active', c.id === 'tab-' + name);
  });
}

// ══════════════════════════════════════════════════════════════
//  FILTRO AÑOS DINÁMICO
// ══════════════════════════════════════════════════════════════
function actualizarFiltroAnos() {
  var sel = document.getElementById('filtAnos');
  var actual = sel.value;
  var edades = [];
  jugadores.forEach(function(j){ if (j.anos !== '' && edades.indexOf(j.anos) < 0) edades.push(j.anos); });
  edades.sort(function(a,b){ return a - b; });
  sel.innerHTML = '<option value="">Todos</option>';
  edades.forEach(function(e){ sel.innerHTML += '<option value="' + e + '"' + (String(e) === actual ? ' selected' : '') + '>' + e + '</option>'; });
}

// ══════════════════════════════════════════════════════════════
//  LIMPIAR FILTROS
// ══════════════════════════════════════════════════════════════
function limpiarFiltros() {
  ['filtPos','filtAnos','filtEsp','filtContacto','filtPortal','groupBy'].forEach(function(id){
    document.getElementById(id).value = '';
  });
  document.getElementById('buscar').value = '';
  renderTabla();
}

// ══════════════════════════════════════════════════════════════
//  ATAJOS DE TECLADO
// ══════════════════════════════════════════════════════════════
document.addEventListener('keydown', function(e) {
  if (!editingId) return;
  if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  if (e.key === 'Enter' && e.target.closest('.edit-row')) { e.preventDefault(); saveRowEdit(editingId); }
});

window.addEventListener('beforeunload', function(e) {
  if (editingId) { e.preventDefault(); e.returnValue = ''; }
});

// ══════════════════════════════════════════════════════════════
//  SORTING
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('thead').addEventListener('click', function(e) {
    var th = e.target.closest('th.sortable');
    if (!th) return;
    var col = th.dataset.col;
    if (sortCol === col) { sortDir *= -1; } else { sortCol = col; sortDir = -1; }
    document.querySelectorAll('th').forEach(function(t){ t.classList.remove('sort-asc','sort-desc'); });
    th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
    renderTabla();
  });
});

// ══════════════════════════════════════════════════════════════
//  RENDER TABLA
// ══════════════════════════════════════════════════════════════
function renderTabla() {
  var fp  = document.getElementById('filtPos').value;
  var fa  = document.getElementById('filtAnos').value;
  var fe  = document.getElementById('filtEsp').value;
  var fc  = document.getElementById('filtContacto').value;
  var fpo = document.getElementById('filtPortal').value;
  var fb  = document.getElementById('buscar').value.toLowerCase();
  var grp = document.getElementById('groupBy').value;

  var hayFiltros = fp || fa || fe || fc || fpo || fb;
  document.getElementById('btnLimpiar').style.display = hayFiltros ? 'inline-block' : 'none';

  var list = jugadores.filter(function(j) {
    if (fp  && j.posicion !== fp) return false;
    if (fa  && String(j.anos) !== fa) return false;
    if (fe  && j.esp      !== fe) return false;
    if (fc  && j.contacto !== fc) return false;
    if (fpo && j.portal   !== fpo) return false;
    if (fb && (j.nombre||'').toLowerCase().indexOf(fb) < 0
           && (j.dueno||'').toLowerCase().indexOf(fb)  < 0) return false;
    return true;
  });

  if (sortCol) {
    list.sort(function(a, b) {
      var av = a[sortCol] === '' ? -Infinity : +a[sortCol];
      var bv = b[sortCol] === '' ? -Infinity : +b[sortCol];
      return (av - bv) * sortDir;
    });
  }

  var total = jugadores.length;
  document.getElementById('counter').textContent = list.length < total
    ? list.length + ' de ' + total
    : total + ' jugadores';
  var html = '';
  if (grp) {
    var groups = {};
    list.forEach(function(j) {
      var key = String(j[grp] || '—');
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
  if (val === '' || val == null) return '<td class="empty">·</td>';
  var high = val >= 14;
  return '<td class="' + (high ? 'num-high' : 'num') + '">' + val + '</td>';
}

function numCell(val) {
  return val !== '' && val != null ? '<td class="num">' + val + '</td>' : '<td class="empty">·</td>';
}

// ══════════════════════════════════════════════════════════════
//  EDICIÓN INLINE
// ══════════════════════════════════════════════════════════════
function selHtml(id, opts, val) {
  var s = '<select class="er" id="' + id + '">';
  opts.forEach(function(o) {
    s += '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
  });
  return s + '</select>';
}

function erNum(id, val, w) {
  return '<input class="er" type="number" id="' + id + '" value="' + (val !== '' && val != null ? val : '') + '" style="width:' + (w||38) + 'px">';
}

function erTxt(id, val, w) {
  return '<input class="er" type="text" id="' + id + '" value="' + esc(val||'') + '" style="width:' + (w||70) + 'px">';
}

function renderEditRow(j) {
  var POSS = [['','—'],['Portero','Por'],['Delantero','Del'],['Mediocentro','MC'],['Extremo','Ext'],['Defensa Central','DC'],['Defensa Lateral','DL']];
  var ESPS = [['','—'],['Técnico','Técnico'],['Imprevisible','Imp'],['Potente','Pot'],['Rápido','Ráp'],['Cabezón','Cab']];
  var NIFS = [['','—'],['Continental Incompleto','Cont.Inc'],['Continental Completo','Cont.Com'],['Mundial Incompleto','Mund.Inc'],['Mundial Completo','Mund.Com']];
  var CONS = [['No','No'],['Sí','Sí']];
  var htUrl = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;
  var r = '<tr class="edit-row" data-id="' + j.id + '">';
  r += '<td><strong>' + esc(j.nombre) + '</strong></td>';
  r += '<td><a href="' + htUrl + '" target="_blank" style="color:var(--brand);font-family:monospace;font-size:10px;text-decoration:none">' + j.id + '↗</a></td>';
  r += '<td>' + selHtml('er_pos', POSS, j.posicion) + '</td>';
  r += '<td>' + selHtml('er_esp', ESPS, j.esp) + '</td>';
  r += '<td>' + erNum('er_port', j.port) + '</td>';
  r += '<td>' + erNum('er_def',  j.def)  + '</td>';
  r += '<td>' + erNum('er_jug',  j.jug)  + '</td>';
  r += '<td>' + erNum('er_lat',  j.lat)  + '</td>';
  r += '<td>' + erNum('er_pas',  j.pas)  + '</td>';
  r += '<td>' + erNum('er_anot', j.anot) + '</td>';
  r += '<td>' + erNum('er_bp',   j.bp)   + '</td>';
  r += '<td>' + erNum('er_htms',  j.htms,  44) + '</td>';
  r += '<td>' + erNum('er_htms28',j.htms28,44) + '</td>';
  r += '<td>' + erNum('er_tsi',   j.tsi,   52) + '</td>';
  r += '<td>' + erNum('er_forma', j.forma, 38) + '</td>';
  r += '<td>' + erNum('er_res',   j.resistencia, 38) + '</td>';
  r += '<td>' + selHtml('er_nivel', NIFS, j.nivel) + '</td>';
  r += '<td>' + erTxt('er_tier', j.tier, 44) + '</td>';
  r += '<td>' + erNum('er_anos',  j.anos,  38) + '</td>';
  r += '<td>' + erNum('er_dias',  j.dias,  38) + '</td>';
  r += '<td>' + erNum('er_lvent', j.lvlEnt, 38) + '</td>';
  r += '<td>' + erNum('er_efent', j.efEnt, 44) + '</td>';
  r += '<td>' + erTxt('er_dueno', j.dueno, 80) + '</td>';
  r += '<td>' + selHtml('er_con', CONS, j.contacto) + '</td>';
  r += '<td>' + erNum('er_lid',  j.liderazgo, 38)  + '</td>';
  r += '<td>' + erNum('er_exp',  j.experiencia, 38) + '</td>';
  r += '<td>' + erTxt('er_notas', j.notas, 120) + '</td>';
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
  var idx = jugadores.findIndex(function(j){ return String(j.id) === String(id); });
  if (idx < 0) return;

  function gn(elId){ var v = parseFloat(document.getElementById(elId).value); return isNaN(v) ? '' : v; }
  function gs(elId){ return document.getElementById(elId).value.trim(); }

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
  if (res.error) { alert('Error al guardar: ' + res.error.message); return; }

  var savedId = id;
  editingId = null;
  renderTabla();
  setTimeout(function() {
    var row = document.querySelector('#tbody tr[data-id="' + savedId + '"]');
    if (row) {
      row.classList.add('row-saved');
      setTimeout(function(){ row.classList.remove('row-saved'); }, 1200);
    }
  }, 20);
}

// ══════════════════════════════════════════════════════════════
//  RENDER FILA
// ══════════════════════════════════════════════════════════════
function renderRow(j) {
  if (String(j.id) === String(editingId)) return renderEditRow(j);
  var htUrl  = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;
  var posKey = POS_CLASS[j.posicion] || '';
  var espKey = ESP_CLASS[j.esp] || '';
  var cBadge = j.contacto === 'Sí'
    ? '<span class="badge-si" onclick="toggleContacto(\'' + j.id + '\',event)" title="Clic para cambiar">Sí</span>'
    : '<span class="badge-no" onclick="toggleContacto(\'' + j.id + '\',event)" title="Clic para cambiar">No</span>';

  var r = '<tr data-id="' + j.id + '">';
  r += '<td onclick="openPlayerModal(\'' + j.id + '\')"><strong>' + esc(j.nombre) + '</strong></td>';
  r += '<td><a href="' + htUrl + '" target="_blank" style="color:var(--brand);text-decoration:none;font-family:monospace;font-size:10px">' + j.id + '↗</a></td>';
  r += '<td>' + (posKey ? '<span class="badge badge-' + posKey + '">' + esc(j.posicion) + '</span>' : '<span style="color:#c2cbd8">—</span>') + '</td>';
  r += '<td>' + (espKey ? '<span class="esp-' + espKey + '">' + esc(j.esp) + '</span>' : '<span style="color:#c2cbd8">·</span>') + '</td>';
  r += skillCell(j.port) + skillCell(j.def) + skillCell(j.jug) + skillCell(j.lat);
  r += skillCell(j.pas)  + skillCell(j.anot)+ skillCell(j.bp);
  r += numCell(j.htms) + numCell(j.htms28) + numCell(j.tsi);
  r += numCell(j.forma) + numCell(j.resistencia);
  r += '<td style="color:var(--muted);font-size:10px">' + esc(j.nivel) + '</td>';
  r += '<td style="color:var(--muted)">' + esc(j.tier) + '</td>';
  r += numCell(j.anos) + numCell(j.dias);
  r += numCell(j.lvlEnt) + numCell(j.efEnt);
  r += '<td style="color:#475569"><small>' + esc(j.dueno) + '</small></td>';
  r += '<td>' + cBadge + '</td>';
  r += numCell(j.liderazgo) + numCell(j.experiencia);
  r += '<td><small style="color:var(--muted)">' + esc((j.notas||'').substring(0,50)) + (j.notas&&j.notas.length>50?'…':'') + '</small></td>';
  r += '<td style="white-space:nowrap">'
    + '<button class="btn-sm btn-edit" onclick="startEdit(\'' + j.id + '\')" title="Editar fila">✏️</button>'
    + '</td>';
  r += '</tr>';
  return r;
}

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// ══════════════════════════════════════════════════════════════
//  TOGGLE CONTACTO
// ══════════════════════════════════════════════════════════════
async function toggleContacto(id, event) {
  event.stopPropagation();
  var idx = jugadores.findIndex(function(j){ return String(j.id) === String(id); });
  if (idx < 0) return;
  jugadores[idx].contacto = jugadores[idx].contacto === 'Sí' ? 'No' : 'Sí';
  var res = await client.from('jugadores').update({ contacto: jugadores[idx].contacto }).eq('id', id);
  if (!res.error) renderTabla();
}

// ══════════════════════════════════════════════════════════════
//  MODAL JUGADOR
// ══════════════════════════════════════════════════════════════
function openPlayerModal(id) {
  var j = jugadores.find(function(j){ return String(j.id) === String(id); });
  if (!j) return;
  currentModalId = id;

  document.getElementById('modalNombre').textContent = j.nombre;
  document.getElementById('modalHtUrl').href = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;

  var posKey = POS_CLASS[j.posicion] || '';
  var espKey = ESP_CLASS[j.esp] || '';
  document.getElementById('modalMeta').innerHTML =
    (posKey ? '<span class="badge badge-' + posKey + '">' + esc(j.posicion) + '</span>' : '') +
    (espKey ? ' <span class="esp-' + espKey + '" style="font-size:12px">' + esc(j.esp) + '</span>' : '') +
    (j.dueno ? '<span class="pm-owner">· ' + esc(j.dueno) + '</span>' : '');

  var skills = [
    ['Portería',j.port,true],['Defensa',j.def,true],['Jugadas',j.jug,true],
    ['Lateral',j.lat,true],['Pases',j.pas,true],['Anotación',j.anot,true],
    ['Balón Parado',j.bp,true],['HTMS',j.htms,false],['HTMS28',j.htms28,false],
    ['TSI',j.tsi,false],['Forma',j.forma,false],['Resistencia',j.resistencia,false],
  ];
  document.getElementById('modalStats').innerHTML = skills.map(function(s){
    var val = s[1] !== '' && s[1] != null ? s[1] : '—';
    var high = s[2] && s[1] !== '' && s[1] >= 14;
    return '<div class="stat-item' + (high?' high':'') + '"><span>' + s[0] + '</span><strong>' + val + '</strong></div>';
  }).join('');

  var info = [
    ['Edad', j.anos !== '' ? j.anos + ' años ' + j.dias + ' días' : '—'],
    ['Carácter', j.caracter],['Liderazgo', j.liderazgo],['Experiencia', j.experiencia],
    ['Portal', j.portal],['Tier', j.tier],
    ['Fecha registro', j.fechaReg],['Fecha 17.000 días', j.fecha17],
  ];
  document.getElementById('modalInfo').innerHTML = info.map(function(r){
    return '<div class="info-row"><span>' + r[0] + '</span><strong>' + esc(String(r[1]||'—')) + '</strong></div>';
  }).join('') + (j.notas ? '<div class="info-row" style="flex-direction:column;align-items:flex-start;gap:4px"><span>Notas</span><strong style="max-width:100%;white-space:normal;text-align:left">' + esc(j.notas) + '</strong></div>' : '');

  document.getElementById('playerOverlay').classList.add('open');
}

function closePlayerModal() {
  document.getElementById('playerOverlay').classList.remove('open');
  currentModalId = null;
}

function closePlayerIfOutside(e) {
  if (e.target === document.getElementById('playerOverlay')) closePlayerModal();
}

// ══════════════════════════════════════════════════════════════
//  EXPORTAR XLSX
// ══════════════════════════════════════════════════════════════
function exportarXLSX() {
  var headers = ['Nombre','ID','Años','Días','Especialidad','Portería','Defensa','Jugadas','Lateral','Pases','Anotación','Balón Parado','HTMS','HTMS28','TSI','Forma','Resistencia','Posición','Nivel','Tier','Portal','Nivel Entrenador','Eficiencia Entreno (%)','Notas','Contacto','Dueño','Carácter','Liderazgo','Experiencia','Fecha Registro','Fecha 17.000 días'];
  var keys    = ['nombre','id','anos','dias','esp','port','def','jug','lat','pas','anot','bp','htms','htms28','tsi','forma','resistencia','posicion','nivel','tier','portal','lvlEnt','efEnt','notas','contacto','dueno','caracter','liderazgo','experiencia','fechaReg','fecha17'];
  var data    = [headers];
  jugadores.forEach(function(j){ data.push(keys.map(function(k){ return j[k] !== undefined ? j[k] : ''; })); });
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Jugadores');
  XLSX.writeFile(wb, 'HattrickGEQ.xlsx');
}

// ══════════════════════════════════════════════════════════════
//  PARSER HATTRICK
// ══════════════════════════════════════════════════════════════
function parsePlayerText(raw) {
  var text = raw
    .replace(/\[b\](.*?)\[\/b\]/gi,'$1').replace(/\[i\](.*?)\[\/i\]/gi,'$1')
    .replace(/\[\/?(tr|th|td|table|u)\]/gi,' ').replace(/\s{2,}/g,' ');
  var d = {}, m;
  if ((m = raw.match(/\[playerid=(\d+)\]/i)))              d.id       = m[1];
  if ((m = raw.match(/^(.+?)\s*\[playerid=/)))             d.nombre   = m[1].trim();
  if ((m = text.match(/(\d+)\s+años\s+y\s+(\d+)\s+días/i))){ d.anos=+m[1]; d.dias=+m[2]; }
  if ((m = text.match(/Especialidad[:\s]+([^\n\r,.(]+)/i))) d.esp     = normEsp(m[1].trim());
  if ((m = text.match(/Dueño\s+(.+?)\s*\(desde/i)))         d.dueno   = m[1].trim();
  if ((m = text.match(/Mejor posición:\s*([^\n\r(]+)/i)))   d.posicion = normPos(m[1].trim());
  if ((m = text.match(/TSI\s+([\d\s]{2,})/i)))              d.tsi     = parseInt(m[1].replace(/\s/g,''));
  if ((m = text.match(/Forma\s+\w+\s+(\d+)/i)))             d.forma   = +m[1];
  if ((m = text.match(/Resistencia\s+\w+\s+(\d+)/i)))       d.resistencia = +m[1];
  if ((m = text.match(/Habilidad:\s*(\d+)/i)))              d.htms    = +m[1];
  if ((m = text.match(/Potencial:\s*(\d+)/i)))              d.htms28  = +m[1];
  [['port','Portería'],['def','Defensa'],['jug','Jugadas'],['lat','Lateral'],
   ['pas','Pases'],['anot','Anotación'],['bp','Balón parado']].forEach(function(s){
    var re = new RegExp(s[1]+'[^(]*\\((\\d+)\\)','i');
    if ((m = text.match(re))) d[s[0]] = +m[1];
  });
  if ((m = text.match(/experiencia[^(]*\((\d+)\)/i))) d.experiencia = +m[1];
  if ((m = text.match(/liderazgo[^(]*\((\d+)\)/i)))   d.liderazgo   = +m[1];
  if ((m = text.match(/Una persona ([^\n\r.]+)/i)))    d.caracter    = m[1].trim();
  return d;
}

function normPos(raw) {
  var t = raw.toLowerCase().trim();
  if (t==='por'||t==='portero')        return 'Portero';
  if (t==='del'||t==='delantero')      return 'Delantero';
  if (t==='mc'||t==='mediocentro')     return 'Mediocentro';
  if (t==='ext'||t==='extremo')        return 'Extremo';
  if (t==='dc'||t==='defensa central') return 'Defensa Central';
  if (t==='dl'||t==='defensa lateral') return 'Defensa Lateral';
  return raw;
}

function normEsp(raw) {
  var t = raw.toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e')
             .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').trim();
  if (t==='tec'||t==='tecnico')                   return 'Técnico';
  if (t==='imp'||t==='imprevisible')              return 'Imprevisible';
  if (t==='pot'||t==='potente')                   return 'Potente';
  if (t==='rap'||t==='rapido')                    return 'Rápido';
  if (t==='cab'||t==='cabezon'||t==='cabeceador') return 'Cabezón';
  return '';
}

// ══════════════════════════════════════════════════════════════
//  TAB IMPORTAR
// ══════════════════════════════════════════════════════════════
function previewImport() {
  var txt = document.getElementById('playerText').value.trim();
  if (!txt) { showImportMsg('Pega primero el texto del jugador.','err'); return; }
  var d = parsePlayerText(txt);
  if (!d.id) { showImportMsg('No se encontró el playerid en el texto.','err'); return; }
  parsedImport = { data: d };

  var idx   = jugadores.findIndex(function(j){ return String(j.id) === String(d.id); });
  var found = idx >= 0;

  var rows = [
    ['Nombre',d.nombre],['ID',d.id],['Edad',(d.anos||0)+' años '+(d.dias||0)+' días'],
    ['Especialidad',d.esp],['Posición',d.posicion],
    ['Portería',d.port],['Defensa',d.def],['Jugadas',d.jug],['Lateral',d.lat],
    ['Pases',d.pas],['Anotación',d.anot],['Balón parado',d.bp],
    ['HTMS',d.htms],['HTMS28',d.htms28],['TSI',d.tsi],
    ['Forma',d.forma],['Resistencia',d.resistencia],
    ['Dueño',d.dueno],['Experiencia',d.experiencia],['Liderazgo',d.liderazgo],
  ];

  var tag   = found ? '<span class="tag tag-upd">Actualizar</span>' : '<span class="tag tag-new">Nuevo jugador</span>';
  var tabla = rows.map(function(r){
    var v    = r[1];
    var cell = v != null && v !== ''
      ? '<span class="'+(typeof v==='number'?'pval-num':'')+'">'+esc(String(v))+'</span>'
      : '<span class="pval-miss">no detectado</span>';
    return '<tr><td>'+r[0]+'</td><td>'+cell+'</td></tr>';
  }).join('');

  document.getElementById('importRight').innerHTML =
    '<div class="preview-box"><h3>Vista previa '+tag+'</h3><table>'+tabla+'</table></div>';
  document.getElementById('btnConfirm').style.display = 'block';
  showImportMsg(
    found ? 'Jugador encontrado. Confirma para actualizar.' : 'Jugador nuevo. Se añadirá a la base de datos.',
    found ? 'ok' : 'warn'
  );
}

async function confirmarImport() {
  if (!parsedImport) return;
  var d      = parsedImport.data;
  var idx    = jugadores.findIndex(function(j){ return String(j.id) === String(d.id); });
  var fields = ['nombre','anos','dias','esp','port','def','jug','lat','pas','anot','bp',
                'htms','htms28','tsi','forma','resistencia','posicion','dueno','liderazgo','experiencia','caracter'];

  var jugador;
  if (idx >= 0) {
    jugador = Object.assign({}, jugadores[idx]);
    fields.forEach(function(f){ if (d[f] != null && d[f] !== '') jugador[f] = d[f]; });
  } else {
    jugador = {
      id:'',nombre:'',anos:'',dias:'',esp:'',port:'',def:'',jug:'',lat:'',pas:'',
      anot:'',bp:'',htms:'',htms28:'',tsi:'',forma:'',resistencia:'',
      posicion:'',nivel:'',tier:'',portal:'',lvlEnt:'',efEnt:'',
      notas:'',contacto:'No',dueno:'',caracter:'',liderazgo:'',experiencia:'',fechaReg:'',fecha17:''
    };
    jugador.id = d.id;
    fields.forEach(function(f){ if (d[f] != null && d[f] !== '') jugador[f] = d[f]; });
  }

  document.getElementById('spin').style.display = 'block';
  document.getElementById('btnConfirm').style.display = 'none';

  var res = await client.from('jugadores').upsert(mapToDb(jugador), { onConflict: 'id' });
  document.getElementById('spin').style.display = 'none';

  if (res.error) {
    showImportMsg('Error al guardar: ' + res.error.message, 'err');
    document.getElementById('btnConfirm').style.display = 'block';
    return;
  }

  if (idx >= 0) jugadores[idx] = jugador; else jugadores.push(jugador);
  parsedImport = null;
  showImportMsg('✅ ' + (jugador.nombre || d.id) + (idx >= 0 ? ' actualizado.' : ' añadido.'), 'ok');
  renderTabla();
}

function clearImport() {
  document.getElementById('playerText').value = '';
  document.getElementById('importRight').innerHTML =
    '<div style="color:var(--muted);padding-top:80px;text-align:center;font-size:13px">La vista previa del jugador aparecerá aquí</div>';
  document.getElementById('btnConfirm').style.display = 'none';
  document.getElementById('msgImport').style.display  = 'none';
  parsedImport = null;
}

function showImportMsg(txt, cls) {
  var el = document.getElementById('msgImport');
  el.textContent = txt; el.className = 'msg ' + cls; el.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════
//  ELIMINAR JUGADOR
// ══════════════════════════════════════════════════════════════
async function deletePlayer(id) {
  alert('El borrado directo está desactivado para evitar pérdidas accidentales. Edita la ficha o marca el contacto/estado según corresponda.');
}

// ══════════════════════════════════════════════════════════════
//  NUEVA FICHA (panel fijo)
// ══════════════════════════════════════════════════════════════
function toggleAltaPanel() {
  var p = document.getElementById('altaPanel');
  var btn = document.getElementById('btnAlta');
  var open = p.style.display !== 'none';
  if (open) {
    p.style.display = 'none';
    btn.textContent = 'Añadir jugador';
  } else {
    resetAltaForm();
    p.style.display = 'block';
    btn.textContent = 'Cerrar alta';
    document.getElementById('nNombre').focus();
  }
}

function closeAltaPanel() {
  document.getElementById('altaPanel').style.display = 'none';
  document.getElementById('btnAlta').textContent = 'Añadir jugador';
}

function resetAltaForm() {
  ['nNombre','nId','nDueno','nTier','nNotas'].forEach(function(id){ document.getElementById(id).value=''; });
  ['nPort','nDef','nJug','nLat','nPas','nAnot','nBp','nHtms','nHtms28','nTsi','nForma','nResistencia','nAnos','nDias','nLiderazgo','nExperiencia'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('nPosicion').value = '';
  document.getElementById('nEsp').value      = '';
  document.getElementById('nNivel').value    = '';
  document.getElementById('nContacto').value = 'No';
  document.getElementById('newMsg').style.display = 'none';
}

async function saveNewPlayer() {
  var nombre = document.getElementById('nNombre').value.trim();
  var id     = document.getElementById('nId').value.trim().replace(/[^\d]/g,'');
  if (!nombre || !id) {
    showNewMsg('Nombre e ID son obligatorios.','err'); return;
  }
  if (jugadores.find(function(j){ return j.id === id; })) {
    showNewMsg('Ya existe un jugador con ese ID.','err'); return;
  }

  function iv(elId){ var v=parseFloat(document.getElementById(elId).value); return isNaN(v)?null:v; }
  function sv(elId){ var v=document.getElementById(elId).value.trim(); return v||null; }

  var row = {
    id:id, nombre:nombre,
    anos:iv('nAnos'), dias:iv('nDias'),
    especialidad:sv('nEsp'),
    porteria:iv('nPort'), defensa:iv('nDef'), jugadas:iv('nJug'), lat:iv('nLat'),
    pases:iv('nPas'), anotacion:iv('nAnot'), balon_parado:iv('nBp'),
    htms:iv('nHtms'), htms28:iv('nHtms28'), tsi:iv('nTsi'),
    forma:iv('nForma'), resistencia:iv('nResistencia'),
    posicion:sv('nPosicion'), nivel:sv('nNivel'),
    tier:sv('nTier'), dueno:sv('nDueno'),
    contacto:document.getElementById('nContacto').value,
    liderazgo:iv('nLiderazgo'), experiencia:iv('nExperiencia'),
    notas:sv('nNotas'),
  };

  var res = await client.from('jugadores').insert(row);
  if (res.error) { showNewMsg('Error: ' + res.error.message,'err'); return; }

  jugadores.push(mapFromDb(row));
  jugadores.sort(function(a,b){ return a.nombre.localeCompare(b.nombre,'es'); });
  showNewMsg('✅ ' + nombre + ' añadido.','ok');
  renderTabla();
  setTimeout(closeAltaPanel, 1500);
}

function showNewMsg(txt, cls) {
  var el = document.getElementById('newMsg');
  el.textContent = txt; el.className = 'msg ' + cls; el.style.display = 'block';
}
