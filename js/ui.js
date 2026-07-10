// ── Login ────────────────────────────────────────────────────────
window.addEventListener('load', function() {
  inicializarAuth();
});

async function inicializarAuth() {
  var res = await client.auth.getSession();
  if (res.data && res.data.session) {
    mostrarApp();
  } else {
    mostrarLogin();
  }

  client.auth.onAuthStateChange(function(event, session) {
    if (session) {
      mostrarApp();
    } else if (event === 'SIGNED_OUT') {
      mostrarLogin();
    }
  });
}

async function login() {
  var emailInput = document.getElementById('emailInput');
  var input = document.getElementById('pwdInput');
  var btn = document.getElementById('loginBtn');
  var err = document.getElementById('loginErr');
  var email = emailInput.value.trim();
  var password = input.value;

  err.style.display = 'none';
  if (!email) {
    err.textContent = 'Introduce el usuario';
    err.style.display = 'block';
    emailInput.focus();
    return;
  }
  if (!password) {
    err.textContent = 'Introduce la contrase\u00f1a';
    err.style.display = 'block';
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Entrando...';

  var res = await client.auth.signInWithPassword({
    email: email,
    password: password
  });

  btn.disabled = false;
  btn.textContent = 'Entrar';

  if (res.error) {
    err.textContent = 'Acceso no valido';
    err.style.display = 'block';
    return;
  }

  input.value = '';
  localStorage.setItem('ht_last_email', email);
  mostrarApp();
}

async function logout() {
  await client.auth.signOut();
  jugadores = [];
  editingId = null;
  document.getElementById('tbody').innerHTML = '';
  mostrarLogin();
}

function mostrarLogin() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  var emailInput = document.getElementById('emailInput');
  var lastEmail = localStorage.getItem('ht_last_email') || '';
  emailInput.value = lastEmail;
  (lastEmail ? document.getElementById('pwdInput') : emailInput).focus();
}

function mostrarApp() {
  if (document.getElementById('app').style.display === 'flex') return;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  cargarJugadores();
}

// ── Tabs ─────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.tab-content').forEach(function(c) {
    c.classList.toggle('active', c.id === 'tab-' + name);
  });
}

// ── Filtros ──────────────────────────────────────────────────────
function actualizarFiltroAnos() {
  var sel = document.getElementById('filtAnos');
  var actual = sel.value;
  var edades = [];
  jugadores.forEach(function(j) {
    if (j.anos !== '' && edades.indexOf(j.anos) < 0) edades.push(j.anos);
  });
  edades.sort(function(a, b) { return a - b; });
  sel.innerHTML = '<option value="">Todos</option>';
  edades.forEach(function(e) {
    sel.innerHTML += '<option value="' + e + '"' + (String(e) === actual ? ' selected' : '') + '>' + e + '</option>';
  });
}

function limpiarFiltros() {
  ['filtPos','filtAnos','filtEsp','filtContacto','filtPortal','groupBy'].forEach(function(id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('buscar').value = '';
  renderTabla();
}

function hayFiltrosActivos() {
  return !!(
    document.getElementById('filtPos').value ||
    document.getElementById('filtAnos').value ||
    document.getElementById('filtEsp').value ||
    document.getElementById('filtContacto').value ||
    document.getElementById('filtPortal').value ||
    document.getElementById('buscar').value.trim()
  );
}

function getJugadoresFiltrados() {
  var fp  = document.getElementById('filtPos').value;
  var fa  = document.getElementById('filtAnos').value;
  var fe  = document.getElementById('filtEsp').value;
  var fc  = document.getElementById('filtContacto').value;
  var fpo = document.getElementById('filtPortal').value;
  var fb  = document.getElementById('buscar').value.toLowerCase();

  return jugadores.filter(function(j) {
    if (fp  && j.posicion !== fp)  return false;
    if (fa  && String(j.anos) !== fa) return false;
    if (fe  && j.esp !== fe)       return false;
    if (fc  && j.contacto !== fc)  return false;
    if (fpo && j.portal !== fpo)   return false;
    if (fb && (j.nombre||'').toLowerCase().indexOf(fb) < 0
           && (j.dueno||'').toLowerCase().indexOf(fb)  < 0) return false;
    return true;
  });
}

// ── Atajos de teclado ────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (!editingId) return;
  if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  if (e.key === 'Enter' && e.target.closest('.edit-row')) { e.preventDefault(); saveRowEdit(editingId); }
});

window.addEventListener('beforeunload', function(e) {
  if (editingId) { e.preventDefault(); e.returnValue = ''; }
});

// ── Toast ────────────────────────────────────────────────────────
function showToast(txt, type) {
  var c  = document.getElementById('toastContainer');
  var el = document.createElement('div');
  el.className  = 'toast ' + (type || 'ok');
  el.textContent = txt;
  c.appendChild(el);
  var dur = type === 'err' ? 5000 : type === 'warn' ? 4000 : 3000;
  setTimeout(function() { if (el.parentNode) el.remove(); }, dur);
}

// ── Skeleton loader ──────────────────────────────────────────────
function mostrarSkeleton() {
  var cols = [130,55,85,55,28,28,28,28,28,28,28,45,50,45,28,28,75,28,28,28,28,28,85,65,28,28,90,40];
  var html = '';
  for (var i = 0; i < 9; i++) {
    html += '<tr class="skeleton-row">';
    cols.forEach(function(w) {
      var rw = Math.round(w * (0.55 + Math.random() * 0.45));
      html += '<td><div class="skeleton-cell" style="width:' + rw + 'px"></div></td>';
    });
    html += '</tr>';
  }
  document.getElementById('tbody').innerHTML = html;
}

