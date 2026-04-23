<script setup>
import { Share2, Check } from "lucide-vue-next";

// ─── STATO ───────────────────────────────────────────────────────────────────

// L'array principale: contiene tutti gli elementi della lista.
// Inizia vuoto; viene popolato da localStorage non appena la pagina è pronta.
const items = ref([]);

// Le categorie disponibili: una costante, non cambierà mai durante l'uso.
const categories = ["Fruit", "Dairy", "Meat", "Bakery", "Drinks", "Other"];

// Lista ricevuta tramite URL (?data=...). null = nessun import in attesa.
const pendingImport = ref(null);

// true per 2 secondi dopo aver copiato il link, usato per il feedback visivo.
const copied = ref(false);

// Indice dell'item con il pannello nota aperto. null = nessuno aperto.
// Un solo item alla volta può avere la nota visibile.
const editingNoteIndex = ref(null);

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

// onMounted si esegue solo dopo che la pagina è caricata nel browser,
// dove localStorage esiste. Carica gli elementi salvati in precedenza.
// Se non c'è nulla salvato, JSON.parse riceve "[]" e restituisce un array vuoto.
onMounted(() => {
  items.value = JSON.parse(localStorage.getItem("items") || "[]");

  // Se l'URL contiene ?data=..., decodifica la lista e la mette in attesa di conferma.
  // try/catch protegge da URL malformati o manomessi.
  const params = new URLSearchParams(location.search);
  const data = params.get("data");
  if (data) {
    try {
      pendingImport.value = JSON.parse(decodeURIComponent(data));
    } catch {
      // dato non valido, ignora silenziosamente
    }
  }
});

