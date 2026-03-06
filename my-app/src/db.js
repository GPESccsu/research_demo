// ═══════════════════════════════════════════════════════════
// SciFlow Database Layer
// Uses IndexedDB for large data (papers, logs, clips)
// Uses localStorage for small config data (AI settings)
// ═══════════════════════════════════════════════════════════

const DB_NAME = "sciflow_db";
const DB_VERSION = 2;

const STORES = {
  papers: { keyPath: "id", autoIncrement: true },
  clips: { keyPath: "id", autoIncrement: true },
  logs: { keyPath: "id", autoIncrement: true },
  synonymGroups: { keyPath: "id", autoIncrement: true },
  checklistData: { keyPath: "id" },
  writingDrafts: { keyPath: "id", autoIncrement: true },
  chatHistory: { keyPath: "id", autoIncrement: true },
  uiState: { keyPath: "id" },
};

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (const [name, opts] of Object.entries(STORES)) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, opts);
          if (name === "papers") {
            store.createIndex("group", "group", { unique: false });
            store.createIndex("year", "year", { unique: false });
          }
          if (name === "clips") {
            store.createIndex("folder", "folder", { unique: false });
          }
          if (name === "logs") {
            store.createIndex("time", "time", { unique: false });
          }
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Generic CRUD operations
async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbAdd(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbClear(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbBulkPut(storeName, items) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
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

// ── High-level data API ──

// Papers
export async function getPapers() {
  const papers = await dbGetAll("papers");
  return papers.length > 0 ? papers : null;
}

export async function savePapers(papers) {
  await dbBulkPut("papers", papers);
}

export async function addPaper(paper) {
  return await dbAdd("papers", paper);
}

export async function updatePaper(paper) {
  await dbPut("papers", paper);
}

export async function deletePaper(id) {
  await dbDelete("papers", id);
}

// Clips / Reading materials
export async function getClips() {
  return await dbGetAll("clips");
}

export async function addClip(clip) {
  return await dbAdd("clips", clip);
}

export async function deleteClip(id) {
  await dbDelete("clips", id);
}

// Lab Logs
export async function getLogs() {
  const logs = await dbGetAll("logs");
  return logs.length > 0 ? logs : null;
}

export async function saveLogs(logs) {
  await dbBulkPut("logs", logs);
}

export async function addLog(log) {
  return await dbAdd("logs", log);
}

export async function deleteLog(id) {
  await dbDelete("logs", id);
}

// Checklist
export async function getChecklist() {
  const data = await dbGetAll("checklistData");
  return data.length > 0 ? data : null;
}

export async function saveChecklist(categories) {
  await dbBulkPut("checklistData", categories.map((c, i) => ({ ...c, id: i })));
}

// Writing Drafts
export async function getDrafts() {
  return await dbGetAll("writingDrafts");
}

export async function saveDraft(draft) {
  await dbPut("writingDrafts", draft);
}

// Chat History
export async function getChatHistory() {
  return await dbGetAll("chatHistory");
}

export async function saveChatMessage(msg) {
  return await dbAdd("chatHistory", { ...msg, timestamp: Date.now() });
}

export async function clearChatHistory() {
  await dbClear("chatHistory");
}

// UI State
export async function getUIState(id) {
  return await dbGet("uiState", id);
}

export async function saveUIState(id, data) {
  await dbPut("uiState", { id, ...data, updatedAt: Date.now() });
}

// Synonym Groups
export async function getSynonymGroups() {
  return await dbGetAll("synonymGroups");
}

export async function saveSynonymGroup(group) {
  return await dbAdd("synonymGroups", group);
}

export async function deleteSynonymGroup(id) {
  await dbDelete("synonymGroups", id);
}

// Export everything
export { saveConfig, loadConfig, dbGetAll, dbPut, dbAdd, dbDelete, dbClear };
