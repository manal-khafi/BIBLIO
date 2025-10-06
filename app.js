// Simple SPA Library Manager using localStorage

const STORAGE_KEY = 'biblio';
const API_BASE_DEFAULT = 'http://127.0.0.1:4000/api';
let API_BASE = localStorage.getItem('apiBase') || API_BASE_DEFAULT;
let useApi = false;

const defaultDb = {
  adherents: [],
  bibliothecaires: [],
  categories: [],
  livres: [],
  users: [],
  emprunts: []
};

// Data layer
const db = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
        return structuredClone(defaultDb);
      }
      const parsed = JSON.parse(raw);
      // ensure all collections exist
      for (const key of Object.keys(defaultDb)) {
        if (!Array.isArray(parsed[key])) parsed[key] = [];
      }
      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
      return structuredClone(defaultDb);
    }
  },
  save(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
};

let state = db.load();

async function probeApi() {
  try {
    const res = await fetch(API_BASE.replace(/\/$/, '') + '/adherents', { method: 'GET' });
    useApi = res.ok;
  } catch {
    useApi = false;
  }
}

// Utilities
const uid = () => crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2));

function byId(id) { return document.getElementById(id); }
function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return [...el.querySelectorAll(sel)]; }

function saveState() { db.save(state); }

// Routing
const routes = ['adherents', 'bibliothecaires', 'categories', 'livres', 'emprunts', 'users'];
let currentRoute = routes[0];

window.addEventListener('hashchange', handleRouteChange);
function handleRouteChange() {
  const route = location.hash.replace('#/', '') || routes[0];
  currentRoute = routes.includes(route) ? route : routes[0];
  render();
}

// (UI controls for API intentionally removed)

// Export/Import
byId('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'biblio.json';
  a.click();
  URL.revokeObjectURL(url);
});

byId('importInput').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const parsed = JSON.parse(text);
    // simple shape validation
    for (const key of Object.keys(defaultDb)) {
      if (!(key in parsed)) parsed[key] = [];
      if (!Array.isArray(parsed[key])) parsed[key] = [];
    }
    state = parsed;
    saveState();
    render();
  } catch {
    alert('Fichier JSON invalide.');
  } finally {
    e.target.value = '';
  }
});

