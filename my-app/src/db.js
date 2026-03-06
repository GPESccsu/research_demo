// ═══════════════════════════════════════════════════════════
// SciFlow Database Layer — SQLite (via sql.js WASM)
// Provides persistent storage using a real SQLite database
// with auto-save to IndexedDB for persistence across sessions.
// Also supports exporting/importing .sqlite files.
// ═══════════════════════════════════════════════════════════

import initSqlJs from "sql.js";

const DB_NAME = "sciflow_sqlite";
const IDB_STORE = "sciflow_store";
const IDB_KEY = "database";

let _db = null;
let _SQL = null;
let _initPromise = null;

// ── IndexedDB helpers for persisting the SQLite binary ──

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_STORE, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("store");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("store", "readonly");
    const req = tx.objectStore("store").get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("store", "readwrite");
    tx.objectStore("store").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── SQLite initialization ──

function createTables(db) {
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    authors TEXT,
    journal TEXT,
    year INTEGER,
    tags TEXT,
    cited INTEGER DEFAULT 0,
    "group" TEXT DEFAULT 'core',
    doi TEXT,
    abstract TEXT,
    bibtex TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    folder TEXT,
    content TEXT,
    source TEXT,
    page INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    time TEXT,
    title TEXT,
    "desc" TEXT,
    sample TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS synonym_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    word TEXT,
    type TEXT,
    reason TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS checklist_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    category TEXT,
    items TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS writing_drafts (
    id TEXT PRIMARY KEY,
    project_id INTEGER DEFAULT 1,
    content TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    role TEXT,
    content TEXT,
    timestamp INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS problem_tree (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 1,
    level INTEGER DEFAULT 1,
    label TEXT,
    text TEXT,
    color TEXT,
    refs TEXT,
    sort_order INTEGER DEFAULT 0
  )`);
}

async function getDB() {
  if (_db) return _db;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    _SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    const saved = await idbGet(IDB_KEY);
    if (saved) {
      _db = new _SQL.Database(new Uint8Array(saved));
      // Ensure new tables exist after migration
      createTables(_db);
    } else {
      _db = new _SQL.Database();
      createTables(_db);
    }
    return _db;
  })();
  return _initPromise;
}

async function persistDB() {
  if (!_db) return;
  const data = _db.export();
  await idbPut(IDB_KEY, data.buffer);
}

// Auto-persist with debounce
let _persistTimer = null;
function schedulePersist() {
  if (_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => persistDB(), 300);
}

// ── Helper: rows to objects ──
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(db, sql, params = []) {
  db.run(sql, params);
  schedulePersist();
}

// ── localStorage helpers for AI config ──

const CONFIG_KEY = "sciflow_ai_config";

function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to save config:", e);
  }
}

function loadConfig(defaultConfig) {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...defaultConfig, ...saved };
    }
  } catch (e) {
    console.warn("Failed to load config:", e);
  }
  return defaultConfig;
}

// ── Projects ──

export async function getProjects() {
  const db = await getDB();
  return queryAll(db, "SELECT * FROM projects ORDER BY created_at DESC");
}

export async function addProject(name) {
  const db = await getDB();
  runSql(db, "INSERT INTO projects (name) VALUES (?)", [name]);
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function deleteProject(id) {
  const db = await getDB();
  runSql(db, "DELETE FROM projects WHERE id = ?", [id]);
}

// ── Papers ──

export async function getPapers(projectId) {
  const db = await getDB();
  const rows = queryAll(db, "SELECT * FROM papers WHERE project_id = ? ORDER BY created_at DESC", [projectId || 1]);
  return rows.length > 0 ? rows.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] })) : null;
}

export async function savePapers(papers, projectId) {
  const db = await getDB();
  for (const p of papers) {
    const tags = JSON.stringify(p.tags || []);
    db.run(
      `INSERT OR REPLACE INTO papers (id, project_id, title, authors, journal, year, tags, cited, "group", doi, abstract, bibtex)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id || null, projectId || 1, p.title, p.authors, p.journal, p.year, tags, p.cited || 0, p.group, p.doi || null, p.abstract || null, p.bibtex || null]
    );
  }
  schedulePersist();
}

