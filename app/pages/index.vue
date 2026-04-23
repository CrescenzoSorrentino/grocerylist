<script setup>
// STATO GLOBALE — questi dati appartengono all'intera app.
// Tutti i componenti figli li ricevono da qui tramite props.

// L'array principale: contiene tutti gli elementi della lista.
// Inizia vuoto; viene popolato da localStorage non appena la pagina è pronta.
const items = ref([]);

// Le categorie disponibili: una costante, non cambierà mai durante l'uso.
const categories = ["Fruit", "Dairy", "Meat", "Bakery", "Drinks", "Other"];

// onMounted si esegue solo dopo che la pagina è caricata nel browser,
// dove localStorage esiste. Carica gli elementi salvati in precedenza.
// Se non c'è nulla salvato, JSON.parse riceve "[]" e restituisce un array vuoto.
onMounted(() => {
  items.value = JSON.parse(localStorage.getItem("items") || "[]");
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

// Normalizza il testo: trim, lowercase, poi prima lettera uppercase.
// Garantisce che "mela", "Mela", "MELA" diventino tutti "Mela".
function normalize(str) {
  const s = str.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

// Indice dell'item con il pannello nota aperto. null significa nessuno aperto.
// Un solo item alla volta può avere la nota visibile.
const editingNoteIndex = ref(null);

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


// computed ricalcola "grouped" automaticamente ogni volta che "items" cambia.
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
    <h1>Grocery List</h1>
    <p class="subtitle">
      Plan your shop, stick to the list. Spend less, waste nothing.
    </p>

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
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 48px 16px 40px;

  @media (min-width: 640px) {
    justify-content: center;
    padding: 40px 20px;
  }
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
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
</style>