// CRUD operations (generic)
async function list(collection) {
  if (useApi) {
    const res = await fetch(`${API_BASE}/${collection}`);
    if (!res.ok) throw new Error('API list failed');
    return await res.json();
  }
  return state[collection];
}
async function create(collection, item) {
  if (useApi) {
    const res = await fetch(`${API_BASE}/${collection}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
    if (!res.ok) throw new Error('API create failed');
    return await res.json();
  }
  const row = { _id: uid(), ...item };
  state[collection].push(row);
  saveState();
  return row;
}
async function update(collection, _id, partial) {
  if (useApi) {
    const res = await fetch(`${API_BASE}/${collection}/${_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partial) });
    if (!res.ok) throw new Error('API update failed');
    return await res.json();
  }
  const rows = state[collection];
  const idx = rows.findIndex(r => r._id === _id);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...partial };
    saveState();
    return rows[idx];
  }
  return null;
}
async function removeRow(collection, _id) {
  if (useApi) {
    const res = await fetch(`${API_BASE}/${collection}/${_id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API delete failed');
    return;
  }
  state[collection] = state[collection].filter(r => r._id !== _id);
  saveState();
}

// Entity field definitions
const entityFields = {
  adherents: [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    { name: 'prenom', label: 'Prénom', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'telephone', label: 'Téléphone', type: 'text' }
  ],
  bibliothecaires: [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    { name: 'prenom', label: 'Prénom', type: 'text', required: true },
    { name: 'poste', label: 'Poste', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' }
  ],
  categories: [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' }
  ],
  livres: [
    { name: 'titre', label: 'Titre', type: 'text', required: true },
    { name: 'auteur', label: 'Auteur', type: 'text' },
    { name: 'annee', label: 'Année', type: 'number' },
    { name: 'genre', label: 'Genre', type: 'text' },
    { name: 'exemplaires', label: 'Exemplaires', type: 'number' }
  ],
  users: [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    { name: 'prenom', label: 'Prénom', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Rôle', type: 'select', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'staff', label: 'Staff' }
    ], required: true },
    { name: 'motDePasse', label: 'Mot de passe', type: 'password', required: true }
  ],
  emprunts: [
    { name: 'id_adherent', label: 'Adhérent', type: 'select', options: () => state.adherents.map(a => ({ value: a._id, label: displayPerson(a) })) , required: true },
    { name: 'id_livre', label: 'Livre', type: 'select', options: () => state.livres.map(l => ({ value: l._id, label: l.titre })) , required: true },
    { name: 'date_emprunt', label: 'Date d\'emprunt', type: 'date', required: true },
    { name: 'date_retour', label: 'Date de retour', type: 'date' },
    { name: 'statut', label: 'Statut', type: 'select', options: [
      { value: 'en_cours', label: 'En cours' },
      { value: 'retourne', label: 'Retourné' },
      { value: 'en_retard', label: 'En retard' }
    ] }
  ]
};

const entityColumns = {
  adherents: ['nom', 'prenom', 'email', 'telephone'],
  bibliothecaires: ['nom', 'prenom', 'poste', 'email'],
  categories: ['nom', 'description'],
  livres: ['titre', 'auteur', 'annee', 'genre', 'exemplaires'],
  users: ['nom', 'prenom', 'email', 'role'],
  emprunts: ['id_adherent', 'id_livre', 'date_emprunt', 'date_retour', 'statut']
};

// Helpers to display related names
function displayValue(key, value) {
  if (key === 'id_adherent') {
    const a = state.adherents.find(x => x._id === value);
    return a ? displayPerson(a) : '';
  }
  if (key === 'id_livre') {
    return state.livres.find(l => l._id === value)?.titre || '';
  }
  return value ?? '';
}

function displayPerson(p) {
  const n = [p.nom, p.prenom].filter(Boolean).join(' ');
  return n || p.email || 'N/A';
}

// Renderers
const contentEl = byId('content');
const searchInput = byId('searchInput');
const newBtn = byId('newBtn');

newBtn.addEventListener('click', () => openForm(currentRoute));
searchInput.addEventListener('input', () => render());

function render() {
  // Highlight active nav
  qsa('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#/${currentRoute}`));

  // Update topbar actions
  newBtn.style.display = currentRoute ? 'inline-flex' : 'none';

  // Render table
  renderList(currentRoute);
}

async function renderList(collection) {
  const rows = await list(collection);
  const query = (searchInput.value || '').toLowerCase().trim();
  const cols = entityColumns[collection];
  const filtered = !query
    ? rows
    : rows.filter(r => cols.some(k => String(displayValue(k, r[k])).toLowerCase().includes(query)));

  const t = qs('#tableTemplate').content.cloneNode(true);
  const thead = qs('thead', t);
  const tbody = qs('tbody', t);

  const headers = `<tr>${cols.map(c => `<th>${humanize(c)}</th>`).join('')}<th>Actions</th></tr>`;
  thead.innerHTML = headers;

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length + 1;
    td.innerHTML = '<div class="empty">Aucune donnée</div>';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    for (const row of filtered) {
      const tr = document.createElement('tr');
      for (const col of cols) {
        const td = document.createElement('td');
        td.textContent = displayValue(col, row[col]);
        tr.appendChild(td);
      }
      const actions = document.createElement('td');
      actions.className = 'row-actions';
      actions.append(
        mkBtn('Éditer', 'btn', () => openForm(collection, row._id)),
        mkBtn('Supprimer', 'btn btn-danger', () => {
          if (confirm('Supprimer cet élément ?')) {
            removeWithCascade(collection, row._id);
            render();
          }
        })
      );
      tr.appendChild(actions);
      tbody.appendChild(tr);
    }
  }

  contentEl.innerHTML = '';
  contentEl.appendChild(t);
}

