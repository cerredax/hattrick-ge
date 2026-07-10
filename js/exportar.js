// ── Exportar XLSX ────────────────────────────────────────────────
function exportarXLSX() {
  var headers = ['Nombre','ID','Años','Días','Especialidad','Portería','Defensa','Jugadas','Lateral','Pases','Anotación','Balón Parado','HTMS','HTMS28','TSI','Forma','Resistencia','Posición','Nivel','Tier','Portal','Nivel Entrenador','Eficiencia Entreno (%)','Notas','Contacto','Dueño','Carácter','Liderazgo','Experiencia','Fecha Registro','Fecha 17.000 días'];
  var keys    = ['nombre','id','anos','dias','esp','port','def','jug','lat','pas','anot','bp','htms','htms28','tsi','forma','resistencia','posicion','nivel','tier','portal','lvlEnt','efEnt','notas','contacto','dueno','caracter','liderazgo','experiencia','fechaReg','fecha17'];
  var data    = [headers];
  jugadores.forEach(function(j) {
    data.push(keys.map(function(k) { return j[k] !== undefined ? j[k] : ''; }));
  });
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Jugadores');
  XLSX.writeFile(wb, 'HattrickGEQ.xlsx');
}
