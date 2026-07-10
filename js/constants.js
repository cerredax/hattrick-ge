// ── Mapas de posición y especialidad ────────────────────────────
var POS_CLASS = {
  'Portero':'Por','Delantero':'Del','Mediocentro':'MC',
  'Extremo':'Ext','Defensa Central':'DC','Defensa Lateral':'DL'
};
var ESP_CLASS = {
  'Técnico':'tec','Imprevisible':'imp','Potente':'pot',
  'Rápido':'rap','Cabezón':'cab'
};

// ── Etiquetas de nivel de habilidad (índice = valor numérico) ───
var NIVEL_LABEL = [
  'No sabe', 'Desastroso', 'Horrible', 'Pobre', 'Débil', 'Insuficiente',
  'Aceptable', 'Bueno', 'Excelente', 'Formidable', 'Destacado',
  'Brillante', 'Magnífico', 'Clase mundial', 'Sobrenatural',
  'Titánico', 'Extraterrestre', 'Mítico', 'Mágico', 'Utopía', 'Divino'
];

// ── Opciones de selects para edición inline ──────────────────────
var POSS_OPTS = [
  ['','—'],['Portero','Por'],['Defensa Central','DC'],['Defensa Lateral','DL'],
  ['Mediocentro','MC'],['Extremo','Ext'],['Delantero','Del']
];
var ESPS_OPTS = [
  ['','—'],['Técnico','Técnico'],['Imprevisible','Imp'],
  ['Potente','Pot'],['Rápido','Ráp'],['Cabezón','Cab']
];
var NIFS_OPTS = [
  ['','—'],
  ['Continental Incompleto','Cont.Inc'],['Continental Completo','Cont.Com'],
  ['Mundial Incompleto','Mund.Inc'],['Mundial Completo','Mund.Com']
];
var CONS_OPTS = [['No','No'],['Sí','Sí']];

// ── Mapa texto Hattrick → valor numérico ────────────────────────
var NIVEL_NUM = {
  'desastroso':1,'horrible':2,'pobre':3,'debil':4,
  'insuficiente':5,'aceptable':6,'bueno':7,'excelente':8,
  'formidable':9,'destacado':10,'brillante':11,'magnifico':12,
  'clase mundial':13,'sobrenatural':14,'titanico':15,'extraterrestre':16,
  'mitico':17,'magico':18,'utopia':19,'divino':20,
  // aliases para compatibilidad con Foxtrick
  'pesimo':2,'muy pobre':3,'maravilloso':17,'utopico':19
};

// ── Columnas disponibles para ordenar ───────────────────────────
var SORT_COLS = [
  { val:'anos',        label:'Edad'        },
  { val:'dias',        label:'Días'        },
  { val:'port',        label:'Portería'    },
  { val:'def',         label:'Defensa'     },
  { val:'jug',         label:'Jugadas'     },
  { val:'lat',         label:'Lateral'     },
  { val:'pas',         label:'Pases'       },
  { val:'anot',        label:'Anotación'   },
  { val:'htms',        label:'HTMS'        },
  { val:'tsi',         label:'TSI'         },
  { val:'forma',       label:'Forma'       },
  { val:'resistencia', label:'Resistencia' },
  { val:'liderazgo',   label:'Liderazgo'   },
  { val:'experiencia', label:'Experiencia' },
];

