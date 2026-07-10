// ── Actualización individual vía Edge Function ───────────────────
async function actualizarFisicoJugadorDesdeHattrick(j) {
  var res = await client.functions.invoke('update-hattrick-player', {
    body: { playerId: j.id }
  });
  if (res.error) throw res.error;
  if (!res.data || !res.data.ok) {
    throw new Error(res.data && res.data.error ? res.data.error : 'Error actualizando desde Hattrick');
  }
  var update = res.data.updated || {};
  if (update.tsi         != null) j.tsi         = update.tsi;
  if (update.forma       != null) j.forma       = update.forma;
  if (update.resistencia != null) j.resistencia = update.resistencia;
  return update;
}

// ── Botón "Actualizar forma/TSI" ────────────────────────────────
async function actualizarFisicoDesdeHattrick() {
  if (updatingHt) return;

  var filtrados     = getJugadoresFiltrados().filter(function(j) { return j.id; });
  var usandoFiltros = hayFiltrosActivos();
  var lista         = usandoFiltros ? filtrados : jugadores.filter(function(j) { return j.id; });
  if (lista.length === 0) { showToast('No hay jugadores para actualizar.', 'warn'); return; }
  if (!usandoFiltros && !confirm('Vas a actualizar ' + lista.length + ' jugadores desde Hattrick. ¿Continuar?')) return;

  var btn      = document.getElementById('btnActualizarHt');
  var oldText  = btn ? btn.textContent : '';
  var oldStats = document.getElementById('stats').textContent;
  var ok = 0, fail = 0, firstError = '';
  updatingHt = true;
  if (btn) btn.disabled = true;

  try {
    for (var i = 0; i < lista.length; i++) {
      var j = lista[i];
      if (btn) btn.textContent = 'Actualizando ' + (i + 1) + '/' + lista.length;
      document.getElementById('stats').textContent = 'Actualizando ' + (i + 1) + '/' + lista.length;
      try {
        await actualizarFisicoJugadorDesdeHattrick(j);
        ok++;
      } catch (err) {
        fail++;
        if (!firstError) firstError = err && err.message ? err.message : String(err);
        console.warn('No se pudo actualizar desde Hattrick:', j.id, err);
      }
    }
  } finally {
    updatingHt = false;
    if (btn) { btn.disabled = false; btn.textContent = oldText || 'Actualizar forma/TSI'; }
    document.getElementById('stats').textContent = oldStats;
    renderTabla();
  }

  showToast('Actualización Hattrick: ' + ok + ' ok, ' + fail + ' errores', fail ? 'warn' : 'ok');
  if (fail) {
    showToast('Revisa la Edge Function: despliegue, secreto SERVICE_ROLE_KEY y logs de Supabase.' + (firstError ? ' Detalle: ' + firstError : ''), 'warn');
  }
}
