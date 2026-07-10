// ── Carga desde Supabase ─────────────────────────────────────────
async function cargarJugadores() {
  document.getElementById('stats').textContent = 'Cargando...';
  mostrarSkeleton();
  var res = await client.from('jugadores').select('*').order('nombre', { ascending: true });
  if (res.error) {
    document.getElementById('stats').textContent = 'Error: ' + res.error.message;
    showToast('Error al conectar con la base de datos.', 'err');
    return;
  }
  jugadores = res.data.map(mapFromDb);
  document.getElementById('stats').textContent = jugadores.length + ' jugadores';
  actualizarFiltroAnos();
  renderTabla();
}

// ── Mapeo DB → objeto local ──────────────────────────────────────
function mapFromDb(r) {
  return {
    nombre:      r.nombre        || '',
    id:          r.id            || '',
    anos:        r.anos          != null ? r.anos          : '',
    dias:        r.dias          != null ? r.dias          : '',
    esp:         r.especialidad  || '',
    port:        r.porteria      != null ? r.porteria      : '',
    def:         r.defensa       != null ? r.defensa       : '',
    jug:         r.jugadas       != null ? r.jugadas       : '',
    lat:         r.lat           != null ? r.lat           : '',
    pas:         r.pases         != null ? r.pases         : '',
    anot:        r.anotacion     != null ? r.anotacion     : '',
    bp:          r.balon_parado  != null ? r.balon_parado  : '',
    htms:        r.htms          != null ? r.htms          : '',
    htms28:      r.htms28        != null ? r.htms28        : '',
    tsi:         r.tsi           != null ? r.tsi           : '',
    forma:       r.forma         != null ? r.forma         : '',
    resistencia: r.resistencia   != null ? r.resistencia   : '',
    posicion:    r.posicion      || '',
    nivel:       r.nivel         || '',
    tier:        r.tier          || '',
    portal:      r.portal        || '',
    lvlEnt:      r.nivel_entrenador   != null ? r.nivel_entrenador   : '',
    efEnt:       r.eficiencia_entreno != null ? r.eficiencia_entreno : '',
    notas:       r.notas         || '',
    contacto:    r.contacto      || 'No',
    dueno:       r.dueno         || '',
    caracter:    r.caracter      || '',
    liderazgo:   r.liderazgo     != null ? r.liderazgo     : '',
    experiencia: r.experiencia   != null ? r.experiencia   : '',
    fechaReg:    r.fecha_registro || '',
    fecha17:     r.fecha_17000   || '',
  };
}

// ── Mapeo objeto local → DB ──────────────────────────────────────
function mapToDb(j) {
  function n(v) { var x = parseFloat(v); return isNaN(x) ? null : x; }
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