// watch osserva "items" e, ogni volta che cambia (anche in profondità),
// salva automaticamente l'array aggiornato nel localStorage.
// { deep: true } è necessario perché items è un array di oggetti:
// senza, Vue non accorgerebbe dei cambiamenti interni (es. item.done = true).
watch(
  items,
  (newItems) => {
    localStorage.setItem("items", JSON.stringify(newItems));
  },
  { deep: true },
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Normalizza il testo: trim, lowercase, poi prima lettera uppercase.
// Garantisce che "mela", "Mela", "MELA" diventino tutti "Mela".
function normalize(str) {
  const s = str.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── GESTORI EVENTI ──────────────────────────────────────────────────────────

// Riceve l'evento "add" da AddBar con { name, category } e aggiunge
// il nuovo elemento all'array solo se non esiste già (confronto case-insensitive).
function addItem({ name, category }) {
  const normalized = normalize(name);
  const duplicate = items.value.some(
    (i) => i.name.toLowerCase() === normalized.toLowerCase(),
  );
  if (duplicate) return;
  items.value.push({ name: normalized, done: false, category, note: "" });
}

// Riceve l'evento "toggle" e inverte lo stato done dell'elemento.
// Se era false diventa true, e viceversa.
function toggleItem(index) {
  items.value[index].done = !items.value[index].done;
}

// Riceve l'evento "remove" con l'indice dell'elemento da eliminare.
// splice(indice, 1) rimuove esattamente 1 elemento in quella posizione.
function removeItem(index) {
  items.value.splice(index, 1);
}

// Apre il pannello nota per l'item cliccato.
// Se l'item era già aperto lo chiude (comportamento toggle).
function noteItem(index) {
  editingNoteIndex.value = editingNoteIndex.value === index ? null : index;
}

// Riceve l'evento "update-note" con l'indice dell'item e il testo scritto dall'utente.
// Salva il testo direttamente nell'array; il watch lo persiste in localStorage.
function updateNote(index, text) {
  items.value[index].note = text;
}

// Codifica la lista corrente nell'URL e copia il link negli appunti.
// Mostra "Copied!" per 2 secondi come conferma visiva.
async function shareList() {
  const data = encodeURIComponent(JSON.stringify(items.value));
  const url = `${location.origin}${location.pathname}?data=${data}`;
  await navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

// Importa la lista ricevuta, resettando "done" a false per ogni item
// perché il contatto parte da una lista fresca.
// Pulisce l'URL dopo l'import per evitare re-import al refresh.
function importList() {
  items.value = pendingImport.value.map((item) => ({ ...item, done: false }));
  pendingImport.value = null;
  history.replaceState(null, "", location.pathname);
}

// Scarta la lista ricevuta senza importarla e pulisce l'URL.
function dismissImport() {
  pendingImport.value = null;
  history.replaceState(null, "", location.pathname);
}

// ─── COMPUTED ─────────────────────────────────────────────────────────────────

// Trasforma l'array piatto in un oggetto raggruppato per categoria, es:
// { Dairy: [{...}, {...}], Fruit: [{...}] }
// reduce costruisce questo oggetto partendo da {} (l'accumulatore "acc").
// Aggiunge anche "index" a ogni elemento così i figli sanno dove agire nell'array originale.
const grouped = computed(() => {
  return items.value.reduce((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ ...item, index });
    return acc;
  }, {});
});
</script>

<template>
  <main>
    <div class="title-row">
      <h1>Grocery List</h1>
      <!-- Icona share accanto al titolo: visibile solo se ci sono item. -->
      <button
        v-if="items.length > 0"
        class="share-btn"
        @click="shareList"
      >
        <Check v-if="copied" :size="16" />
        <Share2 v-else :size="18" />
        <span v-if="copied">Copied!</span>
      </button>
    </div>
    <p class="subtitle">
      Plan your shop, stick to the list. Spend less, waste nothing.
    </p>

    <!-- Banner di import: compare solo quando si apre un link condiviso. -->
    <div v-if="pendingImport" class="import-banner">
      <p>You received a list with {{ pendingImport.length }} items. Import it?</p>
      <div class="import-actions">
        <button @click="importList">Import</button>
        <button @click="dismissImport">Dismiss</button>
      </div>
    </div>

    <div class="card">

      <!-- Passa le categorie come prop e ascolta l'evento "add". -->
      <AddBar :categories="categories" @add="addItem" />

      <!-- Mostra i gruppi solo se la lista non è vuota. -->
      <div v-if="items.length > 0">
        <!-- v-for su un oggetto: "groupItems" è l'array degli elementi,
             "category" è la chiave (nome della categoria).
             Passa i dati verso il basso e ascolta gli eventi verso l'alto. -->
        <CategoryGroup
          v-for="(groupItems, category) in grouped"
          :key="category"
          :category="category"
          :items="groupItems"
          :editing-note-index="editingNoteIndex"
          @toggle="toggleItem"
          @note="noteItem"
          @update-note="updateNote"
          @remove="removeItem"
        />
      </div>

    </div>

    <!-- Messaggio visibile solo quando la lista è completamente vuota. -->
    <p v-if="items.length === 0" class="empty">Your list is empty.</p>

    <AppFooter />
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 16px 40px;

  @media (min-width: 640px) {
    justify-content: center;
    padding: 40px 20px;
  }
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-wrap: balance;

  @media (min-width: 640px) {
    font-size: 2.5rem;
  }
}

.subtitle {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-top: -8px;
  margin-bottom: 4px;
  text-align: center;
  text-wrap: balance;
}

.card {
  width: 100%;
  max-width: 640px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.empty {
  color: var(--color-muted);
  font-size: 0.95rem;
}

.import-banner {
  width: 100%;
  max-width: 640px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  p {
    font-size: 0.9rem;
    color: var(--color-text);
    margin: 0;
  }
}

.import-actions {
  display: flex;
  gap: 8px;

  button {
    padding: 8px 20px;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;

    &:first-child {
      background: var(--color-primary);
      color: #fff;
    }

    &:last-child {
      background: var(--color-bg);
      color: var(--color-muted);
    }
  }
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: color 0.2s;

  span {
    font-size: 0.8rem;
    font-family: inherit;
    font-weight: 500;
  }

  @media (hover: hover) {
    &:hover {
      color: var(--color-text);
    }
  }
}
</style>
