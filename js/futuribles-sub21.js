// ── Mapeo DB ──────────────────────────────────────────────────────
function mapS21FromDb(r) {
  return {
    id:           String(r.id || ''),
    nombre:       r.nombre        || '',
    anos:         r.anos          != null ? r.anos          : '',
    dias:         r.dias          != null ? r.dias          : '',
    esp:          r.especialidad  || '',
    port:         r.porteria      != null ? r.porteria      : '',
    def:          r.defensa       != null ? r.defensa       : '',
    jug:          r.jugadas       != null ? r.jugadas       : '',
    lat:          r.lat           != null ? r.lat           : '',
    pas:          r.pases         != null ? r.pases         : '',
    anot:         r.anotacion     != null ? r.anotacion     : '',
    bp:           r.balon_parado  != null ? r.balon_parado  : '',
    tsi:          r.tsi           != null ? r.tsi           : '',
    forma:        r.forma         != null ? r.forma         : '',
    resistencia:  r.resistencia   != null ? r.resistencia   : '',
    liderazgo:    r.liderazgo     != null ? r.liderazgo     : '',
    experiencia:  r.experiencia   != null ? r.experiencia   : '',
    dueno:        r.dueno         || '',
    partidos_nt:  r.partidos_nt   != null ? r.partidos_nt   : '',
    partidos_u21: r.partidos_u21  != null ? r.partidos_u21  : '',
    lesionado:    r.lesionado     || false,
    en_venta:     r.en_venta      || false,
  };
}

function mapS21ToDb(j) {
  function n(v) { var x = parseInt(String(v).replace(/\D/g,''), 10); return isNaN(x) ? null : x; }
  return {
    id:             j.id             || null,
    nombre:         j.nombre         || null,
    anos:           n(j.anos),
    dias:           n(j.dias),
    especialidad:   j.esp            || null,
    porteria:       n(j.port),
    defensa:        n(j.def),
    jugadas:        n(j.jug),
    lat:            n(j.lat),
    pases:          n(j.pas),
    anotacion:      n(j.anot),
    balon_parado:   n(j.bp),
    tsi:            n(j.tsi),
    forma:          n(j.forma),
    resistencia:    n(j.resistencia),
    liderazgo:      n(j.liderazgo),
    experiencia:    n(j.experiencia),
    dueno:          j.dueno          || null,
    partidos_nt:    n(j.partidos_nt),
    partidos_u21:   n(j.partidos_u21),
    lesionado:      !!j.lesionado,
    en_venta:       !!j.en_venta,
    actualizado_en: new Date().toISOString(),
  };
}

// ── Cargar desde Supabase ─────────────────────────────────────────
async function cargarFuturiblesS21() {
  var counterEl = document.getElementById('s21-counter');
  if (counterEl) counterEl.textContent = 'Cargando...';

  var res = await client.from('futuribles_sub21').select('*').order('anos', { ascending: false });
  if (res.error) {
    showToast('Error cargando Sub-21: ' + res.error.message, 'err');
    if (counterEl) counterEl.textContent = 'Error';
    return;
  }
  futuriblesS21 = (res.data || []).map(mapS21FromDb);
  if (counterEl) counterEl.textContent = futuriblesS21.length + ' jugadores';

  var lastEl = document.getElementById('s21-last-update');
  if (lastEl && res.data && res.data.length > 0) {
    var last = res.data.reduce(function(a, b) {
      return (a.actualizado_en || '') > (b.actualizado_en || '') ? a : b;
    });
    if (last.actualizado_en) {
      lastEl.textContent = 'Última carga: ' + new Date(last.actualizado_en).toLocaleString('es-ES', {
        day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
      });
    }
  }
  renderFuturiblesS21();
}