export async function addPaper(paper, projectId) {
  const db = await getDB();
  const tags = JSON.stringify(paper.tags || []);
  runSql(db,
    `INSERT INTO papers (project_id, title, authors, journal, year, tags, cited, "group", doi, abstract, bibtex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [projectId || 1, paper.title, paper.authors, paper.journal, paper.year, tags, paper.cited || 0, paper.group, paper.doi || null, paper.abstract || null, paper.bibtex || null]
  );
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function updatePaper(paper) {
  const db = await getDB();
  const tags = JSON.stringify(paper.tags || []);
  runSql(db,
    `UPDATE papers SET title=?, authors=?, journal=?, year=?, tags=?, cited=?, "group"=?, doi=?, abstract=?, bibtex=? WHERE id=?`,
    [paper.title, paper.authors, paper.journal, paper.year, tags, paper.cited || 0, paper.group, paper.doi || null, paper.abstract || null, paper.bibtex || null, paper.id]
  );
}

export async function deletePaper(id) {
  const db = await getDB();
  runSql(db, "DELETE FROM papers WHERE id = ?", [id]);
}

// ── Clips / Reading materials ──

export async function getClips(projectId) {
  const db = await getDB();
  return queryAll(db, "SELECT * FROM clips WHERE project_id = ? ORDER BY created_at DESC", [projectId || 1]);
}

export async function addClip(clip, projectId) {
  const db = await getDB();
  runSql(db,
    "INSERT INTO clips (project_id, folder, content, source, page) VALUES (?, ?, ?, ?, ?)",
    [projectId || 1, clip.folder, clip.content, clip.source || null, clip.page || null]
  );
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function deleteClip(id) {
  const db = await getDB();
  runSql(db, "DELETE FROM clips WHERE id = ?", [id]);
}

// ── Lab Logs ──

export async function getLogs(projectId) {
  const db = await getDB();
  const rows = queryAll(db, "SELECT * FROM logs WHERE project_id = ? ORDER BY created_at DESC", [projectId || 1]);
  return rows.length > 0 ? rows : null;
}

export async function saveLogs(logs, projectId) {
  const db = await getDB();
  for (const l of logs) {
    db.run(
      `INSERT OR REPLACE INTO logs (id, project_id, time, title, "desc", sample) VALUES (?, ?, ?, ?, ?, ?)`,
      [l.id || null, projectId || 1, l.time, l.title, l.desc, l.sample || null]
    );
  }
  schedulePersist();
}

export async function addLog(log, projectId) {
  const db = await getDB();
  runSql(db,
    `INSERT INTO logs (project_id, time, title, "desc", sample) VALUES (?, ?, ?, ?, ?)`,
    [projectId || 1, log.time, log.title, log.desc, log.sample || null]
  );
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function deleteLog(id) {
  const db = await getDB();
  runSql(db, "DELETE FROM logs WHERE id = ?", [id]);
}

// ── Checklist ──

export async function getChecklist(projectId) {
  const db = await getDB();
  const rows = queryAll(db, "SELECT * FROM checklist_data WHERE project_id = ? ORDER BY id", [projectId || 1]);
  if (rows.length === 0) return null;
  return rows.map(r => ({ ...r, items: JSON.parse(r.items || "[]") }));
}

export async function saveChecklist(categories, projectId) {
  const db = await getDB();
  db.run("DELETE FROM checklist_data WHERE project_id = ?", [projectId || 1]);
  for (const c of categories) {
    db.run(
      "INSERT INTO checklist_data (project_id, category, items) VALUES (?, ?, ?)",
      [projectId || 1, c.category, JSON.stringify(c.items)]
    );
  }
  schedulePersist();
}

// ── Writing Drafts ──

export async function getDrafts(projectId) {
  const db = await getDB();
  return queryAll(db, "SELECT * FROM writing_drafts WHERE project_id = ? ORDER BY updated_at DESC", [projectId || 1]);
}

export async function saveDraft(draft, projectId) {
  const db = await getDB();
  runSql(db,
    "INSERT OR REPLACE INTO writing_drafts (id, project_id, content, updated_at) VALUES (?, ?, ?, datetime('now'))",
    [draft.id, projectId || 1, draft.content]
  );
}

// ── Chat History ──

export async function getChatHistory(projectId) {
  const db = await getDB();
  return queryAll(db, "SELECT * FROM chat_history WHERE project_id = ? ORDER BY timestamp", [projectId || 1]);
}

export async function saveChatMessage(msg, projectId) {
  const db = await getDB();
  runSql(db,
    "INSERT INTO chat_history (project_id, role, content, timestamp) VALUES (?, ?, ?, ?)",
    [projectId || 1, msg.role, msg.content, Date.now()]
  );
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function clearChatHistory(projectId) {
  const db = await getDB();
  runSql(db, "DELETE FROM chat_history WHERE project_id = ?", [projectId || 1]);
}

// ── Synonym Groups ──

export async function getSynonymGroups(projectId) {
  const db = await getDB();
  return queryAll(db, "SELECT * FROM synonym_groups WHERE project_id = ?", [projectId || 1]);
}

export async function saveSynonymGroup(group, projectId) {
  const db = await getDB();
  runSql(db,
    "INSERT INTO synonym_groups (project_id, word, type, reason) VALUES (?, ?, ?, ?)",
    [projectId || 1, group.word, group.type, group.reason || null]
  );
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function deleteSynonymGroup(id) {
  const db = await getDB();
  runSql(db, "DELETE FROM synonym_groups WHERE id = ?", [id]);
}

// ── Problem Tree ──

export async function getProblemTree(projectId) {
  const db = await getDB();
  return queryAll(db, "SELECT * FROM problem_tree WHERE project_id = ? ORDER BY sort_order, id", [projectId || 1]);
}

export async function saveProblemTree(nodes, projectId) {
  const db = await getDB();
  db.run("DELETE FROM problem_tree WHERE project_id = ?", [projectId || 1]);
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    db.run(
      "INSERT INTO problem_tree (project_id, level, label, text, color, refs, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [projectId || 1, n.level, n.label, n.text, n.color || null, n.refs || null, i]
    );
  }
  schedulePersist();
}

export async function addProblemNode(node, projectId) {
  const db = await getDB();
  runSql(db,
    "INSERT INTO problem_tree (project_id, level, label, text, color, refs, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [projectId || 1, node.level, node.label, node.text, node.color || null, node.refs || null, node.sort_order || 999]
  );
  return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

export async function updateProblemNode(node) {
  const db = await getDB();
  runSql(db,
    "UPDATE problem_tree SET level=?, label=?, text=?, color=?, refs=? WHERE id=?",
    [node.level, node.label, node.text, node.color || null, node.refs || null, node.id]
  );
}

export async function deleteProblemNode(id) {
  const db = await getDB();
  runSql(db, "DELETE FROM problem_tree WHERE id = ?", [id]);
}

// ── Database Export / Import ──

export async function exportDatabase() {
  const db = await getDB();
  const data = db.export();
  return new Uint8Array(data);
}

export async function importDatabase(arrayBuffer) {
  const db = await getDB();
  const SQL = _SQL;
  _db = new SQL.Database(new Uint8Array(arrayBuffer));
  createTables(_db);
  await persistDB();
  return _db;
}

// ── BibTeX Import/Export ──

export function paperToBibTeX(paper) {
  const key = `${(paper.authors || "unknown").split(",")[0].trim().split(" ").pop() || "unknown"}${paper.year || "0000"}`;
  const tags = Array.isArray(paper.tags) ? paper.tags.join(", ") : (paper.tags || "");
  return `@article{${key},
  title = {${paper.title || ""}},
  author = {${paper.authors || ""}},
  journal = {${paper.journal || ""}},
  year = {${paper.year || ""}},
  doi = {${paper.doi || ""}},
  keywords = {${tags}}
}`;
}

export function papersToRIS(papers) {
  return papers.map(p => {
    const tags = Array.isArray(p.tags) ? p.tags : [];
    return [
      "TY  - JOUR",
      `TI  - ${p.title || ""}`,
      ...(p.authors || "").split(",").map(a => `AU  - ${a.trim()}`),
      `JO  - ${p.journal || ""}`,
      `PY  - ${p.year || ""}`,
      `DO  - ${p.doi || ""}`,
      ...tags.map(t => `KW  - ${t}`),
      "ER  - ",
    ].join("\n");
  }).join("\n\n");
}

export function parseBibTeX(bibtex) {
  const entries = [];
  const regex = /@\w+\{[^,]*,([^}]+(?:\{[^}]*\}[^}]*)*)}/gs;
  const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g;
  let match;
  while ((match = regex.exec(bibtex)) !== null) {
    const body = match[1];
    const fields = {};
    let fMatch;
    while ((fMatch = fieldRegex.exec(body)) !== null) {
      fields[fMatch[1].toLowerCase()] = fMatch[2].trim();
    }
    if (fields.title) {
      entries.push({
        title: fields.title,
        authors: fields.author || "",
        journal: fields.journal || "",
        year: parseInt(fields.year) || new Date().getFullYear(),
        doi: fields.doi || "",
        tags: (fields.keywords || "").split(",").map(t => t.trim()).filter(Boolean),
        group: "imported",
        cited: 0,
      });
    }
  }
  return entries;
}

export function parseRIS(ris) {
  const entries = [];
  const blocks = ris.split(/^ER\s+-/m).filter(b => b.trim());
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const paper = { title: "", authors: "", journal: "", year: new Date().getFullYear(), doi: "", tags: [], group: "imported", cited: 0 };
    const authors = [];
    const keywords = [];
    for (const line of lines) {
      const m = line.match(/^([A-Z][A-Z0-9])\s+-\s+(.*)/);
      if (!m) continue;
      const [, tag, val] = m;
      if (tag === "TI" || tag === "T1") paper.title = val;
      else if (tag === "AU" || tag === "A1") authors.push(val);
      else if (tag === "JO" || tag === "JF" || tag === "T2") paper.journal = val;
      else if (tag === "PY" || tag === "Y1") paper.year = parseInt(val) || paper.year;
      else if (tag === "DO") paper.doi = val;
      else if (tag === "KW") keywords.push(val);
    }
    paper.authors = authors.join(", ");
    paper.tags = keywords;
    if (paper.title) entries.push(paper);
  }
  return entries;
}

// Export everything
export { saveConfig, loadConfig };
