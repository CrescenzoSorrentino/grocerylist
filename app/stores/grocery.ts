import { defineStore } from "pinia";

// Descrive la struttura di ogni elemento della lista.
// TypeScript usa questa definizione per segnalare errori se accedi a un campo inesistente.
interface Item {
  id: number;      // identificatore univoco generato al momento della creazione
  name: string;    // nome dell'elemento, sempre con prima lettera maiuscola
  done: boolean;   // true se l'elemento è stato spuntato
  category: string; // categoria di appartenenza (es. "Dairy", "Fruit")
  note: string;    // nota opzionale aggiunta dall'utente
}

// defineStore crea e registra lo store con il nome "grocery".
// Il prefisso "use" è una convenzione Vue per i composable.
// Il terzo argomento { persist } dice a pinia-plugin-persistedstate
// di salvare automaticamente "items" nel localStorage.
export const useGroceryStore = defineStore(
  "grocery",
  () => {

    // ─── STATO ───────────────────────────────────────────────────────────────

    // Lista fissa delle categorie disponibili. Non è reattiva perché non cambia mai.
    const categories = ["Fruit", "Dairy", "Meat", "Bakery", "Drinks", "Other"];

    // Colore associato a ogni categoria — scelti per evocare la categoria stessa.
    const categoryColors: Record<string, string> = {
      Fruit:  "#f97316", // arancione → agrumi, frutta fresca
      Dairy:  "#60a5fa", // azzurro latte → latticini, latte
      Meat:   "#dc2626", // rosso scuro → carne
      Bakery: "#d97706", // ambra dorata → grano, pane
      Drinks: "#0ea5e9", // blu acqua → bevande, acqua
      Other:  "#94a3b8", // grigio neutro → varie
    };

    // Array principale della lista. ref<Item[]> dice a TypeScript che contiene oggetti Item.
    const items = ref<Item[]>([]);

    // Id dell'item con il pannello nota aperto. null = nessuna nota aperta.
    const editingNoteId = ref<number | null>(null);

    // Lista ricevuta tramite URL (?data=...). null = nessun import in attesa.
    const pendingImport = ref<Item[] | null>(null);

    // true per 2 secondi dopo aver copiato il link di condivisione.
    const copied = ref(false);

    // Storico degli stati precedenti per la funzione undo. Tiene al massimo 20 snapshot.
    const undoStack = ref<Item[][]>([]);

    // ─── GETTER ──────────────────────────────────────────────────────────────

    // true se esiste almeno un elemento spuntato (mostra il bottone "clear done").
    const hasDone = computed(() => items.value.some((i) => i.done));

    // true se c'è almeno uno snapshot disponibile (mostra il bottone undo).
    const canUndo = computed(() => undoStack.value.length > 0);

    // Trasforma l'array piatto in un oggetto raggruppato per categoria.
    // Esempio: { Dairy: [item1, item2], Fruit: [item3] }
    // Il template usa questo oggetto per disegnare un gruppo per ogni categoria.
    const grouped = computed(() => {
      return items.value.reduce(
        (acc, item) => {
          // Se la categoria non esiste ancora nell'oggetto, la crea come array vuoto.
          if (!acc[item.category]) acc[item.category] = [];
          // Aggiunge l'item dentro l'array della sua categoria.
          // Il ! dice a TypeScript di fidarsi che l'array esiste (lo abbiamo appena creato).
          acc[item.category]!.push(item);
          return acc;
        },
        {} as Record<string, Item[]>, // valore iniziale: oggetto vuoto
      );
    });

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    // Salva una copia profonda dello stato corrente nello stack undo.
    // JSON.parse(JSON.stringify(...)) crea una copia completamente indipendente dell'array.
    // shift() rimuove il più vecchio se si superano 20 snapshot.
    function snapshot() {
      undoStack.value.push(JSON.parse(JSON.stringify(items.value)));
      if (undoStack.value.length > 20) undoStack.value.shift();
    }

    // Normalizza il testo: rimuove spazi, mette tutto in minuscolo,
    // poi mette la prima lettera maiuscola.
    // Garantisce che "mela", "MELA", "Mela" diventino tutti "Mela".
    function normalize(str: string) {
      const s = str.trim().toLowerCase();
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // ─── ACTIONS ─────────────────────────────────────────────────────────────

    // Aggiunge un nuovo elemento alla lista.
    // Prima normalizza il nome, poi controlla i duplicati (confronto case-insensitive).
    // Se non è un duplicato, salva uno snapshot e aggiunge l'item con id univoco.
    function addItem(name: string, category: string) {
      const normalized = normalize(name);
      if (
        items.value.some(
          (i) => i.name.toLowerCase() === normalized.toLowerCase(),
        )
      )
        return;
      snapshot();
      items.value.push({
        id: Date.now(), // timestamp come id univoco
        name: normalized,
        done: false,
        category,
        note: "",
      });
    }

    // Inverte lo stato done dell'elemento con quell'id.
    // find cerca il primo item con id corrispondente.
    function toggleItem(id: number) {
      const item = items.value.find((i) => i.id === id);
      if (item) {
        snapshot();
        item.done = !item.done;
      }
    }

    // Rimuove l'elemento con quell'id ricreando l'array senza di esso.
    function removeItem(id: number) {
      snapshot();
      items.value = items.value.filter((i) => i.id !== id);
    }

    // Apre o chiude il pannello nota per un item.
    // Se id è null forza la chiusura (usato dal backdrop e da deleteAndClose).
    // Se l'item era già aperto lo chiude, altrimenti apre il nuovo.
    function toggleNote(id: number | null) {
      if (id === null) { editingNoteId.value = null; return; }
      editingNoteId.value = editingNoteId.value === id ? null : id;
    }

    // Aggiorna il testo della nota di un item.
    // Non salva snapshot perché la nota si aggiorna a ogni carattere digitato.
    function updateNote(id: number, text: string) {
      const item = items.value.find((i) => i.id === id);
      if (item) item.note = text.length > 0 ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    }

    // Rimuove tutti gli elementi spuntati in un colpo solo.
    function clearDone() {
      snapshot();
      items.value = items.value.filter((i) => !i.done);
    }

    // Ripristina l'ultimo snapshot dallo stack undo.
    // pop() rimuove e restituisce l'ultimo elemento dell'array.
    function undo() {
      const previous = undoStack.value.pop();
      if (previous) items.value = previous;
    }

    // Codifica la lista corrente come JSON nell'URL e copia il link negli appunti.
    // copied diventa true per 2 secondi come feedback visivo all'utente.
    async function shareList() {
      const data = encodeURIComponent(JSON.stringify(items.value));
      const url = `${location.origin}${location.pathname}?data=${data}`;
      await navigator.clipboard.writeText(url);
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
    }

    // Viene chiamata all'avvio. Prima esegue la migrazione dai dati vecchi,
    // poi controlla se l'URL contiene ?data=... con una lista da importare.
    function checkImportFromUrl() {
      migrateFromLegacy(); // provvisorio — da rimuovere dopo qualche settimana
      const params = new URLSearchParams(location.search);
      const data = params.get("data");
      if (data) {
        try {
          pendingImport.value = JSON.parse(decodeURIComponent(data));
        } catch {
          // URL malformato o manomesso, ignora silenziosamente
        }
      }
    }

    // Importa la lista ricevuta via URL, resettando done a false per ogni item
    // e assegnando nuovi id per evitare collisioni. Pulisce l'URL dopo l'import.
    function importList() {
      if (!pendingImport.value) return;
      snapshot();
      items.value = pendingImport.value.map((item) => ({
        ...item,
        id: Date.now() + Math.random(),
        done: false,
      }));
      pendingImport.value = null;
      window.history.replaceState(null, "", location.pathname);
    }

    // Elimina l'item correntemente aperto nel pannello e chiude il pannello.
    function deleteAndClose() {
      if (editingNoteId.value === null) return;
      removeItem(editingNoteId.value);
      editingNoteId.value = null;
    }

    // Scarta la lista ricevuta senza importarla e pulisce l'URL.
    function dismissImport() {
      pendingImport.value = null;
      window.history.replaceState(null, "", location.pathname);
    }

    // ─── MIGRAZIONE (PROVVISORIO) ─────────────────────────────────────────────
    // Converte i dati salvati dal vecchio sistema (localStorage "items")
    // al nuovo formato Pinia aggiungendo un id a ogni elemento.
    // Da rimuovere dopo che tutti gli utenti hanno aggiornato.
    function migrateFromLegacy() {
      const legacy = localStorage.getItem("items");
      if (!legacy) return;
      try {
        const parsed = JSON.parse(legacy);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          items.value.length === 0
        ) {
          items.value = parsed.map((item) => ({
            ...item,
            id: Date.now() + Math.random(),
          }));
        }
      } catch {
        // dati non validi, ignora
      }
      localStorage.removeItem("items");
    }

    // ─── RETURN ──────────────────────────────────────────────────────────────
    // Tutto quello che è nel return è accessibile dall'esterno con useGroceryStore().
    // Quello che non è qui esiste solo dentro lo store.
    return {
      categories,
      categoryColors,
      items,
      editingNoteId,
      pendingImport,
      copied,
      hasDone,
      canUndo,
      grouped,
      addItem,
      toggleItem,
      removeItem,
      toggleNote,
      updateNote,
      clearDone,
      undo,
      shareList,
      checkImportFromUrl,
      importList,
      dismissImport,
      deleteAndClose,
    };
  },
  {
    // Salva automaticamente solo "items" nel localStorage.
    // Lo stato UI (copied, editingNoteId ecc.) non viene persistito.
    persist: {
      pick: ["items"],
    },
  },
);