// ── Render tabla ──────────────────────────────────────────────────
function renderFuturiblesS21() {
  var tbody = document.getElementById('s21-tbody');
  if (!tbody) return;

  var list = futuriblesS21.slice().sort(function(a, b) {
    var av = a.anos === '' ? -Infinity : +a.anos;
    var bv = b.anos === '' ? -Infinity : +b.anos;
    if (bv !== av) return bv - av;
    return (+b.dias || 0) - (+a.dias || 0);
  });

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="19"><div class="empty-state">'
      + '<div class="empty-icon">📋</div>'
      + '<div class="empty-title">Sin jugadores</div>'
      + '<div class="empty-desc">Usa el botón <strong>Importar lista</strong> para cargar los futuribles Sub-21 desde Hattrick.</div>'
      + '</div></td></tr>';
    return;
  }

  var html = '';
  list.forEach(function(j) {
    var htUrl = 'https://www.hattrick.org/Club/Players/Player.aspx?PlayerID=' + j.id;
    var r = '<tr>';
    r += '<td style="white-space:nowrap">';
    r += '<a href="' + htUrl + '" target="_blank" style="color:var(--brand);font-weight:600;text-decoration:none">' + esc(j.nombre) + ' ↗</a>';
    if (j.lesionado) r += ' <span title="Lesionado" style="font-size:11px">🤕</span>';
    if (j.en_venta)  r += ' <span title="En venta"  style="font-size:11px">💰</span>';
    r += '</td>';
    r += '<td>' + espBadgeHtml(j.esp, 'esp-compact') + '</td>';
    r += skillCell(j.port) + skillCell(j.def) + skillCell(j.jug) + skillCell(j.lat);
    r += skillCell(j.pas)  + skillCell(j.anot) + skillCell(j.bp);
    r += numCell(j.tsi) + numCell(j.forma) + numCell(j.resistencia);
    r += numCell(j.anos)  + numCell(j.dias);
    r += numCell(j.liderazgo) + numCell(j.experiencia);
    r += numCell(j.partidos_nt) + numCell(j.partidos_u21);
    r += '<td style="color:#475569"><small>' + esc(j.dueno) + '</small></td>';
    r += '</tr>';
    html += r;
  });
  tbody.innerHTML = html;
}