function openForm(collection, id) {
  const editing = id != null;
  const fields = entityFields[collection];
  const row = editing ? state[collection].find(r => r._id === id) : {};
  const t = qs('#formTemplate').content.cloneNode(true);
  const form = qs('form', t);

  const fieldGrid = document.createElement('div');
  fieldGrid.className = 'grid';
  for (const field of fields) {
    const fieldEl = document.createElement('div');
    fieldEl.className = 'field';
    const label = document.createElement('label');
    label.textContent = field.label + (field.required ? ' *' : '');
    label.setAttribute('for', field.name);
    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
    } else if (field.type === 'select') {
      input = document.createElement('select');
      const opts = typeof field.options === 'function' ? field.options() : (field.options || []);
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '-- Sélectionner --';
      input.appendChild(placeholder);
      for (const opt of opts) {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        input.appendChild(o);
      }
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
    }
    input.id = field.name;
    input.name = field.name;
    input.required = !!field.required;
    if (row[field.name] != null) input.value = row[field.name];

    fieldEl.append(label, input);
    fieldGrid.appendChild(fieldEl);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';
  const saveBtn = mkBtn('Enregistrer', 'btn btn-primary');
  const cancelBtn = mkBtn('Annuler', 'btn');
  actions.append(saveBtn, cancelBtn);

  form.append(fieldGrid, actions);
  contentEl.innerHTML = '';
  contentEl.appendChild(form);

  cancelBtn.addEventListener('click', (e) => { e.preventDefault(); renderList(collection); });
  form.addEventListener('submit', (e) => e.preventDefault());
  saveBtn.addEventListener('click', async () => {
    const data = {};
    for (const field of fields) {
      const el = qs(`[name="${field.name}"]`, form);
      let val = el.value;
      if (field.type === 'select' && val === '') val = null;
      if (field.type === 'number' && val !== '') val = Number(val);
      data[field.name] = val;
    }
    if (!validate(collection, data)) return;
    if (editing) {
      await update(collection, id, data);
    } else {
      await create(collection, data);
    }
    renderList(collection);
  });
}

function validate(collection, data) {
  // Required fields
  const fields = entityFields[collection];
  for (const f of fields) {
    if (f.required && !String(data[f.name] ?? '').trim()) {
      alert(`Veuillez remplir: ${f.label}`);
      return false;
    }
  }
  // Relationship constraints
  if (collection === 'emprunts') {
    if (data.id_adherent && !state.adherents.some(a => a._id === data.id_adherent)) { alert('Adhérent invalide'); return false; }
    if (data.id_livre && !state.livres.some(l => l._id === data.id_livre)) { alert('Livre invalide'); return false; }
    if (data.date_retour && data.date_emprunt && data.date_retour < data.date_emprunt) { alert('La date de retour doit être après la date d\'emprunt'); return false; }
  }
  return true;
}

function removeWithCascade(collection, id) {
  if (!useApi && collection === 'adherents') {
    // delete loans for that adherent
    state.emprunts = state.emprunts.filter(e => e.id_adherent !== id);
  }
  if (!useApi && collection === 'livres') {
    // delete loans for that book
    state.emprunts = state.emprunts.filter(e => e.id_livre !== id);
  }
  removeRow(collection, id);
}

// UI helpers
function mkBtn(label, cls, onClick) {
  const b = document.createElement('button');
  b.className = cls;
  b.textContent = label;
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

function humanize(key) {
  const map = {
    nom: 'Nom', prenom: 'Prénom', email: 'Email', telephone: 'Téléphone', description: 'Description',
    titre: 'Titre', auteur: 'Auteur', annee: 'Année', genre: 'Genre', exemplaires: 'Exemplaires',
    role: 'Rôle', motDePasse: 'Mot de passe', poste: 'Poste',
    id_adherent: 'Adhérent', id_livre: 'Livre', date_emprunt: 'Date emprunt', date_retour: 'Date retour', statut: 'Statut'
  };
  return map[key] || key;
}

// Initial route and render
if (!location.hash) location.hash = '#/adherents';
(async () => {
  await probeApi();
  handleRouteChange();
})();

// Reprobe API periodically to reflect backend availability changes
setInterval(() => { probeApi(); }, 15000);


