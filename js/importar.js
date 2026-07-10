// ── Parser texto Hattrick / Foxtrick ────────────────────────────
function wordToNum(w) {
  var s = (w || '').toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íì]/g,'i')
    .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').trim();
  return NIVEL_NUM[s] || null;
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
  var t = raw.toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e')
    .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').trim();
  if (t==='tec'||t==='tecnico')                   return 'Técnico';
  if (t==='imp'||t==='imprevisible')              return 'Imprevisible';
  if (t==='pot'||t==='potente')                   return 'Potente';
  if (t==='rap'||t==='rapido')                    return 'Rápido';
  if (t==='cab'||t==='cabezon'||t==='cabeceador') return 'Cabezón';
  return '';
}

function parsePlayerText(raw) {
  if (raw.normalize) raw = raw.normalize('NFC');
  var text = raw
    .replace(/\[b\](.*?)\[\/b\]/gi,'$1').replace(/\[i\](.*?)\[\/i\]/gi,'$1')
    .replace(/\[\/?(tr|th|td|table|u)\]/gi,' ').replace(/\s{2,}/g,' ');
  var d = {}, m;

  if ((m = raw.match(/\[playerid=(\d+)\]/i)))               d.id       = m[1];
  if ((m = raw.match(/^(.+?)\s*\[playerid=/)))              d.nombre   = m[1].trim();
  if ((m = text.match(/(\d+)\s+años\s+y\s+(\d+)\s+días/i))){ d.anos=+m[1]; d.dias=+m[2]; }
  if ((m = text.match(/Especialidad[:\s]+([^\n\r,.(]+)/i))) d.esp      = normEsp(m[1].trim());
  if ((m = text.match(/Dueño:?\s+(.+?)\s*\(?desde/i)))      d.dueno    = m[1].trim();
  if ((m = text.match(/Mejor posición:\s*([^\n\r(]+)/i)))   d.posicion = normPos(m[1].trim());

  // TSI — acepta "TSI 82 420" y "TSI: 82.420"
  if ((m = raw.match(/TSI:?\s*([\d\s.,]+)/i))) {
    var tv = parseInt(m[1].replace(/[^\d]/g, ''));
    if (!isNaN(tv)) d.tsi = tv;
  }

  // Forma y Resistencia — formato Foxtrick "bueno (7)" o clásico "bueno 7"
  m = text.match(/Forma[^(\n]*\((\d+)\)/i) || text.match(/Forma\s+\w+\s+(\d+)/i);
  if (m) d.forma = +m[1];
  m = text.match(/Resistencia[^(\n]*\((\d+)\)/i) || text.match(/Resistencia\s+\w+\s+(\d+)/i);
  if (m) d.resistencia = +m[1];

  if ((m = text.match(/Habilidad:\s*(\d+)/i)))  d.htms   = +m[1];
  if ((m = text.match(/Potencial:\s*(\d+)/i)))  d.htms28 = +m[1];

  // Habilidades con valor numérico entre paréntesis
  [['port','Portería'],['def','Defensa'],['jug','Jugadas'],['lat','Lateral'],
   ['pas','Pases'],['anot','Anotación'],['bp','Balón parado']].forEach(function(s) {
    var re = new RegExp(s[1] + '[^(\\n]*\\((\\d+)\\)', 'i');
    if ((m = text.match(re))) d[s[0]] = +m[1];
  });

  // Experiencia — formato clásico "(N) en experiencia" o texto "nivel X en experiencia"
  m = text.match(/\((\d+)\)(?:\(\d+\))?\s+en\s+experiencia/i);
  if (m) {
    d.experiencia = +m[1];
  } else {
    m = text.match(/nivel\s+([\w ]+?)\s+en\s+experiencia/i);
    if (m) { var ev = wordToNum(m[1]); if (ev) d.experiencia = ev; }
  }

  // Liderazgo — formato clásico "liderazgo WORD (N)" o texto "liderazgo WORD"
  m = text.match(/liderazgo\s+\w+[\s(]+(\d+)\)/i);
  if (m) {
    d.liderazgo = +m[1];
  } else {
    m = text.match(/liderazgo\s+([\w]+)/i);
    if (m) { var lv = wordToNum(m[1]); if (lv) d.liderazgo = lv; }
  }

  if ((m = text.match(/Una persona ([^\n\r.]+)/i))) d.caracter = m[1].trim();
  return d;
}

// ── Tab importar ─────────────────────────────────────────────────
function previewImport() {
  var txt = document.getElementById('playerText').value.trim();
  if (!txt) { showImportMsg('Pega primero el texto del jugador.', 'err'); return; }
  var d = parsePlayerText(txt);
  if (!d.id) { showImportMsg('No se encontró el playerid en el texto.', 'err'); return; }
  parsedImport = { data: d };

  var idx   = jugadores.findIndex(function(j) { return String(j.id) === String(d.id); });
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

  var tag   = found
    ? '<span class="tag tag-upd">Actualizar</span>'
    : '<span class="tag tag-new">Nuevo jugador</span>';
  var tabla = rows.map(function(r) {
    var v    = r[1];
    var cell = v != null && v !== ''
      ? '<span class="' + (typeof v === 'number' ? 'pval-num' : '') + '">' + esc(String(v)) + '</span>'
      : '<span class="pval-miss">no detectado</span>';
    return '<tr><td>' + r[0] + '</td><td>' + cell + '</td></tr>';
  }).join('');

  document.getElementById('importRight').innerHTML =
    '<div class="preview-box"><h3>Vista previa ' + tag + '</h3><table>' + tabla + '</table></div>';
  document.getElementById('btnConfirm').style.display = 'block';
  showImportMsg(
    found ? 'Jugador encontrado. Confirma para actualizar.' : 'Jugador nuevo. Se añadirá a la base de datos.',
    found ? 'ok' : 'warn'
  );
}

async function confirmarImport() {
  if (!parsedImport) return;
  var d      = parsedImport.data;
  var idx    = jugadores.findIndex(function(j) { return String(j.id) === String(d.id); });
  var fields = ['nombre','anos','dias','esp','port','def','jug','lat','pas','anot','bp',
                'htms','htms28','tsi','forma','resistencia','posicion','dueno','liderazgo','experiencia','caracter'];

  var jugador;
  if (idx >= 0) {
    jugador = Object.assign({}, jugadores[idx]);
    fields.forEach(function(f) { if (d[f] != null && d[f] !== '') jugador[f] = d[f]; });
  } else {
    jugador = {
      id:'',nombre:'',anos:'',dias:'',esp:'',port:'',def:'',jug:'',lat:'',pas:'',
      anot:'',bp:'',htms:'',htms28:'',tsi:'',forma:'',resistencia:'',
      posicion:'',nivel:'',tier:'',portal:'',lvlEnt:'',efEnt:'',
      notas:'',contacto:'No',dueno:'',caracter:'',liderazgo:'',experiencia:'',fechaReg:'',fecha17:''
    };
    jugador.id = d.id;
    fields.forEach(function(f) { if (d[f] != null && d[f] !== '') jugador[f] = d[f]; });
  }

  document.getElementById('spin').style.display       = 'block';
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
  var accion = idx >= 0 ? ' actualizado.' : ' añadido.';
  showImportMsg('✅ ' + (jugador.nombre || d.id) + accion, 'ok');
  showToast('✓ ' + (jugador.nombre || d.id) + accion);
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