// ── Toggle panel import ───────────────────────────────────────────
function toggleS21Import() {
  var panel = document.getElementById('s21ImportPanel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function clearS21Import() {
  var ta = document.getElementById('s21HtmlInput');
  var msg = document.getElementById('s21MsgImport');
  var btn = document.getElementById('s21BtnConfirm');
  var right = document.getElementById('s21ImportRight');
  if (ta) ta.value = '';
  if (msg) { msg.textContent = ''; msg.className = 'msg'; }
  if (btn) btn.style.display = 'none';
  if (right) right.innerHTML = '<div style="color:var(--muted);padding-top:40px;text-align:center;font-size:13px">La vista previa aparecerá aquí</div>';
  futuriblesS21Parsed = null;
}

// ── Parser HTML de Hattrick ───────────────────────────────────────
// Columnas de table.tablesorter en NTPlayers.aspx (índice 0-based):
// 0=bandera  1=nombre(data-fullname)  2=ID(hidden)  3=esp(data-sortvalue 1-5)
// 4=lesion   5=venta  6=edad(data-sortvalue YYYddd)  7=dias(hidden)  8=TSI
// 9=exp  10=lid  11=forma  12=res  13=port  14=def  15=jug  16=lat  17=pas  18=anot  19=bp
// 20=MN  21=MU
// ESP_BY_NUM definido en constants.js: {'1':'Técnico',...,'5':'Cabezón'}
function parseFuturiblesHTML(html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var players = [];

  var table = doc.querySelector('table.tablesorter');
  if (!table) return players;

  function intVal(td) {
    if (!td) return '';
    var dv = (td.getAttribute('data-sortvalue') || '').trim();
    var raw = dv !== '' ? dv : td.textContent.trim();
    var n = parseInt(raw.replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? '' : n;
  }

  table.querySelectorAll('tbody > tr').forEach(function(row) {
    var cells = Array.from(row.querySelectorAll('td'));
    if (cells.length < 20) return;

    var nombre = (cells[1].getAttribute('data-fullname') || cells[1].textContent || '').trim();
    if (!nombre || nombre.length < 2) return;

    var pid = (cells[2].textContent || '').trim().replace(/\D/g, '');
    if (!pid) return;

    var espNum = (cells[3].getAttribute('data-sortvalue') || '').trim();
    var esp = ESP_BY_NUM[espNum] || '';

    var lesionadoSv = (cells[4].getAttribute('data-sortvalue') || '').trim();
    var lesionado = lesionadoSv !== '' && lesionadoSv !== '0';

    var ventaSv = (cells[5].getAttribute('data-sortvalue') || '').trim();
    var en_venta = ventaSv !== '' && ventaSv !== '0';

    var edadSv = parseInt((cells[6].getAttribute('data-sortvalue') || '0').trim(), 10);
    var anos = edadSv > 0 ? Math.floor(edadSv / 1000) : '';
    var dias = edadSv > 0 ? edadSv % 1000 : '';

    players.push({
      id:           pid,
      nombre:       nombre,
      esp:          esp,
      lesionado:    lesionado,
      en_venta:     en_venta,
      anos:         anos,
      dias:         dias,
      tsi:          intVal(cells[8]),
      experiencia:  intVal(cells[9]),
      liderazgo:    intVal(cells[10]),
      forma:        intVal(cells[11]),
      resistencia:  intVal(cells[12]),
      port:         intVal(cells[13]),
      def:          intVal(cells[14]),
      jug:          intVal(cells[15]),
      lat:          intVal(cells[16]),
      pas:          intVal(cells[17]),
      anot:         intVal(cells[18]),
      bp:           intVal(cells[19]),
      partidos_nt:  intVal(cells[20]),
      partidos_u21: intVal(cells[21]),
      dueno:        '',
    });
  });

  return players;
}

// ── Vista previa ──────────────────────────────────────────────────
function previewS21Import() {
  var html  = (document.getElementById('s21HtmlInput').value || '').trim();
  var msg   = document.getElementById('s21MsgImport');
  var btn   = document.getElementById('s21BtnConfirm');
  var right = document.getElementById('s21ImportRight');

  msg.textContent = ''; msg.className = 'msg';
  btn.style.display = 'none';
  futuriblesS21Parsed = null;

  if (!html) {
    msg.textContent = 'Pega el HTML primero.';
    msg.className = 'msg msg-warn';
    return;
  }

  var parsed = parseFuturiblesHTML(html);

  if (!parsed || parsed.length === 0) {
    msg.textContent = 'No se encontraron jugadores en el HTML. Asegúrate de pegar la página completa de NTPlayers de Hattrick.';
    msg.className = 'msg msg-err';
    return;
  }

  futuriblesS21Parsed = parsed;
  msg.textContent = parsed.length + ' jugadores detectados. Revisa la vista previa y confirma.';
  msg.className = 'msg msg-ok';
  btn.style.display = 'inline-block';

  var rows = parsed.slice(0, 10).map(function(j) {
    return '<tr>'
      + '<td style="white-space:nowrap"><strong>' + esc(j.nombre) + '</strong></td>'
      + '<td style="color:var(--muted);font-size:10px">' + j.id + '</td>'
      + '<td>' + espBadgeHtml(j.esp, 'esp-compact') + '</td>'
      + numCell(j.anos) + numCell(j.port) + numCell(j.def) + numCell(j.jug)
      + numCell(j.tsi)
      + '<td style="color:#475569"><small>' + esc(j.dueno) + '</small></td>'
      + '</tr>';
  }).join('');

  var extra = parsed.length > 10 ? '<tr><td colspan="9" style="color:var(--muted);font-size:11px;text-align:center">… y ' + (parsed.length - 10) + ' más</td></tr>' : '';

  right.innerHTML = '<div style="overflow-x:auto">'
    + '<table style="font-size:12px;border-collapse:collapse;width:100%">'
    + '<thead><tr>'
    + '<th style="text-align:left;padding:4px 6px">Nombre</th>'
    + '<th style="text-align:left;padding:4px 6px">ID</th>'
    + '<th>Esp</th><th>Años</th><th>Port</th><th>Def</th><th>Jug</th><th>TSI</th>'
    + '<th style="text-align:left;padding:4px 6px">Club</th>'
    + '</tr></thead>'
    + '<tbody>' + rows + extra + '</tbody>'
    + '</table></div>';
}

// ── Confirmar importación (truncate + insert) ─────────────────────
async function confirmarS21Import() {
  if (!futuriblesS21Parsed || futuriblesS21Parsed.length === 0) return;

  var btn = document.getElementById('s21BtnConfirm');
  var msg = document.getElementById('s21MsgImport');
  btn.disabled = true;
  btn.textContent = '⏳ Importando...';
  msg.textContent = '';

  // 1. Borrar todos los registros existentes
  var delRes = await client.from('futuribles_sub21').delete().neq('id', '__none__');
  if (delRes.error) {
    msg.textContent = 'Error al borrar datos anteriores: ' + delRes.error.message;
    msg.className = 'msg msg-err';
    btn.disabled = false;
    btn.textContent = '💾 Importar y reemplazar';
    return;
  }

  // 2. Insertar todos los jugadores parseados
  var rows = futuriblesS21Parsed.map(mapS21ToDb);
  var insRes = await client.from('futuribles_sub21').insert(rows);
  if (insRes.error) {
    msg.textContent = 'Error al insertar: ' + insRes.error.message;
    msg.className = 'msg msg-err';
    btn.disabled = false;
    btn.textContent = '💾 Importar y reemplazar';
    return;
  }

  btn.disabled = false;
  btn.textContent = '💾 Importar y reemplazar';
  btn.style.display = 'none';

  showToast('✓ ' + futuriblesS21Parsed.length + ' jugadores importados correctamente.');
  futuriblesS21Parsed = null;

  var ta = document.getElementById('s21HtmlInput');
  if (ta) ta.value = '';
  msg.textContent = '';

  document.getElementById('s21ImportPanel').style.display = 'none';
  await cargarFuturiblesS21();
}
